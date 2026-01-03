import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { exportJSON } from '@/src/lib/importExport';
import { getState, resetState } from '@/src/lib/storage';
import { LocalState } from '@/src/lib/types';

export default function SettingsScreen() {
  const [state, setState] = useState<LocalState | null>(null);

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

  const handleReset = async () => {
    const next = await resetState();
    setState(next);
  };

  const handleExportLogs = async () => {
    if (!state) return;
    try {
      await exportJSON('fitcoach-logs.json', state.logs);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron exportar los registros.');
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
      <Text style={styles.title}>Ajustes</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>FitCoach (demo local)</Text>
        <Text style={styles.cardBody}>Todo se guarda en este dispositivo usando AsyncStorage.</Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={handleExportLogs}>
        <Text style={styles.primaryButtonText}>Exportar logs JSON</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={handleReset}>
        <Text style={styles.secondaryButtonText}>Restablecer demo</Text>
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
    fontSize: 26,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#F4F5F7',
    padding: 16,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardBody: {
    marginTop: 6,
    color: '#666',
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
