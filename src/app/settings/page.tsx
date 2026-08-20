'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Globe,
  Key,
  Flame,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Mail,
  Lock,
} from 'lucide-react';
import { SlackIcon } from '@/components/icons/SlackIcon';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'aws-fis' | 'security' | 'notifications'>('general');
  const [isSaved, setIsSaved] = useState(false);

  // Form State
  const [appName, setAppName] = useState('Resilience & Chaos Hub');
  const [environment, setEnvironment] = useState('Production');
  const [autoRollback, setAutoRollback] = useState(true);
  const [fisExecutionRole, setFisExecutionRole] = useState('arn:aws:iam::111111111111:role/CentralFISMasterRole');
  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.com/services/T00/B00/XXXXXX');
  const [emailAlerts, setEmailAlerts] = useState('devops-alerts@company.com');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey] = useState('fis_live_99887766554433221100abcdef');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Settings className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            <span>Platform Settings</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure global preferences, AWS FIS cross-account integration, security keys, and alert channels
          </p>
        </div>

        {/* Save Status Notification */}
        {isSaved && (
          <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm h-fit">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'general'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>General Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('aws-fis')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'aws-fis'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>AWS FIS & Chaos Defaults</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'security'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & API Keys</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'notifications'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alerts & Notifications</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            
            {/* TAB 1: GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">General Settings</h3>
                  <p className="text-xs text-slate-500">Global display options and default platform environment.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Application Name</label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="w-full max-w-md px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Default Target Environment</label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="w-full max-w-md px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Production">Production</option>
                      <option value="Staging">Staging</option>
                      <option value="Development">Development</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AWS FIS & CHAOS */}
            {activeTab === 'aws-fis' && (
              <div className="space-y-5">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">AWS FIS Settings</h3>
                  <p className="text-xs text-slate-500">Configure fault injection master IAM roles and automated stop conditions.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Master FIS Execution Role ARN</label>
                    <input
                      type="text"
                      value={fisExecutionRole}
                      onChange={(e) => setFisExecutionRole(e.target.value)}
                      className="w-full font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <input
                      type="checkbox"
                      id="rollback"
                      checked={autoRollback}
                      onChange={(e) => setAutoRollback(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                    />
                    <label htmlFor="rollback" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Enforce CloudWatch Auto-Rollback Stop Conditions on all experiments
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Security & Access Tokens</h3>
                  <p className="text-xs text-slate-500">Manage API keys for programmatic chaos execution via CLI or CI/CD pipelines.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">API Key</label>
                    <div className="flex items-center space-x-2 max-w-md">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        readOnly
                        className="w-full font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Alert Channels</h3>
                  <p className="text-xs text-slate-500">Receive real-time notifications when FIS stop conditions are triggered.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                      <SlackIcon className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Slack Incoming Webhook URL</span>
                    </label>
                    <input
                      type="text"
                      value={slackWebhook}
                      onChange={(e) => setSlackWebhook(e.target.value)}
                      className="w-full max-w-md font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      <span>Alert Recipient Emails</span>
                    </label>
                    <input
                      type="email"
                      value={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.value)}
                      className="w-full max-w-md px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Bar */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}