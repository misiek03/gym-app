import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';

type CustomExercise = {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  body_area: string | null;
  target_muscles: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const CATEGORY_FILTERS = ['All', 'Upper', 'Lower', 'Core', 'Strength'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' as const },
  { label: 'A-Z', value: 'name_asc' as const },
];
type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export default function DatabaseScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [bodyArea, setBodyArea] = useState('');
  const [targetMuscles, setTargetMuscles] = useState('');
  const [notes, setNotes] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortValue>('newest');
  const [editingExercise, setEditingExercise] = useState<CustomExercise | null>(null);

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const customExercisesQuery = useQuery({
    queryKey: ['customExercises', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_exercises')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      return (data ?? []) as CustomExercise[];
    },
  });

  const saveExerciseMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;

      const payload = {
        user_id: user.id,
        name: name.trim(),
        category: category.trim() || null,
        body_area: bodyArea.trim() || null,
        target_muscles: targetMuscles.trim() || null,
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (editingExercise) {
        const { error } = await supabase
          .from('custom_exercises')
          .update(payload)
          .eq('user_id', user.id)
          .eq('id', editingExercise.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase
        .from('custom_exercises')
        .insert({ ...payload, created_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customExercises', user?.id] });
      setIsModalVisible(false);
      resetForm();
      setEditingExercise(null);
    },
    onError: () => {
      Alert.alert('Save failed', 'Could not save the exercise. Try again.');
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      if (!user?.id) return;
      const { error } = await supabase.from('custom_exercises').delete().eq('id', exerciseId).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customExercises', user?.id] });
    },
    onError: () => {
      Alert.alert('Delete failed', 'Could not delete the exercise. Try again.');
    },
  });

  const customExercises = useMemo(() => {
    const rows = customExercisesQuery.data ?? [];
    const query = searchText.trim().toLowerCase();

    const filtered = rows.filter((exercise) => {
      const categoryValue = (exercise.category ?? '').trim().toLowerCase();
      const matchesCategory =
        activeCategory === 'All' ||
        categoryValue.includes(activeCategory.toLowerCase());

      const searchable = [
        exercise.name,
        exercise.category ?? '',
        exercise.body_area ?? '',
        exercise.target_muscles ?? '',
        exercise.notes ?? '',
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !query || searchable.includes(query);

      return matchesCategory && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [activeCategory, customExercisesQuery.data, searchText, sortBy]);

  const resetForm = () => {
    setName('');
    setCategory('');
    setBodyArea('');
    setTargetMuscles('');
    setNotes('');
  };

  const handleAddExercise = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert('Exercise name required', 'Please provide the exercise name.');
      return;
    }

    saveExerciseMutation.mutate();
  };

  const openEditModal = (exercise: CustomExercise) => {
    setEditingExercise(exercise);
    setName(exercise.name);
    setCategory(exercise.category ?? '');
    setBodyArea(exercise.body_area ?? '');
    setTargetMuscles(exercise.target_muscles ?? '');
    setNotes(exercise.notes ?? '');
    setIsModalVisible(true);
  };

  return (
    <View className="flex-1 bg-[#0e0e0e] pt-16">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-6 mb-8">
        <Text className="text-white font-black tracking-tighter text-4xl">EXERCISES</Text>
        <TouchableOpacity
          className="w-12 h-12 items-center justify-center bg-[#131313] rounded-full"
          onPress={() => setIsSearchVisible((prev) => !prev)}
        >
          <Ionicons name="search" size={20} color="#adaaaa" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-2 pb-32">
        {isSearchVisible && (
          <View className="mb-5">
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search exercises..."
              placeholderTextColor="#484847"
              className="bg-[#131313] text-white rounded-2xl px-4 py-3"
            />
          </View>
        )}

        {/* Categories / Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10 flex-row overflow-visible">
          {CATEGORY_FILTERS.map((filter) => {
            const isActive = activeCategory === filter;
            return (
              <TouchableOpacity
                key={filter}
                className={`${isActive ? 'bg-[#cafd00]' : 'bg-[#2c2c2c]'} px-5 py-3 rounded-full mr-3 items-center justify-center`}
                onPress={() => setActiveCategory(filter)}
              >
                <Text className={`${isActive ? 'text-[#0e0e0e] font-black' : 'text-white font-bold'} text-xs tracking-widest uppercase`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row overflow-visible">
          {SORT_OPTIONS.map((option) => {
            const isActive = sortBy === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                className={`${isActive ? 'bg-[#cafd00]' : 'bg-[#20201f]'} px-4 py-2 rounded-full mr-3 items-center justify-center`}
                onPress={() => setSortBy(option.value)}
              >
                <Text className={`${isActive ? 'text-[#0e0e0e] font-black' : 'text-[#d8d8d8] font-bold'} text-[10px] tracking-widest uppercase`}>
                  Sort: {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Database List */}
        <View className="mb-8">
           {!customExercisesQuery.isLoading && customExercises.length === 0 && (
             <View className="bg-[#131313] p-5 rounded-2xl mb-4">
               <Text className="text-[#adaaaa] text-sm">No custom exercises match your filters.</Text>
             </View>
           )}
           {customExercises.map((exercise) => (
             <View key={exercise.id}>
               <ExerciseCard
                 title={exercise.name.toUpperCase()}
                 muscles={[exercise.category, exercise.body_area, exercise.target_muscles].filter(Boolean).join(' • ') || 'Custom exercise'}
                 icon="sparkles-outline"
                 onEdit={() => openEditModal(exercise)}
                 onDelete={() => deleteExerciseMutation.mutate(exercise.id)}
                 isCustom
               />
               <View className="h-4" />
             </View>
           ))}
           <ExerciseCard title="CHEST PRESS" muscles="Pectorals, Triceps" icon="fitness-outline" />
           <View className="h-4" />
           <ExerciseCard title="SQUATS" muscles="Quads, Glutes, Core" icon="body-outline" />
           <View className="h-4" />
           <ExerciseCard title="DEADLIFT" muscles="Posterior Chain" icon="barbell-outline" />
           <View className="h-4" />
           <ExerciseCard title="PULL UPS" muscles="Lats, Biceps" icon="walk-outline" />
           <View className="h-4" />
           <ExerciseCard title="LAT PULLDOWN" muscles="Lats, Upper Back" icon="barbell-outline" />
        </View>

        {/* Add New Exercise Card */}
        <TouchableOpacity
          className="bg-[#131313] rounded-3xl p-8 items-center justify-center mb-16 active:opacity-80"
          onPress={() => {
            resetForm();
            setEditingExercise(null);
            setIsModalVisible(true);
          }}
        >
          <View className="w-14 h-14 bg-[#20201f] rounded-full items-center justify-center mb-6 shadow-[0_0_24px_rgba(202,253,0,0.1)]">
             <Ionicons name="add" size={28} color="#cafd00" />
          </View>
          <Text className="text-white text-2xl font-black tracking-tighter mb-2 text-center">ADD NEW{'\n'}EXERCISE</Text>
          <Text className="text-[#adaaaa] text-center px-4 mt-2">Expand your kinetic library with custom movements</Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide" transparent onRequestClose={() => setIsModalVisible(false)}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-[#131313] rounded-t-3xl p-6 pb-10">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-white text-2xl font-black tracking-tighter">
                {editingExercise ? 'EDIT EXERCISE' : 'ADD EXERCISE'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setEditingExercise(null);
                  resetForm();
                }}
                className="w-10 h-10 rounded-full bg-[#20201f] items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#adaaaa" />
              </TouchableOpacity>
            </View>

            <FormInput label="Exercise name *" value={name} onChangeText={setName} placeholder="e.g. Bulgarian Split Squat" />
            <FormInput label="Category (optional)" value={category} onChangeText={setCategory} placeholder="e.g. Strength" />
            <FormInput label="Body area (optional)" value={bodyArea} onChangeText={setBodyArea} placeholder="e.g. Lower body" />
            <FormInput label="Target muscles (optional)" value={targetMuscles} onChangeText={setTargetMuscles} placeholder="e.g. Quads, Glutes" />
            <FormInput label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Any extra details" multiline />

            <TouchableOpacity
              className={`mt-3 rounded-full py-4 items-center justify-center ${canSubmit ? 'bg-[#cafd00]' : 'bg-[#2c2c2c]'}`}
              onPress={handleAddExercise}
              disabled={!canSubmit || saveExerciseMutation.isPending}
            >
              <Text className={`font-black tracking-widest text-xs uppercase ${canSubmit ? 'text-[#0e0e0e]' : 'text-[#7a7a7a]'}`}>
                {saveExerciseMutation.isPending ? 'Saving...' : editingExercise ? 'Update exercise' : 'Save exercise'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="text-[#adaaaa] text-[10px] font-bold tracking-widest uppercase mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#484847"
        multiline={multiline}
        className={`bg-[#0e0e0e] text-white rounded-2xl px-4 py-3 ${multiline ? 'h-24' : ''}`}
        style={multiline ? { textAlignVertical: 'top' } : undefined}
      />
    </View>
  );
}

function ExerciseCard({
  title,
  muscles,
  icon,
  onEdit,
  onDelete,
  isCustom = false,
}: {
  title: string;
  muscles: string;
  icon: any;
  onEdit?: () => void;
  onDelete?: () => void;
  isCustom?: boolean;
}) {
  return (
    <TouchableOpacity className="bg-[#131313] p-6 rounded-3xl flex-row items-center justify-between active:bg-[#20201f]">
      <View className="flex-row items-center flex-1">
        <View className="w-14 h-14 bg-[#20201f] rounded-2xl items-center justify-center mr-5">
          <Ionicons name={icon} size={24} color="#00e3fd" />
        </View>
        <View className="flex-1 pr-4">
          <Text className="text-white text-xl font-black tracking-tighter mb-1.5">{title}</Text>
          <Text className="text-[#adaaaa] text-xs font-semibold uppercase tracking-widest">{muscles}</Text>
        </View>
      </View>
      {isCustom ? (
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onEdit} className="w-8 h-8 rounded-full bg-[#0e0e0e] items-center justify-center mr-2">
            <Ionicons name="create-outline" size={14} color="#adaaaa" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} className="w-8 h-8 rounded-full bg-[#0e0e0e] items-center justify-center">
            <Ionicons name="trash-outline" size={14} color="#ff6767" />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="w-8 h-8 rounded-full bg-[#0e0e0e] items-center justify-center">
          <Ionicons name="chevron-forward" size={16} color="#adaaaa" />
        </View>
      )}
    </TouchableOpacity>
  );
}