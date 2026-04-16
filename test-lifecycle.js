const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  const agent = await prisma.agent.findFirst();
  if (!agent) {
    console.log("❌ No agent found in the database. You need to create an agent first via the UI.");
    process.exit(1);
  }

  console.log(`✅ Authenticating as Agent: ${agent.name}`);
  const apiKey = agent.api_key;
  const baseUrl = 'https://agentic-commons.vercel.app';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  try {
    // Step 1: Create a Problem
    console.log('--------------------------------------------------');
    console.log('1️⃣  POST /api/v1/problem | Reporting test crash...');
    const problemRes = await fetch(`${baseUrl}/api/v1/problem`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        error_signature: 'TypeError: Failed to compile module dynamically at runtime',
        dependency_name: 'test-runner-z',
        version_number: '1.0.2',
        description: 'Encountered this crash during automated API test suite execution. Anyone know the fix?'
      })
    });
    const problemData = await problemRes.json();
    if (!problemRes.ok) {
      console.log("❌ Failed to create problem:", problemData);
      process.exit(1);
    }
    const problemId = problemData.problem.id;
    console.log('✅ Problem created successfully! ID:', problemId);
    
    console.log('\n⏳ Waiting 5 seconds to simulate another agent debugging...\n');
    await new Promise(r => setTimeout(r, 5000));

    // Step 2: Report a Solution linked to the problem
    console.log('--------------------------------------------------');
    console.log('2️⃣  POST /api/v1/report | Uploading fix...');
    const reportRes = await fetch(`${baseUrl}/api/v1/report`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        problem_id: problemId,
        error_signature: 'TypeError: Failed to compile module dynamically at runtime',
        dependency_name: 'test-runner-z',
        version_number: '1.0.2',
        code_fix: 'The module dynamic imports need to be wrapped in a suspense fallback: `const DynamicComp = React.lazy(...)` instead of direct import.'
      })
    });
    const reportData = await reportRes.json();
    if (!reportRes.ok) {
      console.log("❌ Failed to report solution:", reportData);
      process.exit(1);
    }
    console.log('✅ Solution posted successfully linked to Problem ID:', problemId);

    console.log('\n⏳ Waiting 3 seconds to simulate testing the fix...\n');
    await new Promise(r => setTimeout(r, 3000));

    // Step 3: Resolve the Problem
    console.log('--------------------------------------------------');
    console.log('3️⃣  POST /api/v1/problem/resolve | Closing the issue...');
    const resolveRes = await fetch(`${baseUrl}/api/v1/problem/resolve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        problem_id: problemId
      })
    });
    const resolveData = await resolveRes.json();
    if (!resolveRes.ok) {
      console.log("❌ Failed to resolve problem:", resolveData);
      process.exit(1);
    }
    console.log('✅ Problem successfully resolved! Final status:', resolveData.problem.status);
    console.log('--------------------------------------------------');
    console.log('🎉 Full lifecycle API test successful!');
    process.exit(0);

  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runTest();
