import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Briefcase, CheckSquare, Flame, TrendingUp, Clock, ArrowRight, Activity, Calendar, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";
import DashboardCard from "@/components/DashboardCard";
import DashboardLayout from "@/layouts/DashboardLayout";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/stats"),
      api.get("/dashboard/activity"),
      api.get("/habits")
    ])
      .then(([s, a, h]) => {
        setStats(s.data);
        setActivity(a.data);
        setHabits(h.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.name?.split(" ")[0]}! ✨</h1>
            <p className="text-muted-foreground text-sm mt-1">You're on a {stats?.habitStreak ?? 0} day streak. Keep it up!</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/habits">
              <button className="px-4 py-2 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] transition-all">
                Daily Check-in
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
          
          {/* Main Habit Progress - Large Card */}
          <motion.div variants={item} className="md:col-span-4 lg:col-span-4 glass-card rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Habit Consistency
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Your activity over the last 8 weeks</p>
                </div>
                <Link href="/analytics" className="text-xs font-bold text-primary hover:underline">Full Report</Link>
              </div>

              <div className="h-[240px] w-full">
                {activity?.weeklyApplications?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activity.weeklyApplications}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="week" hide />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        labelFormatter={v => `Week of ${v}`}
                      />
                      <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground italic">No data yet</div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Column */}
          <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 gap-6">
            <motion.div variants={item}>
              <DashboardCard 
                title="Current Streak" 
                value={`${stats?.habitStreak ?? 0} Days`} 
                icon={Flame} 
                color="orange" 
                subtitle="Best: 12 days"
              />
            </motion.div>
            <motion.div variants={item}>
              <DashboardCard 
                title="Tasks Done" 
                value={stats?.tasksCompleted ?? 0} 
                icon={CheckSquare} 
                color="green" 
                subtitle="All time total"
              />
            </motion.div>
          </div>

          {/* Today's Habits - Medium Card */}
          <motion.div variants={item} className="md:col-span-3 lg:col-span-3 glass-card rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" /> Today's Habits
              </h2>
              <span className="text-xs font-bold px-3 py-1 bg-orange-100 text-orange-600 rounded-full">
                {habits.filter(h => h.completed).length}/{habits.length} Done
              </span>
            </div>

            <div className="space-y-4">
              {habits.slice(0, 4).map((habit) => (
                <div key={habit.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${habit.completed ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-background/50 border-2 border-orange-200'}`}>
                      {habit.completed ? <Sparkles className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-orange-300" />}
                    </div>
                    <span className={`font-semibold ${habit.completed ? 'text-muted-foreground line-through' : ''}`}>{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-orange-600">
                    <Flame className="w-3 h-3" /> {habit.streak}
                  </div>
                </div>
              ))}
              {habits.length === 0 && (
                <div className="text-center py-8 text-muted-foreground italic">No habits added yet</div>
              )}
              <Link href="/habits" className="block text-center text-xs font-bold text-primary mt-4 hover:underline">Manage all habits →</Link>
            </div>
          </motion.div>

          {/* Today's Focus - Medium Card */}
          <motion.div variants={item} className="md:col-span-3 lg:col-span-3 glass-card rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" /> Focus Tasks
              </h2>
              <Link href="/tasks" className="text-xs font-bold text-primary hover:underline">View All</Link>
            </div>

            <div className="space-y-4">
              {activity?.todayTasks?.slice(0, 3).map((task: any) => (
                <div key={task.id} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-all">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-violet-500 border-violet-500 text-white' : 'border-violet-200 group-hover:border-violet-400'}`}>
                    {task.completed && <CheckSquare className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${task.completed ? 'text-muted-foreground line-through' : ''}`}>{task.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">{task.priority} Priority</p>
                  </div>
                </div>
              ))}
              {(!activity?.todayTasks || activity.todayTasks.length === 0) && (
                <div className="text-center py-8 text-muted-foreground italic">Zero tasks for today! Chill time? 🏝️</div>
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
}
