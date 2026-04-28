import { supabase } from './supabase';

export type WorkoutSession = {
  id: string;
  user_id: string;
  title: string;
  location: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  created_at: string;
  session_exercises: SessionExercise[];
};

export type SessionExercise = {
  id: string;
  user_id: string;
  session_id: string;
  exercise_name: string;
  exercise_order: number;
  exercise_sets: ExerciseSet[];
};

export type ExerciseSet = {
  id: string;
  user_id: string;
  session_exercise_id: string;
  set_order: number;
  reps: number;
  weight_kg: number;
};

export type WeeklyAggregate = {
  dayLabel: string;
  date: string;
  durationMinutes: number;
  volumeKg: number;
};

export type DashboardStats = {
  totalWorkouts: number;
  monthlyWorkouts: number;
  avgDurationMinutes: number;
  totalVolumeKg: number;
};

export type SessionSummary = {
  id: string;
  title: string;
  location: string | null;
  startedAt: string;
  durationMinutes: number;
  exerciseCount: number;
  volumeKg: number;
};

function calculateSessionVolumeKg(session: WorkoutSession): number {
  return session.session_exercises.reduce((sessionSum, exercise) => {
    const exerciseVolume = exercise.exercise_sets.reduce((setSum, set) => {
      return setSum + set.weight_kg * set.reps;
    }, 0);
    return sessionSum + exerciseVolume;
  }, 0);
}

export async function getWorkoutSessions(userId: string, limit = 24): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      id,
      user_id,
      title,
      location,
      started_at,
      ended_at,
      duration_minutes,
      created_at,
      session_exercises (
        id,
        user_id,
        session_id,
        exercise_name,
        exercise_order,
        exercise_sets (
          id,
          user_id,
          session_exercise_id,
          set_order,
          reps,
          weight_kg
        )
      )
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as WorkoutSession[];
}

export async function createWorkoutSessionDraft(userId: string) {
  const startedAt = new Date().toISOString();
  const endedAt = new Date(Date.now() + 45 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      title: 'New Workout',
      location: 'Gym Floor',
      started_at: startedAt,
      ended_at: endedAt,
      duration_minutes: 45,
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function buildSessionSummaries(sessions: WorkoutSession[], take?: number): SessionSummary[] {
  const source = take ? sessions.slice(0, take) : sessions;
  return source.map((session) => ({
    id: session.id,
    title: session.title,
    location: session.location,
    startedAt: session.started_at,
    durationMinutes: session.duration_minutes,
    exerciseCount: session.session_exercises.length,
    volumeKg: calculateSessionVolumeKg(session),
  }));
}

export function buildWeeklyAggregates(sessions: WorkoutSession[]): WeeklyAggregate[] {
  const now = new Date();
  const currentDay = now.getDay();
  const mondayOffset = (currentDay + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return {
      dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      date: date.toISOString(),
      durationMinutes: 0,
      volumeKg: 0,
    };
  });

  for (const session of sessions) {
    const sessionDate = new Date(session.started_at);
    const diff = Math.floor((sessionDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff <= 6) {
      days[diff].durationMinutes += session.duration_minutes;
      days[diff].volumeKg += calculateSessionVolumeKg(session);
    }
  }

  return days;
}

export function buildDashboardStats(sessions: WorkoutSession[]): DashboardStats {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthlyWorkouts = sessions.filter((session) => {
    const date = new Date(session.started_at);
    return date.getMonth() === month && date.getFullYear() === year;
  }).length;

  const totalDuration = sessions.reduce((sum, session) => sum + session.duration_minutes, 0);
  const totalVolume = sessions.reduce((sum, session) => sum + calculateSessionVolumeKg(session), 0);

  return {
    totalWorkouts: sessions.length,
    monthlyWorkouts,
    avgDurationMinutes: sessions.length ? Math.round(totalDuration / sessions.length) : 0,
    totalVolumeKg: totalVolume,
  };
}
