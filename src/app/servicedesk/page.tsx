'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  Users,
  Shield,
  Network,
  Wrench,
  Headphones,
  Zap,
  Cloud,
} from 'lucide-react';

interface EndpointHealth {
  id: string;
  name: string;
  url: string;
  category: 'Cloud Console' | 'Core Service' | 'Developer Tool' | 'ITSM';
  status: 'Operational' | 'Degraded' | 'Downtime';
  uptime30d: number;
  responseTimeMs: number;
  lastChecked: string;
  sslExpiresDays: number;
  incidentHistoryCount: number;
  historyBars: Array<'green' | 'yellow' | 'red'>;
}

interface ActiveAlert {
  id: string;
  service: string;
  severity: 'Critical' | 'Warning' | 'Info';
  message: string;
  timestamp: string;
  proactiveAction: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  team: 'DevOps' | 'Service Desk' | 'Network Team' | 'Security';
  status: 'On-Call' | 'Available' | 'In Incident' | 'Off-Shift';
  shiftHours: string;
  contactEmail: string;
  teamsHandle: string;
  avatarUrl: string;
  primaryTech: string;
}

// Extended Team Roster with Azure and GCP leads
const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'usr-1',
    name: 'Alex Rivera',
    role: 'Lead DevOps Engineer (GCP & K8s)',
    team: 'DevOps',
    status: 'On-Call',
    shiftHours: '08:00 - 16:00 EST',
    contactEmail: 'arivera@company.com',
    teamsHandle: '@arivera',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    primaryTech: 'Google Cloud Platform (GCP), GKE, Terraform, GitLab CI',
  },
  {
    id: 'usr-2',
    name: 'Marcus Chen',
    role: 'Senior Network Architect',
    team: 'Network Team',
    status: 'On-Call',
    shiftHours: '08:00 - 16:00 EST',
    contactEmail: 'mchen@company.com',
    teamsHandle: '@mchen',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    primaryTech: 'Azure ExpressRoute, GCP Cloud Interconnect, Fortinet',
  },
  {
    id: 'usr-3',
    name: 'Sarah Jenkins',
    role: 'Cloud Security Lead (Azure Defender)',
    team: 'Security',
    status: 'In Incident',
    shiftHours: '12:00 - 20:00 EST',
    contactEmail: 'sjenkins@company.com',
    teamsHandle: '@sjenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    primaryTech: 'Azure Sentinel, GCP Security Command Center, Entra ID',
  },
  {
    id: 'usr-4',
    name: 'David Kalu',
    role: 'L2 Service Desk Specialist',
    team: 'Service Desk',
    status: 'On-Call',
    shiftHours: '07:00 - 15:00 EST',
    contactEmail: 'dkalu@company.com',
    teamsHandle: '@dkalu',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    primaryTech: 'ServiceNow, M365 Admin, Azure Identity',
  },
  {
    id: 'usr-5',
    name: 'Elena Rostova',
    role: 'Azure Cloud Infrastructure Architect',
    team: 'DevOps',
    status: 'Available',
    shiftHours: '09:00 - 17:00 EST',
    contactEmail: 'erostova@company.com',
    teamsHandle: '@erostova',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    primaryTech: 'Azure DevOps, AKS, Bicep/ARM, Cost Management',
  },
  {
    id: 'usr-6',
    name: 'Jordan Vance',
    role: 'GCP & Multi-Cloud Network Specialist',
    team: 'Network Team',
    status: 'Available',
    shiftHours: '09:00 - 17:00 EST',
    contactEmail: 'jvance@company.com',
    teamsHandle: '@jvance',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    primaryTech: 'GCP VPC Peering, Palo Alto VPN, SD-WAN, Cloud DNS',
  },
];

