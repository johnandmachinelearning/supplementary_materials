import { AWSAccount, Workload, OptimizationOpportunity } from '@/types';

const ENVIRONMENTS = ['production', 'staging', 'development', 'sandbox'] as const;
const REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];
const WORKLOAD_TYPES = ['EKS', 'ECS', 'EC2', 'RDS', 'Lambda', 'Serverless'] as const;

export function generateMockAccounts(count = 200): AWSAccount[] {
  const accounts: AWSAccount[] = [];

  for (let i = 1; i <= count; i++) {
    const accountId = (100000000000 + i).toString();
    const env = ENVIRONMENTS[Math.floor(Math.random() * ENVIRONMENTS.length)];
    const workloadCount = Math.floor(Math.random() * 8) + 2;

    const totalProtected = Math.floor(Math.random() * 40) + 10;
    const failed = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
    const successful = totalProtected - failed;

    const backupStatus: BackupStatus = {
    totalProtectedResources: totalProtected,
    successfulJobs: successful,
    failedJobs: failed,
    complianceRate: Math.round((successful / totalProtected) * 100),
    };
    
    const workloads: Workload[] = Array.from({ length: workloadCount }, (_, idx) => ({
      id: `wl-${accountId}-${idx + 1}`,
      name: `${env}-${WORKLOAD_TYPES[idx % WORKLOAD_TYPES.length].toLowerCase()}-cluster-${idx + 1}`,
      type: WORKLOAD_TYPES[Math.floor(Math.random() * WORKLOAD_TYPES.length)],
      region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      status: Math.random() > 0.85 ? (Math.random() > 0.5 ? 'warning' : 'critical') : 'healthy',
      cpuUtilization: Math.floor(Math.random() * 85) + 10,
      memoryUtilization: Math.floor(Math.random() * 80) + 15,
      monthlyCost: parseFloat((Math.random() * 4500 + 200).toFixed(2)),
    }));

    const monthlySpend = parseFloat(workloads.reduce((acc, w) => acc + w.monthlyCost, 0).toFixed(2));

    const optimizations: OptimizationOpportunity[] = [
      {
        id: `opt-${i}-1`,
        category: 'Rightsizing',
        description: `Overprovisioned EC2 instances in ${workloads[0]?.name || 'cluster'}`,
        potentialMonthlySavings: parseFloat((monthlySpend * 0.12).toFixed(2)),
        severity: monthlySpend > 3000 ? 'high' : 'medium',
      },
      {
        id: `opt-${i}-2`,
        category: 'Unattached EBS',
        description: 'Unattached gp3 EBS volumes detected',
        potentialMonthlySavings: parseFloat((Math.random() * 150 + 30).toFixed(2)),
        severity: 'low',
      },
    ];

    accounts.push({
      accountId,
      accountName: `aws-${env}-acc-${String(i).padStart(3, '0')}`,
      environment: env,
      ownerEmail: `devops-team-${env}@company.internal`,
      monthlySpend,
      workloads,
      flowLogs: {
        vpcId: `vpc-${Math.random().toString(36).substring(2, 10)}`,
        acceptedBytes: Math.floor(Math.random() * 5000000000) + 1000000000,
        rejectedBytes: Math.floor(Math.random() * 50000000) + 10000,
        topSources: [
          { ip: '10.0.1.45', bytes: 120000000 },
          { ip: '10.0.2.112', bytes: 98000000 },
        ],
        anomaliesDetected: Math.floor(Math.random() * 5),
      },
      optimizations,
      complianceScore: Math.floor(Math.random() * 25) + 75,
      backupStatus,
    });
  }

  return accounts;
}