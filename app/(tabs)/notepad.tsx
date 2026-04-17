import { View, Text, TextInput, Platform, ActivityIndicator, Keyboard, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

const TAB_BAR_HEIGHT = 65;

export default function NotepadScreen() {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved'|'saving'|'error'>('saved');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Animated value for the bottom padding that reacts to keyboard
  const animatedPaddingBottom = useRef(new Animated.Value(0)).current;

  // Track keyboard height & animate the container
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setIsKeyboardVisible(true);
      // Keyboard height minus the tab bar which it slides over
      const targetPadding = e.endCoordinates.height - TAB_BAR_HEIGHT;
      Animated.timing(animatedPaddingBottom, {
        toValue: Math.max(targetPadding, 0),
        duration: Platform.OS === 'ios' ? (e.duration ?? 250) : 250,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      setIsKeyboardVisible(false);
      Animated.timing(animatedPaddingBottom, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e.duration ?? 250) : 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Load session & data
  const { data: remoteText, isLoading } = useQuery({
    queryKey: ['notepad'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notepad_state')
        .select('content')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.content || '';
    }
  });

  // Sync state initially when loaded
  useEffect(() => {
    if (remoteText !== undefined) {
      setText(remoteText);
      setSaveStatus('saved');
    }
  }, [remoteText]);

  // Debounced Auto-save mutation
  const saveMutation = useMutation({
    mutationFn: async (newText: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { error } = await supabase
        .from('notepad_state')
        .upsert({ user_id: session.user.id, content: newText, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.setQueryData(['notepad'], text);
    },
    onError: () => {
      setSaveStatus('error');
    }
  });

  // Effect to trigger debounce save
  useEffect(() => {
    if (remoteText !== undefined && text !== remoteText && text !== queryClient.getQueryData(['notepad'])) {
      setSaveStatus('saving');
      const timer = setTimeout(() => {
        saveMutation.mutate(text);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [text, remoteText]);

  return (
    <View className="flex-1 bg-[#0e0e0e]">
      <Animated.View
        style={{
          flex: 1,
          paddingTop: 64,
          paddingHorizontal: 24,
          paddingBottom: animatedPaddingBottom,
        }}
      >
        {/* Header — tap to dismiss keyboard */}
        <Pressable onPress={Keyboard.dismiss}>
          <View className={`flex-row items-center justify-between ${isKeyboardVisible ? 'mb-3' : 'mb-8'}`}>
            <Text className={`text-white font-black tracking-tighter ${isKeyboardVisible ? 'text-xl' : 'text-3xl'}`}>
              WORKOUT LOG
            </Text>
            <View className={`w-10 h-10 rounded-full items-center justify-center ${saveStatus === 'saved' ? 'bg-[#cafd00]' : 'bg-[#20201f]'}`}>
              {saveStatus === 'saving' ? (
                 <ActivityIndicator size="small" color="#cafd00" />
              ) : saveStatus === 'error' ? (
                 <Ionicons name="warning" size={20} color="#ff3333" />
              ) : (
                 <Ionicons name="checkmark" size={24} color="#0e0e0e" />
              )}
            </View>
          </View>
        </Pressable>

        {/* Notes area — fills all remaining space, shrinks with keyboard */}
        <View className="flex-1 bg-[#131313] rounded-3xl p-6">
          {isLoading ? (
             <View className="flex-1 items-center justify-center">
               <ActivityIndicator size="large" color="#cafd00" />
             </View>
          ) : (
            <TextInput 
              className="flex-1 text-white text-lg leading-relaxed"
              multiline
              scrollEnabled
              placeholder={"Squat: 100kg x 5 (felt light)\nBench: 80kg 3x8\n..."}
              placeholderTextColor="#484847"
              style={{ textAlignVertical: 'top' }}
              value={text}
              onChangeText={setText}
            />
          )}
        </View>
      </Animated.View>
    </View>
  );
}
