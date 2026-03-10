import { Sparkles, Target, Coffee, TrendingUp, Heart } from 'lucide-react';

export default function AISuggestions({ suggestions }) {
  const getIcon = (type) => {
    switch (type) {
      case 'priority': return <Target className="w-5 h-5" />;
      case 'break': return <Coffee className="w-5 h-5" />;
      case 'schedule': return <TrendingUp className="w-5 h-5" />;
      case 'motivation': return <Heart className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getGradient = (type) => {
    switch (type) {
      case 'priority': return 'from-pink-400 to-pink-600';
      case 'break': return 'from-purple-400 to-purple-600';
      case 'schedule': return 'from-teal-400 to-teal-600';
      case 'motivation': return 'from-rose-400 to-rose-600';
      default: return 'from-indigo-400 to-indigo-600';
    }
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">AI Suggestions</h3>
          <p className="text-sm text-gray-600">Personalized tips for better studying</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl border-2 border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${getGradient(suggestion.type)} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                {getIcon(suggestion.type)}
              </div>
              <p className="text-gray-700 leading-relaxed flex-1">
                {suggestion.message}
              </p>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getGradient(suggestion.type)} transform scale-x-0 group-hover:scale-x-100 transition-transform`} />
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <p className="text-sm text-gray-700 text-center">
          <span className="font-semibold text-purple-700">Pro Tip:</span> Review these suggestions daily to optimize your study routine and achieve better results!
        </p>
      </div>
    </div>
  );
}
