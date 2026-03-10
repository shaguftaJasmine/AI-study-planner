import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import PlannerForm from './components/PlannerForm';
import StudyPlanView from './components/StudyPlanView';
import CalendarView from './components/CalendarView';
import AISuggestions from './components/AISuggestions';
import {
  LayoutDashboard,
  PlusSquare,
  ListTodo,
  Calendar,
  Lightbulb,
  LogOut,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [studyPlan, setStudyPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          setUser(session?.user || null);
          if (session?.user) {
            await loadUserData(session.user.id);
          }
        })();
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user || null);
    if (session?.user) {
      await loadUserData(session.user.id);
    }
    setLoading(false);
  };

  const loadUserData = async (userId) => {
    const { data: plans } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (plans && plans.length > 0) {
      setStudyPlan(plans[0]);
      await loadTasks(plans[0].id);
      await loadSuggestions(plans[0].id);
    }
  };

  const loadTasks = async (planId) => {
    const { data } = await supabase
      .from('study_tasks')
      .select('*')
      .eq('study_plan_id', planId)
      .order('task_date', { ascending: true });

    if (data) setTasks(data);
  };

  const loadSuggestions = async (planId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/suggestions/${planId}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handlePlanCreated = (data) => {
    setStudyPlan(data.studyPlan);
    setTasks(data.tasks);
    setSuggestions(data.suggestions);
    setCurrentView('dashboard');
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStudyPlan(null);
    setTasks([]);
    setSuggestions([]);
    setCurrentView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={setUser} />;
  }

  const todayTasks = tasks.filter(
    (t) => t.task_date === new Date().toISOString().split('T')[0]
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'form', label: 'New Plan', icon: PlusSquare },
    { id: 'plan', label: 'Tasks', icon: ListTodo },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'suggestions', label: 'AI Tips', icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-teal-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">
                  Study Planner
                </h1>
              </div>

              <div className="hidden md:flex gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        currentView === item.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

          <div className="md:hidden flex gap-1 pb-3 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    currentView === item.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <Dashboard
            user={user}
            onNavigate={setCurrentView}
            todayTasks={todayTasks}
          />
        )}

        {currentView === 'form' && (
          <PlannerForm user={user} onPlanCreated={handlePlanCreated} />
        )}

        {currentView === 'plan' && (
          <StudyPlanView tasks={tasks} onTaskUpdate={handleTaskUpdate} />
        )}

        {currentView === 'calendar' && <CalendarView tasks={tasks} />}

        {currentView === 'suggestions' && (
          <AISuggestions suggestions={suggestions} />
        )}
      </main>
    </div>
  );
}
