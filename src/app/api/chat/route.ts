import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: `You are an expert DevOps & Cloud Governance AI Agent embedded inside a Next.js Cloud Security & Cost Optimization Dashboard.
    
Your goal is to assist DevOps engineers and SecOps teams with live status updates regarding:
1. Cloud Security Posture (CIS AWS, SOC 2, HIPAA, critical vulnerabilities).
2. Cost Optimization (idle resources, right-sizing recommendations, automated Terraform PRs).
3. Dashboard & System Infrastructure Health.

Use the provided tools whenever a user asks about security status, cost savings, or system health. Be concise, actionable, and structured in your text responses.`,
    messages,
    tools: {
      getSecurityStatus: tool({
        description: 'Fetch real-time cloud security posture, framework scores, and critical findings.',
        parameters: z.object({
          framework: z.enum(['all', 'cis', 'soc2', 'hipaa']).default('all'),
        }),
        execute: async ({ framework }) => {
          // Simulated database/API lookup to dashboard backend
          return {
            overallScore: 88,
            cisScore: 92,
            soc2Score: 88,
            hipaaScore: 96,
            criticalCount: 2,
            highCount: 1,
            topVulnerability: 'S3 Bucket Public Read Access (prod-customer-backups-2026)',
            iamIssue: 'Root IAM account lacks MFA enforcement',
            frameworkFilter: framework,
          };
        },
      }),

      getCostOptimizationSummary: tool({
        description: 'Fetch monthly cost savings opportunities and open Terraform PR status.',
        parameters: z.object({}),
        execute: async () => {
          // Simulated lookup to cost-optimization service
          return {
            monthlySavingsPotential: '$2,790',
            annualSavingsPotential: '$33,480',
            openTerraformPRs: 2,
            topActionableOpportunity: 'analytics-worker-01 (m5.4xlarge → m5.xlarge) — Save $420/mo',
            idleVolumesCount: 4,
          };
        },
      }),

      getSystemHealth: tool({
        description: 'Check status of connected webhooks, scan engines, and CI/CD pipelines.',
        parameters: z.object({}),
        execute: async () => {
          return {
            slackIntegration: 'Connected (#cost-governance)',
            githubApp: 'Active (Auto-PR Enabled)',
            securityScanEngine: 'Running (Next scheduled scan in 14 minutes)',
            databaseConnection: 'Healthy',
          };
        },
      }),
    },
    maxSteps: 3, // Allows the model to execute a tool and use the output in its response
  });

  return result.toDataStreamResponse();
}