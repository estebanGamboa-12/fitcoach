import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { addDays, formatDate, formatDateLabel } from '@/src/lib/date';
import { exportJSON, importJSON } from '@/src/lib/importExport';
import { getState, resetState, setState, updatePlan } from '@/src/lib/storage';
import { LocalState, Plan } from '@/src/lib/types';

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
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Plan del cliente</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{plan?.workouts.length ?? 0}</Text>
          <Text style={styles.summaryLabel}>Entrenamientos</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{plan?.assignments.length ?? 0}</Text>
          <Text style={styles.summaryLabel}>Asignaciones</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Asignaciones próximas</Text>
      <View style={styles.list}>
        {upcomingDates.map(({ date, key }) => {
          const assignment = plan?.assignments.find((item) => item.scheduledDate === key);
          const workout = plan?.workouts.find((item) => item.id === assignment?.workoutId);
          return (
            <Pressable
              key={key}
              style={styles.assignmentCard}
              onPress={() => setSelectedDate(key)}>
              <View>
                <Text style={styles.assignmentDate}>{formatDateLabel(date)}</Text>
                <Text style={styles.assignmentWorkout}>{workout?.title ?? 'Sin asignar'}</Text>
              </View>
              <Text style={styles.assignmentCta}>Cambiar</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Entrenamientos</Text>
      <View style={styles.list}>
        {plan?.workouts.map((workout) => (
          <Pressable
            key={workout.id}
            style={styles.workoutCard}
            onPress={() => router.push(`/coach/workout-editor/${workout.id}`)}>
            <View>
              <Text style={styles.workoutTitle}>{workout.title}</Text>
              <Text style={styles.workoutMeta}>{workout.items.length} ejercicios</Text>
            </View>
            <Text style={styles.assignmentCta}>Editar</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryButton} onPress={handleReset}>
          <Text style={styles.secondaryButtonText}>Restablecer demo</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={handleExport}>
          <Text style={styles.primaryButtonText}>Exportar plan JSON</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={handleImport}>
          <Text style={styles.primaryButtonText}>Importar plan JSON</Text>
        </Pressable>
      </View>

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
            <Pressable style={styles.modalCancel} onPress={() => setSelectedDate(null)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F4F5F7',
    padding: 16,
    borderRadius: 16,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  summaryLabel: {
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  list: {
    gap: 12,
  },
  assignmentCard: {
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentDate: {
    fontSize: 14,
    color: '#666',
  },
  assignmentWorkout: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
  },
  assignmentCta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C5D99',
  },
  workoutCard: {
    backgroundColor: '#F4F5F7',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  workoutMeta: {
    color: '#666',
    marginTop: 4,
  },
  buttonRow: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1C5D99',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1C5D99',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1C5D99',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOption: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F4F5F7',
    paddingHorizontal: 12,
  },
  modalOptionText: {
    fontWeight: '600',
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCancelText: {
    color: '#1C5D99',
    fontWeight: '600',
  },
});
