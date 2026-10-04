import { Pool } from 'pg';
import { ISubscriptionRepository } from '../../domain/ports/ISubscriptionRepository';
import { Subscription } from '../../domain/models/Subscription';

export class PostgresSubscriptionRepository implements ISubscriptionRepository {
  constructor(private pool: Pool) {}

  async getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    const result = await this.pool.query('SELECT * FROM subscriptions WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      user_id: row.user_id,
      base_price: parseFloat(row.base_price),
      expires_at: new Date(row.expires_at)
    };
  }

  async updateExpiration(subscriptionId: string, newExpiry: Date): Promise<void> {
    await this.pool.query('UPDATE subscriptions SET expires_at = $1 WHERE id = $2', [newExpiry, subscriptionId]);
  }
}
