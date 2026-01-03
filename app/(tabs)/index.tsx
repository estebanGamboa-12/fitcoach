import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { formatDateLabel } from '@/src/lib/date';
import { getState } from '@/src/lib/storage';
import { LocalState } from '@/src/lib/types';

export default function ClientHomeScreen() {
  const [state, setState] = useState<LocalState | null>(null);
  const router = useRouter();

  const loadState = useCallback(() => {
    let active = true;
    getState().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(loadState);

  if (!state) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const { plan } = state;
  const assignments = [...plan.assignments].sort((a, b) =>
    a.scheduledDate.localeCompare(b.scheduledDate)
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Hola, {plan.client.name}</Text>
      <Text style={styles.subtitle}>Semana</Text>
      <View style={styles.list}>
        {assignments.map((assignment) => {
          const workout = plan.workouts.find((item) => item.id === assignment.workoutId);
          const date = new Date(`${assignment.scheduledDate}T00:00:00`);
          return (
            <Pressable
              key={assignment.id}
              onPress={() => router.push(`/workout/${assignment.id}`)}
              style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{workout?.title ?? 'Entrenamiento'}</Text>
                <Text style={styles.cardDate}>{formatDateLabel(date)}</Text>
              </View>
              <Text style={styles.cardSubtitle}>{workout?.notes ?? 'Sesión asignada'}</Text>
              <View style={styles.ctaRow}>
                <Text style={styles.cta}>Abrir sesión</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#F4F5F7',
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDate: {
    fontSize: 12,
    color: '#666',
  },
  cardSubtitle: {
    marginTop: 8,
    color: '#555',
  },
  ctaRow: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  cta: {
    fontWeight: '600',
    color: '#1C5D99',
  },
});
