import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { formatDate, formatDateLabel } from '@/src/lib/date';
import { getState } from '@/src/lib/storage';
import { LocalState } from '@/src/lib/types';
import {
  Card,
  ListEmptyState,
  Screen,
  SecondaryButton,
  SectionHeader,
  colors,
  spacing,
  typography,
} from '@/src/ui';

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
      <Screen scroll={false} style={styles.centered} padding={false}>
        <ActivityIndicator size="large" color={colors.accent} />
      </Screen>
    );
  }

  const { plan } = state;
  const assignments = useMemo(
    () =>
      [...plan.assignments].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)),
    [plan.assignments]
  );
  const todayKey = useMemo(() => formatDate(new Date()), []);

  return (
    <Screen scroll={false} padding={false}>
      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Hola, {plan.client.name}</Text>
            <Text style={styles.subtitle}>Sesiones asignadas</Text>
            <SectionHeader title="Semana" />
          </View>
        }
        ListEmptyComponent={
          <ListEmptyState
            message="No hay sesiones asignadas."
            iconName="calendar-outline"
          />
        }
        renderItem={({ item }) => {
          const workout = plan.workouts.find((entry) => entry.id === item.workoutId);
          const date = new Date(`${item.scheduledDate}T00:00:00`);
          const isToday = item.scheduledDate === todayKey;
          return (
            <Pressable
              onPress={() => router.push(`/workout/${item.id}`)}
              style={styles.cardWrapper}>
              <Card style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.cardContent}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardTitle}>{workout?.title ?? 'Entrenamiento'}</Text>
                      {isToday ? (
                        <View style={styles.todayBadge}>
                          <Text style={styles.todayBadgeText}>Hoy</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.cardSubtitle}>
                      {workout?.notes ?? 'Sesión asignada'}
                    </Text>
                    <View style={styles.cardMetaRow}>
                      <View style={styles.dateChip}>
                        <Text style={styles.dateChipText}>{formatDateLabel(date)}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardAction}>
                    <SecondaryButton
                      label="Abrir"
                      size="sm"
                      onPress={() => router.push(`/workout/${item.id}`)}
                    />
                    <FontAwesome name="chevron-right" size={16} color={colors.textMuted} />
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    ...typography.title,
  },
  subtitle: {
    color: colors.textSecondary,
    ...typography.body,
  },
  cardWrapper: {
    borderRadius: 18,
  },
  card: {
    padding: spacing.lg,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardTitle: {
    color: colors.textOnCard,
    ...typography.section,
  },
  cardSubtitle: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    ...typography.body,
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardMetaRow: {
    marginTop: spacing.sm,
  },
  dateChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.cardMuted,
  },
  dateChipText: {
    color: colors.textMuted,
    ...typography.meta,
  },
  todayBadge: {
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  todayBadgeText: {
    color: colors.accent,
    ...typography.meta,
  },
  cardAction: {
    alignItems: 'center',
    gap: spacing.sm,
  },
});
