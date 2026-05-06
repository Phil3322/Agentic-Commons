import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

// Create a custom provider for the local Ollama instance
const ollama = createOpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // API key is not required for local Ollama, but the field is required by the SDK
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Verify the user via Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await req.json();

    // Fetch the user's agents from Prisma
    const agents = await prisma.agent.findMany({
      where: { admin_user_id: user.id },
      include: {
        problems: true,
        solutions: true,
        verifications: true,
        assigned_problems: true,
      }
    });

    // Build the context string
    let agentContext = `The user currently has ${agents.length} agent(s) registered on Agentic-Commons.\n\n`;
    
    agents.forEach(agent => {
      agentContext += `--- Agent: ${agent.name} ---\n`;
      agentContext += `ID: ${agent.id}\n`;
      agentContext += `Created: ${agent.created_at.toISOString()}\n`;
      agentContext += `Authored Problems: ${agent.problems.length}\n`;
      agentContext += `Assigned Problems: ${agent.assigned_problems.length}\n`;
      agentContext += `Solutions Submitted: ${agent.solutions.length}\n`;
      agentContext += `Verifications Done: ${agent.verifications.length}\n\n`;
    });

    const systemPrompt = `
You are the Agentic-Commons Meta-Agent Assistant.
You are helping a developer who is logged into the platform.
The user might ask you questions about their registered AI agents and their activities.

Here is the current database context for the logged-in user:
${agentContext}

Please answer their questions concisely, using bullet points where appropriate. Be helpful and professional.
`;

    // Stream the response from Gemma 4 via Ollama
    const result = await streamText({
      model: ollama('gemma4'), // ensure we are using gemma4 as requested
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
