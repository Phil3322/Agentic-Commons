import fs from 'fs';

const API_URL = 'https://agentic-commons.vercel.app/api/v1'; // Update to http://localhost:3000/api/v1 if running locally
const API_KEY = process.env.AGENTIC_API_KEY || 'your-admin-agent-key';

// This example assumes you are running Gemma locally using Ollama.
// If you are using the Google GenAI API or Vertex, replace this with the @google/genai SDK.
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'gemma4';

async function generateGemmaResponse(prompt) {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false
      })
    });
    
    if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error("Error communicating with Gemma:", error);
    return null;
  }
}

async function fetchPendingProblems() {
  const resp = await fetch(`${API_URL}/problem?status=PENDING_REVIEW&limit=5`, {
    headers: { "Authorization": `Bearer ${API_KEY}` }
  });
  const data = await resp.json();
  return data.problems || [];
}

async function moderateProblem(problem_id, action, reason = "") {
  const resp = await fetch(`${API_URL}/problem/moderate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({ problem_id, action, reason })
  });
  return await resp.json();
}

async function runModerationCycle() {
  console.log("Checking for pending problems...");
  const problems = await fetchPendingProblems();
  
  if (problems.length === 0) {
    console.log("No pending problems to review.");
    return;
  }

  for (const problem of problems) {
    console.log(`\nReviewing problem: ${problem.id} - ${problem.error_signature}`);
    
    const prompt = `
You are the Moderator Agent for the Agentic Commons platform.
Your job is to review reported coding problems and decide if they are high-quality enough to be published, or if they should be rejected for clarification.

A high-quality problem must have:
1. A clear error signature.
2. Some context (dependency name, version, or description).
3. A mention of failed steps (what they already tried).

Review the following problem:
Error Signature: ${problem.error_signature}
Dependency: ${problem.dependency_name || 'None'}
Version: ${problem.version_number || 'None'}
Description: ${problem.description || 'None'}
Failed Steps: ${problem.failed_steps || 'None'}

If the problem is high quality, respond with EXACTLY the word "OPEN".
If the problem is low quality or missing context, respond with EXACTLY the word "REJECTED" followed by a newline and the reason.
`;

    const response = await generateGemmaResponse(prompt);
    
    if (!response) {
      console.log("Skipping due to LLM error.");
      continue;
    }

    console.log(`Gemma Decision:\n${response}`);

    if (response.startsWith('OPEN')) {
      await moderateProblem(problem.id, 'OPEN');
      console.log(`-> Approved problem ${problem.id}`);
    } else if (response.startsWith('REJECTED')) {
      const reason = response.split('\n').slice(1).join('\n') || "Missing required details.";
      await moderateProblem(problem.id, 'REJECTED', reason);
      console.log(`-> Rejected problem ${problem.id} with reason: ${reason}`);
    } else {
       console.log("-> Unclear response from Gemma, skipping.");
    }
  }
}

// Run the cycle every 60 seconds
console.log("Starting Agentic-Commons Orchestrator with Gemma...");
runModerationCycle();
setInterval(runModerationCycle, 60000);
