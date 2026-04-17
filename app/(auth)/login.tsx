import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter your email and password.');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert('Sign In Error', error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Sign Up Error', error.message);
    } else {
      Alert.alert('Success', 'Account created successfully!');
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-[#0e0e0e]" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-8">
        
        <View className="items-center mb-16">
          <View className="w-20 h-20 bg-[#20201f] rounded-3xl items-center justify-center mb-6 shadow-[0_0_30px_rgba(202,253,0,0.15)]">
            <Ionicons name="barbell" size={40} color="#cafd00" />
          </View>
          <Text className="text-white text-4xl font-black tracking-tighter">KINETIC</Text>
          <Text className="text-[#adaaaa] mt-2 font-bold tracking-widest text-xs uppercase">Unlock Your Potential</Text>
        </View>

        <View className="mb-6">
          <Text className="text-white font-bold mb-2 ml-1 text-xs tracking-widest uppercase">Email</Text>
          <TextInput
            className="bg-[#131313] text-white px-5 py-4 rounded-2xl font-semibold border border-[#20201f]"
            placeholder="athlete@kinetic.com"
            placeholderTextColor="#484847"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="mb-10">
          <Text className="text-white font-bold mb-2 ml-1 text-xs tracking-widest uppercase">Password</Text>
          <TextInput
            className="bg-[#131313] text-white px-5 py-4 rounded-2xl font-semibold border border-[#20201f]"
            placeholder="••••••••"
            placeholderTextColor="#484847"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          className="bg-[#cafd00] py-4 rounded-full items-center justify-center mb-4 active:opacity-80"
          onPress={signInWithEmail}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color="#0e0e0e" />
          ) : (
            <Text className="text-[#0e0e0e] font-black text-lg tracking-widest uppercase">Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className="border-2 border-[#20201f] py-4 rounded-full items-center justify-center active:bg-[#20201f]"
          onPress={signUpWithEmail}
          disabled={loading}
        >
          <Text className="text-white font-bold text-sm tracking-widest uppercase">Create Account</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}
