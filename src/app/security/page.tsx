'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Terminal,
  Activity,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Key,
  Globe,
  Database,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

interface SecurityVulnerability {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  resourceId: string;
  category: 'IAM' | 'Network' | 'Storage' | 'K8s' | 'Database';
  environment: 'production' | 'staging' | 'development';
  status: 'Open' | 'Remediated' | 'In Progress';
  cveId?: string;
  detectedAt: string;
}

export default function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState<'vulnerabilities' | 'compliance' | 'audit'>('vulnerabilities');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const [vulnerabilities, setVulnerabilities] = useState<SecurityVulnerability[]>([
    {
      id: 'SEC-2026-001',
      severity: 'Critical',
      title: 'S3 Bucket Public Read Access Enabled',
      resourceId: 'arn:aws:s3:::prod-customer-backups-2026',
      category: 'Storage',
      environment: 'production',
      status: 'Open',
      detectedAt: '12 mins ago',
    },
    {
      id: 'SEC-2026-002',
      severity: 'Critical',
      title: 'Root IAM Account Lacks MFA Enforcement',
      resourceId: 'arn:aws:iam::123456789012:root',
      category: 'IAM',
      environment: 'production',
      status: 'Open',
      detectedAt: '45 mins ago',
    },
    {
      id: 'SEC-2026-003',
      severity: 'High',
      title: 'Security Group Allows Port 22 (SSH) to 0.0.0.0/0',
      resourceId: 'sg-0a82b7c6d5e4f3a1',
      category: 'Network',
      environment: 'staging',
      status: 'In Progress',
      detectedAt: '2 hours ago',
    },
    {
      id: 'SEC-2026-004',
      severity: 'High',
      title: 'RDS Postgres Instance Storage Unencrypted at Rest',
      resourceId: 'db-orders-replica-prod',
      category: 'Database',
      environment: 'production',
      status: 'Open',
      detectedAt: '5 hours ago',
    },
    {
      id: 'SEC-2026-005',
      severity: 'Medium',
      title: 'Outdated Kubernetes Container Image (CVE-2025-4123)',
      resourceId: 'k8s/deploy/auth-service',
      category: 'K8s',
      environment: 'development',
      status: 'Open',
      cveId: 'CVE-2025-4123',
      detectedAt: '1 day ago',
    },
  ]);

  // Derived Metrics
  const metrics = useMemo(() => {
    const critical = vulnerabilities.filter((v) => v.severity === 'Critical' && v.status !== 'Remediated').length;
    const high = vulnerabilities.filter((v) => v.severity === 'High' && v.status !== 'Remediated').length;
    const medium = vulnerabilities.filter((v) => v.severity === 'Medium' && v.status !== 'Remediated').length;
    
    // Overall Security Score Calculation (Simplified Posture Score)
    const baseScore = 100;
    const deductions = critical * 15 + high * 8 + medium * 3;
    const securityScore = Math.max(0, baseScore - deductions);

    return { critical, high, medium, securityScore };
  }, [vulnerabilities]);

  const filteredVulnerabilities = useMemo(() => {
    return vulnerabilities.filter((v) => {
      const matchesSeverity = severityFilter === 'all' || v.severity.toLowerCase() === severityFilter.toLowerCase();
      const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            v.resourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            v.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSeverity && matchesSearch;
    });
  }, [vulnerabilities, severityFilter, searchTerm]);

  const handleRemediate = (id: string) => {
    setVulnerabilities((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'Remediated' } : v))
    );
  };

  const triggerScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-3">
            <Lock className="w-8 h-8 text-rose-500" />
            <span>Cloud Security & Posture Management</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time vulnerability detection, threat analysis, and automated infrastructure remediation
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={triggerScan}
            disabled={isScanning}
            className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg text-xs font-bold transition flex items-center space-x-2 text-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-rose-400' : ''}`} />
            <span>{isScanning ? 'Scanning Infrastructure...' : 'Run Security Scan'}</span>
          </button>
          <div className="bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg text-xs font-mono flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-rose-400 font-bold">Threat Engine Active</span>
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Posture Score */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
              Posture
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">{metrics.securityScore} / 100</p>
          <p className="text-xs text-slate-400 mt-1">Global Cloud Compliance Score</p>
          <div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all"
            style={{ width: `${metrics.securityScore}%` }}
          />
        </div>

        {/* Critical Alerts */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-start">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono">
              Action Required
            </span>
          </div>
          <p className="text-3xl font-extrabold text-rose-400 mt-3">{metrics.critical}</p>
          <p className="text-xs text-slate-400 mt-1">Critical Vulnerabilities</p>
        </div>

        {/* High Severity Alerts */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-start">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
              Warning
            </span>
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-3">{metrics.high}</p>
          <p className="text-xs text-slate-400 mt-1">High Severity Findings</p>
        </div>

        {/* Active Safeguards */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-start">
            <Zap className="w-6 h-6 text-blue-400" />
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
              Automated
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">24 Policy Rules</p>
          <p className="text-xs text-slate-400 mt-1">Active auto-remediation policies</p>
        </div>
      </div>

      {/* Main Table & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        {/* Navigation Tabs & Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('vulnerabilities')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'vulnerabilities'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Vulnerability Findings
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'compliance'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Compliance Frameworks
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'audit'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Audit Log
            </button>
          </div>

          {activeTab === 'vulnerabilities' && (
            <div className="flex items-center space-x-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-rose-500 text-slate-200 w-48"
                />
              </div>

              {/* Severity selection */}
              <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex space-x-1 text-xs">
                {(['all', 'critical', 'high', 'medium'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-3 py-1 rounded capitalize transition ${
                      severityFilter === sev
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab Content 1: Vulnerabilities */}
        {activeTab === 'vulnerabilities' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="p-3">Severity / Issue</th>
                  <th className="p-3">Resource Target</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Detected</th>
                  <th className="p-3">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredOpportunities(filteredVulnerabilities).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <SeverityBadge severity={item.severity} />
                        <span className="font-semibold text-white">{item.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{item.id}</p>
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-400">
                      {item.resourceId}
                    </td>
                    <td className="p-3">
                      <CategoryBadge category={item.category} />
                    </td>
                    <td className="p-3 text-xs text-slate-400">{item.detectedAt}</td>
                    <td className="p-3">
                      {item.status === 'Remediated' ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRemediate(item.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded transition shadow-lg shadow-rose-600/20 flex items-center space-x-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Auto-Fix</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content 2: Compliance Frameworks */}
        {activeTab === 'compliance' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <ComplianceCard title="CIS AWS Foundations Benchmark v1.4" score={92} totalControls={64} passedControls={59} />
            <ComplianceCard title="SOC 2 Type II Security Controls" score={88} totalControls={42} passedControls={37} />
            <ComplianceCard title="HIPAA Security & Encryption Standards" score={96} totalControls={28} passedControls={27} />
          </div>
        )}

        {/* Tab Content 3: Audit Log */}
        {activeTab === 'audit' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-slate-300">
              <span className="text-emerald-400">[2026-08-10T10:42:12Z]</span>
              <span>IAM Auto-Remediation Triggered: Enforced MFA policy on IAM user user-dev-3</span>
              <span className="text-slate-500">SUCCESS</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-slate-300">
              <span className="text-rose-400">[2026-08-10T09:18:01Z]</span>
              <span>CloudTrail Anomaly: Root user login without hardware token from 198.51.100.4</span>
              <span className="text-rose-400 font-bold">ALERT</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-slate-300">
              <span className="text-blue-400">[2026-08-10T08:00:00Z]</span>
              <span>Automated Container Vulnerability Scan executed across 12 ECR Repositories</span>
              <span className="text-slate-500">INFO</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function filteredOpportunities(items: SecurityVulnerability[]) {
  return items;
}

function SeverityBadge({ severity }: { severity: SecurityVulnerability['severity'] }) {
  const styles = {
    Critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    High: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold border rounded uppercase ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function CategoryBadge({ category }: { category: SecurityVulnerability['category'] }) {
  const icons = {
    IAM: Key,
    Network: Globe,
    Storage: Layers,
    K8s: Terminal,
    Database: Database,
  };

  const IconComponent = icons[category];

  return (
    <span className="inline-flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
      <IconComponent className="w-3.5 h-3.5 text-slate-400" />
      <span>{category}</span>
    </span>
  );
}

function ComplianceCard({
  title,
  score,
  totalControls,
  passedControls,
}: {
  title: string;
  score: number;
  totalControls: number;
  passedControls: number;
}) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-sm text-white">{title}</h4>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          {score}%
        </span>
      </div>
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div className="bg-emerald-500 h-full" style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-slate-400 font-mono">
        {passedControls} of {totalControls} Controls Passed
      </p>
    </div>
  );
}