import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  return (
    <ScrollView className="flex-1 bg-[#0e0e0e] pt-16 pb-32">
      {/* Header section */}
      <View className="px-6 mb-8 flex-row items-end justify-between">
        <View>
          <Text className="text-[#cafd00] font-black text-xs tracking-widest uppercase mb-1">October 2023</Text>
          <Text className="text-white text-4xl font-black tracking-tighter leading-tight">HISTORY</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-[#131313] rounded-full items-center justify-center">
          <Ionicons name="filter" size={20} color="#adaaaa" />
        </TouchableOpacity>
      </View>

      <View className="px-6">
        <Text className="text-[#adaaaa] font-bold text-lg tracking-tighter mb-6">Recent Movements</Text>

        <HistoryCard title="Hypertrophy Upper A" duration="72m" volume="14,200kg" exercises="6" icon="barbell" />
        <HistoryCard title="Endurance Protocol" duration="55m" volume="8,450kg" exercises="8" icon="fitness" />
        <HistoryCard title="Power Lower Body" duration="62m" volume="11,900kg" exercises="5" icon="body" />
        <HistoryCard title="Active Recovery" duration="45m" volume="2,100kg" exercises="3" icon="walk" />
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
