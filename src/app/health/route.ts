import { db } from '@/lib/db'; // ou ajuste conforme o caminho correto

export async function GET() {
  try {
    const [rows] = await db.query('SELECT 1');
    return Response.json({ status: 'ok', db: true });
  } catch (err: any) {
    return Response.json({ status: 'error', error: err.message }, { status: 500 });
  }
}
