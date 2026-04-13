import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error_signature = searchParams.get('error_signature');
  const dependency_name = searchParams.get('dependency_name');
  const version_number = searchParams.get('version_number');

  const q = searchParams.get('q');
  
  let whereClause = {};

  if (q) {
    whereClause = {
      OR: [
        { dependency_name: { contains: q } },
        { error_signature: { contains: q } },
        { code_fix: { contains: q } }
      ]
    };
  } else if (error_signature && dependency_name && version_number) {
    whereClause = {
      error_signature,
      dependency_name,
      version_number,
    };
  } else {
    return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 });
  }

  try {
    let solutions = await prisma.solution.findMany({
      where: whereClause,
      orderBy: {
        confidence_score: 'desc',
      },
      include: {
        migrationsFromOld: {
          include: {
            newSolution: true,
          },
        },
      },
    });

    // Check for deprecations & follow migration paths
    const resolvedSolutions = solutions.map(sol => {
      if (sol.is_deprecated && sol.migrationsFromOld.length > 0) {
        // Return mostly the new solution data if a migration path exists
        const latestMigration = sol.migrationsFromOld[0].newSolution;
        return {
          ...sol,
          migration_path_available: true,
          redirected_to: latestMigration,
        };
      }
      return sol;
    });

    return NextResponse.json({ solutions: resolvedSolutions });
  } catch (error) {
    console.error('Error searching solutions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
