'use client';

import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  Send,
  Filter,
  Search,
  Layers,
  TrendingUp,
  Activity,
  Timer,
  Gauge,
  CheckCircle,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface Approver {
  id: string;
  name: string;
  role: string;
  team: 'DevOps' | 'Security' | 'Network' | 'Lead Architecture';
  status: 'Available' | 'On-Call' | 'In Review' | 'Away';
  allowedEnvironments: string[];
  avatarUrl: string;
  email: string;
}

interface PendingDeployment {
  id: string;
  pipelineId: string;
  repository: string;
  branch: string;
  commitHash: string;
  commitMessage: string;
  environment: 'Production' | 'Staging' | 'UAT';
  requestedBy: string;
  requestedAt: string;
  riskScore: 'Low' | 'Medium' | 'High';
  requiredApprovals: number;
  currentApprovals: string[];
  assignedApprovers: Approver[];
  securityStatus: 'Passed' | 'Warnings' | 'Failed';
}

interface DoraMetric {
  title: string;
  value: string;
  benchmark: string;
  change: string;
  isPositive: boolean;
  description: string;
}

// 30-day mock DORA trend data
const DORA_30_DAY_DATA = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;
  const isWeekend = day % 7 === 0 || day % 7 === 6;
  const deployments = isWeekend
    ? Math.floor(Math.random() * 5) + 2
    : Math.floor(Math.random() * 12) + 12;
  const leadTimeMins = Math.max(25, Math.floor(60 - day * 0.7 + (Math.random() * 10 - 5)));
  const failureRatePercent = parseFloat(
    Math.max(0.5, 4.5 - day * 0.08 + (Math.random() * 1.5 - 0.75)).toFixed(1)
  );
  const mttrMins = Math.max(8, Math.floor(28 - day * 0.4 + (Math.random() * 6 - 3)));

  return {
    date: `Day ${day}`,
    deployments,
    leadTimeMins,
    failureRatePercent,
    mttrMins,
  };
});

