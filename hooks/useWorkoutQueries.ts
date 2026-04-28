import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider';
import {
  buildDashboardStats,
  buildSessionSummaries,
  buildWeeklyAggregates,
  createWorkoutSessionDraft,
  getWorkoutSessions,
} from '../lib/workoutDomain';

export function useRecentSessionsQuery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workouts', user?.id, 'recent'],
    queryFn: async () => {
      const sessions = await getWorkoutSessions(user!.id, 6);
      return buildSessionSummaries(sessions, 6);
    },
    enabled: !!user?.id,
  });
}

export function useDashboardMetricsQuery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workouts', user?.id, 'dashboard'],
    queryFn: async () => {
      const sessions = await getWorkoutSessions(user!.id, 32);
      return {
        weeklyAggregates: buildWeeklyAggregates(sessions),
        stats: buildDashboardStats(sessions),
      };
    },
    enabled: !!user?.id,
  });
}

export function useStartWorkoutMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User is not authenticated');
      }

      return createWorkoutSessionDraft(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.id, 'recent'] });
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.id, 'dashboard'] });
    },
  });
}
