import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../theme/theme';

interface MetricSummaryProps {
  value: number | string;
  label: string;
  subtitle?: string;
  borderColor?: string;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - theme.spacing.xl * 2 - theme.spacing.md) / 2;

export const MetricSummary: React.FC<MetricSummaryProps> = ({ value, label, subtitle, borderColor }) => {
  return (
    <View style={[
      styles.card, 
      borderColor ? { borderTopWidth: 3, borderTopColor: borderColor } : null
    ]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    width: cardWidth,
    marginBottom: theme.spacing.md,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  value: {
    fontSize: theme.typography.sizes.xxl + 4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
export default MetricSummary;
