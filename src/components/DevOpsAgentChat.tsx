'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  X,
  MessageSquare,
  ChevronDown,
  ShieldAlert,
  TrendingDown,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  GitPullRequest,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  structuredCard?: {
    type: 'security' | 'optimization' | 'system';
    data: any;
  };
}

export default function DevOpsAgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: "Hello! I'm your DevOps & Cloud Governance Agent. Ask me anything about live security vulnerabilities, cost optimization savings, or open Terraform PRs across your environments.",
      timestamp: 'Just now',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Query engine simulation using context from Security & Optimization dashboards
  const processAgentQuery = (query: string) => {
    const lower = query.toLowerCase();
    setIsThinking(true);

    setTimeout(() => {
      let replyText = '';
      let card: ChatMessage['structuredCard'] | undefined = undefined;

      if (lower.includes('security') || lower.includes('vulnerability') || lower.includes('alert') || lower.includes('posture')) {
        replyText = "Here is the current security snapshot across your connected cloud accounts:";
        card = {
          type: 'security',
          data: {
            score: '88/100',
            criticalCount: 2,
            highCount: 1,
            topIssue: 'S3 Bucket Public Read Access (prod-customer-backups-2026)',
            rootMfa: 'Root IAM lacks MFA enforcement',
          },
        };
      } else if (lower.includes('optimization') || lower.includes('cost') || lower.includes('savings') || lower.includes('pr')) {
        replyText = "I checked the cost optimization engine. Here are the top metrics:";
        card = {
          type: 'optimization',
          data: {
            monthlySavings: '$2,790',
            annualSavings: '$33,480',
            openPRs: 2,
            topOpportunity: 'analytics-worker-01 (m5.4xlarge → m5.xlarge) — Save $420/mo',
          },
        };
      } else if (lower.includes('status') || lower.includes('health') || lower.includes('webhook')) {
        replyText = "All dashboard governance connectors and infrastructure monitoring services are operational.";
        card = {
          type: 'system',
          data: {
            slackWebhook: 'Connected (#cost-governance)',
            githubApp: 'Active (Auto-PR Enabled)',
            securityScanEngine: 'Running (Next scan in 14m)',
          },
        };
      } else {
        replyText = `I analyzed your request regarding "${query}". Currently, all 3 production accounts are synced. You have **2 critical security findings** requiring attention and **$2,790/mo in potential cost savings** ready for automated Terraform PR generation.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          structuredCard: card,
        },
      ]);
      setIsThinking(false);
    }, 900);
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    processAgentQuery(query);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white p-4 rounded-full shadow-2xl z-50 flex items-center space-x-2 transition-all hover:scale-105 border border-white/20"
        >
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="text-xs font-bold tracking-wide pr-1">DevOps Agent</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
        </button>
      )}

      {/* Chat Drawer Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[560px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <Bot className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>DevOps Agent</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Dashboard Context Active</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-slate-900/50 p-2 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto text-[11px] font-mono">
            <button
              onClick={() => handleSend('What is our current security posture?')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded border border-rose-500/20 whitespace-nowrap transition"
            >
              🛡️ Security Posture
            </button>
            <button
              onClick={() => handleSend('Show high-value savings PRs')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-emerald-500/20 whitespace-nowrap transition"
            >
              💰 Cost Savings
            </button>
            <button
              onClick={() => handleSend('Check system health')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded border border-blue-500/20 whitespace-nowrap transition"
            >
              ⚡ System Health
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-rose-600 text-white font-medium rounded-br-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Rendered Intelligence Cards */}
                  {msg.structuredCard?.type === 'security' && (
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 mt-2 font-mono">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Posture Score:</span>
                        <span className="text-emerald-400 font-bold">{msg.structuredCard.data.score}</span>
                      </div>
                      <div className="text-[11px] text-rose-400 space-y-1">
                        <p>⚠️ {msg.structuredCard.data.criticalCount} Critical Vulnerabilities Found</p>
                        <p className="text-slate-400 text-[10px] truncate">• {msg.structuredCard.data.topIssue}</p>
                      </div>
                    </div>
                  )}

                  {msg.structuredCard?.type === 'optimization' && (
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 mt-2 font-mono">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Potential Savings:</span>
                        <span className="text-emerald-400 font-bold">{msg.structuredCard.data.monthlySavings}/mo</span>
                      </div>
                      <p className="text-[10px] text-slate-300">
                        Top Action: <span className="text-amber-400">{msg.structuredCard.data.topOpportunity}</span>
                      </p>
                    </div>
                  )}

                  {msg.structuredCard?.type === 'system' && (
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 mt-2 text-[10px] font-mono">
                      <p className="text-emerald-400">✓ {msg.structuredCard.data.slackWebhook}</p>
                      <p className="text-emerald-400">✓ {msg.structuredCard.data.githubApp}</p>
                      <p className="text-blue-400">⚡ {msg.structuredCard.data.securityScanEngine}</p>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center space-x-2 text-slate-400 bg-slate-900 border border-slate-800 p-2.5 rounded-xl w-32">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                <span className="text-[11px]">Analyzing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Ask agent about security, costs, or PRs..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}