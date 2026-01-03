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
      <Text style={styles.title}>Editar entrenamiento</Text>
      <TextInput
        style={styles.titleInput}
        value={draft.title}
        onChangeText={(text) => setDraft((prev) => (prev ? { ...prev, title: text } : prev))}
        placeholder="Título"
      />

      {draft.items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <TextInput
            style={styles.itemName}
            value={item.name}
            onChangeText={(text) => updateItem(item.id, { name: text })}
            placeholder="Ejercicio"
          />
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={String(item.sets)}
              keyboardType="numeric"
              onChangeText={(text) => updateItem(item.id, { sets: Number(text) || 0 })}
              placeholder="Sets"
            />
            <TextInput
              style={styles.input}
              value={item.reps}
              onChangeText={(text) => updateItem(item.id, { reps: text })}
              placeholder="Reps"
            />
            <TextInput
              style={styles.input}
              value={String(item.restSeconds)}
              keyboardType="numeric"
              onChangeText={(text) => updateItem(item.id, { restSeconds: Number(text) || 0 })}
              placeholder="Descanso"
            />
          </View>
          <Pressable style={styles.removeButton} onPress={() => handleRemoveItem(item.id)}>
            <Text style={styles.removeButtonText}>Eliminar ejercicio</Text>
          </Pressable>
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
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  titleInput: {
    backgroundColor: '#F4F5F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
    padding: 16,
    gap: 12,
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
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E3E5E8',
  },
  removeButton: {
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: '#C0392B',
    fontWeight: '600',
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
