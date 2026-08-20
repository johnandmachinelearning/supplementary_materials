'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  DollarSign,
  Cpu,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  X,
  GitPullRequest,
  Send,
  Code2,
  Check,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';

interface OptimizationOpportunity {
  id: string;
  accountId: string;
  accountName: string;
  environment: 'production' | 'staging' | 'development';
  category: 'compute_rightsizing' | 'unattached_ebs' | 'idle_database' | 'graviton_migration' | 'savings_plan';
  resourceId: string;
  resourceName: string;
  currentSpec: string;
  recommendedSpec: string;
  estimatedMonthlySavings: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'pr_created' | 'slack_sent' | 'remediated';
  terraformFile?: string;
}

export default function OptimizationDashboard() {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [activeEnvironmentFilter, setActiveEnvironmentFilter] = useState<string>('all');
  const [activeModal, setActiveModal] = useState<{
    type: 'terraform' | 'slack';
    item: OptimizationOpportunity;
  } | null>(null);
  const [modalActionSuccess, setModalActionSuccess] = useState(false);

  const [opportunities, setOpportunities] = useState<OptimizationOpportunity[]>([
    {
      id: 'opt-101',
      accountId: '123456789012',
      accountName: 'Prod-Core-Analytics',
      environment: 'production',
      category: 'compute_rightsizing',
      resourceId: 'i-0a1b2c3d4e5f6a1',
      resourceName: 'analytics-worker-01',
      currentSpec: 'm5.4xlarge (Avg CPU 6%)',
      recommendedSpec: 'm5.xlarge',
      estimatedMonthlySavings: 420,
      riskLevel: 'Low',
      status: 'pending',
      terraformFile: 'terraform/modules/compute/analytics_workers.tf',
    },
    {
      id: 'opt-102',
      accountId: '987654321098',
      accountName: 'Dev-Sandbox-TeamA',
      environment: 'development',
      category: 'unattached_ebs',
      resourceId: 'vol-091a2b3c4d5e6f7a',
      resourceName: 'dev-temp-db-backup',
      currentSpec: 'gp2 1,000 GB (Unattached)',
      recommendedSpec: 'Delete Volume / Archive Snapshot',
      estimatedMonthlySavings: 100,
      riskLevel: 'Low',
      status: 'pending',
      terraformFile: 'terraform/modules/storage/dev_volumes.tf',
    },
    {
      id: 'opt-103',
      accountId: '555666777888',
      accountName: 'Staging-E-Commerce',
      environment: 'staging',
      category: 'idle_database',
      resourceId: 'db-staging-aurora-instance-1',
      resourceName: 'staging-aurora-writer',
      currentSpec: 'db.r5.2xlarge (0 Connections 14d)',
      recommendedSpec: 'Migrate to Aurora Serverless v2',
      estimatedMonthlySavings: 380,
      riskLevel: 'Medium',
      status: 'pending',
      terraformFile: 'terraform/environments/staging/rds.tf',
    },
    {
      id: 'opt-104',
      accountId: '123456789012',
      accountName: 'Prod-Core-Analytics',
      environment: 'production',
      category: 'graviton_migration',
      resourceId: 'i-0f9e8d7c6b5a4f3e2',
      resourceName: 'redis-cache-cluster-node',
      currentSpec: 'r5.2xlarge',
      recommendedSpec: 'r7g.2xlarge (Graviton3)',
      estimatedMonthlySavings: 290,
      riskLevel: 'Low',
      status: 'pending',
      terraformFile: 'terraform/modules/elasticache/cache.tf',
    },
    {
      id: 'opt-105',
      accountId: '333444555666',
      accountName: 'FinTech-Payments-Hub',
      environment: 'production',
      category: 'savings_plan',
      resourceId: 'sp-commitment-gap',
      resourceName: 'Compute Savings Plan Gap',
      currentSpec: '68% On-Demand Coverage',
      recommendedSpec: '1-Yr No Upfront Compute SP (Target 90%)',
      estimatedMonthlySavings: 1850,
      riskLevel: 'Low',
      status: 'pending',
      terraformFile: 'terraform/global/savings_plans.tf',
    },
  ]);

  // Calculations
  const metrics = useMemo(() => {
    const totalPotentialMonthlySavings = opportunities.reduce(
      (acc, item) => (item.status !== 'remediated' ? acc + item.estimatedMonthlySavings : acc),
      0
    );

    const highValueOpportunities = opportunities.filter(
      (o) => o.estimatedMonthlySavings >= 300 && o.status === 'pending'
    );

    return {
      totalPotentialMonthlySavings,
      totalPotentialAnnualSavings: totalPotentialMonthlySavings * 12,
      highValueCount: highValueOpportunities.length,
      computeSavings: opportunities
        .filter((o) => o.category === 'compute_rightsizing' || o.category === 'graviton_migration')
        .reduce((acc, o) => acc + o.estimatedMonthlySavings, 0),
    };
  }, [opportunities]);

  // Filtered List
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      const matchesCategory = !activeCategoryFilter || item.category === activeCategoryFilter;
      const matchesEnv = activeEnvironmentFilter === 'all' || item.environment === activeEnvironmentFilter;
      return matchesCategory && matchesEnv;
    });
  }, [opportunities, activeCategoryFilter, activeEnvironmentFilter]);

  const handleExecuteTerraformPR = (id: string) => {
    setOpportunities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'pr_created' } : item))
    );
    setModalActionSuccess(true);
    setTimeout(() => {
      setModalActionSuccess(false);
      setActiveModal(null);
    }, 1500);
  };

  const handleSendSlackAlert = (id: string) => {
    setOpportunities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'slack_sent' } : item))
    );
    setModalActionSuccess(true);
    setTimeout(() => {
      setModalActionSuccess(false);
      setActiveModal(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-amber-400" />
            <span>Cloud Optimization & Automated Action Center</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate automated Terraform PRs and dispatch Slack alerts for high-value savings recommendations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs font-mono flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">Slack Webhook & GitHub App Connected</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-start">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
              Recoverable
            </span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-3">
            ${metrics.totalPotentialMonthlySavings.toLocaleString()} / mo
          </p>
          <p className="text-xs text-slate-400 mt-1">
            ${metrics.totalPotentialAnnualSavings.toLocaleString()} annual impact
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-start">
            <Zap className="w-6 h-6 text-amber-400" />
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
              High Value (&gt;$300/mo)
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">{metrics.highValueCount} Actionable</p>
          <p className="text-xs text-slate-400 mt-1">Eligible for automated Terraform PRs</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-start">
            <GitPullRequest className="w-6 h-6 text-blue-400" />
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
              IaC Automation
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">
            {opportunities.filter((o) => o.status === 'pr_created').length} Open PRs
          </p>
          <p className="text-xs text-slate-400 mt-1">Automated branch creation active</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-start">
            <Bell className="w-6 h-6 text-purple-400" />
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono">
              Slack Webhooks
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">
            {opportunities.filter((o) => o.status === 'slack_sent').length} Sent
          </p>
          <p className="text-xs text-slate-400 mt-1">Notified #cost-governance</p>
        </div>
      </div>

      {/* Directory & Actions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              <span>Optimization Opportunities & Automation Trigger Panel</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Trigger GitHub Pull Requests or send rich Slack alerts directly to owner teams
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex space-x-1 text-xs">
              {(['all', 'production', 'staging', 'development'] as const).map((env) => (
                <button
                  key={env}
                  onClick={() => setActiveEnvironmentFilter(env)}
                  className={`px-3 py-1 rounded capitalize transition ${
                    activeEnvironmentFilter === env
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-3">Resource / Account</th>
                <th className="p-3">Target Spec</th>
                <th className="p-3">Est. Savings</th>
                <th className="p-3">Automation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOpportunities.map((item) => {
                const isHighValue = item.estimatedMonthlySavings >= 300;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-white">{item.resourceName}</p>
                        {isHighValue && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded font-bold">
                            HIGH VALUE
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-slate-500">
                        {item.resourceId} • {item.accountName}
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="text-xs text-slate-400 line-through">{item.currentSpec}</p>
                      <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                        {item.recommendedSpec}
                      </p>
                    </td>
                    <td className="p-3 font-mono font-bold text-white">
                      ${item.estimatedMonthlySavings.toLocaleString()} / mo
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {/* Terraform PR Trigger */}
                        <button
                          onClick={() => setActiveModal({ type: 'terraform', item })}
                          disabled={item.status === 'pr_created'}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1.5 ${
                            item.status === 'pr_created'
                              ? 'bg-blue-500/20 text-blue-400 cursor-not-allowed border border-blue-500/30'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                          }`}
                        >
                          <GitPullRequest className="w-3.5 h-3.5" />
                          <span>{item.status === 'pr_created' ? 'PR Created' : 'Create TF PR'}</span>
                        </button>

                        {/* Slack Alert Trigger */}
                        <button
                          onClick={() => setActiveModal({ type: 'slack', item })}
                          disabled={item.status === 'slack_sent'}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1.5 ${
                            item.status === 'slack_sent'
                              ? 'bg-purple-500/20 text-purple-400 cursor-not-allowed border border-purple-500/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{item.status === 'slack_sent' ? 'Notified' : 'Slack Alert'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTION MODAL (Terraform PR & Slack Previews) */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center space-x-2">
                {activeModal.type === 'terraform' ? (
                  <>
                    <Code2 className="w-5 h-5 text-blue-400" />
                    <span>Automated Terraform Pull Request Generation</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-5 h-5 text-purple-400" />
                    <span>Send High-Value Cost Alert to Slack</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalActionSuccess ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-lg font-bold text-white">
                  {activeModal.type === 'terraform'
                    ? 'Pull Request Successfully Opened!'
                    : 'Slack Notification Sent!'}
                </p>
                <p className="text-xs text-slate-400">
                  Target: {activeModal.item.resourceName} (${activeModal.item.estimatedMonthlySavings}/mo)
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                    <p className="text-slate-400">Resource: <span className="text-white">{activeModal.item.resourceId}</span></p>
                    <p className="text-slate-400">Account: <span className="text-white">{activeModal.item.accountName} ({activeModal.item.accountId})</span></p>
                    <p className="text-slate-400">Monthly Impact: <span className="text-emerald-400 font-bold">${activeModal.item.estimatedMonthlySavings}</span></p>
                  </div>

                  {activeModal.type === 'terraform' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-300">Target File to Modify:</p>
                      <p className="text-xs font-mono text-blue-400 bg-slate-950 p-2 rounded border border-slate-800">
                        {activeModal.item.terraformFile}
                      </p>
                      <p className="text-xs font-semibold text-slate-300 pt-1">HCL Modification Diff Preview:</p>
                      <pre className="p-3 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-300 overflow-x-auto">
{`- instance_type = "${activeModal.item.currentSpec.split(' ')[0]}"
+ instance_type = "${activeModal.item.recommendedSpec.split(' ')[0]}"`}
                      </pre>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-300">Channel Destination:</p>
                      <p className="text-xs font-mono text-purple-400 bg-slate-950 p-2 rounded border border-slate-800">
                        #cost-governance-alerts (Webhook ID: wh_aws_opt_9981)
                      </p>
                      <p className="text-xs font-semibold text-slate-300 pt-1">Slack Message Payload Preview:</p>
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 space-y-1">
                        <p className="font-bold text-amber-400">⚠️ High-Value Optimization Identified</p>
                        <p>Resource <span className="font-mono text-white">{activeModal.item.resourceName}</span> can be rightsized to <span className="font-mono text-emerald-400">{activeModal.item.recommendedSpec}</span>.</p>
                        <p className="text-emerald-400 font-bold">Estimated Savings: ${activeModal.item.estimatedMonthlySavings}/month</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded text-xs font-bold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  {activeModal.type === 'terraform' ? (
                    <button
                      onClick={() => handleExecuteTerraformPR(activeModal.item.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center space-x-1.5"
                    >
                      <GitPullRequest className="w-4 h-4" />
                      <span>Open Pull Request</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendSlackAlert(activeModal.item.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold flex items-center space-x-1.5"
                    >
                      <Send className="w-4 h-4" />
                      <span>Dispatch Alert</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}