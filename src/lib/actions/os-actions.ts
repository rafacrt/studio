
'use server';

import db from '@/lib/db';
import type { OS, CreateOSData } from '@/lib/types';
import { OSStatus } from '@/lib/types';
import { findOrCreateClientByName } from './client-actions';
import { findOrCreatePartnerByName } from './partner-actions';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

const generateNewOSNumero = async (connection: any): Promise<string> => {
  // In a real scenario, this might involve a transaction or a dedicated sequence table
  // For now, simple MAX + 1
  const [rows] = await connection.query<RowDataPacket[]>("SELECT MAX(CAST(SUBSTRING(numero, 1) AS UNSIGNED)) as maxNumero FROM os_table");
  const maxNumero = rows[0]?.maxNumero || 0;
  return String(maxNumero + 1).padStart(6, '0');
};

export async function createOSInDB(data: CreateOSData): Promise<OS> {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Find or Create Client
    const client = await findOrCreateClientByName(data.cliente);
    if (!client || !client.id) throw new Error('Failed to get client ID.');

    // 2. Find or Create Partner (if provided)
    let partnerId: string | null = null;
    let partnerName: string | undefined = undefined;
    if (data.parceiro && data.parceiro.trim() !== '') {
      const partner = await findOrCreatePartnerByName(data.parceiro);
      if (!partner || !partner.id) throw new Error('Failed to get partner ID.');
      partnerId = partner.id;
      partnerName = partner.name;
    }

    // 3. Generate new OS Numero
    const newOsNumero = await generateNewOSNumero(connection);

    // 4. Create OS
    const osDataForDB = {
      numero: newOsNumero,
      cliente_id: parseInt(client.id, 10),
      parceiro_id: partnerId ? parseInt(partnerId, 10) : null,
      projeto: data.projeto,
      tarefa: data.tarefa,
      observacoes: data.observacoes || '',
      tempoTrabalhado: data.tempoTrabalhado || null,
      status: data.status || OSStatus.NA_FILA,
      dataAbertura: new Date(), // Use current datetime
      programadoPara: data.programadoPara ? new Date(data.programadoPara) : null, // Ensure it's a Date object or null
      isUrgent: data.isUrgent || false,
      dataFinalizacao: null,
      dataInicioProducao: null,
      tempoProducaoMinutos: null,
    };
    
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO os_table (numero, cliente_id, parceiro_id, projeto, tarefa, observacoes, tempoTrabalhado, status, dataAbertura, programadoPara, isUrgent, dataFinalizacao, dataInicioProducao, tempoProducaoMinutos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        osDataForDB.numero,
        osDataForDB.cliente_id,
        osDataForDB.parceiro_id,
        osDataForDB.projeto,
        osDataForDB.tarefa,
        osDataForDB.observacoes,
        osDataForDB.tempoTrabalhado,
        osDataForDB.status,
        osDataForDB.dataAbertura,
        osDataForDB.programadoPara,
        osDataForDB.isUrgent,
        osDataForDB.dataFinalizacao,
        osDataForDB.dataInicioProducao,
        osDataForDB.tempoProducaoMinutos,
      ]
    );

    if (!result.insertId) {
      throw new Error('Failed to create OS: No insertId returned.');
    }

    await connection.commit();

    // Construct the OS object to return to the client (matching store's OS type)
    const createdOS: OS = {
      id: String(result.insertId),
      numero: newOsNumero,
      cliente: client.name, // Use client name
      parceiro: partnerName, // Use partner name if exists
      clientId: client.id,
      partnerId: partnerId ?? undefined,
      projeto: data.projeto,
      tarefa: data.tarefa,
      observacoes: data.observacoes || '',
      tempoTrabalhado: data.tempoTrabalhado || '',
      status: data.status || OSStatus.NA_FILA,
      dataAbertura: osDataForDB.dataAbertura.toISOString(),
      programadoPara: data.programadoPara || undefined,
      isUrgent: data.isUrgent || false,
      // dataInicioProducao and tempoProducaoMinutos will be set when status changes via other actions
    };
    return createdOS;

  } catch (error) {
    await connection.rollback();
    console.error('Database error in createOSInDB:', error);
    // Explicitly check if error is an instance of Error to access message property
    if (error instanceof Error) {
        throw new Error(`Failed to create OS: ${error.message}`);
    }
    throw new Error('Failed to create OS due to an unknown error.');
  } finally {
    connection.release();
  }
}

// Placeholder for future getAllOSFromDB - this is more complex due to joins needed
export async function getAllOSFromDB(): Promise<OS[]> {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(`
      SELECT 
        os.id, os.numero, os.projeto, os.tarefa, os.observacoes, os.tempoTrabalhado, os.status,
        os.dataAbertura, os.dataFinalizacao, os.programadoPara, os.isUrgent,
        os.dataInicioProducao, os.tempoProducaoMinutos,
        c.id as clientId, c.name as cliente_name,
        p.id as partnerId, p.name as partner_name
      FROM os_table os
      JOIN clients c ON os.cliente_id = c.id
      LEFT JOIN partners p ON os.parceiro_id = p.id
      ORDER BY os.dataAbertura DESC
    `);

    return rows.map(row => ({
      id: String(row.id),
      numero: row.numero,
      cliente: row.cliente_name,
      parceiro: row.partner_name || undefined,
      clientId: String(row.clientId),
      partnerId: row.partnerId ? String(row.partnerId) : undefined,
      projeto: row.projeto,
      tarefa: row.tarefa,
      observacoes: row.observacoes,
      tempoTrabalhado: row.tempoTrabalhado,
      status: row.status as OSStatus,
      dataAbertura: new Date(row.dataAbertura).toISOString(),
      dataFinalizacao: row.dataFinalizacao ? new Date(row.dataFinalizacao).toISOString() : undefined,
      programadoPara: row.programadoPara ? new Date(row.programadoPara).toISOString().split('T')[0] : undefined,
      isUrgent: Boolean(row.isUrgent),
      dataInicioProducao: row.dataInicioProducao ? new Date(row.dataInicioProducao).toISOString() : undefined,
      tempoProducaoMinutos: row.tempoProducaoMinutos,
    }));
  } catch (error) {
    console.error('Database error in getAllOSFromDB:', error);
    throw new Error('Failed to fetch OS list from database.');
  } finally {
    connection.release();
  }
}
