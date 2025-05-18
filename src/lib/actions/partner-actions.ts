
'use server';

import db from '@/lib/db';
import type { Partner } from '@/store/os-store'; // Using Partner type from store as it's compatible
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

/**
 * Finds a partner by name or creates a new one if not found.
 * Returns the partner object (either existing or newly created).
 */
export async function findOrCreatePartnerByName(partnerName: string): Promise<Partner> {
  if (!partnerName || partnerName.trim() === '') {
    throw new Error('Partner name cannot be empty.');
  }
  const connection = await db.getConnection();
  try {
    // Check if partner exists
    const [existingPartners] = await connection.query<RowDataPacket[]>(
      'SELECT id, name FROM partners WHERE name = ?',
      [partnerName.trim()]
    );

    if (existingPartners.length > 0) {
      const existingPartner = existingPartners[0];
      return { id: String(existingPartner.id), name: existingPartner.name };
    }

    // Partner does not exist, create new
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO partners (name) VALUES (?)',
      [partnerName.trim()]
    );
    
    if (result.insertId) {
      return { id: String(result.insertId), name: partnerName.trim() };
    } else {
      throw new Error('Failed to create partner: No insertId returned.');
    }
  } catch (error) {
    console.error('Database error in findOrCreatePartnerByName:', error);
    throw new Error(`Failed to find or create partner "${partnerName}".`);
  } finally {
    connection.release();
  }
}

/**
 * Fetches all partners from the database.
 */
export async function getAllPartnersFromDB(): Promise<Partner[]> {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>('SELECT id, name FROM partners ORDER BY name ASC');
    return rows.map(row => ({ id: String(row.id), name: row.name }));
  } catch (error) {
    console.error('Database error in getAllPartnersFromDB:', error);
    throw new Error('Failed to fetch partners from database.');
  } finally {
    connection.release();
  }
}
