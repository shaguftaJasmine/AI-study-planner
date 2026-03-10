import express from 'express';
import cors from 'cors';
import { supabase } from './supabaseClient.js';
import { generateStudySchedule, generateAISuggestions } from './aiLogic.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/generate-plan', async (req, res) => {
  try {
    const { title, subjects, examDate, dailyStudyHours, userId } = req.body;

    if (!title || !subjects || !examDate || !dailyStudyHours || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: studyPlan, error: planError } = await supabase
      .from('study_plans')
      .insert({
        user_id: userId,
        title,
        subjects,
        exam_date: examDate,
        daily_study_hours: dailyStudyHours
      })
      .select()
      .single();

    if (planError) {
      console.error('Error creating study plan:', planError);
      return res.status(500).json({ error: 'Failed to create study plan' });
    }

    const tasks = generateStudySchedule({
      subjects,
      examDate,
      dailyStudyHours
    });

    const tasksWithPlanId = tasks.map(task => ({
      ...task,
      study_plan_id: studyPlan.id
    }));

    const { data: createdTasks, error: tasksError } = await supabase
      .from('study_tasks')
      .insert(tasksWithPlanId)
      .select();

    if (tasksError) {
      console.error('Error creating tasks:', tasksError);
      return res.status(500).json({ error: 'Failed to create tasks' });
    }

    const suggestions = generateAISuggestions({ subjects, dailyStudyHours }, createdTasks);

    res.json({
      studyPlan,
      tasks: createdTasks,
      suggestions
    });
  } catch (error) {
    console.error('Error in generate-plan:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/study-plans/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: plans, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching study plans:', error);
      return res.status(500).json({ error: 'Failed to fetch study plans' });
    }

    res.json(plans);
  } catch (error) {
    console.error('Error in get study-plans:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/study-tasks/:planId', async (req, res) => {
  try {
    const { planId } = req.params;

    const { data: tasks, error } = await supabase
      .from('study_tasks')
      .select('*')
      .eq('study_plan_id', planId)
      .order('task_date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }

    res.json(tasks);
  } catch (error) {
    console.error('Error in get study-tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completed } = req.body;

    const { data, error } = await supabase
      .from('study_tasks')
      .update({ completed })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in update task:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/suggestions/:planId', async (req, res) => {
  try {
    const { planId } = req.params;

    const { data: plan, error: planError } = await supabase
      .from('study_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError) {
      console.error('Error fetching plan:', planError);
      return res.status(500).json({ error: 'Failed to fetch plan' });
    }

    const { data: tasks, error: tasksError } = await supabase
      .from('study_tasks')
      .select('*')
      .eq('study_plan_id', planId);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }

    const suggestions = generateAISuggestions(
      {
        subjects: plan.subjects,
        dailyStudyHours: plan.daily_study_hours
      },
      tasks
    );

    res.json(suggestions);
  } catch (error) {
    console.error('Error in get suggestions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
