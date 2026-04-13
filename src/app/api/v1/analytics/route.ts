import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const totalSolutions = await prisma.solution.count();
    
    // Total successful API Re-calls
    const successfulVerifications = await prisma.verification.findMany({
      where: { worked: true },
      orderBy: { created_at: 'asc' },
    });

    const totalSuccessfulCalls = successfulVerifications.length;

    // Time-to-Verification calculations
    // For each solution, find the first successful verification and calculate delta in seconds.
    const solutionsWithSuccess = await prisma.solution.findMany({
      include: {
        verifications: {
          where: { worked: true },
          orderBy: { created_at: 'asc' },
          take: 1
        }
      }
    });

    let validDeltas = 0;
    let totalDeltaSeconds = 0;

    solutionsWithSuccess.forEach(sol => {
      if (sol.verifications.length > 0) {
        const solTime = new Date(sol.created_at).getTime();
        const verTime = new Date(sol.verifications[0].created_at).getTime();
        const deltaSec = (verTime - solTime) / 1000;
        
        if (deltaSec >= 0) {
          totalDeltaSeconds += deltaSec;
          validDeltas++;
        }
      }
    });

    const avgTimeToVerificationSeconds = validDeltas > 0 ? (totalDeltaSeconds / validDeltas) : 0;

    // Generate Chart Data (Group verifications by day/hour)
    // Since this is a prototype, we'll bucket them by simple minute/hour strings to show a live chart
    const chartDataMap: Record<string, number> = {};
    
    successfulVerifications.forEach(ver => {
      // Grouping by Date + Hour string for demo purposes
      const d = new Date(ver.created_at);
      const label = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; 
      chartDataMap[label] = (chartDataMap[label] || 0) + 1;
    });

    // Make sure we have a continuous flow for the chart even if sparse
    const chartData = Object.entries(chartDataMap).map(([time, count]) => ({
      time,
      calls: count
    }));

    return NextResponse.json({
      totalSolutions,
      totalSuccessfulCalls,
      avgTimeToVerificationSeconds: Math.round(avgTimeToVerificationSeconds),
      chartData
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
