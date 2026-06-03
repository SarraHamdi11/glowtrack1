import { useEffect, useState } from "react";
import { Plus, Trash2, X, Flame, Sparkles, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import DashboardLayout from "@/layouts/DashboardLayout";
import api from "@/services/api";

type Habit = { id: string; name: string; completed: boolean; streak: number; createdAt: string };

const HABIT_ICONS = ["🧘", "💧", "🏃", "📚", "🍎", "💻", "🎨", "🌿"];

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchHabits(); }, []);

  async function fetchHabits() {
    try { const { data } = await api.get("/habits"); setHabits(data); }
    finally { setLoading(false); }
  }

  async function handleAdd() {
    if (!name.trim()) { toast.error("Habit name is required"); return; }
    setSaving(true);
    try {
      const { data } = await api.post("/habits", { name });
      setHabits(h => [...h, data]);
      setName(""); setShowModal(false);
      toast.success("Habit added! Time to shine ✨");
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  }

  async function toggleHabit(id: string) {
    const { data } = await api.post(`/habits/${id}/toggle`);
    const newHabits = habits.map(x => x.id === id ? data : x);
    setHabits(newHabits);
    
    if (data.completed) {
      toast.success("Great job! Keep the streak alive! 🔥");
      
      // Check if all habits are completed
      const allDone = newHabits.length > 0 && newHabits.every(h => h.completed);
      if (allDone) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#3b82f6', '#8b5cf6', '#ec4899']
        });
        toast.success("Perfect Day! You've completed all your rituals! 🌟", {
          description: "Enjoy the feeling of being 1% better today.",
          duration: 5000,
        });
      }
    }
  }

  async function handleDelete(id: string) {
    await api.delete(`/habits/${id}`);
    setHabits(h => h.filter(x => x.id !== id));
    setDeleteId(null);
    toast.success("Habit removed");
  }

  const completedCount = habits.filter(h => h.completed).length;
  const completionPct = habits.length ? Math.round((completedCount / habits.length) * 100) : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Daily Rituals</h1>
            <p className="text-muted-foreground text-sm mt-1">Consistency is the key to mastery. Build your streaks! 🚀</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white text-sm font-bold shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> 
            Add Ritual
          </button>
        </div>

        {/* Today's progress - Modern Bento Card */}
        {habits.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-[2.5rem] p-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Today's Glow Up</h2>
                <p className="text-muted-foreground font-medium">
                  {completedCount === habits.length 
                    ? "Perfect day! You're crushing it! 🌟" 
                    : `${completedCount} of ${habits.length} habits completed. Almost there!`}
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-muted/30"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * completionPct) / 100}
                      className="text-primary transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xl font-black text-primary">{completionPct}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Habits grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : habits.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-card border border-dashed border-border rounded-[3rem]"
            >
              <div className="text-7xl mb-6">🌱</div>
              <h3 className="text-2xl font-bold tracking-tight">Your garden is empty</h3>
              <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                Small habits lead to big changes. What will you start today?
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-8 px-8 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                Plant a Habit
              </button>
            </motion.div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {habits.map((habit, index) => (
                  <motion.div 
                    key={habit.id} 
                    variants={item}
                    layout
                    className={`relative bg-card border-2 rounded-[2rem] p-6 transition-all duration-300 group hover:-translate-y-1 ${
                      habit.completed 
                        ? "border-primary/20 bg-primary/[0.02] shadow-sm" 
                        : "border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-colors ${
                          habit.completed ? 'bg-primary/10 text-primary' : 'bg-muted/50'
                        }`}>
                          {HABIT_ICONS[index % HABIT_ICONS.length]}
                        </div>
                        <div>
                          <p className={`font-bold text-lg leading-tight ${habit.completed ? 'text-muted-foreground' : ''}`}>
                            {habit.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Flame className={`w-4 h-4 ${habit.streak > 0 ? "text-orange-500 fill-orange-500" : "text-muted-foreground"}`} />
                            <span className="text-xs font-bold text-muted-foreground">{habit.streak} DAY STREAK</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setDeleteId(habit.id)} 
                        className="p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Streak Progress - Modern Dots */}
                    <div className="flex gap-1.5 mb-8">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                            i < Math.min(habit.streak, 7) 
                              ? "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.4)]" 
                              : "bg-muted/60"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-full py-4 rounded-2xl text-sm font-black tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                        habit.completed 
                          ? "bg-muted/50 text-muted-foreground cursor-default" 
                          : "bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98]"
                      }`}
                    >
                      {habit.completed ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" /> Done
                        </>
                      ) : (
                        <>
                          <Circle className="w-5 h-5" /> Complete
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )
        }
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          <div
            className="relative w-full max-w-md rounded-3xl shadow-2xl p-6 overflow-hidden"
            style={{ background: "linear-gradient(145deg, #f5f3ff 0%, #eff6ff 100%)", border: "0.5px solid #c7d2fe" }}
          >
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, #e0e7ff 0%, transparent 70%)" }} />
            <div className="pointer-events-none absolute -bottom-8 -left-8 w-28 h-28 rounded-full" style={{ background: "radial-gradient(circle, #dbeafe 0%, transparent 70%)" }} />

            {/* Header */}
            <div className="relative flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #818cf8, #60a5fa)" }}>
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#4338ca] text-base leading-tight">New habit</p>
                  <p className="text-xs text-[#6366f1] leading-tight">Build consistency ✨</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl transition"
                style={{ background: "#e0e7ff", color: "#6366f1" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6366f1" }}>Habit name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                  placeholder="e.g. Morning workout, Read 30 mins..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    border: "1px solid #c7d2fe",
                    color: "#3730a3",
                  }}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-[1fr_1.6fr] gap-2.5 pt-1">
                <button
                  onClick={() => setShowModal(false)}
                  className="py-2.5 rounded-xl text-sm font-semibold transition"
                  style={{ background: "rgba(255,255,255,0.6)", border: "1px solid #c7d2fe", color: "#6366f1" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-60 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #6366f1, #3b82f6)" }}
                >
                  <Plus className="w-4 h-4" />
                  {saving ? "Adding..." : "Add habit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div
            className="relative w-full max-w-md rounded-3xl shadow-2xl p-6 overflow-hidden"
            style={{ background: "linear-gradient(145deg, #f5f3ff 0%, #eff6ff 100%)", border: "0.5px solid #c7d2fe" }}
          >
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, #e0e7ff 0%, transparent 70%)" }} />
            <div className="pointer-events-none absolute -bottom-8 -left-8 w-28 h-28 rounded-full" style={{ background: "radial-gradient(circle, #dbeafe 0%, transparent 70%)" }} />

            <div className="relative">
              <h2 className="font-bold text-lg mb-2" style={{ color: "#4338ca" }}>Delete habit?</h2>
              <p className="text-sm mb-6" style={{ color: "#6366f1" }}>Your streak will be lost. This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
                  style={{ background: "rgba(255,255,255,0.6)", border: "1px solid #c7d2fe", color: "#6366f1" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition"
                  style={{ background: "linear-gradient(135deg, #6366f1, #3b82f6)" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
