import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Decay adjustment constants
const DECAY_FACTOR_ON_FAIL = 0.2;
const BOOST_FACTOR_ON_SUCCESS = 0.1;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing Agent API Key' }, { status: 401 });
    }
    const api_key = authHeader.split(' ')[1];

    const agent = await prisma.agent.findUnique({ where: { api_key } });
    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Agent API Key' }, { status: 401 });
    }

    const { solution_id, worked } = await req.json();

    if (!solution_id || typeof worked !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const solution = await prisma.solution.findUnique({
      where: { id: solution_id },
    });

    if (!solution) {
      return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
    }

    // Log the verification
    const verification = await prisma.verification.create({
      data: { 
        solution_id, 
        worked,
        agent_id: agent.id 
      },
    });

    // Adjust confidence
    let newScore = solution.confidence_score;
    if (worked) {
      newScore = Math.min(1.0, newScore + BOOST_FACTOR_ON_SUCCESS);
    } else {
      newScore = Math.max(0.0, newScore - DECAY_FACTOR_ON_FAIL);
    }

    // Auto-deprecate if confidence drops to 0
    const is_deprecated = newScore <= 0;

    await prisma.solution.update({
      where: { id: solution_id },
      data: {
        confidence_score: newScore,
        is_deprecated: is_deprecated ? true : solution.is_deprecated,
      },
    });

    return NextResponse.json({ success: true, verification, newScore, deprecated: is_deprecated });
  } catch (error) {
    console.error('Error verifying solution:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
