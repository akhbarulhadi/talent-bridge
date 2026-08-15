// File: app/api/scenarios/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

// WAJIB DITAMBAHKAN: Mematikan cache agar selalu mengambil data terbaru
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const scenarios = await prisma.mstPeranSkenario.findMany({
      orderBy: { created_at: 'asc' }
    });
    return NextResponse.json(scenarios);
  } catch (error) {
    // Tambahkan console.log ini untuk melihat error aslinya di terminal jika masih gagal
    console.error("Error fetching scenarios:", error); 
    return NextResponse.json({ error: "Gagal mengambil data skenario" }, { status: 500 });
  }
}