import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Change 'next/font' to 'next/font/google'
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Navbar } from '@/components/Navbar';
//import DevOpsAgentChat from '@/components/DevOpsAgentChat';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AWS DevOps Control System',
  description: 'Multi-account observability, VPC flow log analytics, and cost insights.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
<body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300" suppressHydrationWarning>
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {/* Top Bar with Theme Toggle */}
          <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
            <h1 className="font-bold text-sm tracking-wide">IT Engineering Dashboard</h1>
            <ThemeToggle />
          </header>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          {/* Global Floating DevOps Agent */}
{/* DevOps AI Agent Chat */}
          {/* <DevOpsAgentChat /> */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
    
  );
}