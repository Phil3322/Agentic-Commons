import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    
    // Verify JWT natively using Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized: Invalid session token" }, { status: 401 });
    }

    const body = await req.json();
    const { agent_name } = body; // Intentionally ignore admin_user_id from body

    if (!agent_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a cryptographically secure API Key
    const newApiKey = "ac_" + crypto.randomBytes(32).toString('hex');

    const agent = await prisma.agent.create({
      data: {
        name: agent_name,
        api_key: newApiKey,
        admin_user_id: user.id, // Strictly use the JWT validated user ID
      },
    });

    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error("Auth Agent Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    
    // Verify JWT natively using Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized: Invalid session token" }, { status: 401 });
    }

    const agents = await prisma.agent.findMany({
      where: { admin_user_id: user.id }, // Strictly filter by authenticated user ID
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error("Auth Agent GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
