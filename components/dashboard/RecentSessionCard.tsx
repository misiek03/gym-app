import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title: string;
  month: string;
  day: string;
  location?: string | null;
  duration: string;
}

export function RecentSessionCard({ title, month, day, location, duration }: Props) {
  return (
    <TouchableOpacity className="flex-row items-center p-4 bg-[#131313] rounded-3xl mb-3 active:bg-[#20201f]">
      {/* Date Badge */}
      <View className="bg-[#20201f] w-14 h-14 rounded-[14px] items-center justify-center mr-4">
        <Text className="text-[#adaaaa] text-[10px] font-bold tracking-widest leading-tight">{month}</Text>
        <Text className="text-white text-lg font-black tracking-tighter leading-tight mt-0.5">{day}</Text>
      </View>
      
      {/* Info */}
      <View className="flex-1 justify-center">
        <Text className="text-white font-bold text-lg tracking-tight mb-2" numberOfLines={1}>{title}</Text>
        <View className="flex-row items-center">
          <Ionicons name="location-sharp" size={12} color="#adaaaa" />
          <Text className="text-[#adaaaa] text-[11px] font-medium ml-1 mr-3">{location ?? 'Unknown location'}</Text>
          <Ionicons name="time" size={12} color="#adaaaa" />
          <Text className="text-[#adaaaa] text-[11px] font-medium ml-1">{duration}</Text>
        </View>
      </View>
      
      {/* Arrow */}
      <View className="w-8 h-8 rounded-full bg-[#0e0e0e] items-center justify-center ml-2">
        <Ionicons name="chevron-forward" size={14} color="#adaaaa" />
      </View>
    </TouchableOpacity>
  );
}
