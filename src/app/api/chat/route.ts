import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      getSecurityStatus: {
        description: 'Get security status metrics',
        inputSchema: z.object({
          framework: z.string().optional(),
        }),
        execute: async ({ framework }: { framework?: string }) => ({
          overallScore: 88,
          cisScore: 92,
          soc2Score: 85,
          hipaaScore: 90,
          criticalCount: 0,
          highCount: 2,
          topVulnerability: 'Outdated SSL Certificate',
          iamIssue: 'Unused Access Keys',
          frameworkFilter: framework ?? 'ALL',
        }),
      },
    },
  });

  return result.toTextStreamResponse();
}