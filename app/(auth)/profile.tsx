import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const email = user?.email ?? 'Unknown';
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  async function handleSignOut() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  }

  // Extract initials from email
  const initials = email
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView className="flex-1 bg-[#0e0e0e] pt-16 pb-32">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-6 mb-10">
        <TouchableOpacity
          className="w-10 h-10 bg-[#20201f] rounded-full items-center justify-center active:opacity-80"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#adaaaa" />
        </TouchableOpacity>
        <Text className="text-white font-black tracking-widest text-lg">
          KINE<Text className="text-[#cafd00]">TIC</Text>
        </Text>
        <View className="w-10 h-10" />
      </View>

      {/* Avatar & Email */}
      <View className="items-center mb-12 px-6">
        <View className="w-24 h-24 bg-[#131313] rounded-full items-center justify-center mb-5 border-2 border-[#20201f] shadow-[0_0_30px_rgba(202,253,0,0.1)]">
          <Text className="text-[#cafd00] text-3xl font-black tracking-tighter">
            {initials}
          </Text>
        </View>
        <Text className="text-white text-2xl font-black tracking-tighter mb-2">
          {email.split('@')[0].toUpperCase()}
        </Text>
        <Text className="text-[#adaaaa] text-sm font-semibold">{email}</Text>
      </View>

      {/* Account Info Cards */}
      <View className="px-6 mb-8">
        <Text className="text-white text-xl font-black tracking-tighter mb-5">
          ACCOUNT
        </Text>

        {/* Email */}
        <View className="bg-[#131313] rounded-2xl p-5 mb-3 flex-row items-center border border-[#20201f]">
          <View className="w-10 h-10 bg-[#20201f] rounded-full items-center justify-center mr-4">
            <Ionicons name="mail" size={18} color="#cafd00" />
          </View>
          <View className="flex-1">
            <Text className="text-[#adaaaa] text-[10px] font-bold tracking-widest uppercase mb-1">
              Email
            </Text>
            <Text className="text-white text-sm font-semibold">{email}</Text>
          </View>
        </View>

        {/* Member Since */}
        <View className="bg-[#131313] rounded-2xl p-5 mb-3 flex-row items-center border border-[#20201f]">
          <View className="w-10 h-10 bg-[#20201f] rounded-full items-center justify-center mr-4">
            <Ionicons name="calendar" size={18} color="#00e3fd" />
          </View>
          <View className="flex-1">
            <Text className="text-[#adaaaa] text-[10px] font-bold tracking-widest uppercase mb-1">
              Member Since
            </Text>
            <Text className="text-white text-sm font-semibold">
              {createdAt}
            </Text>
          </View>
        </View>

        {/* Last Sign In */}
        <View className="bg-[#131313] rounded-2xl p-5 mb-3 flex-row items-center border border-[#20201f]">
          <View className="w-10 h-10 bg-[#20201f] rounded-full items-center justify-center mr-4">
            <Ionicons name="log-in" size={18} color="#ffd700" />
          </View>
          <View className="flex-1">
            <Text className="text-[#adaaaa] text-[10px] font-bold tracking-widest uppercase mb-1">
              Last Sign In
            </Text>
            <Text className="text-white text-sm font-semibold">
              {lastSignIn}
            </Text>
          </View>
        </View>

        {/* User ID */}
        <View className="bg-[#131313] rounded-2xl p-5 flex-row items-center border border-[#20201f]">
          <View className="w-10 h-10 bg-[#20201f] rounded-full items-center justify-center mr-4">
            <Ionicons name="finger-print" size={18} color="#adaaaa" />
          </View>
          <View className="flex-1">
            <Text className="text-[#adaaaa] text-[10px] font-bold tracking-widest uppercase mb-1">
              User ID
            </Text>
            <Text className="text-[#484847] text-xs font-mono" numberOfLines={1}>
              {user?.id ?? '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="px-6 mb-8">
        <Text className="text-white text-xl font-black tracking-tighter mb-5">
          ACTIONS
        </Text>

        {/* Sign Out */}
        <TouchableOpacity
          className="bg-[#131313] rounded-2xl p-5 flex-row items-center border border-[#20201f] active:bg-[#1a1a19]"
          onPress={handleSignOut}
        >
          <View className="w-10 h-10 bg-[#20201f] rounded-full items-center justify-center mr-4">
            <Ionicons name="log-out" size={18} color="#ff4d4d" />
          </View>
          <View className="flex-1">
            <Text className="text-[#ff4d4d] text-sm font-bold">Log Out</Text>
            <Text className="text-[#adaaaa] text-xs mt-0.5">
              Sign out of your account
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#484847" />
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View className="items-center pt-8 pb-4">
        <Text className="text-[#484847] text-[10px] font-bold tracking-widest uppercase">
          KINETIC v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}
