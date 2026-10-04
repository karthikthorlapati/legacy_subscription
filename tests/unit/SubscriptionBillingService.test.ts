import { SubscriptionBillingService } from '../../src/domain/services/SubscriptionBillingService';
import { ISubscriptionRepository } from '../../src/domain/ports/ISubscriptionRepository';
import { IUserRepository } from '../../src/domain/ports/IUserRepository';
import { IPaymentGateway } from '../../src/domain/ports/IPaymentGateway';
import { ITimeProvider } from '../../src/domain/ports/ITimeProvider';
import { User } from '../../src/domain/models/User';
import { Subscription } from '../../src/domain/models/Subscription';

describe('SubscriptionBillingService', () => {
  let mockSubscriptionRepo: jest.Mocked<ISubscriptionRepository>;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockPaymentGateway: jest.Mocked<IPaymentGateway>;
  let mockTimeProvider: jest.Mocked<ITimeProvider>;
  let service: SubscriptionBillingService;

  beforeEach(() => {
    mockSubscriptionRepo = {
      getSubscriptionByUserId: jest.fn(),
      updateExpiration: jest.fn(),
    };
    mockUserRepo = {
      getUserById: jest.fn(),
    };
    mockPaymentGateway = {
      charge: jest.fn(),
    };
    mockTimeProvider = {
      getCurrentTime: jest.fn(),
    };

    service = new SubscriptionBillingService(
      mockSubscriptionRepo,
      mockUserRepo,
      mockPaymentGateway,
      mockTimeProvider
    );
  });

  const validUser: User = { id: 'user-123', stripe_customer_id: 'cus_123' };
  const expiredSub: Subscription = {
    id: 'sub-123',
    user_id: 'user-123',
    base_price: 100,
    expires_at: new Date('2023-01-01T00:00:00Z'),
  };

  it('should apply a 10% discount if the renewal happens in December', async () => {
    mockUserRepo.getUserById.mockResolvedValue(validUser);
    mockSubscriptionRepo.getSubscriptionByUserId.mockResolvedValue(expiredSub);
    mockTimeProvider.getCurrentTime.mockReturnValue(new Date('2023-12-15T10:00:00Z'));
    mockPaymentGateway.charge.mockResolvedValue(true);

    const result = await service.processRenewal('user-123');

    expect(result).toEqual({ success: true, message: 'Renewal successful' });
    expect(mockPaymentGateway.charge).toHaveBeenCalledWith('cus_123', 90);
    const expectedExpiry = new Date('2024-12-15T10:00:00Z');
    expect(mockSubscriptionRepo.updateExpiration).toHaveBeenCalledWith('sub-123', expectedExpiry);
  });

  it('should charge standard price in non-December months', async () => {
    mockUserRepo.getUserById.mockResolvedValue(validUser);
    mockSubscriptionRepo.getSubscriptionByUserId.mockResolvedValue(expiredSub);
    mockTimeProvider.getCurrentTime.mockReturnValue(new Date('2023-11-15T10:00:00Z'));
    mockPaymentGateway.charge.mockResolvedValue(true);

    const result = await service.processRenewal('user-123');

    expect(result).toEqual({ success: true, message: 'Renewal successful' });
    expect(mockPaymentGateway.charge).toHaveBeenCalledWith('cus_123', 100);
  });

  it('should fail if the subscription is not yet expired', async () => {
    mockUserRepo.getUserById.mockResolvedValue(validUser);
    mockSubscriptionRepo.getSubscriptionByUserId.mockResolvedValue({
      ...expiredSub,
      expires_at: new Date('2024-01-01T00:00:00Z'),
    });
    mockTimeProvider.getCurrentTime.mockReturnValue(new Date('2023-12-15T10:00:00Z'));

    const result = await service.processRenewal('user-123');

    expect(result).toEqual({ success: false, message: 'Subscription is not yet expired' });
    expect(mockPaymentGateway.charge).not.toHaveBeenCalled();
  });

  it('should fail gracefully if the payment gateway fails', async () => {
    mockUserRepo.getUserById.mockResolvedValue(validUser);
    mockSubscriptionRepo.getSubscriptionByUserId.mockResolvedValue(expiredSub);
    mockTimeProvider.getCurrentTime.mockReturnValue(new Date('2023-11-15T10:00:00Z'));
    mockPaymentGateway.charge.mockResolvedValue(false);

    const result = await service.processRenewal('user-123');

    expect(result).toEqual({ success: false, message: 'Payment failed' });
    expect(mockSubscriptionRepo.updateExpiration).not.toHaveBeenCalled();
  });

  it('should fail if user not found', async () => {
    mockUserRepo.getUserById.mockResolvedValue(null);

    const result = await service.processRenewal('user-123');

    expect(result).toEqual({ success: false, message: 'User not found' });
  });

  it('should fail if subscription not found', async () => {
    mockUserRepo.getUserById.mockResolvedValue(validUser);
    mockSubscriptionRepo.getSubscriptionByUserId.mockResolvedValue(null);

    const result = await service.processRenewal('user-123');

    expect(result).toEqual({ success: false, message: 'Subscription not found' });
  });
});
