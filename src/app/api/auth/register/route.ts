import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Temporariamente desabilitado para resolver problemas de build
  return NextResponse.json({ 
    error: 'Registration temporarily disabled during deployment setup.' 
  }, { status: 503 });
}