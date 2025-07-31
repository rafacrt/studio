import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Temporariamente desabilitado para resolver problemas de build
  return NextResponse.json({ 
    error: 'Profile endpoint temporarily disabled during deployment setup.' 
  }, { status: 503 });
}

export async function PUT(request: Request) {
  // Temporariamente desabilitado para resolver problemas de build
  return NextResponse.json({ 
    error: 'Profile update temporarily disabled during deployment setup.' 
  }, { status: 503 });
}