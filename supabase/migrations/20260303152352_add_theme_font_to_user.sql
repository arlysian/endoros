ALTER TABLE "User"
  ADD COLUMN theme text NOT NULL DEFAULT 'default',
  ADD COLUMN font  text NOT NULL DEFAULT 'dm-sans';
