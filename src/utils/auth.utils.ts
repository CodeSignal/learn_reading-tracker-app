import { createHmac } from 'crypto';
import { DatabaseService } from '../database/database.service';

export function hashPassword(password: string): string {
  const salt = 'static-salt';
  return createHmac('sha256', salt).update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Optionally persist or refresh seed; here it’s a no-op helper to keep API.
export function persistUserSeed(_db: DatabaseService) {
  // Intentionally left as a no-op for this in-memory DB.
}

