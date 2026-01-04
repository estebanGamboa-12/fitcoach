import { useCallback, useEffect, useState } from 'react';
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

import { getState, updatePlan } from '@/src/lib/storage';
import { LocalState, Workout, WorkoutItem } from '@/src/lib/types';

export default function WorkoutEditorScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [state, setState] = useState<LocalState | null>(null);
  const [draft, setDraft] = useState<Workout | null>(null);
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
    if (!state || !workoutId) return;
    const found = state.plan.workouts.find((item) => item.id === workoutId);
    setDraft(found ? { ...found, items: [...found.items] } : null);
  }, [state, workoutId]);

  if (!state) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!draft) {
    return (
      <View style={styles.centered}>
        <Text>Entrenamiento no encontrado.</Text>
        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const updateItem = (itemId: string, changes: Partial<WorkoutItem>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) => (item.id === itemId ? { ...item, ...changes } : item)),
      };
    });
  };

  const handleAddItem = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      const nextItem: WorkoutItem = {
        id: `item-${Date.now()}`,
        name: 'Nuevo ejercicio',
        sets: 3,
        reps: '8-10',
        restSeconds: 90,
      };
      return { ...prev, items: [...prev.items, nextItem] };
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, items: prev.items.filter((item) => item.id !== itemId) };
    });
  };

  const handleSave = async () => {
    try {
      const nextState = await updatePlan((plan) => ({
        ...plan,
        workouts: plan.workouts.map((item) => (item.id === draft.id ? draft : item)),
      }));
      setState(nextState);
      Alert.alert('Guardado', 'El entrenamiento se actualizó.');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el entrenamiento.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.title}>Editar entrenamiento</Text>
          <Text style={styles.subtitle}>Personaliza ejercicios y deja comentarios para tu cliente.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Modo local</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Detalles</Text>
      <View style={styles.sectionCard}>
        <Text style={styles.fieldLabel}>Título</Text>
        <TextInput
          style={styles.titleInput}
          value={draft.title}
          onChangeText={(text) => setDraft((prev) => (prev ? { ...prev, title: text } : prev))}
          placeholder="Título del entrenamiento"
        />
        <Text style={styles.fieldLabel}>Notas del entrenador</Text>
        <TextInput
          style={[styles.titleInput, styles.notesInput]}
          value={draft.notes ?? ''}
          multiline
          onChangeText={(text) => setDraft((prev) => (prev ? { ...prev, notes: text } : prev))}
          placeholder="Objetivo de la sesión, ajustes o cues técnicos"
        />
      </View>

      <Text style={styles.sectionTitle}>Ejercicios</Text>
      {draft.items.map((item, index) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemIndex}>Ejercicio {index + 1}</Text>
            <Pressable style={styles.removeButton} onPress={() => handleRemoveItem(item.id)}>
              <Text style={styles.removeButtonText}>Eliminar</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.itemName}
            value={item.name}
            onChangeText={(text) => updateItem(item.id, { name: text })}
            placeholder="Nombre del ejercicio"
          />
          <View style={styles.row}>
            <View style={styles.metricField}>
              <Text style={styles.metricLabel}>Sets</Text>
              <TextInput
                style={styles.input}
                value={String(item.sets)}
                keyboardType="numeric"
                onChangeText={(text) => updateItem(item.id, { sets: Number(text) || 0 })}
                placeholder="4"
              />
            </View>
            <View style={styles.metricField}>
              <Text style={styles.metricLabel}>Reps</Text>
              <TextInput
                style={styles.input}
                value={item.reps}
                onChangeText={(text) => updateItem(item.id, { reps: text })}
                placeholder="8-10"
              />
            </View>
            <View style={styles.metricField}>
              <Text style={styles.metricLabel}>Descanso</Text>
              <TextInput
                style={styles.input}
                value={String(item.restSeconds)}
                keyboardType="numeric"
                onChangeText={(text) => updateItem(item.id, { restSeconds: Number(text) || 0 })}
                placeholder="90"
              />
            </View>
          </View>
          <Text style={styles.fieldLabel}>Comentario</Text>
          <TextInput
            style={[styles.itemName, styles.notesInput]}
            value={item.notes ?? ''}
            onChangeText={(text) => updateItem(item.id, { notes: text })}
            placeholder="Cues, técnica o variantes"
            multiline
          />
        </View>
      ))}

      <Pressable style={styles.secondaryButton} onPress={handleAddItem}>
        <Text style={styles.secondaryButtonText}>Añadir ejercicio</Text>
      </Pressable>
      <Pressable style={styles.primaryButton} onPress={handleSave}>
        <Text style={styles.primaryButtonText}>Guardar cambios</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 18,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerCard: {
    backgroundColor: '#1C5D99',
    borderRadius: 20,
    padding: 18,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    marginTop: 4,
    color: '#DCE8F5',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C2330',
  },
  sectionCard: {
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E3E5E8',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  titleInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#E3E5E8',
  },
  notesInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E3E5E8',
    shadowColor: '#1F2A37',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemIndex: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  itemName: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E3E5E8',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  metricField: {
    flex: 1,
    gap: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E3E5E8',
  },
  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 999,
  },
  removeButtonText: {
    color: '#B91C1C',
    fontWeight: '600',
    fontSize: 12,
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
});
