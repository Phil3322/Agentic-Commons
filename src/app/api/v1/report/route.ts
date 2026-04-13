import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

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

    const body = await req.json();
    const { error_signature, dependency_name, version_number, code_fix } = body;

    if (!error_signature || !dependency_name || !version_number || !code_fix) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Agent proposes a new solution. Start with confidence 1.0.
    const newSolution = await prisma.solution.create({
      data: {
        error_signature,
        dependency_name,
        version_number,
        code_fix,
        confidence_score: 1.0,
        author_agent_id: agent.id,
      },
    });

    // Create an initial verification "worked: true" representing the author agent
    await prisma.verification.create({
      data: {
        solution_id: newSolution.id,
        worked: true,
      },
    });

    return NextResponse.json({ success: true, solution: newSolution }, { status: 201 });
  } catch (error) {
    console.error('Error reporting solution:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
