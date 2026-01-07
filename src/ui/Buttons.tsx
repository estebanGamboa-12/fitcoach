import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from './tokens';

type ButtonSize = 'sm' | 'md';

type BaseButtonProps = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  size?: ButtonSize;
  style?: ViewStyle;
  disabled?: boolean;
};

function BaseButton({
  label,
  onPress,
  icon,
  size = 'md',
  style,
  disabled,
  backgroundColor,
  textColor,
  borderColor,
}: BaseButtonProps & {
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        {
          backgroundColor,
          borderColor: borderColor ?? 'transparent',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      <View style={styles.content}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function PrimaryButton(props: BaseButtonProps) {
  return (
    <BaseButton
      {...props}
      backgroundColor={colors.accent}
      textColor="#fff"
      borderColor={colors.accent}
    />
  );
}

export function SecondaryButton(props: BaseButtonProps) {
  return (
    <BaseButton
      {...props}
      backgroundColor="transparent"
      textColor={colors.accent}
      borderColor={colors.accent}
    />
  );
}

export function DangerButton(props: BaseButtonProps) {
  return (
    <BaseButton
      {...props}
      backgroundColor={colors.dangerMuted}
      textColor={colors.danger}
      borderColor={colors.danger}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  md: {
    paddingVertical: spacing.md,
  },
  sm: {
    paddingVertical: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    alignItems: 'center',
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
});
