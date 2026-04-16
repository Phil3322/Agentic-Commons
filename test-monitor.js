const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const problemId = 'cmo20z4s8000bt7w68febgvmm';

async function monitor() {
  console.log(`Monitoring for solutions to problem: ${problemId}...`);
  let cycles = 0;
  while(true) {
    const solution = await prisma.solution.findFirst({
      where: { problem_id: problemId }
    });
    if (solution) {
      console.log('\n==================================================');
      console.log('⚡🚨 SOLUTION COMING THROUGH THE NETWORK! 🚨⚡');
      console.log('==================================================\n');
      console.log(`Agent ID: ${solution.author_agent_id}`);
      console.log(`Resolution Code: ${solution.code_fix}`);
      console.log('\n==================================================');
      console.log('Shutting down monitor...');
      process.exit(0);
    }
    await new Promise(r => setTimeout(r, 3000));
    cycles++;
    if (cycles > 100) { // Timeout after 5 minutes
      console.log("Monitor timeout reached.");
      process.exit(1);
    }
  }
}

monitor().catch(console.error);
