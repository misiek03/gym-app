import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export default function NotepadScreen() {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved'|'saving'|'error'>('saved');

  // Load session & data
  const { data: remoteText, isLoading } = useQuery({
    queryKey: ['notepad'],
    queryFn: async () => {
      // 1. Check existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      // 2. If no session, sign in anonymously
      if (!session) {
        const { error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) throw signInError;
      }

      // 3. Fetch notepad state (RLS protects this to only current user)
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
      // Update cache so next re-render doesn't overwrite typing
      queryClient.setQueryData(['notepad'], text);
    },
    onError: () => {
      setSaveStatus('error');
    }
  });

  // Effect to trigger debounce save
  useEffect(() => {
    // Check if loaded and if text actually changed from original fetch
    if (remoteText !== undefined && text !== remoteText && text !== queryClient.getQueryData(['notepad'])) {
      setSaveStatus('saving');
      const timer = setTimeout(() => {
        saveMutation.mutate(text);
      }, 1500); // 1.5 second debounce
      return () => clearTimeout(timer);
    }
  }, [text, remoteText]);

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-[#0e0e0e]" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 pt-16 px-6 pb-24">
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-white text-3xl font-black tracking-tighter">WORKOUT LOG</Text>
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

        <View className="flex-row flex-wrap mb-6 gap-2">
          {['1x5','3x8','1RM','RPE8','Drop Set','AMRAP'].map((shortcut) => (
            <TouchableOpacity 
              key={shortcut} 
              className="bg-[#20201f] px-4 py-2 rounded-full mr-2 mb-2"
              onPress={() => setText((prev) => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + shortcut + ' ')}
            >
              <Text className="text-[#adaaaa] font-bold text-xs tracking-widest uppercase">{shortcut}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-1 bg-[#131313] rounded-3xl p-6">
          {isLoading ? (
             <View className="flex-1 items-center justify-center">
               <ActivityIndicator size="large" color="#cafd00" />
             </View>
          ) : (
            <TextInput 
              className="flex-1 text-white text-lg leading-relaxed align-top"
              multiline
              placeholder="Squat: 100kg x 5 (felt light)&#10;Bench: 80kg 3x8&#10;..."
              placeholderTextColor="#484847"
              style={{ textAlignVertical: 'top' }}
              value={text}
              onChangeText={setText}
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
