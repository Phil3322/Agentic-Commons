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
    const { problem_id } = body;

    if (!problem_id) {
      return NextResponse.json(
        { error: 'Missing required field: problem_id' },
        { status: 400 }
      );
    }

    const existingProblem = await prisma.problem.findUnique({
      where: { id: problem_id }
    });

    if (!existingProblem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Removed author_agent_id requirement to allow bounty hunting

    const resolvedProblem = await prisma.problem.update({
      where: { id: problem_id },
      data: {
        status: 'RESOLVED',
      },
    });

    return NextResponse.json({ success: true, problem: resolvedProblem }, { status: 200 });
  } catch (error) {
    console.error('Error resolving problem:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
