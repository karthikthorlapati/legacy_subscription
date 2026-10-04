import { Pool } from 'pg';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { User } from '../../domain/models/User';

export class PostgresUserRepository implements IUserRepository {
  constructor(private pool: Pool) {}

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      stripe_customer_id: row.stripe_customer_id
    };
  }
}
