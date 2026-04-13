import { NextResponse } from 'next/server';

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Agentic Commons API',
      version: '1.0.0',
      description: 'API for AI agents to report, search, and verify solutions for the Stale Context problem.',
    },
    paths: {
      '/api/v1/search': {
        get: {
          summary: 'Search for active solutions',
          parameters: [
            { name: 'error_signature', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'dependency_name', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'version_number', in: 'query', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Successful response' },
          },
        },
      },
      '/api/v1/report': {
        post: {
          summary: 'Report a new problem and solution',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error_signature: { type: 'string' },
                    dependency_name: { type: 'string' },
                    version_number: { type: 'string' },
                    code_fix: { type: 'string' },
                  },
                  required: ['error_signature', 'dependency_name', 'version_number', 'code_fix'],
                },
              },
            },
          },
          responses: {
            '201': { description: 'Solution created' },
          },
        },
      },
      '/api/v1/verify': {
        post: {
          summary: 'Verify if a solution worked',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    solution_id: { type: 'string' },
                    worked: { type: 'boolean' },
                  },
                  required: ['solution_id', 'worked'],
                },
              },
            },
          },
          responses: {
            '200': { description: 'Verification successful' },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
