import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [bodyArea, setBodyArea] = useState('');
  const [targetMuscles, setTargetMuscles] = useState('');
  const [notes, setNotes] = useState('');
  const [customExercises, setCustomExercises] = useState<
    { title: string; muscles: string }[]
  >([]);

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

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
      Alert.alert(
        'Exercise name required',
        'Please provide the exercise name.',
      );
      return;
    }

    const details = [category.trim(), bodyArea.trim(), targetMuscles.trim()]
      .filter(Boolean)
      .join(' • ');

    setCustomExercises((prev) => [
      {
        title: trimmedName.toUpperCase(),
        muscles: details || 'Custom exercise',
      },
      ...prev,
    ]);

    setIsModalVisible(false);
    resetForm();
  };

  return (
    <View className='flex-1 bg-[#0e0e0e] pt-16'>
      {/* Top Bar */}
      <View className='flex-row items-center justify-between px-6 mb-8'>
        <Text className='text-white font-black tracking-tighter text-4xl'>
          EXERCISES
        </Text>
        <TouchableOpacity className='w-12 h-12 items-center justify-center bg-[#131313] rounded-full'>
          <Ionicons
            name='search'
            size={20}
            color='#adaaaa'
          />
        </TouchableOpacity>
      </View>

      <ScrollView className='flex-1 px-6 pt-2 pb-32'>
        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className='mb-10 flex-row overflow-visible'
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

        {/* Database List */}
        <View className='mb-8'>
          {customExercises.map((exercise, index) => (
            <View key={`${exercise.title}-${index}`}>
              <ExerciseCard
                title={exercise.title}
                muscles={exercise.muscles}
                icon='sparkles-outline'
              />
              <View className='h-4' />
            </View>
          ))}
          <ExerciseCard
            title='CHEST PRESS'
            muscles='Pectorals, Triceps'
            icon='fitness-outline'
          />
          <View className='h-4' />
          <ExerciseCard
            title='SQUATS'
            muscles='Quads, Glutes, Core'
            icon='body-outline'
          />
          <View className='h-4' />
          <ExerciseCard
            title='DEADLIFT'
            muscles='Posterior Chain'
            icon='barbell-outline'
          />
          <View className='h-4' />
          <ExerciseCard
            title='PULL UPS'
            muscles='Lats, Biceps'
            icon='walk-outline'
          />
          <View className='h-4' />
          <ExerciseCard
            title='LAT PULLDOWN'
            muscles='Lats, Upper Back'
            icon='barbell-outline'
          />
        </View>

        {/* Add New Exercise Card */}
        <TouchableOpacity
          className='bg-[#131313] rounded-3xl p-8 items-center justify-center mb-16 active:opacity-80'
          onPress={() => setIsModalVisible(true)}
        >
          <View className='w-14 h-14 bg-[#20201f] rounded-full items-center justify-center mb-6 shadow-[0_0_24px_rgba(202,253,0,0.1)]'>
            <Ionicons
              name='add'
              size={28}
              color='#cafd00'
            />
          </View>
          <Text className='text-white text-2xl font-black tracking-tighter mb-2 text-center'>
            ADD NEW{'\n'}EXERCISE
          </Text>
          <Text className='text-[#adaaaa] text-center px-4 mt-2'>
            Expand your kinetic library with custom movements
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType='slide'
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className='flex-1 bg-black/60 justify-end'>
          <View className='bg-[#131313] rounded-t-3xl p-6 pb-10'>
            <View className='flex-row items-center justify-between mb-5'>
              <Text className='text-white text-2xl font-black tracking-tighter'>
                ADD EXERCISE
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className='w-10 h-10 rounded-full bg-[#20201f] items-center justify-center'
              >
                <Ionicons
                  name='close'
                  size={20}
                  color='#adaaaa'
                />
              </TouchableOpacity>
            </View>

            <FormInput
              label='Exercise name *'
              value={name}
              onChangeText={setName}
              placeholder='e.g. Bulgarian Split Squat'
            />
            <FormInput
              label='Category (optional)'
              value={category}
              onChangeText={setCategory}
              placeholder='e.g. Strength'
            />
            <FormInput
              label='Body area (optional)'
              value={bodyArea}
              onChangeText={setBodyArea}
              placeholder='e.g. Lower body'
            />
            <FormInput
              label='Target muscles (optional)'
              value={targetMuscles}
              onChangeText={setTargetMuscles}
              placeholder='e.g. Quads, Glutes'
            />
            <FormInput
              label='Notes (optional)'
              value={notes}
              onChangeText={setNotes}
              placeholder='Any extra details'
              multiline
            />

            <TouchableOpacity
              className={`mt-3 rounded-full py-4 items-center justify-center ${canSubmit ? 'bg-[#cafd00]' : 'bg-[#2c2c2c]'}`}
              onPress={handleAddExercise}
              disabled={!canSubmit}
            >
              <Text
                className={`font-black tracking-widest text-xs uppercase ${canSubmit ? 'text-[#0e0e0e]' : 'text-[#7a7a7a]'}`}
              >
                Save exercise
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
    <View className='mb-4'>
      <Text className='text-[#adaaaa] text-[10px] font-bold tracking-widest uppercase mb-2'>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor='#484847'
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
  category,
}: {
  title: string;
  muscles: string;
  icon: string;
  category: string;
}) {
  return (
    <TouchableOpacity className='bg-[#131313] p-6 rounded-3xl flex-row items-center justify-between active:bg-[#20201f]'>
      <View className='flex-row items-center flex-1'>
        <View className='w-14 h-14 bg-[#20201f] rounded-2xl items-center justify-center mr-5'>
          <Ionicons
            name={icon as any}
            size={24}
            color='#00e3fd'
          />
        </View>
        <View className='flex-1 pr-4'>
          <Text className='text-white text-xl font-black tracking-tighter mb-1.5'>
            {title}
          </Text>
          <Text className='text-[#adaaaa] text-xs font-semibold uppercase tracking-widest'>
            {muscles}
          </Text>
        </View>
      </View>
      <View className='w-8 h-8 rounded-full bg-[#0e0e0e] items-center justify-center'>
        <Ionicons
          name='chevron-forward'
          size={16}
          color='#adaaaa'
        />
      </View>
    </TouchableOpacity>
  );
}
