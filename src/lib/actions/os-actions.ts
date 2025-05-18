
'use server';

import db from '@/lib/db';
import type { OS, CreateOSData } from '@/lib/types';
import { OSStatus } from '@/lib/types';
import { findOrCreateClientByName } from './client-actions';
import { findOrCreatePartnerByName } from './partner-actions';
import type { ResultSetHeader, RowDataPacket, PoolConnection } from 'mysql2/promise';

const generateNewOSNumero = async (connection: PoolConnection): Promise<string> => {
  // In a real scenario, this might involve a transaction or a dedicated sequence table
  // For now, simple MAX + 1. Ensure 'numero' is treated as a string for potential leading zeros.
  const [rows] = await connection.query<RowDataPacket[]>("SELECT MAX(CAST(numero AS UNSIGNED)) as maxNumero FROM os_table");
  const maxNumero = rows[0]?.maxNumero || 0;
  const newNumeroInt = Number(maxNumero) + 1;
  return String(newNumeroInt).padStart(6, '0');
};

export async function createOSInDB(data: CreateOSData): Promise<OS> {
  const connection = await db.getConnection();
  console.log('[OSAction] Starting createOSInDB with data:', data);
  try {
    await connection.beginTransaction();
    console.log('[OSAction] Transaction started.');

    // 1. Find or Create Client
    console.log(`[OSAction] Finding or creating client: "${data.cliente}"`);
    const client = await findOrCreateClientByName(data.cliente);
    if (!client || !client.id) {
        console.error('[OSAction] Failed to get client ID for:', data.cliente);
        throw new Error('Failed to get client ID.');
    }
    console.log(`[OSAction] Client resolved: ID ${client.id}, Name ${client.name}`);

    // 2. Find or Create Partner (if provided)
    let partnerId: string | null = null;
    let partnerName: string | undefined = undefined;
    if (data.parceiro && data.parceiro.trim() !== '') {
      console.log(`[OSAction] Finding or creating partner: "${data.parceiro}"`);
      const partner = await findOrCreatePartnerByName(data.parceiro);
      if (!partner || !partner.id) {
          console.error('[OSAction] Failed to get partner ID for:', data.parceiro);
          throw new Error('Failed to get partner ID.');
      }
      partnerId = partner.id;
      partnerName = partner.name;
      console.log(`[OSAction] Partner resolved: ID ${partner.id}, Name ${partner.name}`);
    } else {
      console.log('[OSAction] No partner provided or partner name is empty.');
    }

    // 3. Generate new OS Numero
    console.log('[OSAction] Generating new OS numero.');
    const newOsNumero = await generateNewOSNumero(connection);
    console.log(`[OSAction] New OS numero generated: ${newOsNumero}`);

    // 4. Create OS
    // Handle optional programadoPara date carefully
    const programadoParaDate = data.programadoPara && data.programadoPara.trim() !== '' ? new Date(data.programadoPara) : null;
    if (programadoParaDate && isNaN(programadoParaDate.getTime())) {
        console.warn(`[OSAction] Invalid programadoPara date string received: "${data.programadoPara}". Setting to null.`);
        // programadoParaDate = null; // It will already be null or an invalid date object which DB might reject or handle as null
    }


    const osDataForDB = {
      numero: newOsNumero,
      cliente_id: parseInt(client.id, 10),
      parceiro_id: partnerId ? parseInt(partnerId, 10) : null,
      projeto: data.projeto,
      tarefa: data.tarefa,
      observacoes: data.observacoes || '',
      tempoTrabalhado: data.tempoTrabalhado || null, // Ensure empty string becomes null
      status: data.status || OSStatus.NA_FILA,
      dataAbertura: new Date(), // Use current datetime
      programadoPara: programadoParaDate,
      isUrgent: data.isUrgent || false,
      dataFinalizacao: null,
      dataInicioProducao: null,
      tempoProducaoMinutos: null,
    };
    
    console.log('[OSAction] OS data prepared for DB insertion:', osDataForDB);

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
        osDataForDB.programadoPara, // Use the potentially null Date object
        osDataForDB.isUrgent,
        osDataForDB.dataFinalizacao,
        osDataForDB.dataInicioProducao,
        osDataForDB.tempoProducaoMinutos,
      ]
    );

    if (!result.insertId) {
      console.error('[OSAction] Failed to create OS: No insertId returned from DB.', result);
      throw new Error('Failed to create OS: No insertId returned.');
    }
    console.log(`[OSAction] OS successfully inserted with ID: ${result.insertId}`);

    await connection.commit();
    console.log('[OSAction] Transaction committed.');

    // Construct the OS object to return to the client (matching store's OS type)
    const createdOS: OS = {
      id: String(result.insertId),
      numero: newOsNumero,
      cliente: client.name, // Use client name from resolved client
      parceiro: partnerName, // Use partner name if exists from resolved partner
      clientId: client.id,
      partnerId: partnerId ?? undefined,
      projeto: data.projeto,
      tarefa: data.tarefa,
      observacoes: data.observacoes || '',
      tempoTrabalhado: data.tempoTrabalhado || '',
      status: data.status || OSStatus.NA_FILA,
      dataAbertura: osDataForDB.dataAbertura.toISOString(),
      programadoPara: programadoParaDate ? programadoParaDate.toISOString().split('T')[0] : undefined, // Format YYYY-MM-DD for consistency
      isUrgent: data.isUrgent || false,
      // dataInicioProducao and tempoProducaoMinutos will be set when status changes via other actions
    };
    console.log('[OSAction] OS object constructed to return to client:', createdOS);
    return createdOS;

  } catch (error: any) {
    await connection.rollback();
    console.error('[OSAction] Original DB error in createOSInDB:', error);
    console.error(`[OSAction] Failed to create OS. Details: ${error.message}`);
    // Explicitly check if error is an instance of Error to access message property
    if (error instanceof Error) {
        throw new Error(`Failed to create OS: ${error.message}`);
    }
    throw new Error('Failed to create OS due to an unknown error.');
  } finally {
    connection.release();
    console.log('[OSAction] Connection released.');
  }
}

// Placeholder for future getAllOSFromDB - this is more complex due to joins needed
export async function getAllOSFromDB(): Promise<OS[]> {
  const connection = await db.getConnection();
  try {
    console.log('[OSAction] Fetching all OS from DB.');
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
      ORDER BY os.isUrgent DESC, os.dataAbertura DESC
    `);
    console.log(`[OSAction] Found ${rows.length} OS records.`);
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
  } catch (error: any) {
    console.error('[OSAction] Original DB error in getAllOSFromDB:', error);
    console.error(`[OSAction] Failed to fetch OS list. Details: ${error.message}`);
    throw new Error('Failed to fetch OS list from database.');
  } finally {
    connection.release();
    console.log('[OSAction] Connection released after fetching all OS.');
  }
}

