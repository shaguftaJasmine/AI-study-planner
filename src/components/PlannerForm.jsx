import { useState } from 'react';
import { PlusCircle, Trash2, Sparkles } from 'lucide-react';

export default function PlannerForm({ user, onPlanCreated }) {
  const [title, setTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState(4);
  const [subjects, setSubjects] = useState([
    { name: '', difficulty: 'medium' }
  ]);
  const [loading, setLoading] = useState(false);

  const addSubject = () => {
    setSubjects([...subjects, { name: '', difficulty: 'medium' }]);
  };

  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validSubjects = subjects.filter(s => s.name.trim());
    if (!title || !examDate || validSubjects.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subjects: validSubjects,
          examDate,
          dailyStudyHours: dailyHours,
          userId: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to generate plan');

      const data = await response.json();
      onPlanCreated(data);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create Study Plan</h2>
            <p className="text-gray-600">Let AI organize your study schedule</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Final Exams 2024"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Study Hours
              </label>
              <input
                type="number"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseInt(e.target.value))}
                min="1"
                max="12"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Subjects
              </label>
              <button
                type="button"
                onClick={addSubject}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <PlusCircle className="w-4 h-4" />
                Add Subject
              </button>
            </div>

            <div className="space-y-3">
              {subjects.map((subject, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={subject.name}
                    onChange={(e) => updateSubject(index, 'name', e.target.value)}
                    placeholder="Subject name"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  />

                  <select
                    value={subject.difficulty}
                    onChange={(e) => updateSubject(index, 'difficulty', e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>

                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Generating Your Plan...
              </span>
            ) : (
              'Generate Study Plan with AI'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
