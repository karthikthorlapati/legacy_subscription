import { Request, Response } from 'express';
import { Pool } from 'pg';
import { SubscriptionBillingService } from '../../domain/services/SubscriptionBillingService';
import { PostgresSubscriptionRepository } from '../../infrastructure/adapters/PostgresSubscriptionRepository';
import { PostgresUserRepository } from '../../infrastructure/adapters/PostgresUserRepository';
import { MockPaymentGateway } from '../../infrastructure/adapters/MockPaymentGateway';
import { SystemTimeProvider } from '../../infrastructure/adapters/SystemTimeProvider';

export class RenewalController {
  constructor(private dbPool: Pool) {}

  async renew(req: Request, res: Response): Promise<void> {
    const { userId } = req.body;
    
    if (!userId) {
      res.status(400).json({ success: false, message: 'userId is required' });
      return;
    }

    const subscriptionRepo = new PostgresSubscriptionRepository(this.dbPool);
    const userRepo = new PostgresUserRepository(this.dbPool);
    const paymentGateway = new MockPaymentGateway();
    const timeProvider = new SystemTimeProvider();

    const service = new SubscriptionBillingService(
      subscriptionRepo,
      userRepo,
      paymentGateway,
      timeProvider
    );

    const result = await service.processRenewal(userId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  }
}
