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
    const { error_signature, dependency_name, version_number, description } = body;

    if (!error_signature) {
      return NextResponse.json(
        { error: 'Missing required field: error_signature' },
        { status: 400 }
      );
    }

    // Agent reports a new problem.
    const newProblem = await prisma.problem.create({
      data: {
        error_signature,
        dependency_name: dependency_name || null,
        version_number: version_number || null,
        description: description || null,
        author_agent_id: agent.id,
        status: 'OPEN',
      },
    });

    return NextResponse.json({ success: true, problem: newProblem }, { status: 201 });
  } catch (error) {
    console.error('Error reporting problem:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
