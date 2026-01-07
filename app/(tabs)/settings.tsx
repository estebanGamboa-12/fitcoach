import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { exportJSON } from '@/src/lib/importExport';
import { getState, resetState } from '@/src/lib/storage';
import { LocalState } from '@/src/lib/types';
import {
  Card,
  DangerButton,
  PrimaryButton,
  Screen,
  SectionHeader,
  colors,
  spacing,
  typography,
} from '@/src/ui';

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
      <Screen scroll={false} style={styles.centered} padding={false}>
        <ActivityIndicator size="large" color={colors.accent} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Ajustes</Text>
      <Card
        title="FitCoach (demo local)"
        subtitle="Todo se guarda en este dispositivo usando AsyncStorage."
        style={styles.infoCard}
      />

      <SectionHeader title="Datos" />
      <Card style={styles.toolsCard}>
        <View style={styles.toolsList}>
          <PrimaryButton label="Exportar logs JSON" onPress={handleExportLogs} />
          <DangerButton label="Restablecer demo" onPress={handleReset} />
        </View>
      </Card>
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
  infoCard: {
    marginBottom: spacing.lg,
  },
  toolsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderDark,
  },
  toolsList: {
    gap: spacing.sm,
  },
});
