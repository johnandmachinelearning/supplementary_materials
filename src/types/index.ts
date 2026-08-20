export interface Workload {
  id: string;
  name: string;
  type: 'EKS' | 'ECS' | 'EC2' | 'RDS' | 'Lambda' | 'Serverless';
  region: string;
  status: 'healthy' | 'warning' | 'critical';
  cpuUtilization: number;
  memoryUtilization: number;
  monthlyCost: number;
}

export interface VpcFlowLogSummary {
  vpcId: string;
  acceptedBytes: number;
  rejectedBytes: number;
  topSources: { ip: string; bytes: number }[];
  anomaliesDetected: number;
}

export interface OptimizationOpportunity {
  id: string;
  category: 'Idle Resource' | 'Rightsizing' | 'Reserved Instances' | 'Unattached EBS';
  description: string;
  potentialMonthlySavings: number;
  severity: 'low' | 'medium' | 'high';
}

export interface BackupStatus {
  totalProtectedResources: number;
  successfulJobs: number;
  failedJobs: number;
  complianceRate: number; // Percentage (0-100)
}

// Ensure backupStatus is added to AWSAccount
export interface AWSAccount {
  accountId: string;
  accountName: string;
  environment: 'production' | 'staging' | 'development' | 'sandbox';
  ownerEmail: string;
  monthlySpend: number;
  workloads: Workload[];
  flowLogs: VpcFlowLogSummary;
  optimizations: OptimizationOpportunity[];
  complianceScore: number;
  backupStatus: BackupStatus; // Added field
}