export function generateStudySchedule(planData) {
  const { subjects, examDate, dailyStudyHours } = planData;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);

  const daysUntilExam = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));

  if (daysUntilExam <= 0) {
    throw new Error('Exam date must be in the future');
  }

  const totalStudyMinutes = daysUntilExam * dailyStudyHours * 60;

  const subjectsWithWeights = subjects.map(subject => {
    let weight = 1;
    if (subject.difficulty === 'hard') weight = 1.5;
    else if (subject.difficulty === 'medium') weight = 1.2;
    else weight = 1;

    return { ...subject, weight };
  });

  const totalWeight = subjectsWithWeights.reduce((sum, s) => sum + s.weight, 0);

  const subjectsWithTime = subjectsWithWeights.map(subject => ({
    ...subject,
    totalMinutes: Math.floor((subject.weight / totalWeight) * totalStudyMinutes)
  }));

  const tasks = [];
  const currentDate = new Date(today);

  for (let day = 0; day < daysUntilExam; day++) {
    const dailyMinutesAvailable = dailyStudyHours * 60;
    let remainingMinutes = dailyMinutesAvailable;

    const dayTasks = [];

    for (const subject of subjectsWithTime) {
      if (subject.totalMinutes <= 0) continue;

      const sessionMinutes = Math.min(
        Math.floor(subject.totalMinutes / Math.max(1, daysUntilExam - day)),
        remainingMinutes,
        90
      );

      if (sessionMinutes >= 20) {
        const priority = subject.difficulty === 'hard' ? 'high' :
                        subject.difficulty === 'medium' ? 'medium' : 'low';

        dayTasks.push({
          subject: subject.name,
          task_date: new Date(currentDate).toISOString().split('T')[0],
          duration_minutes: sessionMinutes,
          description: `Study ${subject.name} - ${getStudyActivity(subject.difficulty)}`,
          priority: priority,
          completed: false
        });

        subject.totalMinutes -= sessionMinutes;
        remainingMinutes -= sessionMinutes;
      }

      if (remainingMinutes < 20) break;
    }

    dayTasks.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    tasks.push(...dayTasks);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return tasks;
}

function getStudyActivity(difficulty) {
  const activities = {
    hard: [
      'Practice complex problems',
      'Review challenging concepts',
      'Solve past exam questions',
      'Deep dive into theory'
    ],
    medium: [
      'Review key concepts',
      'Practice exercises',
      'Create summary notes',
      'Work through examples'
    ],
    easy: [
      'Quick revision',
      'Review notes',
      'Practice basic problems',
      'Read through materials'
    ]
  };

  const list = activities[difficulty] || activities.medium;
  return list[Math.floor(Math.random() * list.length)];
}

export function generateAISuggestions(planData, tasks) {
  const suggestions = [];

  const { subjects, dailyStudyHours } = planData;

  const hardSubjects = subjects.filter(s => s.difficulty === 'hard');
  if (hardSubjects.length > 0) {
    suggestions.push({
      type: 'priority',
      message: `Focus more on difficult subjects: ${hardSubjects.map(s => s.name).join(', ')}`
    });
  }

  if (dailyStudyHours > 4) {
    suggestions.push({
      type: 'break',
      message: 'Take breaks every 50 minutes to maintain focus and retention'
    });
  } else {
    suggestions.push({
      type: 'break',
      message: 'Take a 10-minute break every hour to stay refreshed'
    });
  }

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.task_date === today);

  if (todayTasks.length > 0) {
    const totalMinutes = todayTasks.reduce((sum, t) => sum + t.duration_minutes, 0);
    suggestions.push({
      type: 'schedule',
      message: `Today's schedule: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m across ${todayTasks.length} sessions`
    });
  }

  suggestions.push({
    type: 'technique',
    message: 'Use active recall and spaced repetition for better retention'
  });

  suggestions.push({
    type: 'motivation',
    message: 'Stay consistent! Small daily progress leads to big results'
  });

  return suggestions;
}
