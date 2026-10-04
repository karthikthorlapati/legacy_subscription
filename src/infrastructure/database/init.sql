CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    stripe_customer_id VARCHAR NOT NULL
);

CREATE TABLE subscriptions (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    base_price DECIMAL NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

-- Seed data
INSERT INTO users (id, stripe_customer_id) VALUES ('user-1', 'cus_expired');
INSERT INTO users (id, stripe_customer_id) VALUES ('user-2', 'cus_active');

-- Expired subscription (can be renewed)
INSERT INTO subscriptions (id, user_id, base_price, expires_at) 
VALUES ('sub-1', 'user-1', 10.00, '2020-01-01 00:00:00');

-- Active subscription (cannot be renewed)
INSERT INTO subscriptions (id, user_id, base_price, expires_at) 
VALUES ('sub-2', 'user-2', 10.00, '2099-01-01 00:00:00');
