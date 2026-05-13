const dotenv = require('dotenv');
dotenv.config();
if (process.env.DB_PASSWORD) process.env.DB_PASSWORD = process.env.DB_PASSWORD.replace(/^"|"$/g, '');
const { sequelize } = require('../config/database');

async function run() {
  await sequelize.authenticate();
  console.log('Connected');

  const cols = [
    `ALTER TABLE assets ADD COLUMN IF NOT EXISTS "tagNumber" VARCHAR(50) UNIQUE`,
    `ALTER TABLE assets ADD COLUMN IF NOT EXISTS "itemCategory" VARCHAR(100)`,
    `ALTER TABLE assets ADD COLUMN IF NOT EXISTS "donorName" VARCHAR(200)`,
    `ALTER TABLE assets ADD COLUMN IF NOT EXISTS "quantity" INTEGER DEFAULT 1`,
    `DO $$ BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_assets_sourcetype') THEN
         CREATE TYPE "enum_assets_sourcetype" AS ENUM ('purchased', 'donation', 'transferred');
       END IF;
     END $$`,
    `ALTER TABLE assets ADD COLUMN IF NOT EXISTS "sourceType" "enum_assets_sourcetype" DEFAULT 'purchased'`,
  ];

  for (const sql of cols) {
    try {
      await sequelize.query(sql);
      console.log('OK:', sql.slice(0, 60));
    } catch (e) {
      console.warn('Skip (already exists?):', e.message.slice(0, 80));
    }
  }

  console.log('✅ Asset fields migrated');
  process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
