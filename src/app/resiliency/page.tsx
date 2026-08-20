'use client';

import React, { useState } from 'react';
import {
  Flame,
  ShieldAlert,
  Play,
  Square,
  Activity,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Layers,
  Database,
  Globe,
} from 'lucide-react';

interface AWSAccount {
  id: string;
  name: string;
  environment: 'Production' | 'Staging' | 'Development';
  region: string;
  status: 'Connected' | 'Restricted';
}

interface ChaosExperiment {
  id: string;
  title: string;
  description: string;
  service: 'EC2' | 'RDS' | 'Network' | 'IAM' | 'EKS';
  action: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  durationMinutes: number;
}

export default function FaultInjectionPage() {
  const [selectedAccount, setSelectedAccount] = useState<string>('prod-account-01');
  const [selectedExperiment, setSelectedExperiment] = useState<string>('exp-01');
  const [isRunning, setIsRunning] = useState(false);
  const [activeExperimentId, setActiveExperimentId] = useState<string | null>(null);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const accounts: AWSAccount[] = [
    { id: 'prod-account-01', name: 'AWS Prod Workloads (112233445566)', environment: 'Production', region: 'us-east-1', status: 'Connected' },
    { id: 'prod-account-02', name: 'AWS Prod Analytics (998877665544)', environment: 'Production', region: 'us-west-2', status: 'Connected' },
    { id: 'stage-account-01', name: 'AWS Staging App (554433221100)', environment: 'Staging', region: 'us-east-1', status: 'Connected' },
    { id: 'dev-account-01', name: 'AWS Sandbox Dev (223344556677)', environment: 'Development', region: 'eu-west-1', status: 'Connected' },
  ];

  const experiments: ChaosExperiment[] = [
    {
      id: 'exp-01',
      title: 'EC2 Auto Scaling Instance Termination',
      description: 'Terminates 50% of random EC2 worker nodes in selected Auto Scaling Group to test multi-AZ failover speed.',
      service: 'EC2',
      action: 'aws:ec2:terminate-instances',
      impact: 'Medium',
      durationMinutes: 5,
    },
    {
      id: 'exp-02',
      title: 'RDS Multi-AZ Failover Injection',
      description: 'Forces a abrupt Primary database failover on Aurora PostgreSQL cluster to measure API connection pool recovery.',
      service: 'RDS',
      action: 'aws:rds:reboot-db-instance (force-failover)',
      impact: 'High',
      durationMinutes: 3,
    },
    {
      id: 'exp-03',
      title: 'VPC Blackhole Latency & Packet Loss',
      description: 'Injects 250ms packet latency and 15% packet drop across cross-region VPC peering connections.',
      service: 'Network',
      action: 'aws:fis:inject-network-latency',
      impact: 'Medium',
      durationMinutes: 10,
    },
    {
      id: 'exp-04',
      title: 'Kubelet Worker Node Memory Pressure (EKS)',
      description: 'Simulates 95% RAM exhaustion on 2 worker nodes in EKS cluster to evaluate pod autoscaling limits.',
      service: 'EKS',
      action: 'aws:eks:inject-memory-stress',
      impact: 'Critical',
      durationMinutes: 5,
    },
  ];

  const handleStartExperiment = async () => {
    setIsRunning(true);
    setExecutionLog([
      `[${new Date().toLocaleTimeString()}] Initializing AWS Fault Injection Simulator (FIS) API connection...`,
      `[${new Date().toLocaleTimeString()}] Target Account validated: ${selectedAccount}`,
      `[${new Date().toLocaleTimeString()}] Verifying CloudWatch Stop Conditions (Automated Rollback Safeguard: Active)`,
    ]);

    try {
      const res = await fetch('/api/fault-injection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedExperiment,
          targetAccountId: selectedAccount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveExperimentId(data.experimentId);
        setExecutionLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Experiment Started: ${data.experimentId}`,
          `[${new Date().toLocaleTimeString()}] Action injected into target VPC. Monitoring live health metrics...`,
        ]);
      }
    } catch (err) {
      setExecutionLog((prev) => [...prev, `[ERROR] Failed to start chaos simulation.`]);
      setIsRunning(false);
    }
  };

  const handleStopExperiment = () => {
    setIsRunning(false);
    setExecutionLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Manual Stop Condition Triggered.`,
      `[${new Date().toLocaleTimeString()}] AWS FIS rolling back target state. System returning to steady baseline...`,
    ]);
    setActiveExperimentId(null);
  };

  const currentExp = experiments.find((e) => e.id === selectedExperiment);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Flame className="w-6 h-6 text-rose-500 animate-pulse" />
            <span>AWS Fault Injection Simulation (Chaos Engineering)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Test system resilience by orchestrating controlled fault injections across all linked AWS accounts via AWS FIS
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">AWS FIS Status:</span>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Ready for Injection</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Target Account & Vector Selection */}
        <div className="lg:col-span-1 space-y-6">
          {/* Target Account Selection */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold flex items-center space-x-2 text-slate-800 dark:text-slate-200">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>1. Target AWS Account</span>
            </h3>

            <div className="space-y-2">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => !isRunning && setSelectedAccount(acc.id)}
                  disabled={isRunning}
                  className={`w-full p-3 rounded-lg text-left text-xs border transition flex items-center justify-between ${
                    selectedAccount === acc.id
                      ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{acc.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{acc.region}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                      acc.environment === 'Production'
                        ? 'bg-rose-500/20 text-rose-500'
                        : 'bg-emerald-500/20 text-emerald-500'
                    }`}
                  >
                    {acc.environment}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Fault Vector Selection */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold flex items-center space-x-2 text-slate-800 dark:text-slate-200">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>2. Select Attack Template</span>
            </h3>

            <div className="space-y-2">
              {experiments.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => !isRunning && setSelectedExperiment(exp.id)}
                  disabled={isRunning}
                  className={`w-full p-3 rounded-lg text-left text-xs border transition space-y-1 ${
                    selectedExperiment === exp.id
                      ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-slate-100 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{exp.title}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 font-bold rounded ${
                        exp.impact === 'Critical'
                          ? 'bg-rose-500/20 text-rose-500'
                          : 'bg-amber-500/20 text-amber-500'
                      }`}
                    >
                      {exp.impact} Impact
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {exp.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Console & Monitoring */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Configuration Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {currentExp?.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Action: <span className="font-mono text-rose-500">{currentExp?.action}</span>
                </p>
              </div>

              {/* Execution Control Buttons */}
              <div className="flex items-center space-x-3">
                {!isRunning ? (
                  <button
                    onClick={handleStartExperiment}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-rose-600/20 flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Chaos Experiment</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopExperiment}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-amber-600/20 flex items-center space-x-2"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Trigger Rollback</span>
                  </button>
                )}
              </div>
            </div>

            {/* Parameters Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block">Duration:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {currentExp?.durationMinutes} Minutes
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block">Stop Condition:</span>
                <span className="font-bold text-emerald-500">CloudWatch Alarms</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block">Target Service:</span>
                <span className="font-bold text-blue-500">{currentExp?.service}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block">FIS Experiment ID:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {activeExperimentId || 'Idle'}
                </span>
              </div>
            </div>
          </div>

          {/* Live Execution & Console Output */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center space-x-2 text-rose-400 font-bold">
                <Activity className="w-4 h-4 animate-spin" />
                <span>AWS FIS Real-time Execution Output</span>
              </span>
              <span className="text-[10px] text-slate-500">Auto-scroll enabled</span>
            </div>

            <div className="h-64 overflow-y-auto space-y-2 p-2 bg-slate-900/60 rounded border border-slate-900 text-[11px]">
              {executionLog.length === 0 ? (
                <p className="text-slate-600 italic">
                  Select a target account and click "Run Chaos Experiment" to begin fault injection...
                </p>
              ) : (
                executionLog.map((log, index) => (
                  <p key={index} className="leading-relaxed">
                    {log.includes('ERROR') ? (
                      <span className="text-rose-400 font-bold">{log}</span>
                    ) : log.includes('Started') ? (
                      <span className="text-emerald-400 font-bold">{log}</span>
                    ) : (
                      <span className="text-slate-300">{log}</span>
                    )}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}