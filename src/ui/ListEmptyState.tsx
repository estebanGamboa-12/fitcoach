import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography } from './tokens';

type ListEmptyStateProps = {
  message: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
};

export function ListEmptyState({ message, iconName }: ListEmptyStateProps) {
  return (
    <View style={styles.container}>
      {iconName ? <Ionicons name={iconName} size={28} color={colors.textMuted} /> : null}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
  },
  message: {
    color: colors.textMuted,
    ...typography.body,
    textAlign: 'center',
  },
});
