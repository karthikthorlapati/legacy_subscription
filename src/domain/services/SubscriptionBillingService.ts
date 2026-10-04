import { ISubscriptionRepository } from '../ports/ISubscriptionRepository';
import { IUserRepository } from '../ports/IUserRepository';
import { IPaymentGateway } from '../ports/IPaymentGateway';
import { ITimeProvider } from '../ports/ITimeProvider';

export class SubscriptionBillingService {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly userRepo: IUserRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly timeProvider: ITimeProvider
  ) {}

  async processRenewal(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const sub = await this.subscriptionRepo.getSubscriptionByUserId(userId);
    if (!sub) {
      return { success: false, message: 'Subscription not found' };
    }

    const now = this.timeProvider.getCurrentTime();

    if (new Date(sub.expires_at) > now) {
      return { success: false, message: 'Subscription is not yet expired' };
    }

    let chargeAmount = sub.base_price;
    if (now.getMonth() === 11) {
      chargeAmount = chargeAmount * 0.9;
    }

    try {
      const chargeSuccess = await this.paymentGateway.charge(user.stripe_customer_id, chargeAmount);
      
      if (chargeSuccess) {
        const newExpiry = new Date(now);
        newExpiry.setFullYear(newExpiry.getFullYear() + 1);
        
        await this.subscriptionRepo.updateExpiration(sub.id, newExpiry);
        return { success: true, message: 'Renewal successful' };
      } else {
        return { success: false, message: 'Payment failed' };
      }
    } catch (error) {
      return { success: false, message: 'Payment gateway error' };
    }
  }
}
