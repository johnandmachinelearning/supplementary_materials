'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { generateMockAccounts } from '@/lib/mockGenerator';
import { AWSAccount } from '@/types';
import { Search, Filter, ShieldCheck, ChevronRight } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AWSAccount[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEnv, setSelectedEnv] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAccounts(generateMockAccounts(200));
    setLoading(false);
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesSearch =
        acc.accountName.toLowerCase().includes(search.toLowerCase()) ||
        acc.accountId.includes(search) ||
        acc.ownerEmail.toLowerCase().includes(search.toLowerCase());
      const matchesEnv = selectedEnv === 'all' || acc.environment === selectedEnv;
      return matchesSearch && matchesEnv;
    });
  }, [accounts, search, selectedEnv]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading 200 AWS Accounts...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AWS Accounts Inventory</h1>
          <p className="text-slate-400 text-sm">Managing {accounts.length} linked accounts</p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-slate-600 w-full sm:w-64"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-3">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedEnv}
              onChange={(e) => setSelectedEnv(e.target.value)}
              className="bg-transparent text-sm text-slate-300 focus:outline-none py-2"
            >
              <option value="all">All Envs</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-4">Account ID</th>
                <th className="p-4">Account Name</th>
                <th className="p-4">Environment</th>
                <th className="p-4">Owner Email</th>
                <th className="p-4">Workloads</th>
                <th className="p-4">Monthly Spend</th>
                <th className="p-4">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAccounts.map((acc) => (
                <tr key={acc.accountId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-400">{acc.accountId}</td>
                  <td className="p-4 font-semibold text-white">{acc.accountName}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${
                        acc.environment === 'production'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : acc.environment === 'staging'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {acc.environment}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-400">{acc.ownerEmail}</td>
                  <td className="p-4">{acc.workloads.length} Active</td>
                  <td className="p-4 font-medium text-emerald-400">${acc.monthlySpend.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${acc.complianceScore > 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${acc.complianceScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono">{acc.complianceScore}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-right">
          Showing {filteredAccounts.length} of {accounts.length} accounts
        </div>
      </div>
    </div>
  );
}