import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

type ExerciseCatalogItem = {
  id: string;
  title: string;
  muscles: string;
};

type WorkoutExerciseForm = {
  id: string;
  exerciseId: string;
  title: string;
  muscles: string;
  order: number;
  sets: string;
  reps: string;
  restSeconds: string;
  notes: string;
};

const DEFAULT_EXERCISES: ExerciseCatalogItem[] = [
  { id: 'db-chest-press', title: 'CHEST PRESS', muscles: 'Pectorals, Triceps' },
  { id: 'db-squats', title: 'SQUATS', muscles: 'Quads, Glutes, Core' },
  { id: 'db-deadlift', title: 'DEADLIFT', muscles: 'Posterior Chain' },
  { id: 'db-pull-ups', title: 'PULL UPS', muscles: 'Lats, Biceps' },
  { id: 'db-lat-pulldown', title: 'LAT PULLDOWN', muscles: 'Lats, Upper Back' },
];

const LIMITS = {
  sets: { min: 1, max: 20 },
  reps: { min: 1, max: 100 },
  restSeconds: { min: 0, max: 600 },
};

export default function WorkoutCreatorScreen() {
  const [templateName, setTemplateName] = useState('New routine');
  const [coachNotes, setCoachNotes] = useState('');
  const [exerciseForm, setExerciseForm] = useState<WorkoutExerciseForm[]>([]);
  const [exerciseCatalog, setExerciseCatalog] = useState<ExerciseCatalogItem[]>(DEFAULT_EXERCISES);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const loadExercises = async () => {
      const { data, error } = await supabase
        .from('exercise_database')
        .select('id, title, muscles')
        .order('title', { ascending: true });

      if (error || !data) return;

      const mapped = data
        .filter((item) => item?.title)
        .map((item) => ({
          id: String(item.id),
          title: String(item.title).toUpperCase(),
          muscles: (item.muscles ? String(item.muscles) : 'Custom exercise'),
        }));

      if (mapped.length > 0) {
        setExerciseCatalog(mapped);
      }
    };

    loadExercises();
  }, []);

  const canSubmit = useMemo(() => !isBusy, [isBusy]);

  const addExerciseToPlan = (exercise: ExerciseCatalogItem) => {
    setExerciseForm((prev) => {
      const nextOrder = prev.length + 1;
      return [
        ...prev,
        {
          id: `local-${Date.now()}-${Math.random()}`,
          exerciseId: exercise.id,
          title: exercise.title,
          muscles: exercise.muscles,
          order: nextOrder,
          sets: '3',
          reps: '10',
          restSeconds: '90',
          notes: '',
        },
      ];
    });
    setIsPickerOpen(false);
  };

  const resequence = (items: WorkoutExerciseForm[]) => items.map((item, index) => ({ ...item, order: index + 1 }));

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    setExerciseForm((prev) => {
      const to = direction === 'up' ? index - 1 : index + 1;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      next.splice(to, 0, picked);
      return resequence(next);
    });
  };

  const removeExercise = (id: string) => {
    setExerciseForm((prev) => resequence(prev.filter((item) => item.id !== id)));
  };

  const updateExercise = (id: string, patch: Partial<WorkoutExerciseForm>) => {
    setExerciseForm((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const parseAndValidate = () => {
    if (exerciseForm.length < 1) {
      Alert.alert('Validation error', 'Add at least one exercise to save or start your workout.');
      return null;
    }

    const parsed = [] as {
      id: string;
      order: number;
      title: string;
      muscles: string;
      exerciseId: string;
      sets: number;
      reps: number;
      restSeconds: number;
      notes: string;
    }[];

    for (const exercise of exerciseForm) {
      const sets = Number(exercise.sets);
      const reps = Number(exercise.reps);
      const restSeconds = Number(exercise.restSeconds);

      if (!Number.isInteger(sets) || sets < LIMITS.sets.min || sets > LIMITS.sets.max) {
        Alert.alert('Validation error', `${exercise.title}: sets must be ${LIMITS.sets.min}-${LIMITS.sets.max}.`);
        return null;
      }

      if (!Number.isInteger(reps) || reps < LIMITS.reps.min || reps > LIMITS.reps.max) {
        Alert.alert('Validation error', `${exercise.title}: reps must be ${LIMITS.reps.min}-${LIMITS.reps.max}.`);
        return null;
      }

      if (!Number.isInteger(restSeconds) || restSeconds < LIMITS.restSeconds.min || restSeconds > LIMITS.restSeconds.max) {
        Alert.alert('Validation error', `${exercise.title}: rest must be ${LIMITS.restSeconds.min}-${LIMITS.restSeconds.max} sec.`);
        return null;
      }

      parsed.push({
        id: exercise.id,
        order: exercise.order,
        title: exercise.title,
        muscles: exercise.muscles,
        exerciseId: exercise.exerciseId,
        sets,
        reps,
        restSeconds,
        notes: exercise.notes.trim(),
      });
    }

    return parsed;
  };

  const saveTemplate = async () => {
    const validated = parseAndValidate();
    if (!validated) return;

    setIsBusy(true);
    try {
      const { data: authData } = await supabase.auth.getSession();
      const user = authData.session?.user;
      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to save workout templates.');
        return;
      }

      const { error } = await supabase.from('workout_templates').insert({
        user_id: user.id,
        title: templateName.trim() || 'New routine',
        notes: coachNotes.trim(),
        exercise_plan: validated,
      });

      if (error) throw error;
      Alert.alert('Saved', 'Workout template has been saved.');
    } catch {
      Alert.alert('Save failed', 'Could not save workout template. Check your table schema and try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleStartWorkout = async () => {
    const validated = parseAndValidate();
    if (!validated) return;

    setIsBusy(true);
    try {
      const { data: authData } = await supabase.auth.getSession();
      const user = authData.session?.user;
      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to start a workout.');
        return;
      }

      const { data: templateData, error: templateError } = await supabase
        .from('workout_templates')
        .insert({
          user_id: user.id,
          title: templateName.trim() || 'New routine',
          notes: coachNotes.trim(),
          exercise_plan: validated,
        })
        .select('id')
        .single();

      if (templateError) throw templateError;

      const { error: sessionError } = await supabase.from('workout_sessions').insert({
        user_id: user.id,
        title: templateName.trim() || 'Workout session',
        location: 'Gym floor',
        duration_minutes: 0,
        started_at: new Date().toISOString(),
        template_id: templateData.id,
      });

      if (sessionError) throw sessionError;

      Alert.alert('Session started', 'Workout session created from your template.');
    } catch {
      Alert.alert('Start failed', 'Could not start workout session. Verify workout_templates/workout_sessions schema.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <ScrollView className="flex-1 bg-[#0e0e0e] pt-16 pb-32">
        <View className="px-6 mb-8">
          <Text className="text-[#cafd00] font-black text-xs tracking-widest uppercase mb-1">Kinetic Standard</Text>
          <TextInput
            value={templateName}
            onChangeText={setTemplateName}
            className="text-white text-4xl font-black tracking-tighter leading-tight"
            placeholder="NEW ROUTINE"
            placeholderTextColor="#484847"
          />
        </View>

        <View className="px-6 mb-10">
          <Text className="text-white text-xl font-black tracking-tighter mb-4">EXERCISE SEQUENCE</Text>

          <View className="space-y-4 mb-6">
            {exerciseForm.map((exercise, index) => (
              <ExerciseSequenceBlock
                key={exercise.id}
                item={exercise}
                canMoveUp={index > 0}
                canMoveDown={index < exerciseForm.length - 1}
                onMoveUp={() => moveExercise(index, 'up')}
                onMoveDown={() => moveExercise(index, 'down')}
                onDelete={() => removeExercise(exercise.id)}
                onChange={updateExercise}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setIsPickerOpen(true)}
            className="border border-dashed border-[#484847]/30 bg-[#131313] p-6 rounded-3xl items-center justify-center h-24 mb-10"
          >
            <Ionicons name="add" size={24} color="#adaaaa" className="mb-1" />
            <Text className="text-[#adaaaa] text-xs font-semibold tracking-widest uppercase">Drop next exercise here</Text>
          </TouchableOpacity>

          <Text className="text-white text-xl font-black tracking-tighter mb-4">COACH&apos;S NOTES</Text>
          <TextInput
            value={coachNotes}
            onChangeText={setCoachNotes}
            multiline
            placeholder="Focus on eccentric control for presses..."
            placeholderTextColor="#484847"
            className="bg-[#131313] text-white p-6 rounded-3xl h-32 text-base align-top"
            style={{ textAlignVertical: 'top' }}
          />

          <View className="flex-row mt-8 gap-3">
            <TouchableOpacity
              onPress={saveTemplate}
              disabled={!canSubmit}
              className={`flex-1 rounded-full py-4 items-center justify-center ${canSubmit ? 'bg-[#20201f]' : 'bg-[#2c2c2c]'}`}
            >
              {isBusy ? <ActivityIndicator color="#cafd00" /> : <Text className="text-white text-xs font-black tracking-widest uppercase">Save Template</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStartWorkout}
              disabled={!canSubmit}
              className={`flex-1 rounded-full py-4 items-center justify-center ${canSubmit ? 'bg-[#cafd00]' : 'bg-[#7a7a7a]'}`}
            >
              <Text className="text-[#0e0e0e] text-xs font-black tracking-widest uppercase">Start Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="h-20" />
      </ScrollView>

      <ExercisePickerModal
        visible={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        exercises={exerciseCatalog}
        onSelect={addExerciseToPlan}
      />
    </>
  );
}

function ExerciseSequenceBlock({
  item,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDelete,
  onChange,
}: {
  item: WorkoutExerciseForm;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onChange: (id: string, patch: Partial<WorkoutExerciseForm>) => void;
}) {
  return (
    <View className="bg-[#131313] rounded-3xl p-5 mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 pr-4">
          <Text className="text-white text-lg font-black tracking-tighter mb-1">{item.order}. {item.title}</Text>
          <Text className="text-[#00e3fd] text-[10px] font-bold tracking-widest uppercase">{item.muscles}</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity disabled={!canMoveUp} onPress={onMoveUp} className="w-8 h-8 items-center justify-center bg-[#20201f] rounded-full">
            <Ionicons name="arrow-up" size={14} color={canMoveUp ? '#adaaaa' : '#484847'} />
          </TouchableOpacity>
          <TouchableOpacity disabled={!canMoveDown} onPress={onMoveDown} className="w-8 h-8 items-center justify-center bg-[#20201f] rounded-full">
            <Ionicons name="arrow-down" size={14} color={canMoveDown ? '#adaaaa' : '#484847'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} className="w-8 h-8 items-center justify-center bg-[#2e1515] rounded-full">
            <Ionicons name="trash-outline" size={14} color="#ff8787" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row gap-2 mb-3">
        <NumericField label="Sets" value={item.sets} onChangeText={(value) => onChange(item.id, { sets: value })} />
        <NumericField label="Reps" value={item.reps} onChangeText={(value) => onChange(item.id, { reps: value })} />
        <NumericField label="Rest (s)" value={item.restSeconds} onChangeText={(value) => onChange(item.id, { restSeconds: value })} />
      </View>

      <TextInput
        value={item.notes}
        onChangeText={(value) => onChange(item.id, { notes: value })}
        placeholder="Exercise notes"
        placeholderTextColor="#484847"
        className="bg-[#0e0e0e] text-white rounded-2xl px-4 py-3"
      />
    </View>
  );
}

function NumericField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View className="flex-1">
      <Text className="text-[#adaaaa] text-[10px] font-bold tracking-widest uppercase mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        className="bg-[#0e0e0e] text-white rounded-2xl px-3 py-3"
      />
    </View>
  );
}

function ExercisePickerModal({
  visible,
  onClose,
  exercises,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  exercises: ExerciseCatalogItem[];
  onSelect: (exercise: ExerciseCatalogItem) => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-[#131313] rounded-t-3xl p-6 pb-10 max-h-[80%]">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-white text-2xl font-black tracking-tighter">SELECT EXERCISE</Text>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full bg-[#20201f] items-center justify-center">
              <Ionicons name="close" size={20} color="#adaaaa" />
            </TouchableOpacity>
          </View>

          <ScrollView className="pr-1">
            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => onSelect(exercise)}
                className="bg-[#0e0e0e] rounded-2xl p-4 mb-3"
              >
                <Text className="text-white text-base font-black tracking-tighter mb-1">{exercise.title}</Text>
                <Text className="text-[#adaaaa] text-xs font-semibold uppercase tracking-widest">{exercise.muscles}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
