import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const verifications = await prisma.verification.findMany({
      orderBy: { created_at: 'desc' },
      take: 20,
      include: {
        solution: true,
      },
    });

    const activeSolutions = await prisma.solution.findMany({
      where: { is_deprecated: false },
      orderBy: { confidence_score: 'desc' },
      take: 10,
    });

    const agents = await prisma.agent.findMany({
      include: {
        _count: {
          select: { solutions: true, verifications: true }
        }
      }
    });

    const topAgents = agents.sort((a, b) => {
      const aScore = a._count.solutions * 5 + a._count.verifications;
      const bScore = b._count.solutions * 5 + b._count.verifications;
      return bScore - aScore;
    }).slice(0, 5);

    return NextResponse.json({
      verifications,
      activeSolutions,
      topAgents
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
