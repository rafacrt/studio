
import { NextResponse } from 'next/server';
import { fetchListings } from '@/lib/mock-data';
import type { ListingFilters } from '@/types';

/**
 * @swagger
 * /api/listings:
 *   get:
 *     summary: Retorna uma lista paginada de quartos (listings).
 *     description: Endpoint para buscar quartos com filtros e paginação para ser consumido por clientes como um app móvel.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: O número da página para retornar. Padrão é 1.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: O número de itens por página. Padrão é 10.
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Termo de busca para filtrar por título, endereço ou cidade.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: ID da categoria para filtrar os quartos.
 *     responses:
 *       200:
 *         description: Uma lista de quartos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Listing'
 *       500:
 *         description: Erro no servidor.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Filtros podem ser expandidos conforme necessário
    const filters: ListingFilters = {
      searchTerm: searchParams.get('searchTerm') || undefined,
      category: searchParams.get('category') || undefined,
    };
    
    const listings = await fetchListings(page, limit, filters);
    
    // Retorna os dados como JSON, que seu app móvel pode consumir
    return NextResponse.json(listings, { status: 200 });

  } catch (error) {
    console.error('API Error fetching listings:', error);
    return NextResponse.json({ message: 'Erro ao buscar os quartos' }, { status: 500 });
  }
}
