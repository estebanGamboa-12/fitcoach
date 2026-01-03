import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { formatDateLabel, formatDateTime } from '@/src/lib/date';
import { getLog, getState, upsertLog } from '@/src/lib/storage';
import { LocalState, WorkoutLog } from '@/src/lib/types';

type DraftSet = { weight: string; reps: string; rpe: string };

export default function WorkoutPlayerScreen() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const [state, setState] = useState<LocalState | null>(null);
  const [draftSets, setDraftSets] = useState<Record<string, Record<number, DraftSet>>>({});
  const [lastSaved, setLastSaved] = useState<string | undefined>();
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

  useEffect(() => {
    if (!assignmentId) return;
    getLog(String(assignmentId)).then((log) => {
      if (!log) return;
      setLastSaved(log.completedAt);
      setDraftSets(convertLogToDraft(log));
    });
  }, [assignmentId]);

  const assignment = useMemo(() => {
    if (!state || !assignmentId) return null;
    return state.plan.assignments.find((item) => item.id === assignmentId);
  }, [assignmentId, state]);

  const workout = useMemo(() => {
    if (!state || !assignment) return null;
    return state.plan.workouts.find((item) => item.id === assignment.workoutId) ?? null;
  }, [assignment, state]);

  useEffect(() => {
    if (!workout) return;
    setDraftSets((current) => {
      if (Object.keys(current).length) return current;
      return buildEmptyDraft(workout);
    });
  }, [workout]);

  if (!state || !assignmentId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!assignment || !workout) {
    return (
      <View style={styles.centered}>
        <Text>Entrenamiento no encontrado.</Text>
        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const workoutDate = new Date(`${assignment.scheduledDate}T00:00:00`);

  const handleChange = (itemId: string, setIndex: number, field: keyof DraftSet, value: string) => {
    setDraftSets((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [setIndex]: {
          ...prev[itemId]?.[setIndex],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    try {
      const log: WorkoutLog = {
        assignmentId: assignment.id,
        completedAt: new Date().toISOString(),
        sets: convertDraftToLog(draftSets),
      };
      await upsertLog(log);
      setLastSaved(log.completedAt);
      Alert.alert('Guardado', 'Tus registros se guardaron localmente.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el entrenamiento.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{workout.title}</Text>
      <Text style={styles.subtitle}>{formatDateLabel(workoutDate)}</Text>
      {workout.notes ? <Text style={styles.notes}>{workout.notes}</Text> : null}
      <Text style={styles.saved}>Último guardado: {formatDateTime(lastSaved)}</Text>

      {workout.items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemMeta}>
              {item.sets}x{item.reps} · {item.restSeconds}s
            </Text>
          </View>
          {Array.from({ length: item.sets }, (_, index) => {
            const setNumber = index + 1;
            const values = draftSets[item.id]?.[setNumber] ?? { weight: '', reps: '', rpe: '' };
            return (
              <View key={`${item.id}-${setNumber}`} style={styles.setRow}>
                <Text style={styles.setLabel}>Set {setNumber}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="kg"
                  value={values.weight}
                  onChangeText={(text) => handleChange(item.id, setNumber, 'weight', text)}
                />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="reps"
                  value={values.reps}
                  onChangeText={(text) => handleChange(item.id, setNumber, 'reps', text)}
                />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="RPE"
                  value={values.rpe}
                  onChangeText={(text) => handleChange(item.id, setNumber, 'rpe', text)}
                />
              </View>
            );
          })}
        </View>
      ))}

      <Pressable style={styles.primaryButton} onPress={handleSave}>
        <Text style={styles.primaryButtonText}>Guardar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

function buildEmptyDraft(workout: { items: { id: string; sets: number }[] }) {
  return workout.items.reduce<Record<string, Record<number, DraftSet>>>((acc, item) => {
    const sets: Record<number, DraftSet> = {};
    for (let setNumber = 1; setNumber <= item.sets; setNumber += 1) {
      sets[setNumber] = { weight: '', reps: '', rpe: '' };
    }
    acc[item.id] = sets;
    return acc;
  }, {});
}

function convertDraftToLog(draft: Record<string, Record<number, DraftSet>>) {
  const result: WorkoutLog['sets'] = {};
  Object.entries(draft).forEach(([itemId, sets]) => {
    const next: Record<number, { weight?: number | null; reps?: number | null; rpe?: number | null }> = {};
    Object.entries(sets).forEach(([setIndex, values]) => {
      next[Number(setIndex)] = {
        weight: parseNumber(values.weight),
        reps: parseNumber(values.reps),
        rpe: parseNumber(values.rpe),
      };
    });
    result[itemId] = next;
  });
  return result;
}

function convertLogToDraft(log: WorkoutLog): Record<string, Record<number, DraftSet>> {
  const result: Record<string, Record<number, DraftSet>> = {};
  Object.entries(log.sets).forEach(([itemId, sets]) => {
    const next: Record<number, DraftSet> = {};
    Object.entries(sets).forEach(([setIndex, values]) => {
      next[Number(setIndex)] = {
        weight: values.weight?.toString() ?? '',
        reps: values.reps?.toString() ?? '',
        rpe: values.rpe?.toString() ?? '',
      };
    });
    result[itemId] = next;
  });
  return result;
}

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
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
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  notes: {
    marginTop: 8,
    color: '#444',
  },
  saved: {
    marginTop: 12,
    fontSize: 12,
    color: '#666',
  },
  itemCard: {
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  itemHeader: {
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemMeta: {
    marginTop: 4,
    color: '#666',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  setLabel: {
    width: 52,
    fontSize: 12,
    color: '#444',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E3E5E8',
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: '#1C5D99',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#1C5D99',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#1C5D99',
    fontWeight: '600',
  },
});
