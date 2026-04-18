import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider';
import {
  createExercise,
  CreateExerciseInput,
  CATEGORIES,
  BODY_AREAS,
  MUSCLES,
  EXERCISE_ICONS,
} from '../lib/exercises';

export default function AddExerciseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ── Form State ───────────────────────────────────────────
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('');
  const [bodyArea, setBodyArea] = useState<string>('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string>('barbell-outline');
  const [notes, setNotes] = useState('');

  // ── Mutation ─────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (input: CreateExerciseInput) => {
      if (!user) throw new Error('Not authenticated');
      return createExercise(user.id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      router.back();
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to save exercise');
    },
  });

  // ── Validation ───────────────────────────────────────────
  const isValid = name.trim().length > 0 && category && bodyArea && selectedMuscles.length > 0;

  const handleSave = () => {
    if (!isValid) return;
    mutation.mutate({
      name: name.trim(),
      category,
      target_muscles: selectedMuscles,
      body_area: bodyArea,
      icon: selectedIcon,
      notes: notes.trim() || null,
    });
  };

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0e0e0e]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-[#20201f] rounded-full items-center justify-center"
        >
          <Ionicons name="close" size={22} color="#adaaaa" />
        </TouchableOpacity>
        <Text className="text-white font-black tracking-widest text-sm">
          NEW EXERCISE
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* ── Icon Picker ─────────────────────────────── */}
        <View className="mb-8">
          <Text className="text-white text-xl font-black tracking-tighter mb-1">
            ICON
          </Text>
          <Text className="text-[#adaaaa] text-xs font-semibold tracking-widest uppercase mb-5">
            Select a visual identifier
          </Text>

          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {EXERCISE_ICONS.map((iconName) => (
              <TouchableOpacity
                key={iconName}
                onPress={() => setSelectedIcon(iconName)}
                className={`w-[60px] h-[60px] rounded-2xl items-center justify-center ${
                  selectedIcon === iconName
                    ? 'bg-[#cafd00]'
                    : 'bg-[#131313]'
                }`}
              >
                <Ionicons
                  name={iconName as any}
                  size={26}
                  color={selectedIcon === iconName ? '#0e0e0e' : '#adaaaa'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Name Input ──────────────────────────────── */}
        <View className="mb-8">
          <Text className="text-white text-xl font-black tracking-tighter mb-1">
            NAME
          </Text>
          <Text className="text-[#adaaaa] text-xs font-semibold tracking-widest uppercase mb-4">
            What is this exercise called?
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Barbell Bench Press"
            placeholderTextColor="#484847"
            className="bg-[#000000] text-white p-5 rounded-2xl text-base"
            autoCapitalize="words"
          />
        </View>

        {/* ── Category Chips ──────────────────────────── */}
        <View className="mb-8">
          <Text className="text-white text-xl font-black tracking-tighter mb-1">
            CATEGORY
          </Text>
          <Text className="text-[#adaaaa] text-xs font-semibold tracking-widest uppercase mb-4">
            Type of movement
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-5 py-3 rounded-full mr-3 ${
                  category === cat ? 'bg-[#cafd00]' : 'bg-[#2c2c2c]'
                }`}
              >
                <Text
                  className={`font-black text-xs tracking-widest uppercase ${
                    category === cat ? 'text-[#0e0e0e]' : 'text-white'
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Body Area Chips ─────────────────────────── */}
        <View className="mb-8">
          <Text className="text-white text-xl font-black tracking-tighter mb-1">
            BODY AREA
          </Text>
          <Text className="text-[#adaaaa] text-xs font-semibold tracking-widest uppercase mb-4">
            Which region does it target?
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {BODY_AREAS.map((area) => (
              <TouchableOpacity
                key={area}
                onPress={() => setBodyArea(area)}
                className={`px-5 py-3 rounded-full mr-3 ${
                  bodyArea === area ? 'bg-[#00e3fd]' : 'bg-[#2c2c2c]'
                }`}
              >
                <Text
                  className={`font-black text-xs tracking-widest uppercase ${
                    bodyArea === area ? 'text-[#0e0e0e]' : 'text-white'
                  }`}
                >
                  {area}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Target Muscles Grid ─────────────────────── */}
        <View className="mb-8">
          <Text className="text-white text-xl font-black tracking-tighter mb-1">
            TARGET MUSCLES
          </Text>
          <Text className="text-[#adaaaa] text-xs font-semibold tracking-widest uppercase mb-4">
            Select all that apply
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {MUSCLES.map((muscle) => {
              const isSelected = selectedMuscles.includes(muscle);
              return (
                <TouchableOpacity
                  key={muscle}
                  onPress={() => toggleMuscle(muscle)}
                  className={`px-4 py-2.5 rounded-full ${
                    isSelected ? 'bg-[#cafd00]' : 'bg-[#2c2c2c]'
                  }`}
                >
                  <Text
                    className={`font-bold text-xs tracking-widest uppercase ${
                      isSelected ? 'text-[#0e0e0e]' : 'text-white'
                    }`}
                  >
                    {muscle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Notes Input ─────────────────────────────── */}
        <View className="mb-8">
          <Text className="text-white text-xl font-black tracking-tighter mb-1">
            NOTES
          </Text>
          <Text className="text-[#adaaaa] text-xs font-semibold tracking-widest uppercase mb-4">
            Optional tips or cues
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Keep elbows tucked, control the eccentric..."
            placeholderTextColor="#484847"
            className="bg-[#000000] text-white p-5 rounded-2xl text-base h-28"
            multiline
            style={{ textAlignVertical: 'top' }}
          />
        </View>
      </ScrollView>

      {/* ── Bottom Save Bar ─────────────────────────────── */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-4 bg-[#0e0e0e]">
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isValid || mutation.isPending}
          className={`py-5 rounded-full items-center justify-center flex-row ${
            isValid && !mutation.isPending
              ? 'bg-[#cafd00] shadow-[0_0_32px_rgba(202,253,0,0.15)]'
              : 'bg-[#2c2c2c]'
          }`}
          activeOpacity={0.8}
        >
          {mutation.isPending ? (
            <ActivityIndicator size="small" color="#0e0e0e" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={isValid ? '#0e0e0e' : '#484847'}
                style={{ marginRight: 8 }}
              />
              <Text
                className={`font-black tracking-widest text-sm ${
                  isValid ? 'text-[#0e0e0e]' : 'text-[#484847]'
                }`}
              >
                SAVE EXERCISE
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
