'use client';

import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Handle,
  Position,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Network,
  Globe,
  ShieldCheck,
  Cpu,
  ArrowRightLeft,
  Activity,
  Layers,
  Info,
  Terminal,
  ShieldAlert,
  Search,
  Radio,
  Flame,
  Globe2,
  Lock,
  Share2,
  Plug,
  Cloud,
  Server,
  Layers3,
  Box,
  Key,
} from 'lucide-react';

// Cloud Provider Badge Helper
const CloudBadge = ({ provider }: { provider: 'AWS' | 'Azure' | 'GCP' }) => {
  const styles = {
    AWS: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    Azure: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    GCP: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${styles[provider]}`}>
      {provider}
    </span>
  );
};

// Custom React Flow Topology Nodes
const CloudGatewayNode = ({
  data,
}: {
  data: { label: string; type: string; provider: 'AWS' | 'Azure' | 'GCP'; account: string };
}) => (
  <div className="px-4 py-2.5 shadow-lg rounded-xl bg-slate-900 border-2 border-slate-700 text-white min-w-[180px]">
    <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
      <CloudBadge provider={data.provider} />
      <span className="text-[9px] font-mono text-slate-400">{data.account}</span>
    </div>
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-blue-400 shrink-0" />
      <div>
        <div className="text-[9px] text-blue-400 font-mono font-semibold uppercase">{data.type}</div>
        <div className="text-xs font-bold font-sans">{data.label}</div>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-blue-500" />
    <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-blue-500" />
  </div>
);

const NetworkMeshNode = ({ data }: { data: { label: string; mode: string } }) => (
  <div className="p-3 shadow-xl rounded-xl bg-purple-950/80 border-2 border-purple-500 text-purple-100 min-w-[210px] text-center">
    <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-purple-400" />
    <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-purple-400" />
    <div className="flex items-center justify-center space-x-1.5 mb-1">
      <Share2 className="w-4 h-4 text-purple-400" />
      <span className="text-xs font-bold">{data.label}</span>
    </div>
    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/30 text-purple-200">
      {data.mode}
    </span>
  </div>
);

const SubnetNode = ({
  data,
}: {
  data: { label: string; cidr: string; isPublic: boolean; provider: 'AWS' | 'Azure' | 'GCP'; account: string };
}) => (
  <div
    className={`p-3 shadow-md rounded-xl border-2 min-w-[220px] ${
      data.isPublic
        ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-100'
        : 'bg-indigo-950/40 border-indigo-500/80 text-indigo-100'
    }`}
  >
    <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-slate-400" />
    <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-2">
      <div className="flex items-center space-x-1.5">
        <ShieldCheck className={`w-4 h-4 ${data.isPublic ? 'text-emerald-400' : 'text-indigo-400'}`} />
        <span className="text-xs font-bold">{data.label}</span>
      </div>
      <CloudBadge provider={data.provider} />
    </div>
    <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
      <span>{data.cidr}</span>
      <span className="text-slate-400">{data.account}</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-slate-400" />
  </div>
);

const EniNode = ({
  data,
}: {
  data: { label: string; ip: string; status: 'Active' | 'Idle' | 'Busy'; resource: string };
}) => (
  <div className="p-3 shadow-sm rounded-lg bg-slate-900/90 border border-slate-700 text-slate-100 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="w-2 h-2 bg-purple-500" />
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-1.5">
        <Cpu className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs font-semibold">{data.label}</span>
      </div>
      <span
        className={`w-2 h-2 rounded-full ${
          data.status === 'Active'
            ? 'bg-emerald-400 animate-pulse'
            : data.status === 'Busy'
            ? 'bg-amber-400'
            : 'bg-slate-500'
        }`}
      />
    </div>
    <div className="mt-1 text-[10px] font-mono text-purple-300">{data.ip}</div>
    <div className="text-[10px] text-slate-400 truncate">{data.resource}</div>
  </div>
);

const nodeTypes = {
  gateway: CloudGatewayNode,
  mesh: NetworkMeshNode,
  subnet: SubnetNode,
  eni: EniNode,
};

const initialNodes: Node[] = [
  { id: 'tgw-hub', type: 'mesh', position: { x: 380, y: 20 }, data: { label: 'Cross-Cloud Transit Mesh', mode: 'AWS TGW + Azure ExpressRoute' } },
  
  // AWS Account Node
  { id: 'aws-igw', type: 'gateway', position: { x: 80, y: 150 }, data: { label: 'igw-0a8b9c (US-East)', type: 'Internet Gateway', provider: 'AWS', account: '123456789012 (Prod)' } },
  { id: 'aws-subnet-1', type: 'subnet', position: { x: 50, y: 290 }, data: { label: 'us-east-1a-prod-priv', cidr: '10.0.10.0/24', isPublic: false, provider: 'AWS', account: '123456789012' } },
  { id: 'aws-eni-1', type: 'eni', position: { x: 60, y: 440 }, data: { label: 'eni-08d44c (EKS App)', ip: '10.0.10.12', status: 'Active', resource: 'k8s-worker-az1' } },

  // Azure Subscription Node
  { id: 'azure-vnet-gw', type: 'gateway', position: { x: 380, y: 150 }, data: { label: 'vnet-gw-prod-westeu', type: 'VPN Gateway', provider: 'Azure', account: 'Sub: Prod-EU-01' } },
  { id: 'azure-subnet-1', type: 'subnet', position: { x: 360, y: 290 }, data: { label: 'snet-backend-westeu', cidr: '10.2.1.0/24', isPublic: false, provider: 'Azure', account: 'Sub: Prod-EU-01' } },
  { id: 'azure-eni-1', type: 'eni', position: { x: 370, y: 440 }, data: { label: 'nic-vm-app-01', ip: '10.2.1.4', status: 'Active', resource: 'vm-prod-backend-01' } },

  // GCP Project Node
  { id: 'gcp-router', type: 'gateway', position: { x: 680, y: 150 }, data: { label: 'cr-prod-uscentral', type: 'Cloud Router', provider: 'GCP', account: 'proj-analytics-prod' } },
  { id: 'gcp-subnet-1', type: 'subnet', position: { x: 660, y: 290 }, data: { label: 'sb-bigquery-ingest', cidr: '10.4.0.0/20', isPublic: true, provider: 'GCP', account: 'proj-analytics-prod' } },
  { id: 'gcp-eni-1', type: 'eni', position: { x: 670, y: 440 }, data: { label: 'nic-gke-node-01', ip: '10.4.0.18', status: 'Busy', resource: 'gke-cluster-analytics' } },
];

const initialEdges: Edge[] = [
  { id: 'e-mesh-aws', source: 'tgw-hub', target: 'aws-igw', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
  { id: 'e-mesh-azure', source: 'tgw-hub', target: 'azure-vnet-gw', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e-mesh-gcp', source: 'tgw-hub', target: 'gcp-router', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e-aws-sub', source: 'aws-igw', target: 'aws-subnet-1', style: { stroke: '#6366f1' } },
  { id: 'e-aws-eni', source: 'aws-subnet-1', target: 'aws-eni-1', animated: true, style: { stroke: '#a855f7' } },
  { id: 'e-azure-sub', source: 'azure-vnet-gw', target: 'azure-subnet-1', style: { stroke: '#6366f1' } },
  { id: 'e-azure-eni', source: 'azure-subnet-1', target: 'azure-eni-1', animated: true, style: { stroke: '#a855f7' } },
  { id: 'e-gcp-sub', source: 'gcp-router', target: 'gcp-subnet-1', style: { stroke: '#6366f1' } },
  { id: 'e-gcp-eni', source: 'gcp-subnet-1', target: 'gcp-eni-1', style: { stroke: '#a855f7' } },
];

interface FlowLogEntry {
  id: string;
  timestamp: string;
  cloud: 'AWS' | 'Azure' | 'GCP';
  account: string;
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  packets: number;
  bytes: string;
  action: 'ACCEPT' | 'REJECT';
  interfaceId: string;
}

const MOCK_FLOW_LOGS: FlowLogEntry[] = [
  { id: 'fl-101', timestamp: '2026-08-10 13:18:02', cloud: 'AWS', account: '123456789012 (Prod-US)', srcIp: '192.168.1.45', srcPort: 49152, dstIp: '10.0.10.12', dstPort: 443, protocol: 'TCP', packets: 142, bytes: '84.2 KB', action: 'ACCEPT', interfaceId: 'eni-08d44c' },
  { id: 'fl-102', timestamp: '2026-08-10 13:17:58', cloud: 'Azure', account: 'Sub: Prod-EU-01', srcIp: '185.220.101.5', srcPort: 54321, dstIp: '10.2.1.4', dstPort: 22, protocol: 'TCP', packets: 12, bytes: '1.4 KB', action: 'REJECT', interfaceId: 'nic-vm-app-01' },
  { id: 'fl-103', timestamp: '2026-08-10 13:17:45', cloud: 'GCP', account: 'proj-analytics-prod', srcIp: '10.0.10.12', srcPort: 38920, dstIp: '10.4.0.18', dstPort: 5432, protocol: 'TCP', packets: 520, bytes: '1.2 MB', action: 'ACCEPT', interfaceId: 'nic-gke-node-01' },
  { id: 'fl-104', timestamp: '2026-08-10 13:17:30', cloud: 'AWS', account: '987654321098 (Dev-EU)', srcIp: '45.143.200.12', srcPort: 60124, dstIp: '10.1.5.20', dstPort: 3389, protocol: 'TCP', packets: 4, bytes: '240 B', action: 'REJECT', interfaceId: 'eni-03b91a' },
];

export default function MultiCloudNetworkHub() {
  const [activeTab, setActiveTab] = useState<
    'topology' | 'flowlogs' | 'firewall' | 'dns' | 'security' | 'interconnect' | 'endpoints'
  >('topology');

  const [selectedCloud, setSelectedCloud] = useState<'ALL' | 'AWS' | 'Azure' | 'GCP'>('ALL');
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const [flowLogs] = useState<FlowLogEntry[]>(MOCK_FLOW_LOGS);
  const [actionFilter, setActionFilter] = useState<'ALL' | 'ACCEPT' | 'REJECT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onNodeClick = (_: React.MouseEvent, node: Node) => setSelectedNode(node);

  const filteredLogs = flowLogs.filter((log) => {
    if (selectedCloud !== 'ALL' && log.cloud !== selectedCloud) return false;
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        log.srcIp.toLowerCase().includes(q) ||
        log.dstIp.toLowerCase().includes(q) ||
        log.account.toLowerCase().includes(q) ||
        log.interfaceId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Layers3 className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-bold">Multi-Cloud & Multi-Account Network Hub</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Unified control plane across AWS Accounts, Azure Subscriptions & GCP Projects
          </p>
        </div>

        {/* Global Cloud Filter */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 px-2">Scope:</span>
          {(['ALL', 'AWS', 'Azure', 'GCP'] as const).map((cloud) => (
            <button
              key={cloud}
              onClick={() => setSelectedCloud(cloud)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedCloud === cloud
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cloud}
            </button>
          ))}
        </div>
      </div>

      {/* Global Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Connected Accounts / Subscriptions</span>
            <Box className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">14 Active</p>
          <p className="text-[11px] text-slate-400">8 AWS • 4 Azure • 2 GCP</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Cross-Cloud Traffic (24h)</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">18.4 TB</p>
          <p className="text-[11px] text-emerald-500 font-medium">↑ 8.2% Inter-region mesh</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Intrusion Prevention (IPS) Drops</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-500">2,410 Dropped</p>
          <p className="text-[11px] text-slate-400">Unified Suricata rule engine</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Private Endpoints</span>
            <Plug className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">34 Links</p>
          <p className="text-[11px] text-emerald-500 font-medium">Zero public exposure</p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex overflow-x-auto space-x-1 border-b border-slate-200 dark:border-slate-800 pb-1">
        {[
          { id: 'topology', label: 'Cross-Cloud Topology', icon: Network },
          { id: 'flowlogs', label: 'Unified Flow Logs', icon: Terminal },
          { id: 'firewall', label: 'Central Firewalls & IPS', icon: Flame },
          { id: 'dns', label: 'Global DNS Mesh', icon: Globe2 },
          { id: 'security', label: 'Security Groups & NSGs', icon: Lock },
          { id: 'interconnect', label: 'Transit & Interconnects', icon: Share2 },
          { id: 'endpoints', label: 'Private Endpoints', icon: Plug },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                isActive
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Multi-Cloud Topology */}
      {activeTab === 'topology' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl h-[580px] relative overflow-hidden shadow-inner">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background color="#334155" variant={BackgroundVariant.Dots} gap={16} size={1} />
              <Controls className="bg-slate-900 border-slate-700 fill-slate-200" />
            </ReactFlow>

            <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-[11px] text-slate-400 space-y-1.5 backdrop-blur-md">
              <p className="font-bold text-slate-200 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Multi-Cloud Mesh Legend</span>
              </p>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>AWS Accounts</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Azure Subscriptions</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>GCP Projects</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Info className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-bold">Node & Account Details</h3>
              </div>

              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Node ID</label>
                    <p className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">{selectedNode.id}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</label>
                    <p className="text-xs font-semibold capitalize text-purple-500">{selectedNode.type}</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    {Object.entries(selectedNode.data).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-slate-400 font-mono text-[10px] capitalize">{key}:</span>
                        <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <ArrowRightLeft className="w-8 h-8 mx-auto text-slate-600 animate-bounce" />
                  <p>Click any node or interconnect to inspect account boundaries & routes.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p><strong>Primary Transit:</strong> Equinix Cloud Exchange</p>
              <p><strong>Overlays:</strong> IPsec / BGP Dynamic Mesh</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Flow Logs */}
      {activeTab === 'flowlogs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-blue-500" />
              <div>
                <h2 className="text-base font-bold">Multi-Cloud Packet Stream</h2>
                <p className="text-xs text-slate-400">AWS Flow Logs + Azure NSG Flow Logs + GCP VPC Flow Logs</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search IP, Account, or Interface..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
                />
              </div>

              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {(['ALL', 'ACCEPT', 'REJECT'] as const).map((action) => (
                  <button
                    key={action}
                    onClick={() => setActionFilter(action)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                      actionFilter === action ? 'bg-purple-600 text-white' : 'text-slate-500'
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border ${
                  isLiveStreaming ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-pulse text-emerald-500' : ''}`} />
                <span>{isLiveStreaming ? 'Streaming' : 'Paused'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Account / Subscription</th>
                  <th className="py-2.5 px-3">Source IP:Port</th>
                  <th className="py-2.5 px-3">Destination IP:Port</th>
                  <th className="py-2.5 px-3">Protocol</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td className="py-3 px-3"><CloudBadge provider={log.cloud} /></td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-200">{log.account}</div>
                      <div className="text-[10px] text-slate-400">{log.interfaceId}</div>
                    </td>
                    <td className="py-3 px-3">{log.srcIp}:{log.srcPort}</td>
                    <td className="py-3 px-3">{log.dstIp}:{log.dstPort}</td>
                    <td className="py-3 px-3"><span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">{log.protocol}</span></td>
                    <td className="py-3 px-3 text-slate-400">{log.packets} pkts ({log.bytes})</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.action === 'ACCEPT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {log.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Central Firewalls */}
      {activeTab === 'firewall' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Flame className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-base font-bold">Multi-Cloud Firewall & IPS Policy Center</h2>
              <p className="text-xs text-slate-400">AWS Network Firewall + Azure Firewall Premium + GCP Cloud Armor</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">AWS Network Firewall</span>
                <CloudBadge provider="AWS" />
              </div>
              <p className="text-base font-bold text-slate-100">us-east-1-firewall-hub</p>
              <p className="text-xs text-emerald-400 mt-1">1,200 Suricata IPS Rules Active</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Azure Firewall Premium</span>
                <CloudBadge provider="Azure" />
              </div>
              <p className="text-base font-bold text-slate-100">fw-westeu-central</p>
              <p className="text-xs text-emerald-400 mt-1">TLS Inspection Enabled</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">GCP Cloud Armor</span>
                <CloudBadge provider="GCP" />
              </div>
              <p className="text-base font-bold text-slate-100">policy-edge-protection</p>
              <p className="text-xs text-emerald-400 mt-1">OWASP Top 10 Rules Active</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Global DNS */}
      {activeTab === 'dns' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Globe2 className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="text-base font-bold">Cross-Cloud Route 53 & Azure Private DNS Resolution</h2>
              <p className="text-xs text-slate-400">Conditional DNS forwarding between AWS Route 53 Resolvers & Azure Private DNS</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { domain: 'api.aws.company.internal', cloud: 'AWS', account: '123456789012', type: 'A (Alias)', value: 'alb-prod-1092.us-east-1.elb.amazonaws.com' },
              { domain: 'db.azure.company.internal', cloud: 'Azure', account: 'Sub: Prod-EU-01', type: 'CNAME', value: 'psql-prod.postgres.database.azure.com' },
              { domain: 'bigquery.gcp.company.internal', cloud: 'GCP', account: 'proj-analytics-prod', type: 'A', value: '10.4.0.50 (Cloud DNS Inbound)' },
            ].map((rec, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <CloudBadge provider={rec.cloud as any} />
                  <div>
                    <span className="font-bold text-blue-400">{rec.domain}</span>
                    <div className="text-[10px] text-slate-400 font-sans">{rec.account}</div>
                  </div>
                </div>
                <div className="text-slate-300 truncate max-w-md">{rec.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Security Groups & NSGs */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Lock className="w-5 h-5 text-purple-500" />
            <div>
              <h2 className="text-base font-bold">Security Groups, NSGs & GCP Firewall Rules</h2>
              <p className="text-xs text-slate-400">Micro-segmentation policies aggregated across providers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 uppercase">AWS Security Group</span>
                <CloudBadge provider="AWS" />
              </div>
              <p className="text-xs font-mono font-bold text-slate-200">sg-app-tier-prod</p>
              <div className="p-2 bg-slate-900 rounded text-[11px] font-mono text-slate-300">
                ALLOW TCP 443 from Azure Subnet (10.2.1.0/24)
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400 uppercase">Azure NSG Rule</span>
                <CloudBadge provider="Azure" />
              </div>
              <p className="text-xs font-mono font-bold text-slate-200">nsg-backend-westeu</p>
              <div className="p-2 bg-slate-900 rounded text-[11px] font-mono text-slate-300">
                ALLOW TCP 5432 from AWS VPC (10.0.0.0/16)
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400 uppercase">GCP VPC Firewall</span>
                <CloudBadge provider="GCP" />
              </div>
              <p className="text-xs font-mono font-bold text-slate-200">fw-allow-analytics-mesh</p>
              <div className="p-2 bg-slate-900 rounded text-[11px] font-mono text-slate-300">
                ALLOW TCP 8080 from AWS & Azure Meshes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Transit Interconnects */}
      {activeTab === 'interconnect' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Share2 className="w-5 h-5 text-purple-500" />
            <div>
              <h2 className="text-base font-bold">Cross-Cloud Transit Gateways & Interconnects</h2>
              <p className="text-xs text-slate-400">AWS Transit Gateway, Azure ExpressRoute & GCP Cloud Interconnect</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { name: 'AWS TGW <-> Azure ExpressRoute DirectLink', endpoints: 'AWS us-east-1 <-> Azure West Europe', bandwidth: '10 Gbps', status: 'Healthy' },
              { name: 'AWS TGW <-> GCP Cloud Interconnect Partner', endpoints: 'AWS us-east-1 <-> GCP us-central1', bandwidth: '5 Gbps', status: 'Healthy' },
              { name: 'Azure VPN Gateway <-> GCP Cloud VPN (Backup)', endpoints: 'Azure West Europe <-> GCP us-central1', bandwidth: '1.2 Gbps', status: 'Standby' },
            ].map((link, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="font-bold text-slate-200">{link.name}</div>
                  <div className="text-[10px] text-slate-400">{link.endpoints}</div>
                </div>
                <div className="text-right font-sans">
                  <span className="text-emerald-400 font-bold text-xs">{link.status}</span>
                  <div className="text-[10px] font-mono text-slate-400">{link.bandwidth}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Private Endpoints */}
      {activeTab === 'endpoints' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Plug className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className="text-base font-bold">Multi-Cloud Private Endpoints</h2>
              <p className="text-xs text-slate-400">AWS PrivateLink, Azure Private Endpoints & GCP Private Service Connect</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'vpce-aws-s3', cloud: 'AWS', service: 'S3 Gateway Endpoint', account: '123456789012' },
              { id: 'pe-azure-sqldb', cloud: 'Azure', service: 'Azure SQL Private Endpoint', account: 'Sub: Prod-EU-01' },
              { id: 'psc-gcp-bigquery', cloud: 'GCP', service: 'GCP Private Service Connect', account: 'proj-analytics-prod' },
            ].map((ep) => (
              <div key={ep.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-emerald-400">{ep.id}</span>
                  <CloudBadge provider={ep.cloud as any} />
                </div>
                <p className="font-mono text-slate-200 truncate">{ep.service}</p>
                <p className="text-[10px] text-slate-400">{ep.account}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}