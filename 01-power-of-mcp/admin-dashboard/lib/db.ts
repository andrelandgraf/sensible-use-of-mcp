import dotenv from 'dotenv';

// Load environment variables first, before anything else
dotenv.config();

import { drizzle } from 'drizzle-orm/neon-http';
import invariant from 'tiny-invariant';

invariant(process.env.DATABASE_URL, 'DATABASE_URL is not set');
const db = drizzle(process.env.DATABASE_URL);

export { db };