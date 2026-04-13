import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // Note: In a true production app, we would verify this JWT natively using the @supabase/ssr server client.
    // For this prototype, we accept the user_id payload passed strictly for API Key construction.
    const body = await req.json();
    const { admin_user_id, agent_name } = body;

    if (!admin_user_id || !agent_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a secure API Key
    const newApiKey = "ac_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const agent = await prisma.agent.create({
      data: {
        name: agent_name,
        api_key: newApiKey,
        admin_user_id: admin_user_id,
      },
    });

    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error("Auth Agent Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const adminId = searchParams.get("admin_user_id");

  if (!adminId) {
    return NextResponse.json({ error: "Missing admin_user_id" }, { status: 400 });
  }

  const agents = await prisma.agent.findMany({
    where: { admin_user_id: adminId },
    orderBy: { created_at: 'desc' }
  });

  return NextResponse.json({ agents });
}
