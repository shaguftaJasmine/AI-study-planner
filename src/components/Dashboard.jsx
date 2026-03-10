import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Target, Upload, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Dashboard({ user, onNavigate, todayTasks }) {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    } else if (!error) {
      await supabase
        .from('profiles')
        .insert({ id: user.id, full_name: user.email.split('@')[0] });
      fetchProfile();
    }
  };

  const uploadPhoto = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, profile_photo_url: publicUrl });
    } catch (error) {
      alert('Error uploading photo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const completedToday = todayTasks.filter(t => t.completed).length;
  const totalToday = todayTasks.length;
  const progressPercent = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.full_name || 'Student'}!
            </h1>
            <p className="text-pink-100 text-lg">
              Let's make today productive!
            </p>
          </div>

          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-lg">
              {profile?.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Upload className="w-6 h-6 text-white" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={uploadPhoto}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Today's Tasks</p>
              <p className="text-2xl font-bold text-gray-800">{totalToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-800">{completedToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Progress</p>
              <p className="text-2xl font-bold text-gray-800">{Math.round(progressPercent)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Study Plan</h2>

        {totalToday > 0 ? (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Daily Progress</span>
                <span>{completedToday} / {totalToday} tasks</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {todayTasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    task.completed
                      ? 'bg-teal-50 border-teal-200'
                      : 'bg-purple-50 border-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{task.subject}</h3>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-700">
                        {task.duration_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalToday > 3 && (
              <button
                onClick={() => onNavigate('plan')}
                className="mt-4 w-full py-2 text-purple-600 font-medium hover:text-purple-700 transition-colors"
              >
                View all {totalToday} tasks →
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No study plan yet</p>
            <button
              onClick={() => onNavigate('form')}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-md"
            >
              Create Study Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
