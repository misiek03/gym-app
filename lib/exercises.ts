import { supabase } from './supabase';

export type Exercise = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  target_muscles: string[];
  body_area: string;
  icon: string;
  image_url: string | null;
  notes: string | null;
  created_at: string;
};

export type CreateExerciseInput = {
  name: string;
  category: string;
  target_muscles: string[];
  body_area: string;
  icon?: string;
  image_url?: string | null;
  notes?: string | null;
};

// ── Constants ──────────────────────────────────────────────

export const CATEGORIES = [
  'Compound',
  'Isolation',
  'Bodyweight',
  'Cardio',
  'Stretching',
] as const;

export const BODY_AREAS = [
  'Upper',
  'Lower',
  'Core',
  'Full Body',
] as const;

export const MUSCLES = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Quads',
  'Glutes',
  'Hamstrings',
  'Core',
  'Calves',
  'Forearms',
  'Full Body',
] as const;

export const EXERCISE_ICONS = [
  'barbell-outline',
  'fitness-outline',
  'body-outline',
  'walk-outline',
  'bicycle-outline',
  'footsteps-outline',
  'hand-left-outline',
  'flash-outline',
  'trophy-outline',
  'pulse-outline',
  'heart-outline',
  'flame-outline',
] as const;

// ── Default exercises (seeded on first use) ────────────────

const DEFAULT_EXERCISES: CreateExerciseInput[] = [
  {
    name: 'Chest Press',
    category: 'Compound',
    target_muscles: ['Chest', 'Triceps'],
    body_area: 'Upper',
    icon: 'fitness-outline',
  },
  {
    name: 'Squats',
    category: 'Compound',
    target_muscles: ['Quads', 'Glutes', 'Core'],
    body_area: 'Lower',
    icon: 'body-outline',
  },
  {
    name: 'Deadlift',
    category: 'Compound',
    target_muscles: ['Back', 'Glutes', 'Hamstrings'],
    body_area: 'Full Body',
    icon: 'barbell-outline',
  },
  {
    name: 'Pull Ups',
    category: 'Compound',
    target_muscles: ['Back', 'Biceps'],
    body_area: 'Upper',
    icon: 'walk-outline',
  },
  {
    name: 'Lat Pulldown',
    category: 'Isolation',
    target_muscles: ['Back', 'Biceps'],
    body_area: 'Upper',
    icon: 'barbell-outline',
  },
];

// ── CRUD Operations ────────────────────────────────────────

export async function fetchExercises(userId: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createExercise(
  userId: string,
  input: CreateExerciseInput
): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      user_id: userId,
      name: input.name,
      category: input.category,
      target_muscles: input.target_muscles,
      body_area: input.body_area,
      icon: input.icon ?? 'barbell-outline',
      image_url: input.image_url ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function seedDefaultExercises(userId: string): Promise<Exercise[]> {
  // Check if user already has exercises
  const existing = await fetchExercises(userId);
  if (existing.length > 0) return existing;

  // Seed defaults
  const { data, error } = await supabase
    .from('exercises')
    .insert(
      DEFAULT_EXERCISES.map((ex) => ({
        user_id: userId,
        ...ex,
      }))
    )
    .select();

  if (error) throw error;
  return data ?? [];
}
