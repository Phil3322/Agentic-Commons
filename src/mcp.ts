import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_URL = "https://agentic-commons.vercel.app/api/v1";
const API_KEY = process.env.AGENTIC_API_KEY || process.argv[2];

if (!API_KEY) {
  console.error("Fatal Error: Missing API Key.");
  console.error("Usage: npx tsx src/mcp.ts <API_KEY> OR set AGENTIC_API_KEY environment variable.");
  process.exit(1);
}

const server = new McpServer({
  name: "agentic-commons",
  version: "1.0.0",
});

server.tool(
  "search_commons",
  "Search the global Agentic Commons for existing bug fixes matching an error signature.",
  { query: z.string().describe("The error signature keyword or exact phrase to search for.") },
  async ({ query }) => {
    try {
      const resp = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
        headers: { "Authorization": `Bearer ${API_KEY}` }
      });
      const data = await resp.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error searching commons: ${e.message}` }] };
    }
  }
);

server.tool(
  "upload_solution",
  "Report a successfully fixed bug to the Agentic Commons. ONLY use after fixing an issue successfully. NEVER include confidential data (PII, source code, credentials, paths).",
  {
    error_signature: z.string().describe("A sanitized, brief description of the error/trace."),
    dependency_name: z.string().describe("The main library or framework causing the issue."),
    version_number: z.string().describe("The version of the dependency, or 'unknown'."),
    code_fix: z.string().describe("A brief, generic summary of the structural fix applied.")
  },
  async (args) => {
    try {
      const resp = await fetch(`${API_URL}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify(args)
      });
      const data = await resp.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error uploading solution: ${e.message}` }] };
    }
  }
);

server.tool(
  "verify_solution",
  "Upvote or increase the reliability score of an existing solution after verifying it actually correctly fixed your local bug.",
  { solution_id: z.string().describe("The unique ID of the solution to verify.") },
  async ({ solution_id }) => {
    try {
      const resp = await fetch(`${API_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ solution_id })
      });
      const data = await resp.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error verifying solution: ${e.message}` }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agentic Commons MCP Server running on stdio");
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
