import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarView({ tasks }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    generateWeekDays();
  }, [currentDate, tasks]);

  const generateWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const dateString = date.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => t.task_date === dateString);

      days.push({
        date,
        dateString,
        tasks: dayTasks,
        isToday: dateString === new Date().toISOString().split('T')[0]
      });
    }

    setWeekDays(days);
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTaskStats = (dayTasks) => {
    const completed = dayTasks.filter(t => t.completed).length;
    const total = dayTasks.length;
    return { completed, total };
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Weekly Calendar</h2>
              <p className="text-gray-600">
                {weekDays[0]?.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const stats = getTaskStats(day.tasks);
            const progressPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

            return (
              <div
                key={index}
                className={`rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                  day.isToday
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="text-center mb-3">
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                    day.isToday ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className={`text-2xl font-bold ${
                    day.isToday ? 'text-purple-600' : 'text-gray-800'
                  }`}>
                    {day.date.getDate()}
                  </p>
                  {day.isToday && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full font-medium">
                      Today
                    </span>
                  )}
                </div>

                {stats.total > 0 ? (
                  <div className="space-y-2">
                    <div className="bg-gray-100 rounded-lg p-2">
                      <p className="text-xs text-gray-600 mb-1">
                        {stats.completed} / {stats.total} tasks
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {day.tasks.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className={`text-xs p-2 rounded ${
                            task.completed
                              ? 'bg-teal-100 text-teal-700 line-through'
                              : task.priority === 'high'
                              ? 'bg-pink-100 text-pink-700'
                              : task.priority === 'medium'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-teal-100 text-teal-700'
                          }`}
                        >
                          <p className="font-medium truncate">{task.subject}</p>
                          <p className="text-xs opacity-75">{task.duration_minutes}m</p>
                        </div>
                      ))}
                      {day.tasks.length > 3 && (
                        <p className="text-xs text-gray-500 text-center py-1">
                          +{day.tasks.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-400">No tasks</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500 rounded"></div>
            <span className="text-gray-600">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-gray-600">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-500 rounded"></div>
            <span className="text-gray-600">Low Priority</span>
          </div>
        </div>
      </div>
    </div>
  );
}