const AUTHORIZED_APPROVERS: Approver[] = [
  {
    id: 'appr-1',
    name: 'Alex Rivera',
    role: 'Lead DevOps Engineer',
    team: 'DevOps',
    status: 'On-Call',
    allowedEnvironments: ['Production', 'Staging', 'UAT'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'arivera@company.com',
  },
  {
    id: 'appr-2',
    name: 'Sarah Jenkins',
    role: 'Cloud Security Lead',
    team: 'Security',
    status: 'Available',
    allowedEnvironments: ['Production', 'Staging'],
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    email: 'sjenkins@company.com',
  },
  {
    id: 'appr-3',
    name: 'Elena Rostova',
    role: 'Azure Cloud Architect',
    team: 'DevOps',
    status: 'Available',
    allowedEnvironments: ['Production', 'Staging', 'UAT'],
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    email: 'erostova@company.com',
  },
  {
    id: 'appr-4',
    name: 'Marcus Chen',
    role: 'Principal Network Engineer',
    team: 'Network',
    status: 'In Review',
    allowedEnvironments: ['Production'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'mchen@company.com',
  },
];

const INITIAL_DEPLOYMENTS: PendingDeployment[] = [
  {
    id: 'dep-901',
    pipelineId: 'pipe-az-prod-482',
    repository: 'payment-gateway-service',
    branch: 'release/v2.14.0',
    commitHash: '8f2a1b9',
    commitMessage: 'feat(pay): add GCP BigQuery telemetry fallback & Azure keyvault rotation',
    environment: 'Production',
    requestedBy: 'Jordan Vance',
    requestedAt: '12 mins ago',
    riskScore: 'High',
    requiredApprovals: 2,
    currentApprovals: ['appr-1'],
    assignedApprovers: [AUTHORIZED_APPROVERS[0], AUTHORIZED_APPROVERS[1]],
    securityStatus: 'Passed',
  },
  {
    id: 'dep-902',
    pipelineId: 'pipe-gcp-stg-104',
    repository: 'auth-identity-provider',
    branch: 'main',
    commitHash: '3c990ef',
    commitMessage: 'chore(deps): bump Entra ID SDK to v3.12 and patch OpenSSL vulns',
    environment: 'Staging',
    requestedBy: 'David Kalu',
    requestedAt: '35 mins ago',
    riskScore: 'Low',
    requiredApprovals: 1,
    currentApprovals: [],
    assignedApprovers: [AUTHORIZED_APPROVERS[2]],
    securityStatus: 'Passed',
  },
];

export default function DevOpsPipelineDashboard() {
  const [deployments, setDeployments] = useState<PendingDeployment[]>(INITIAL_DEPLOYMENTS);
  const [approvers] = useState<Approver[]>(AUTHORIZED_APPROVERS);
  const [envFilter, setEnvFilter] = useState<'All' | 'Production' | 'Staging' | 'UAT'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const doraMetrics: DoraMetric[] = [
    {
      title: 'Deployment Frequency',
      value: '18.4 / day',
      benchmark: 'Elite Tier',
      change: '+14% vs last week',
      isPositive: true,
      description: 'Average successful deployments to Production per day across all microservices.',
    },
    {
      title: 'Lead Time for Changes',
      value: '42 mins',
      benchmark: 'Elite Tier',
      change: '-8 mins faster',
      isPositive: true,
      description: 'Time elapsed from code commit to running live in Production.',
    },
    {
      title: 'Change Failure Rate',
      value: '2.1%',
      benchmark: '< 5% Target',
      change: '-0.4% improvement',
      isPositive: true,
      description: 'Percentage of releases requiring immediate hotfix, rollback, or patch.',
    },
    {
      title: 'Mean Time to Recovery (MTTR)',
      value: '14 mins',
      benchmark: '< 30m SLA',
      change: '-3 mins faster',
      isPositive: true,
      description: 'Average time taken to restore service when a production failure occurs.',
    },
  ];

  const handleApprove = (deploymentId: string, approverId: string) => {
    setDeployments((prev) =>
      prev.map((dep) => {
        if (dep.id === deploymentId && !dep.currentApprovals.includes(approverId)) {
          return {
            ...dep,
            currentApprovals: [...dep.currentApprovals, approverId],
          };
        }
        return dep;
      })
    );
  };

  const handleReject = (deploymentId: string) => {
    setDeployments((prev) => prev.filter((dep) => dep.id !== deploymentId));
  };

  const filteredDeployments = deployments.filter((dep) => {
    if (envFilter !== 'All' && dep.environment !== envFilter) return false;
    return (
      dep.repository.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.commitMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.requestedBy.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <GitPullRequest className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-bold">CI/CD Pipeline & DORA Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time deployment gates, 30-day DORA velocity trends, and authorized approvers roster
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-full text-xs font-semibold flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Gate & Telemetry Active</span>
          </span>
        </div>
      </div>

      {/* DORA Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {doraMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-2 hover:border-purple-500/30 transition"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">{metric.title}</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full border border-purple-500/20">
                {metric.benchmark}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-slate-900 dark:text-white">{metric.value}</p>
              <span className="text-[11px] font-semibold text-emerald-500 flex items-center space-x-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{metric.change}</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Interactive DORA Trend Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Deployment Volume vs Change Failure Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                <h3 className="text-sm font-bold">Deployment Frequency vs Change Failure Rate</h3>
                <p className="text-xs text-slate-400">30-day velocity comparison</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last 30 Days</span>
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={DORA_30_DAY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={5} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="deployments"
                  name="Deployments / Day"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  opacity={0.85}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="failureRatePercent"
                  name="Change Failure Rate (%)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Lead Time for Changes vs MTTR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="text-sm font-bold">Lead Time for Changes & MTTR Trend</h3>
                <p className="text-xs text-slate-400">Cycle time vs Incident recovery duration (mins)</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last 30 Days</span>
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DORA_30_DAY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadTimeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mttrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={5} />
                <YAxis tick={{ fontSize: 10 }} unit="m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="leadTimeMins"
                  name="Lead Time (mins)"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#leadTimeGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="mttrMins"
                  name="MTTR (mins)"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#mttrGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Telemetry Quick Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">CI/CD Pipeline Success Rate</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">98.6%</p>
            <p className="text-[11px] text-slate-400">Last 500 builds across GitLab & Azure</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Build & Test Duration</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">6m 24s</p>
            <p className="text-[11px] text-slate-400">Target: &lt; 10 mins</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Timer className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Security & Vulnerability Gate</p>
            <p className="text-xl font-bold text-emerald-500">0 Critical Vulns</p>
            <p className="text-[11px] text-slate-400">SonarQube & Snyk passed</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Gauge className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Roster of Available Approvers */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className="text-base font-bold">Authorized Pipeline Approvers</h2>
              <p className="text-xs text-slate-400">Designated sign-off personnel across DevOps, Security, and Architecture</p>
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {approvers.filter((a) => a.status === 'Available' || a.status === 'On-Call').length} Online
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {approvers.map((approver) => (
            <div
              key={approver.id}
              className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2.5 relative"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={approver.avatarUrl}
                  alt={approver.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold truncate text-slate-900 dark:text-white">{approver.name}</h3>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        approver.status === 'Available' || approver.status === 'On-Call'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      {approver.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{approver.role}</p>
                </div>
              </div>

              <div className="text-[10px] space-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                <div className="flex justify-between text-slate-500">
                  <span>Scope:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {approver.allowedEnvironments.join(', ')}
                  </span>
                </div>
              </div>

              <a
                href={`mailto:${approver.email}?subject=Deployment%20Approval%20Request`}
                className="w-full mt-1 px-2 py-1 bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-[10px] font-semibold flex items-center justify-center space-x-1 transition"
              >
                <Send className="w-3 h-3" />
                <span>Request Sign-off</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold">Environment:</span>
          <div className="flex space-x-1">
            {(['All', 'Production', 'Staging', 'UAT'] as const).map((env) => (
              <button
                key={env}
                onClick={() => setEnvFilter(env)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  envFilter === env
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search pipelines or repos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Pending Deployments Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Pending Deployment Queue ({filteredDeployments.length})</span>
          </h2>
        </div>

        {filteredDeployments.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
            No pipelines currently pending approval.
          </div>
        ) : (
          filteredDeployments.map((dep) => {
            const isApproved = dep.currentApprovals.length >= dep.requiredApprovals;

            return (
              <div
                key={dep.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 hover:border-purple-500/40 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {dep.repository}
                      </span>
                      <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                        {dep.branch} @ {dep.commitHash}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          dep.environment === 'Production'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}
                      >
                        {dep.environment}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">{dep.commitMessage}</p>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Risk Assessment</p>
                      <span
                        className={`font-bold ${
                          dep.riskScore === 'High'
                            ? 'text-rose-500'
                            : dep.riskScore === 'Medium'
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {dep.riskScore} Risk
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Security Gate</p>
                      <span className="font-bold text-emerald-500 flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{dep.securityStatus}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">
                        Requested by <strong className="text-slate-700 dark:text-slate-200">{dep.requestedBy}</strong>{' '}
                        • {dep.requestedAt}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="text-slate-400">Approvals Progress:</span>
                      <span className="font-bold font-mono text-purple-500">
                        {dep.currentApprovals.length} / {dep.requiredApprovals}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReject(dep.id)}
                      className="px-3 py-1.5 border border-rose-300 dark:border-rose-900/50 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-medium flex items-center space-x-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleApprove(dep.id, AUTHORIZED_APPROVERS[0].id)}
                      disabled={isApproved}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition ${
                        isApproved
                          ? 'bg-emerald-500 text-white cursor-default'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isApproved ? 'Approved & Promoting' : 'Sign Off & Deploy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}