import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, TrendingUp } from 'lucide-react';

export default function StudyPlanView({ tasks, onTaskUpdate }) {
  const [filter, setFilter] = useState('all');
  const [groupedTasks, setGroupedTasks] = useState({});

  useEffect(() => {
    const grouped = tasks.reduce((acc, task) => {
      const date = task.task_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(task);
      return acc;
    }, {});
    setGroupedTasks(grouped);
  }, [tasks]);

  const toggleTask = async (taskId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });

      if (!response.ok) throw new Error('Failed to update task');

      const updatedTask = await response.json();
      onTaskUpdate(updatedTask);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-pink-400 bg-pink-50';
      case 'medium': return 'border-purple-400 bg-purple-50';
      case 'low': return 'border-teal-400 bg-teal-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'bg-pink-500 text-white';
      case 'medium': return 'bg-purple-500 text-white';
      case 'low': return 'bg-teal-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Overall Progress</h2>
            <p className="text-purple-100">Keep up the great work!</p>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Completed Tasks</span>
            <span className="font-semibold">{completedTasks} / {totalTasks}</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-right text-2xl font-bold mt-2">{Math.round(progressPercent)}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Study Tasks</h3>
          <div className="flex gap-2">
            {['all', 'pending', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === f
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedTasks)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([date, dateTasks]) => {
              const visibleTasks = dateTasks.filter(task => {
                if (filter === 'completed') return task.completed;
                if (filter === 'pending') return !task.completed;
                return true;
              });

              if (visibleTasks.length === 0) return null;

              return (
                <div key={date}>
                  <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    {formatDate(date)}
                  </h4>
                  <div className="space-y-3">
                    {visibleTasks.map(task => (
                      <div
                        key={task.id}
                        className={`border-2 rounded-xl p-4 transition-all hover:shadow-md ${
                          task.completed
                            ? 'bg-teal-50 border-teal-200 opacity-75'
                            : getPriorityColor(task.priority)
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => toggleTask(task.id, task.completed)}
                            className="mt-1 transition-transform hover:scale-110"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-6 h-6 text-teal-500" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-400" />
                            )}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className={`font-semibold text-lg ${
                                task.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                              }`}>
                                {task.subject}
                              </h5>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                getPriorityBadge(task.priority)
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className={`text-sm mb-2 ${
                              task.completed ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                              {task.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{task.duration_minutes} minutes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Circle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tasks found for this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
