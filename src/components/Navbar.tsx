'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Network, TrendingDown, LogOut, ShieldCheck, Flame, Settings, GitBranch, Layers, Headphones } from 'lucide-react';
import { useAuth } from './AuthProvider';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  // Hide Navbar on Login page
  if (pathname === '/login') return null;

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Accounts', href: '/accounts', icon: Users },
    { name: 'DevOps', href: '/devops', icon: GitBranch },
    { name: 'Networking', href: '/networking', icon: Network },
    { name: 'FinOps', href: '/optimization', icon: TrendingDown },
    { name: 'Security', href: '/security', icon: ShieldCheck },
    { name: 'Resiliency', href: '/resiliency', icon: Flame },
    { name: 'Service Desk', href: '/servicedesk', icon: Headphones },
    { name: 'Tools Directory', href: '/links', icon: Layers },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2 font-bold text-lg text-white">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <span>Control Center</span>
        </div>
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-mono">{user?.email || 'admin@company.com'}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-lg transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}