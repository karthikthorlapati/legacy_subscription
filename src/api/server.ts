import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { RenewalController } from './controllers/RenewalController';

dotenv.config();

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/subscription_db',
});

const renewalController = new RenewalController(pool);

app.post('/api/renew', (req, res) => renewalController.renew(req, res));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
