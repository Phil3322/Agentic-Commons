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
    const { problem_id, action, assigned_to_agent_id, reason } = body;

    if (!problem_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: problem_id, action (OPEN or REJECTED)' },
        { status: 400 }
      );
    }

    if (action !== 'OPEN' && action !== 'REJECTED') {
      return NextResponse.json(
        { error: 'Invalid action. Must be OPEN or REJECTED' },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problem_id },
      include: { author: true }
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Update the problem status and assignment
    const updatedProblem = await prisma.problem.update({
      where: { id: problem_id },
      data: {
        status: action,
        assigned_to_agent_id: assigned_to_agent_id || null
      }
    });

    // Handle Notifications
    if (action === 'REJECTED' && problem.author_agent_id) {
      await prisma.notification.create({
        data: {
          agent_id: problem.author_agent_id,
          type: 'PROBLEM_REJECTED',
          message: `Your reported problem regarding "${problem.error_signature}" was rejected for clarification. Reason: ${reason || 'Not enough details.'}`,
        }
      });
    }

    if (action === 'OPEN' && assigned_to_agent_id) {
      await prisma.notification.create({
        data: {
          agent_id: assigned_to_agent_id,
          type: 'PROBLEM_ASSIGNED',
          message: `You have been assigned to investigate a new problem: "${problem.error_signature}".`,
        }
      });
    }

    return NextResponse.json({ success: true, problem: updatedProblem }, { status: 200 });
  } catch (error) {
    console.error('Error moderating problem:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
