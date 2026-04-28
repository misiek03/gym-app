import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecentSessionsQuery } from '../../hooks/useWorkoutQueries';
import { formatKilograms, formatMinutes, formatMonthYear } from '../../lib/formatters';

export default function HistoryScreen() {
  const { data: sessions, isLoading, isError, refetch } = useRecentSessionsQuery();
  const mostRecentDate = sessions?.[0]?.startedAt;

  return (
    <ScrollView className="flex-1 bg-[#0e0e0e] pt-16 pb-32">
      {/* Header section */}
      <View className="px-6 mb-8 flex-row items-end justify-between">
        <View>
          <Text className="text-[#cafd00] font-black text-xs tracking-widest uppercase mb-1">
            {mostRecentDate ? formatMonthYear(mostRecentDate) : 'No Data'}
          </Text>
          <Text className="text-white text-4xl font-black tracking-tighter leading-tight">HISTORY</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-[#131313] rounded-full items-center justify-center">
          <Ionicons name="filter" size={20} color="#adaaaa" />
        </TouchableOpacity>
      </View>

      <View className="px-6">
        <Text className="text-[#adaaaa] font-bold text-lg tracking-tighter mb-6">Recent Movements</Text>

        {isError ? (
          <TouchableOpacity onPress={() => refetch()} className="bg-[#131313] rounded-2xl p-4">
            <Text className="text-[#ff7a7a] font-bold">Failed to load history. Tap to retry.</Text>
          </TouchableOpacity>
        ) : isLoading ? (
          <View className="py-8">
            <ActivityIndicator size="large" color="#cafd00" />
          </View>
        ) : sessions && sessions.length > 0 ? (
          sessions.map((session) => (
            <HistoryCard
              key={session.id}
              title={session.title}
              duration={formatMinutes(session.durationMinutes)}
              volume={formatKilograms(session.volumeKg)}
              exercises={session.exerciseCount.toString()}
              icon="barbell"
            />
          ))
        ) : (
          <View className="bg-[#131313] rounded-2xl p-4">
            <Text className="text-[#adaaaa]">No history yet. Completed sessions will appear here.</Text>
          </View>
        )}
      </View>
      <View className="h-20" />
    </ScrollView>
  );
}

function HistoryCard({ title, duration, volume, exercises, icon }: { title: string, duration: string, volume: string, exercises: string, icon: any }) {
  return (
    <TouchableOpacity className="bg-[#131313] rounded-3xl p-6 mb-4 active:bg-[#20201f]">
      <View className="flex-row items-center mb-6">
        <View className="w-12 h-12 bg-[#20201f] rounded-full items-center justify-center mr-4">
          <Ionicons name={icon} size={20} color="#00e3fd" />
        </View>
        <View className="flex-1">
          <Text className="text-white text-xl font-black tracking-tighter mb-1" numberOfLines={1}>{title}</Text>
          <Text className="text-[#adaaaa] text-xs font-semibold tracking-widest uppercase">Verified Session</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#adaaaa" />
      </View>

      <View className="flex-row justify-between">
        <View>
          <Text className="text-[#adaaaa] text-[10px] font-bold tracking-widest uppercase mb-1">Duration</Text>
          <Text className="text-white font-black text-xl">{duration}</Text>
        </View>
        <View>
          <Text className="text-[#adaaaa] text-[10px] font-bold tracking-widest uppercase mb-1">Volume</Text>
          <Text className="text-[#cafd00] font-black text-xl">{volume}</Text>
        </View>
        <View className="items-end">
          <Text className="text-[#adaaaa] text-[10px] font-bold tracking-widest uppercase mb-1">Exercises</Text>
          <Text className="text-white font-black text-xl">{exercises}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
