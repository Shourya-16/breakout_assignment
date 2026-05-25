import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface StatusBadgeProps {
  status: 'New' | 'Qualified' | 'Escalated' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusNormalized = status.toLowerCase() as 'new' | 'qualified' | 'escalated';
  
  let badgeColor = theme.colors.statuses.new;
  if (statusNormalized === 'qualified') {
    badgeColor = theme.colors.statuses.qualified;
  } else if (statusNormalized === 'escalated') {
    badgeColor = theme.colors.statuses.escalated;
  }

  return (
    <View style={[styles.badge, { backgroundColor: `${badgeColor}15`, borderColor: badgeColor }]}>
      <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      <Text style={[styles.text, { color: badgeColor }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs - 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing.xs,
  },
  text: {
    fontSize: theme.typography.sizes.xs + 1,
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase',
  },
});
export default StatusBadge;
