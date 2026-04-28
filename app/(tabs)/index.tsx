import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RecentSessionCard } from '../../components/dashboard/RecentSessionCard';
import { useRouter } from 'expo-router';
import { useDashboardMetricsQuery, useRecentSessionsQuery } from '../../hooks/useWorkoutQueries';
import { formatMinutes, formatShortMonthDay, formatTons } from '../../lib/formatters';

export default function DashboardScreen() {
  const router = useRouter();
  const { data: dashboardData, isLoading: isDashboardLoading, isError: isDashboardError, refetch: refetchDashboard } = useDashboardMetricsQuery();
  const { data: recentSessions, isLoading: isRecentLoading, isError: isRecentError, refetch: refetchRecent } = useRecentSessionsQuery();

  const bars = dashboardData?.weeklyAggregates ?? [];
  const maxVolumeKg = Math.max(...bars.map((day) => day.volumeKg), 1);

  return (
    <ScrollView className="flex-1 bg-[#0e0e0e] pt-16 pb-32">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-6 mb-10">
        <TouchableOpacity 
          className="w-10 h-10 bg-[#20201f] rounded-full items-center justify-center active:opacity-80"
          onPress={() => router.push('/(auth)/profile')}
        >
          <Ionicons name="person" size={20} color="#adaaaa" />
        </TouchableOpacity>
        <Text className="text-white font-black tracking-widest text-lg">
          KINE<Text className="text-[#cafd00]">TIC</Text>
        </Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Ionicons name="settings-sharp" size={24} color="#adaaaa" />
        </TouchableOpacity>
      </View>

      {/* Header Section */}
      <View className="pl-6 pr-4 mb-10">
        <Text className="text-white text-[42px] font-black tracking-tighter leading-none">
          PHASE:
        </Text>
        <Text className="text-[#cafd00] text-[42px] font-black tracking-tighter leading-none mb-3">
          ASCENT
        </Text>
        <Text className="text-[#adaaaa] text-base leading-relaxed pr-8">
          Your output is up 12% from last week. Keep the intensity high.
        </Text>
      </View>

      {/* Grid Cards */}
      <View className="px-6 space-y-4 mb-12">
        {/* Total Workouts */}
        <View className="bg-[#131313] rounded-3xl p-6 relative">
          <View className="absolute top-6 right-6">
            <Ionicons name="barbell" size={20} color="#cafd00" />
          </View>
          <Text className="text-[#adaaaa] text-xs font-bold tracking-widest uppercase mb-2">Total Workouts</Text>
          {isDashboardLoading ? (
            <ActivityIndicator size="small" color="#cafd00" />
          ) : (
            <>
              <Text className="text-white text-5xl font-black tracking-tighter mb-1">{dashboardData?.stats.totalWorkouts ?? 0}</Text>
              <Text className="text-[#cafd00] text-sm font-bold">+{dashboardData?.stats.monthlyWorkouts ?? 0} this month</Text>
            </>
          )}
        </View>

        {/* Avg Duration */}
        <View className="bg-[#131313] rounded-3xl p-6 relative">
          <View className="absolute top-6 right-6">
            <Ionicons name="time" size={20} color="#00e3fd" />
          </View>
          <Text className="text-[#adaaaa] text-xs font-bold tracking-widest uppercase mb-2">Avg Duration</Text>
          <Text className="text-white text-5xl font-black tracking-tighter mb-1">
            {isDashboardLoading ? '--' : dashboardData?.stats.avgDurationMinutes ?? 0}
            <Text className="text-2xl text-[#adaaaa]"> min</Text>
          </Text>
          <Text className="text-[#00e3fd] text-sm font-bold">High Consistency</Text>
        </View>

        {/* Total Weight */}
        <View className="bg-[#131313] rounded-3xl p-6 relative">
          <View className="absolute top-6 right-6">
            <MaterialCommunityIcons name="weight" size={20} color="#ffd700" />
          </View>
          <Text className="text-[#adaaaa] text-xs font-bold tracking-widest uppercase mb-2">Total Weight</Text>
          <Text className="text-white text-5xl font-black tracking-tighter mb-1">
            {isDashboardLoading ? '--' : formatTons(dashboardData?.stats.totalVolumeKg ?? 0)}
          </Text>
          <Text className="text-[#ffd700] text-sm font-bold">Volume Record</Text>
        </View>
      </View>

      {/* Training Volume Section */}
      <View className="px-6 mb-12 mt-4">
        <View className="flex-row justify-between items-start mb-8">
          <View>
            <Text className="text-white text-2xl font-black tracking-tighter mb-1">TRAINING VOLUME</Text>
            <Text className="text-[#adaaaa] text-sm">Weekly output in tons</Text>
          </View>
          <View className="flex-row items-center bg-[#20201f] px-3 py-1.5 rounded-full mt-1">
            <View className="w-2 h-2 rounded-full bg-[#cafd00] mr-2" />
            <Text className="text-white text-[10px] font-bold tracking-widest uppercase">Target Hit</Text>
          </View>
        </View>
        
        {isDashboardError ? (
          <TouchableOpacity onPress={() => refetchDashboard()} className="bg-[#131313] rounded-2xl p-4">
            <Text className="text-[#ff7a7a] font-bold">Failed to load weekly volume. Tap to retry.</Text>
          </TouchableOpacity>
        ) : isDashboardLoading ? (
          <View className="h-48 items-center justify-center">
            <ActivityIndicator size="large" color="#cafd00" />
          </View>
        ) : (
          <View className="h-48 flex-row items-end justify-between pt-4">
            {bars.map((bar, i) => {
              const heightPct = Math.max(Math.round((bar.volumeKg / maxVolumeKg) * 100), 6);
              const hasVolume = bar.volumeKg > 0;
              return (
                <View key={`${bar.date}-${i}`} className="items-center w-[12%]">
                  {hasVolume && <Text className="text-[#cafd00] text-xs font-bold mb-2">{formatTons(bar.volumeKg)}</Text>}
                  <View className={`w-full rounded-t-xl ${hasVolume ? 'bg-[#cafd00]' : 'bg-[#20201f]'}`} style={{ height: `${heightPct}%` }} />
                  <Text className="text-[#adaaaa] text-[10px] font-bold mt-3">{bar.dayLabel}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Push Button Card */}
      <View className="px-6 mb-16">
        <View className="bg-[#cafd00] rounded-[32px] p-8 shadow-[0_0_32px_rgba(202,253,0,0.15)] relative overflow-hidden">
          {/* Decorative faint background shape */}
          <View className="absolute -top-10 -right-10 w-48 h-48 bg-black/5 rounded-full" />
          
          <View className="w-12 h-12 bg-black/10 rounded-full items-center justify-center mb-6">
            <Ionicons name="play" size={24} color="#0e0e0e" className="ml-1" />
          </View>
          
          <Text className="text-[#0e0e0e] text-[40px] font-black tracking-tighter leading-none mb-8">
            READY TO{'\n'}PUSH?
          </Text>
          
          <TouchableOpacity className="bg-[#131313] py-5 px-6 rounded-full flex-row items-center justify-center active:opacity-80">
            <Text className="text-[#cafd00] font-black tracking-widest text-sm mr-2">START WORKOUT</Text>
            <Ionicons name="flash" size={16} color="#cafd00" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Sessions */}
      <View className="px-6 mb-8 flex-row justify-between items-end">
        <Text className="text-white text-2xl font-black tracking-tighter">RECENT SESSIONS</Text>
        <TouchableOpacity>
          <Text className="text-[#cafd00] font-bold text-xs tracking-widest uppercase mb-1">View All</Text>
        </TouchableOpacity>
      </View>

      <View className="px-6 space-y-3 mb-10 pb-8">
        {isRecentError ? (
          <TouchableOpacity onPress={() => refetchRecent()} className="bg-[#131313] rounded-2xl p-4">
            <Text className="text-[#ff7a7a] font-bold">Failed to load recent sessions. Tap to retry.</Text>
          </TouchableOpacity>
        ) : isRecentLoading ? (
          <View className="py-6">
            <ActivityIndicator size="large" color="#cafd00" />
          </View>
        ) : recentSessions && recentSessions.length > 0 ? (
          recentSessions.map((session) => {
            const date = formatShortMonthDay(session.startedAt);
            return (
              <RecentSessionCard
                key={session.id}
                title={session.title}
                month={date.month}
                day={date.day}
                location={session.location}
                duration={formatMinutes(session.durationMinutes)}
              />
            );
          })
        ) : (
          <View className="bg-[#131313] rounded-2xl p-4">
            <Text className="text-[#adaaaa]">No sessions yet. Start your first workout to populate this feed.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
