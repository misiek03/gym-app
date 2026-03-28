import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutCreatorScreen() {
  return (
    <ScrollView className="flex-1 bg-[#0e0e0e] pt-16 pb-32">
      {/* Top Header */}
      <View className="px-6 mb-8">
        <Text className="text-[#cafd00] font-black text-xs tracking-widest uppercase mb-1">Kinetic Standard</Text>
        <Text className="text-white text-4xl font-black tracking-tighter leading-tight">NEW ROUTINE</Text>
      </View>

      <View className="px-6 mb-10">
        <Text className="text-white text-xl font-black tracking-tighter mb-4">EXERCISE SEQUENCE</Text>
        
        {/* Sequence Blocks */}
        <View className="space-y-4 mb-6">
          <ExerciseSequenceBlock 
            title="BARBELL BACK SQUATS" 
            type="Compound • Quads / Glutes" 
            sets="5 x 5" 
            rest="180s" 
          />
          <ExerciseSequenceBlock 
            title="INCLINE DB PRESS" 
            type="Hypertrophy • Chest / Shoulders" 
            sets="3 x 12" 
            rest="90s" 
          />
          <ExerciseSequenceBlock 
            title="WEIGHTED PULL-UPS" 
            type="Strength • Back / Biceps" 
            sets="4 x 8" 
            rest="120s" 
          />
        </View>

        {/* Drop Zone */}
        <TouchableOpacity className="border border-dashed border-[#484847]/30 bg-[#131313] p-6 rounded-3xl items-center justify-center h-24 mb-10">
          <Ionicons name="add" size={24} color="#adaaaa" className="mb-1" />
          <Text className="text-[#adaaaa] text-xs font-semibold tracking-widest uppercase">Drop next exercise here</Text>
        </TouchableOpacity>

        <Text className="text-white text-xl font-black tracking-tighter mb-4">COACH'S NOTES</Text>
        <TextInput 
          multiline 
          placeholder="Focus on eccentric control for presses..."
          placeholderTextColor="#484847"
          className="bg-[#131313] text-white p-6 rounded-3xl h-32 text-base align-top"
          style={{ textAlignVertical: 'top' }}
        />
      </View>
      <View className="h-20" />
    </ScrollView>
  );
}

function ExerciseSequenceBlock({ title, type, sets, rest }: { title: string, type: string, sets: string, rest: string }) {
  return (
    <View className="bg-[#131313] rounded-3xl p-5 mb-4">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-4">
          <Text className="text-white text-lg font-black tracking-tighter mb-1">{title}</Text>
          <Text className="text-[#00e3fd] text-[10px] font-bold tracking-widest uppercase">{type}</Text>
        </View>
        <TouchableOpacity className="w-8 h-8 items-center justify-center bg-[#20201f] rounded-full">
          <Ionicons name="ellipsis-horizontal" size={16} color="#adaaaa" />
        </TouchableOpacity>
      </View>
      
      <View className="flex-row justify-between bg-[#0e0e0e] rounded-2xl p-4">
        <View>
          <Text className="text-[#adaaaa] text-[10px] font-bold tracking-widest uppercase mb-1">Sets x Reps</Text>
          <Text className="text-white font-black text-lg">{sets}</Text>
        </View>
        <View className="items-end">
          <Text className="text-[#adaaaa] text-[10px] font-bold tracking-widest uppercase mb-1">Rest</Text>
          <Text className="text-[#cafd00] font-black text-lg">{rest}</Text>
        </View>
      </View>
    </View>
  );
}
