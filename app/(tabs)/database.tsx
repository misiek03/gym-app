import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DatabaseScreen() {
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
        {/* Categories / Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10 flex-row overflow-visible">
           <TouchableOpacity className="bg-[#cafd00] px-5 py-3 rounded-full mr-3 items-center justify-center">
             <Text className="text-[#0e0e0e] font-black text-xs tracking-widest uppercase">All</Text>
           </TouchableOpacity>
           <TouchableOpacity className="bg-[#2c2c2c] px-5 py-3 rounded-full mr-3 items-center justify-center">
             <Text className="text-white font-bold text-xs tracking-widest uppercase">Upper</Text>
           </TouchableOpacity>
           <TouchableOpacity className="bg-[#2c2c2c] px-5 py-3 rounded-full mr-3 items-center justify-center">
             <Text className="text-white font-bold text-xs tracking-widest uppercase">Lower</Text>
           </TouchableOpacity>
           <TouchableOpacity className="bg-[#2c2c2c] px-5 py-3 rounded-full mr-6 items-center justify-center">
             <Text className="text-white font-bold text-xs tracking-widest uppercase">Core</Text>
           </TouchableOpacity>
        </ScrollView>

        {/* Database List */}
        <View className="mb-8">
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
        <TouchableOpacity className="bg-[#131313] rounded-3xl p-8 items-center justify-center mb-16 active:opacity-80">
          <View className="w-14 h-14 bg-[#20201f] rounded-full items-center justify-center mb-6 shadow-[0_0_24px_rgba(202,253,0,0.1)]">
             <Ionicons name="add" size={28} color="#cafd00" />
          </View>
          <Text className="text-white text-2xl font-black tracking-tighter mb-2 text-center">ADD NEW{'\n'}EXERCISE</Text>
          <Text className="text-[#adaaaa] text-center px-4 mt-2">Expand your kinetic library with custom movements</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

function ExerciseCard({ title, muscles, icon }: { title: string, muscles: string, icon: any }) {
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
      <View className="w-8 h-8 rounded-full bg-[#0e0e0e] items-center justify-center">
        <Ionicons name="chevron-forward" size={16} color="#adaaaa" />
      </View>
    </TouchableOpacity>
  );
}
