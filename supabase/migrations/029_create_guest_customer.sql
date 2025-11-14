-- Create a guest customer for simulated purchases
INSERT INTO customer_profiles (id, email, first_name, last_name)
VALUES (
  '00000000-0000-0000-0000-000000000099',
  'guest@example.com',
  'Guest',
  'User'
)
ON CONFLICT (id) DO NOTHING;