// Endpoints dataset including Azure & Google Cloud resources
const INITIAL_ENDPOINTS: EndpointHealth[] = [
  {
    id: 'azure-portal',
    name: 'Azure Portal & Entra ID',
    url: 'https://portal.azure.com',
    category: 'Cloud Console',
    status: 'Degraded',
    uptime30d: 98.85,
    responseTimeMs: 840,
    lastChecked: 'Just now',
    sslExpiresDays: 14,
    incidentHistoryCount: 4,
    historyBars: [...Array(18).fill('green'), 'red', 'yellow', ...Array(4).fill('green')],
  },
  {
    id: 'azure-devops',
    name: 'Azure DevOps Services',
    url: 'https://dev.azure.com',
    category: 'Developer Tool',
    status: 'Operational',
    uptime30d: 99.96,
    responseTimeMs: 128,
    lastChecked: 'Just now',
    sslExpiresDays: 160,
    incidentHistoryCount: 0,
    historyBars: Array(24).fill('green'),
  },
  {
    id: 'gcp-console',
    name: 'Google Cloud Console (GCP)',
    url: 'https://console.cloud.google.com',
    category: 'Cloud Console',
    status: 'Operational',
    uptime30d: 99.99,
    responseTimeMs: 92,
    lastChecked: 'Just now',
    sslExpiresDays: 210,
    incidentHistoryCount: 0,
    historyBars: Array(24).fill('green'),
  },
  {
    id: 'gcp-bigquery',
    name: 'Google BigQuery API',
    url: 'https://bigquery.googleapis.com',
    category: 'Core Service',
    status: 'Operational',
    uptime30d: 100.0,
    responseTimeMs: 85,
    lastChecked: 'Just now',
    sslExpiresDays: 210,
    incidentHistoryCount: 0,
    historyBars: Array(24).fill('green'),
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace Admin',
    url: 'https://admin.google.com',
    category: 'Core Service',
    status: 'Operational',
    uptime30d: 99.98,
    responseTimeMs: 110,
    lastChecked: 'Just now',
    sslExpiresDays: 195,
    incidentHistoryCount: 0,
    historyBars: Array(24).fill('green'),
  },
  {
    id: 'jira',
    name: 'Jira Software API & Web',
    url: 'https://jira.atlassian.net',
    category: 'ITSM',
    status: 'Operational',
    uptime30d: 99.99,
    responseTimeMs: 142,
    lastChecked: 'Just now',
    sslExpiresDays: 184,
    incidentHistoryCount: 0,
    historyBars: Array(24).fill('green'),
  },
  {
    id: 'gitlab',
    name: 'GitLab Enterprise CI/CD',
    url: 'https://gitlab.com',
    category: 'Developer Tool',
    status: 'Operational',
    uptime30d: 99.91,
    responseTimeMs: 210,
    lastChecked: 'Just now',
    sslExpiresDays: 92,
    incidentHistoryCount: 2,
    historyBars: [...Array(15).fill('green'), 'yellow', ...Array(8).fill('green')],
  },
  {
    id: 'aws-landing',
    name: 'AWS IAM Identity Center (SSO)',
    url: 'https://aws.amazon.com/console',
    category: 'Cloud Console',
    status: 'Operational',
    uptime30d: 100.0,
    responseTimeMs: 95,
    lastChecked: 'Just now',
    sslExpiresDays: 240,
    incidentHistoryCount: 0,
    historyBars: Array(24).fill('green'),
  },
];

const RECENT_ALERTS: ActiveAlert[] = [
  {
    id: 'alt-101',
    service: 'Azure Portal & Entra ID',
    severity: 'Warning',
    message: 'High HTTP response latency (>800ms) detected from East US region.',
    timestamp: '8 mins ago',
    proactiveAction: 'Route health check triggered auto-failover to Central US endpoint.',
  },
  {
    id: 'alt-102',
    service: 'Google Cloud Platform (GCP)',
    severity: 'Info',
    message: 'GKE Cluster control plane auto-upgrade completed in us-central1.',
    timestamp: '18 mins ago',
    proactiveAction: 'Node pools verified online and passing health checks.',
  },
];

