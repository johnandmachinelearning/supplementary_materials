'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  Search,
  Star,
  CheckCircle2,
  AlertTriangle,
  Folder,
  Layers,
  Sparkles,
  ShieldCheck,
  Globe,
  Terminal,
  Cloud,
  MessageSquare,
  BookOpen,
  CheckSquare,
  GitBranch,
  FileText,
} from 'lucide-react';

interface ToolLink {
  id: string;
  name: string;
  category: 'DevOps & Git' | 'Cloud & Infrastructure' | 'Collaboration & Chat' | 'ITSM & Docs';
  description: string;
  url: string;
  icon: React.ElementType;
  badge?: string;
  status: 'Operational' | 'Degraded' | 'Maintenance';
  isFavorite?: boolean;
}

const TOOLS_DATA: ToolLink[] = [
  {
    id: 'jira',
    name: 'Jira Software',
    category: 'ITSM & Docs',
    description: 'Issue tracking, sprint planning, and agile project boards',
    url: 'https://jira.atlassian.net',
    icon: CheckSquare,
    badge: 'Atlassian',
    status: 'Operational',
    isFavorite: true,
  },
  {
    id: 'confluence',
    name: 'Confluence Wiki',
    category: 'ITSM & Docs',
    description: 'Team documentation, runbooks, architecture decision records',
    url: 'https://confluence.atlassian.net',
    icon: BookOpen,
    badge: 'Atlassian',
    status: 'Operational',
    isFavorite: true,
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'Collaboration & Chat',
    description: 'Team messaging, video meetings, and incident channels',
    url: 'https://teams.microsoft.com',
    icon: MessageSquare,
    badge: 'Microsoft',
    status: 'Operational',
    isFavorite: true,
  },
  {
    id: 'gitlab',
    name: 'GitLab Enterprise',
    category: 'DevOps & Git',
    description: 'Source control, CI/CD pipelines, and Merge Request code reviews',
    url: 'https://gitlab.com',
    icon: GitBranch,
    badge: 'DevOps',
    status: 'Operational',
    isFavorite: true,
  },
  {
    id: 'aws-landing',
    name: 'AWS Account Landing Page',
    category: 'Cloud & Infrastructure',
    description: 'AWS IAM Identity Center (SSO) multi-account access portal',
    url: 'https://aws.amazon.com/console',
    icon: Cloud,
    badge: 'Production',
    status: 'Operational',
    isFavorite: true,
  },
  {
    id: 'azure-portal',
    name: 'Azure Portal',
    category: 'Cloud & Infrastructure',
    description: 'Microsoft Azure cloud resources, Entra ID, and management groups',
    url: 'https://portal.azure.com',
    icon: Cloud,
    badge: 'Cloud',
    status: 'Operational',
  },
  {
    id: 'm365',
    name: 'Microsoft 365 Portal',
    category: 'Collaboration & Chat',
    description: 'Outlook, SharePoint, OneDrive, and corporate apps directory',
    url: 'https://www.office.com',
    icon: Globe,
    badge: 'Enterprise',
    status: 'Operational',
  },
  {
    id: 'servicenow',
    name: 'ServiceNow ITSM Portal',
    category: 'ITSM & Docs',
    description: 'IT Service desk, incident response, change requests, and asset catalog',
    url: 'https://servicenow.com',
    icon: FileText,
    badge: 'ITSM',
    status: 'Operational',
  },
];

const CATEGORIES = [
  'All Tools',
  'Favorites',
  'DevOps & Git',
  'Cloud & Infrastructure',
  'Collaboration & Chat',
  'ITSM & Docs',
] as const;

export default function ToolsDirectoryPage() {
  const [tools, setTools] = useState<ToolLink[]>(TOOLS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Tools');

  const toggleFavorite = (id: string) => {
    setTools((prev) =>
      prev.map((tool) => (tool.id === id ? { ...tool, isFavorite: !tool.isFavorite } : tool))
    );
  };

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === 'Favorites') {
      return matchesSearch && tool.isFavorite;
    }
    if (selectedCategory !== 'All Tools') {
      return matchesSearch && tool.category === selectedCategory;
    }

    return matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Layers className="w-6 h-6 text-blue-500" />
            <span>Developer Tools & Portals Directory</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Central launcher for enterprise SSO platforms, cloud management portals, and team tools
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All Enterprise SSO Services Online</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search portal or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header Row: Icon, Badge, Favorite */}
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {tool.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tool.badge}
                      </span>
                    )}
                    <button
                      onClick={() => toggleFavorite(tool.id)}
                      className="p-1 text-slate-400 hover:text-amber-400 transition"
                      title={tool.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          tool.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-500 transition">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: Category & Launch Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  {tool.category}
                </span>

                <a
                  href={tool.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition flex items-center space-x-1.5 shadow-sm"
                >
                  <span>Launch</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <Folder className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No tools found</h4>
          <p className="text-xs text-slate-500">Try adjusting your search query or selected category.</p>
        </div>
      )}
    </div>
  );
}