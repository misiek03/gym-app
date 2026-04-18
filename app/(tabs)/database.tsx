import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../providers/AuthProvider';
import {
  fetchExercises,
  seedDefaultExercises,
  Exercise,
  BODY_AREAS,
} from '../../lib/exercises';

const FILTER_TABS = ['All', ...BODY_AREAS] as const;

export default function DatabaseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [seeded, setSeeded] = useState(false);

  // ── Seed defaults on first load ──────────────────────────
  useEffect(() => {
    if (!user || seeded) return;
    seedDefaultExercises(user.id)
      .then(() => {
        setSeeded(true);
        queryClient.invalidateQueries({ queryKey: ['exercises'] });
      })
      .catch(() => setSeeded(true));
  }, [user, seeded]);

  // ── Query exercises ──────────────────────────────────────
  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises', user?.id],
    queryFn: () => fetchExercises(user!.id),
    enabled: !!user,
  });

  // ── Filter ───────────────────────────────────────────────
  const filteredExercises =
    activeFilter === 'All'
      ? exercises
      : exercises.filter((ex) => ex.body_area === activeFilter);

  return (
    <View className="flex-1 bg-[#0e0e0e] pt-16">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-6 mb-8">
        <Text className="text-white font-black tracking-tighter text-4xl">EXERCISES</Text>
        <TouchableOpacity className="w-12 h-12 items-center justify-center bg-[#131313] rounded-full">
          <Ionicons name="search" size={20} color="#adaaaa" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-2 pb-32">
        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-10 flex-row overflow-visible"
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveFilter(tab)}
              className={`px-5 py-3 rounded-full mr-3 items-center justify-center ${
                activeFilter === tab ? 'bg-[#cafd00]' : 'bg-[#2c2c2c]'
              }`}
            >
              <Text
                className={`font-black text-xs tracking-widest uppercase ${
                  activeFilter === tab ? 'text-[#0e0e0e]' : 'text-white'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Exercise List */}
        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#cafd00" />
            <Text className="text-[#adaaaa] mt-4 text-xs font-semibold tracking-widest uppercase">
              Loading exercises...
            </Text>
          </View>
        ) : filteredExercises.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-16 h-16 bg-[#131313] rounded-full items-center justify-center mb-6">
              <Ionicons name="barbell-outline" size={28} color="#484847" />
            </View>
            <Text className="text-white text-xl font-black tracking-tighter mb-2">
              No exercises yet
            </Text>
            <Text className="text-[#adaaaa] text-center px-8">
              {activeFilter === 'All'
                ? 'Start building your library by adding your first exercise.'
                : `No ${activeFilter.toLowerCase()} exercises found.`}
            </Text>
          </View>
        ) : (
          <View className="mb-8">
            {filteredExercises.map((exercise, index) => (
              <View key={exercise.id}>
                {index > 0 && <View className="h-4" />}
                <ExerciseCard
                  title={exercise.name.toUpperCase()}
                  muscles={exercise.target_muscles.join(', ')}
                  icon={exercise.icon}
                  category={exercise.category}
                />
              </View>
            ))}
          </View>
        )}

        {/* Add New Exercise Card */}
        <TouchableOpacity
          onPress={() => router.push('/add-exercise')}
          className="bg-[#131313] rounded-3xl p-8 items-center justify-center mb-16 active:opacity-80"
        >
          <View className="w-14 h-14 bg-[#20201f] rounded-full items-center justify-center mb-6 shadow-[0_0_24px_rgba(202,253,0,0.1)]">
            <Ionicons name="add" size={28} color="#cafd00" />
          </View>
          <Text className="text-white text-2xl font-black tracking-tighter mb-2 text-center">
            ADD NEW{'\n'}EXERCISE
          </Text>
          <Text className="text-[#adaaaa] text-center px-4 mt-2">
            Expand your kinetic library with custom movements
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function ExerciseCard({
  title,
  muscles,
  icon,
  category,
}: {
  title: string;
  muscles: string;
  icon: string;
  category: string;
}) {
  return (
    <TouchableOpacity className="bg-[#131313] p-6 rounded-3xl flex-row items-center justify-between active:bg-[#20201f]">
      <View className="flex-row items-center flex-1">
        <View className="w-14 h-14 bg-[#20201f] rounded-2xl items-center justify-center mr-5">
          <Ionicons name={icon as any} size={24} color="#00e3fd" />
        </View>
        <View className="flex-1 pr-4">
          <Text className="text-white text-xl font-black tracking-tighter mb-1.5">{title}</Text>
          <Text className="text-[#adaaaa] text-xs font-semibold uppercase tracking-widest">
            {muscles}
          </Text>
        </View>
      </View>
      <View className="w-8 h-8 rounded-full bg-[#0e0e0e] items-center justify-center">
        <Ionicons name="chevron-forward" size={16} color="#adaaaa" />
      </View>
    </TouchableOpacity>
  );
}
