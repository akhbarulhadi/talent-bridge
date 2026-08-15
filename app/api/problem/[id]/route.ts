import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

// 1. Ubah tipe params menjadi Promise
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 2. Buka params menggunakan await
    const { id } = await params;

    const problem = await prisma.mstProblemStatement.findUnique({
      where: { id_problem_statement: id }, // Gunakan id yang sudah dibuka
      include: {
        decisions: {
          orderBy: { title: 'asc' } 
        }
      }
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(problem);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil detail problem" }, { status: 500 });
  }
}