export default function ServiceDeskDashboard() {
  const [endpoints, setEndpoints] = useState<EndpointHealth[]>(INITIAL_ENDPOINTS);
  const [teamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<'All' | 'DevOps' | 'Service Desk' | 'Network Team' | 'Security'>('All');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setEndpoints((prev) =>
        prev.map((item) => ({
          ...item,
          responseTimeMs: Math.max(45, Math.floor(item.responseTimeMs + (Math.random() * 40 - 20))),
          lastChecked: 'Just now',
        }))
      );
      setIsRefreshing(false);
    }, 800);
  };

  const filteredTeam = teamMembers.filter((member) => {
    if (selectedTeamFilter !== 'All' && member.team !== selectedTeamFilter) return false;
    return (
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.primaryTech.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredEndpoints = endpoints.filter((ep) =>
    ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTeamIcon = (team: TeamMember['team']) => {
    switch (team) {
      case 'DevOps':
        return <Wrench className="w-4 h-4 text-purple-500" />;
      case 'Network Team':
        return <Network className="w-4 h-4 text-blue-500" />;
      case 'Security':
        return <Shield className="w-4 h-4 text-emerald-500" />;
      case 'Service Desk':
        return <Headphones className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-bold">Multi-Cloud ServiceDesk & Operations</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time latency monitoring for Azure, Google Cloud (GCP), AWS & enterprise tools with active engineering contacts
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-2 transition disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Updating...' : 'Refresh Dashboard'}</span>
        </button>
      </div>

      {/* On-Call & Support Roster Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="text-base font-bold">Available Cloud Engineers & Team Roster</h2>
              <p className="text-xs text-slate-400">Direct escalation leads for Azure, Google Cloud, AWS & ITSM</p>
            </div>
          </div>

          {/* Team Filter Pills */}
          <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
            {(['All', 'DevOps', 'Service Desk', 'Network Team', 'Security'] as const).map((team) => (
              <button
                key={team}
                onClick={() => setSelectedTeamFilter(team)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  selectedTeamFilter === team
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-3 relative hover:border-blue-500/40 transition"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold truncate text-slate-900 dark:text-white">{member.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        member.status === 'On-Call'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : member.status === 'In Incident'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.role}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1.5 font-medium text-slate-700 dark:text-slate-300">
                    {getTeamIcon(member.team)}
                    <span>{member.team}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{member.shiftHours}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Cloud Stack: </span>
                  {member.primaryTech}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <a
                  href={`mailto:${member.contactEmail}`}
                  className="text-slate-600 dark:text-slate-300 hover:text-blue-500 transition flex items-center space-x-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
                <a
                  href={`https://teams.microsoft.com/l/chat/0/0?users=${member.contactEmail}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-[11px] flex items-center space-x-1 shadow-2xs"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Ping in Teams</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Azure SLA Uptime</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">99.40%</p>
            <p className="text-[11px] text-amber-500 mt-0.5">East US Latency Warning</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Cloud className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Google Cloud SLA</p>
            <p className="text-2xl font-black text-emerald-500 mt-1">99.99%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">GKE & BigQuery Operational</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

<div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex items-center justify-between">
  <div>
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Degraded Services</p>
    <p className="text-2xl font-black text-amber-500 mt-1">1</p>
    <p className="text-[11px] text-slate-400 mt-0.5">Azure Portal (&gt;800ms latency)</p>
  </div>
  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
    <AlertTriangle className="w-6 h-6" />
  </div>
</div>

        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Critical Outages</p>
            <p className="text-2xl font-black text-rose-500 mt-1">0</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All multi-cloud endpoints up</p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Proactive Monitoring Alerts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold">Proactive Multi-Cloud Logs</h3>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
            Auto-Escalation Active
          </span>
        </div>

        <div className="space-y-2.5">
          {RECENT_ALERTS.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white">{alert.service}</span>
                    <span className="text-slate-400">• {alert.timestamp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{alert.message}</p>
                </div>
              </div>

              <div className="md:text-right shrink-0">
                <span className="inline-flex items-center space-x-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  <span>⚡ Action: {alert.proactiveAction}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoint List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <h3 className="font-bold text-sm">Monitored Service Endpoints (Azure, Google, AWS & Tools)</h3>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Azure, GCP, or tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredEndpoints.map((ep) => (
            <div key={ep.id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-950/40 transition space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      ep.status === 'Operational'
                        ? 'bg-emerald-500'
                        : ep.status === 'Degraded'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  ></span>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ep.name}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {ep.category}
                      </span>
                    </div>
                    <a
                      href={ep.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-blue-500 transition inline-flex items-center space-x-1 mt-0.5"
                    >
                      <span>{ep.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-xs text-slate-600 dark:text-slate-300">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Latency</p>
                    <p
                      className={`font-mono font-bold ${
                        ep.responseTimeMs > 500 ? 'text-amber-500' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {ep.responseTimeMs} ms
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">30d SLA</p>
                    <p className="font-mono font-bold text-emerald-500">{ep.uptime30d}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}