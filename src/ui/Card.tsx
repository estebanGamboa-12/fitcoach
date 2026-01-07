import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing, typography } from './tokens';

type CardProps = {
  title?: string;
  subtitle?: string;
  metadata?: string;
  footer?: ReactNode;
  headerRight?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({
  title,
  subtitle,
  metadata,
  footer,
  headerRight,
  children,
  style,
}: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {(title || metadata || headerRight) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {metadata ? <Text style={styles.metadata}>{metadata}</Text> : null}
          </View>
          {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
        </View>
      )}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  title: {
    color: colors.textOnCard,
    ...typography.section,
  },
  metadata: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    ...typography.meta,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textOnCard,
    ...typography.body,
  },
  footer: {
    marginTop: spacing.md,
  },
});
