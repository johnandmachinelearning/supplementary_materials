'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { generateMockAccounts } from '@/lib/mockGenerator';
import { AWSAccount, Workload } from '@/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Server,
  DollarSign,
  ShieldAlert,
  Cpu,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Box,
  Slack,
  X,
  Filter,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [accounts, setAccounts] = useState<AWSAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Active filter state for interactivity
  const [activeFilter, setActiveFilter] = useState<{
    category: 'compute' | 'backup';
    type?: 'EC2' | 'EKS' | 'ECS';
    status?: 'healthy' | 'warning' | 'critical' | 'failed' | 'successful';
    label: string;
  } | null>(null);

  const inspectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = generateMockAccounts(200);
    setAccounts(data);
    setLoading(false);
  }, []);

  // Compute Aggregates
  const computeAndBackupMetrics = useMemo(() => {
    if (!accounts.length) return null;

    let ec2Count = 0, ec2Healthy = 0, ec2Warning = 0, ec2Critical = 0;
    let eksCount = 0, eksHealthy = 0, eksWarning = 0, eksCritical = 0;
    let ecsCount = 0, ecsHealthy = 0, ecsWarning = 0, ecsCritical = 0;

    let totalProtectedResources = 0;
    let totalSuccessfulBackups = 0;
    let totalFailedBackups = 0;

    accounts.forEach((acc) => {
      totalProtectedResources += acc.backupStatus.totalProtectedResources;
      totalSuccessfulBackups += acc.backupStatus.successfulJobs;
      totalFailedBackups += acc.backupStatus.failedJobs;

      acc.workloads.forEach((w) => {
        if (w.type === 'EC2') {
          ec2Count++;
          if (w.status === 'healthy') ec2Healthy++;
          else if (w.status === 'warning') ec2Warning++;
          else ec2Critical++;
        } else if (w.type === 'EKS') {
          eksCount++;
          if (w.status === 'healthy') eksHealthy++;
          else if (w.status === 'warning') eksWarning++;
          else eksCritical++;
        } else if (w.type === 'ECS') {
          ecsCount++;
          if (w.status === 'healthy') ecsHealthy++;
          else if (w.status === 'warning') ecsWarning++;
          else ecsCritical++;
        }
      });
    });

    const overallBackupRate = Math.round((totalSuccessfulBackups / totalProtectedResources) * 100);

    return {
      ec2: { total: ec2Count, healthy: ec2Healthy, warning: ec2Warning, critical: ec2Critical },
      eks: { total: eksCount, healthy: eksHealthy, warning: eksWarning, critical: eksCritical },
      ecs: { total: ecsCount, healthy: ecsHealthy, warning: ecsWarning, critical: ecsCritical },
      backups: {
        totalProtectedResources,
        totalSuccessfulBackups,
        totalFailedBackups,
        overallBackupRate,
      },
    };
  }, [accounts]);

  // Filter accounts dynamically based on active filter button clicked
  const filteredAccounts = useMemo(() => {
    if (!activeFilter) return [];

    return accounts.filter((acc) => {
      if (activeFilter.category === 'backup') {
        if (activeFilter.status === 'failed') return acc.backupStatus.failedJobs > 0;
        if (activeFilter.status === 'successful') return acc.backupStatus.successfulJobs > 0;
      }

      if (activeFilter.category === 'compute' && activeFilter.type && activeFilter.status) {
        return acc.workloads.some(
          (w) => w.type === activeFilter.type && w.status === activeFilter.status
        );
      }

      return false;
    });
  }, [accounts, activeFilter]);

  const handleSetFilter = (filter: typeof activeFilter) => {
    if (
      activeFilter?.category === filter?.category &&
      activeFilter?.type === filter?.type &&
      activeFilter?.status === filter?.status
    ) {
      setActiveFilter(null); // Toggle off if already active
    } else {
      setActiveFilter(filter);
      setTimeout(() => {
        inspectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  // Chart Data
  const computeHealthChartData = useMemo(() => {
    if (!computeAndBackupMetrics) return null;

    return {
      labels: ['EC2 Instances', 'EKS Clusters', 'ECS Services'],
      datasets: [
        {
          label: 'Healthy',
          data: [
            computeAndBackupMetrics.ec2.healthy,
            computeAndBackupMetrics.eks.healthy,
            computeAndBackupMetrics.ecs.healthy,
          ],
          backgroundColor: '#10b981',
        },
        {
          label: 'Warning',
          data: [
            computeAndBackupMetrics.ec2.warning,
            computeAndBackupMetrics.eks.warning,
            computeAndBackupMetrics.ecs.warning,
          ],
          backgroundColor: '#f59e0b',
        },
        {
          label: 'Critical',
          data: [
            computeAndBackupMetrics.ec2.critical,
            computeAndBackupMetrics.eks.critical,
            computeAndBackupMetrics.ecs.critical,
          ],
          backgroundColor: '#ef4444',
        },
      ],
    };
  }, [computeAndBackupMetrics]);

  const backupDoughnutData = useMemo(() => {
    if (!computeAndBackupMetrics) return null;

    return {
      labels: ['Successful Jobs', 'Failed Jobs'],
      datasets: [
        {
          data: [
            computeAndBackupMetrics.backups.totalSuccessfulBackups,
            computeAndBackupMetrics.backups.totalFailedBackups,
          ],
          backgroundColor: ['#10b981', '#ef4444'],
          borderWidth: 0,
        },
      ],
    };
  }, [computeAndBackupMetrics]);

  if (loading || !computeAndBackupMetrics || !computeHealthChartData || !backupDoughnutData) {
    return <div className="p-8 text-center text-slate-400">Loading 200 AWS Account Telemetry...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cloud Control Center</h1>
          <p className="text-slate-400 text-sm">
            Click on any workload status or backup metric to inspect affected accounts
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs font-mono flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300">200 Accounts Active</span>
        </div>
      </div>

      {/* EC2, EKS, ECS Compute Health Summary (Interactive) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComputeHealthCard
          title="EC2 Instances"
          type="EC2"
          icon={<Cpu className="w-5 h-5 text-blue-400" />}
          metrics={computeAndBackupMetrics.ec2}
          activeFilter={activeFilter}
          onSelectFilter={handleSetFilter}
        />
        <ComputeHealthCard
          title="EKS Clusters"
          type="EKS"
          icon={<Layers className="w-5 h-5 text-purple-400" />}
          metrics={computeAndBackupMetrics.eks}
          activeFilter={activeFilter}
          onSelectFilter={handleSetFilter}
        />
        <ComputeHealthCard
          title="ECS Services"
          type="ECS"
          icon={<Box className="w-5 h-5 text-emerald-400" />}
          metrics={computeAndBackupMetrics.ecs}
          activeFilter={activeFilter}
          onSelectFilter={handleSetFilter}
        />
      </div>

      {/* AWS Backup Overview Row (Interactive) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-lg font-semibold text-slate-200">AWS Backup Compliance & Status</h2>
              <p className="text-xs text-slate-400">Click failed or successful metrics to filter accounts</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-emerald-400">
              {computeAndBackupMetrics.backups.overallBackupRate}%
            </span>
            <p className="text-xs text-slate-500">Compliance Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
            <p className="text-xs text-slate-400">Protected Vault Resources</p>
            <p className="text-xl font-bold text-white mt-1">
              {computeAndBackupMetrics.backups.totalProtectedResources.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() =>
              handleSetFilter({
                category: 'backup',
                status: 'successful',
                label: 'Accounts with Successful Backups',
              })
            }
            className={`bg-slate-950 border p-4 rounded-lg text-left transition ${
              activeFilter?.category === 'backup' && activeFilter?.status === 'successful'
                ? 'border-emerald-500 ring-1 ring-emerald-500'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <p className="text-xs text-slate-400">Successful Jobs (24h)</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              {computeAndBackupMetrics.backups.totalSuccessfulBackups.toLocaleString()}
            </p>
          </button>

          <button
            onClick={() =>
              handleSetFilter({
                category: 'backup',
                status: 'failed',
                label: 'Accounts with Failed Backup Jobs',
              })
            }
            className={`bg-slate-950 border p-4 rounded-lg text-left transition ${
              activeFilter?.category === 'backup' && activeFilter?.status === 'failed'
                ? 'border-red-500 ring-1 ring-red-500 bg-red-950/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <p className="text-xs text-slate-400">Failed Backup Jobs</p>
            <p className="text-xl font-bold text-red-400 mt-1">
              {computeAndBackupMetrics.backups.totalFailedBackups.toLocaleString()}
            </p>
          </button>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex items-center justify-center">
            <div className="h-16 w-16">
              <Doughnut
                data={backupDoughnutData}
                options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC FILTER INSPECTION PANEL */}
      {activeFilter && (
        <div
          ref={inspectorRef}
          className="bg-slate-900 border-2 border-emerald-500/50 rounded-xl p-6 space-y-4 shadow-2xl transition-all"
        >
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Filtered Results: {activeFilter.label}</h2>
                <p className="text-xs text-slate-400">
                  Found {filteredAccounts.length} affected accounts out of 200
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveFilter(null)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="p-3">Account ID</th>
                  <th className="p-3">Account Name</th>
                  <th className="p-3">Environment</th>
                  <th className="p-3">Relevant Workloads</th>
                  <th className="p-3">Backup Status</th>
                  <th className="p-3">Monthly Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAccounts.map((acc) => {
                  const matchingWorkloads = activeFilter.type
                    ? acc.workloads.filter(
                        (w) => w.type === activeFilter.type && w.status === activeFilter.status
                      )
                    : acc.workloads;

                  return (
                    <tr key={acc.accountId} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-xs text-slate-400">{acc.accountId}</td>
                      <td className="p-3 font-semibold text-white">{acc.accountName}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${
                            acc.environment === 'production'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}
                        >
                          {acc.environment}
                        </span>
                      </td>
                      <td className="p-3">
                        {matchingWorkloads.map((w) => (
                          <span
                            key={w.id}
                            className={`inline-block mr-2 text-xs font-mono px-2 py-0.5 rounded ${
                              w.status === 'critical'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : w.status === 'warning'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {w.name} ({w.status})
                          </span>
                        ))}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-xs font-bold ${
                            acc.backupStatus.failedJobs > 0 ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {acc.backupStatus.successfulJobs} Success / {acc.backupStatus.failedJobs} Failed
                        </span>
                      </td>
                      <td className="p-3 font-mono text-emerald-400">
                        ${acc.monthlySpend.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">Workload Status Distribution</h2>
          <div className="h-72">
            <Bar
              data={computeHealthChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { color: '#cbd5e1' } } },
                scales: {
                  x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                  y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">Accounts with Failed Backup Jobs</h2>
          <div className="space-y-3 overflow-y-auto max-h-72">
            {accounts
              .filter((a) => a.backupStatus.failedJobs > 0)
              .slice(0, 5)
              .map((acc) => (
                <div
                  key={acc.accountId}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white text-sm">{acc.accountName}</span>
                      <span className="text-xs font-mono text-slate-500">({acc.accountId})</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {acc.backupStatus.successfulJobs} Successful / {acc.backupStatus.totalProtectedResources} Total
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleSetFilter({
                        category: 'backup',
                        status: 'failed',
                        label: `Failed Backups for ${acc.accountName}`,
                      })
                    }
                    className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1 rounded text-red-400 text-xs font-bold transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{acc.backupStatus.failedJobs} Failed</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComputeHealthCard({
  title,
  type,
  icon,
  metrics,
  activeFilter,
  onSelectFilter,
}: {
  title: string;
  type: 'EC2' | 'EKS' | 'ECS';
  icon: React.ReactNode;
  metrics: { total: number; healthy: number; warning: number; critical: number };
  activeFilter: any;
  onSelectFilter: (filter: any) => void;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="font-semibold text-slate-200">{title}</h3>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
          {metrics.total} Total
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs mt-4">
        {/* Healthy Button */}
        <button
          onClick={() =>
            onSelectFilter({
              category: 'compute',
              type,
              status: 'healthy',
              label: `Accounts with Healthy ${type} Workloads`,
            })
          }
          className={`p-2 rounded border transition ${
            activeFilter?.type === type && activeFilter?.status === 'healthy'
              ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-1 text-emerald-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-bold">{metrics.healthy}</span>
          </div>
          <span className="text-slate-500">Healthy</span>
        </button>

        {/* Warning Button */}
        <button
          onClick={() =>
            onSelectFilter({
              category: 'compute',
              type,
              status: 'warning',
              label: `Accounts with Warning Status ${type} Workloads`,
            })
          }
          className={`p-2 rounded border transition ${
            activeFilter?.type === type && activeFilter?.status === 'warning'
              ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-1 text-amber-400 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-bold">{metrics.warning}</span>
          </div>
          <span className="text-slate-500">Warning</span>
        </button>

        {/* Critical Button */}
        <button
          onClick={() =>
            onSelectFilter({
              category: 'compute',
              type,
              status: 'critical',
              label: `Accounts with Critical ${type} Workloads`,
            })
          }
          className={`p-2 rounded border transition ${
            activeFilter?.type === type && activeFilter?.status === 'critical'
              ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-1 text-red-400 mb-1">
            <XCircle className="w-3.5 h-3.5" />
            <span className="font-bold">{metrics.critical}</span>
          </div>
          <span className="text-slate-500">Critical</span>
        </button>
      </div>
    </div>
  );
}