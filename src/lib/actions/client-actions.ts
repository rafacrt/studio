
'use server';

import db from '@/lib/db';
import type { Client } from '@/lib/types';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

/**
 * Finds a client by name or creates a new one if not found.
 * Returns the client object (either existing or newly created).
 */
export async function findOrCreateClientByName(clientName: string): Promise<Client> {
  if (!clientName || clientName.trim() === '') {
    throw new Error('Client name cannot be empty.');
  }

  const connection = await db.getConnection();
  try {
    // Check if client exists
    const [existingClients] = await connection.query<RowDataPacket[]>(
      'SELECT id, name FROM clients WHERE name = ?',
      [clientName.trim()]
    );

    if (existingClients.length > 0) {
      const existingClient = existingClients[0];
      return { id: String(existingClient.id), name: existingClient.name };
    }

    // Client does not exist, create new
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO clients (name) VALUES (?)',
      [clientName.trim()]
    );

    if (result.insertId) {
      return { id: String(result.insertId), name: clientName.trim() };
    } else {
      throw new Error('Failed to create client: No insertId returned.');
    }
  } catch (error) {
    console.error('Database error in findOrCreateClientByName:', error);
    throw new Error(`Failed to find or create client "${clientName}".`);
  } finally {
    connection.release();
  }
}

/**
 * Fetches all clients from the database.
 */
export async function getAllClientsFromDB(): Promise<Client[]> {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>('SELECT id, name FROM clients ORDER BY name ASC');
    return rows.map(row => ({ id: String(row.id), name: row.name }));
  } catch (error) {
    console.error('Database error in getAllClientsFromDB:', error);
    throw new Error('Failed to fetch clients from database.');
  } finally {
    connection.release();
  }
}
