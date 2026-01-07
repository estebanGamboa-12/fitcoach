import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { addDays, formatDate, formatDateLabel } from '@/src/lib/date';
import { exportJSON, importJSON } from '@/src/lib/importExport';
import { getState, resetState, setState, updatePlan } from '@/src/lib/storage';
import { LocalState, Plan } from '@/src/lib/types';
import {
  Card,
  DangerButton,
  Screen,
  SecondaryButton,
  SectionHeader,
  colors,
  radius,
  spacing,
  typography,
} from '@/src/ui';

export default function CoachScreen() {
  const [state, setLocalState] = useState<LocalState | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const router = useRouter();

  const loadState = useCallback(() => {
    let active = true;
    getState().then((next) => {
      if (active) setLocalState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(loadState);

  const plan = state?.plan;

  const upcomingDates = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(new Date(), index);
    return { date, key: formatDate(date) };
  });

  const handleSelectWorkout = async (dateKey: string, workoutId: string) => {
    if (!plan) return;
    const nextState = await updatePlan((current) => {
      const existing = current.assignments.find((item) => item.scheduledDate === dateKey);
      const assignments = existing
        ? current.assignments.map((item) =>
            item.scheduledDate === dateKey ? { ...item, workoutId } : item
          )
        : [
            ...current.assignments,
            {
              id: `assignment-${Date.now()}`,
              scheduledDate: dateKey,
              workoutId,
            },
          ];
      return { ...current, assignments };
    });
    setLocalState(nextState);
    setSelectedDate(null);
  };

  const handleReset = async () => {
    const nextState = await resetState();
    setLocalState(nextState);
  };

  const handleExport = async () => {
    if (!plan) return;
    try {
      await exportJSON('fitcoach-plan.json', plan);
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar el plan.');
    }
  };

  const handleImport = async () => {
    try {
      const imported = await importJSON<Plan>();
      if (!imported) return;
      const nextState: LocalState = { plan: imported, logs: {} };
      await setState(nextState);
      setLocalState(nextState);
    } catch (error) {
      Alert.alert('Error', 'No se pudo importar el plan.');
    }
  };

  if (!state) {
    return (
      <Screen scroll={false} style={styles.centered} padding={false}>
        <ActivityIndicator size="large" color={colors.accent} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Plan del cliente</Text>
      <Card style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Modo app fit (local)</Text>
          <Text style={styles.heroSubtitle}>
            Ajusta entrenamientos, añade comentarios y asigna sesiones sin depender de la nube.
          </Text>
        </View>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Offline</Text>
        </View>
      </Card>

      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{plan?.workouts.length ?? 0}</Text>
          <Text style={styles.summaryLabel}>Entrenamientos</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{plan?.assignments.length ?? 0}</Text>
          <Text style={styles.summaryLabel}>Asignaciones</Text>
        </Card>
      </View>

      <SectionHeader title="Plan semanal" />
      <View style={styles.list}>
        {upcomingDates.map(({ date, key }) => {
          const assignment = plan?.assignments.find((item) => item.scheduledDate === key);
          const workout = plan?.workouts.find((item) => item.id === assignment?.workoutId);
          return (
            <Pressable key={key} style={styles.cardPressable} onPress={() => setSelectedDate(key)}>
              <Card style={styles.assignmentCard}>
                <View style={styles.assignmentRow}>
                  <View>
                    <Text style={styles.assignmentDate}>{formatDateLabel(date)}</Text>
                    <Text style={styles.assignmentWorkout}>{workout?.title ?? 'Sin asignar'}</Text>
                  </View>
                  <View style={styles.assignmentAction}>
                    <Text style={styles.assignmentCta}>Cambiar</Text>
                    <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Rutinas" />
      <View style={styles.list}>
        {plan?.workouts.map((workout) => (
          <Pressable
            key={workout.id}
            style={styles.cardPressable}
            onPress={() => router.push(`/coach/workout-editor/${workout.id}`)}>
            <Card style={styles.workoutCard}>
              <View style={styles.assignmentRow}>
                <View>
                  <Text style={styles.workoutTitle}>{workout.title}</Text>
                  <Text style={styles.workoutMeta}>{workout.items.length} ejercicios</Text>
                </View>
                <View style={styles.assignmentAction}>
                  <Text style={styles.assignmentCta}>Editar</Text>
                  <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Herramientas" />
      <Card style={styles.toolsCard}>
        <View style={styles.toolsList}>
          <SecondaryButton label="Exportar plan JSON" onPress={handleExport} />
          <SecondaryButton label="Importar plan JSON" onPress={handleImport} />
          <DangerButton label="Restablecer demo" onPress={handleReset} />
        </View>
      </Card>

      <Modal visible={selectedDate !== null} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Seleccionar entrenamiento</Text>
            {plan?.workouts.map((workout) => (
              <Pressable
                key={workout.id}
                style={styles.modalOption}
                onPress={() => selectedDate && handleSelectWorkout(selectedDate, workout.id)}>
                <Text style={styles.modalOptionText}>{workout.title}</Text>
              </Pressable>
            ))}
            <SecondaryButton label="Cancelar" onPress={() => setSelectedDate(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    ...typography.title,
    marginBottom: spacing.md,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderDark,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroTitle: {
    color: colors.textPrimary,
    ...typography.section,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    ...typography.meta,
  },
  heroContent: {
    flex: 1,
  },
  heroBadge: {
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  heroBadgeText: {
    color: colors.accent,
    ...typography.meta,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.lg,
  },
  summaryValue: {
    color: colors.textOnCard,
    fontSize: 22,
    fontWeight: '700',
  },
  summaryLabel: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    ...typography.meta,
  },
  list: {
    gap: spacing.md,
  },
  cardPressable: {
    borderRadius: radius.lg,
  },
  assignmentCard: {},
  assignmentDate: {
    color: colors.textMuted,
    ...typography.meta,
  },
  assignmentWorkout: {
    color: colors.textOnCard,
    ...typography.section,
    marginTop: spacing.xs,
  },
  assignmentCta: {
    color: colors.accent,
    ...typography.meta,
    fontWeight: '600',
  },
  workoutCard: {
    padding: spacing.lg,
  },
  workoutTitle: {
    color: colors.textOnCard,
    ...typography.section,
  },
  workoutMeta: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    ...typography.meta,
  },
  assignmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  assignmentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  toolsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderDark,
  },
  toolsList: {
    gap: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    gap: spacing.sm,
  },
  modalTitle: {
    color: colors.textPrimary,
    ...typography.section,
  },
  modalOption: {
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
  },
  modalOptionText: {
    color: colors.textOnCard,
    fontWeight: '600',
  },
});
