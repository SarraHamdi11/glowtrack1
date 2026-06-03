import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Briefcase, CheckSquare, Activity,
  BarChart2, User, LogOut, Menu, X, Sun, Moon, Sparkles, Plus
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview",   href: "/dashboard", grad: "from-violet-500 to-purple-600" },
  { icon: Activity,        label: "Habits",     href: "/habits",    grad: "from-orange-500 to-amber-500" },
  { icon: CheckSquare,     label: "Tasks",      href: "/tasks",     grad: "from-emerald-500 to-teal-600" },
  { icon: BarChart2,       label: "Analytics",  href: "/analytics", grad: "from-pink-500 to-rose-500" },
  { icon: Briefcase,       label: "Job Search", href: "/jobs",      grad: "from-blue-500 to-indigo-600" },
  { icon: User,            label: "Profile",    href: "/profile",   grad: "from-purple-500 to-violet-600" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, navigate] = useLocation();

  function handleLogout() { logout(); navigate("/"); }

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Background Mesh Gradients for Glassmorphism */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-pink-500/5 blur-[100px]" />
      </div>

      {open && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden" onClick={() => setOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        bg-sidebar/95 backdrop-blur-xl border-r border-white/10 dark:border-white/5
        transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
      `}>
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-bl from-violet-400/20 to-transparent blur-2xl" />
        <div className="pointer-events-none absolute bottom-20 left-0 w-32 h-32 rounded-full bg-gradient-to-tr from-pink-400/15 to-transparent blur-2xl" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10 dark:border-white/5">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #6366f1, #3b82f6)", boxShadow: "0 10px 30px -10px rgba(99, 102, 241, 0.3)" }}>
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold text-lg" style={{ background: "linear-gradient(135deg, #6366f1, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GlowTrack</span>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}>
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto relative">
          {navItems.map(({ icon: Icon, label, href, grad }) => {
            const active = location === href;
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer group
                  ${active ? "text-white shadow-lg" : "text-sidebar-foreground hover:bg-white/10 dark:hover:bg-white/5 hover:text-foreground"}`}
                style={active ? { background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` } : undefined}>
                {active ? (
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10 dark:bg-white/5 group-hover:bg-white/15 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                )}
                {label}
                {active && <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-white/70`} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10 dark:border-white/5 space-y-1 relative">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-sidebar-foreground hover:bg-white/10 dark:hover:bg-white/5 transition-all">
            <div className="w-8 h-8 rounded-xl bg-white/10 dark:bg-white/5 flex items-center justify-center">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </div>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all">
            <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            Sign out
          </button>
          {/* User pill */}
          <div className="flex items-center gap-3 px-3 py-3 mt-1 rounded-2xl bg-white/10 dark:bg-white/5">
            {user?.avatar
              ? <img src={user.avatar} className="w-8 h-8 rounded-xl object-cover" alt="" />
              : <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-extrabold shadow-md">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
            }
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 lg:ml-64 relative min-h-screen">
        <header className="lg:hidden sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">GlowTrack</span>
          </div>
          <button onClick={() => setOpen(true)} className="p-2 rounded-xl bg-muted">
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <div className="p-4 lg:p-8 max-w-6xl mx-auto relative z-10">
          {children}
        </div>

        {/* Floating Action Button (FAB) */}
        <div className="fixed bottom-6 right-6 z-40">
          <AnimatePresence>
            {showFabMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                className="absolute bottom-16 right-0 space-y-2"
              >
                <Link href="/habits">
                  <button className="flex items-center gap-3 px-4 py-3 rounded-2xl glass text-sm font-bold whitespace-nowrap hover:scale-105 transition-all">
                    <Activity className="w-4 h-4 text-orange-500" /> New Habit
                  </button>
                </Link>
                <Link href="/tasks">
                  <button className="flex items-center gap-3 px-4 py-3 rounded-2xl glass text-sm font-bold whitespace-nowrap hover:scale-105 transition-all">
                    <CheckSquare className="w-4 h-4 text-emerald-500" /> New Task
                  </button>
                </Link>
                <Link href="/jobs">
                  <button className="flex items-center gap-3 px-4 py-3 rounded-2xl glass text-sm font-bold whitespace-nowrap hover:scale-105 transition-all">
                    <Briefcase className="w-4 h-4 text-blue-500" /> New Job
                  </button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setShowFabMenu(!showFabMenu)}
            className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 ${showFabMenu ? 'rotate-45 bg-destructive' : 'bg-primary'}`}
            style={!showFabMenu ? { background: "linear-gradient(135deg, #6366f1, #3b82f6)" } : undefined}
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>
      </main>
    </div>
  );
}
