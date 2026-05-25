import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { useApp } from '../context/AppContext';
import ChannelBadge from '../components/ChannelBadge';
import EmptyState from '../components/EmptyState';
import { formatTimeAgo } from '../components/LeadCard';

export const EscalationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { enquiries, resolveEscalation } = useApp();

  const escalatedEnquiries = enquiries.filter(e => e.status === 'Escalated');

  const handleResolve = (id: string, name: string) => {
    resolveEscalation(id);
    Alert.alert('Escalation Resolved', `Enquiry from ${name} has been marked as Qualified.`);
  };

  const renderItem = ({ item }: { item: any }) => {
    const urgencyColor = item.urgency === 'High' ? theme.colors.urgency.high : theme.colors.urgency.medium;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ConversationDetail', { enquiryId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.timeText}>{formatTimeAgo(item.createdAt)}</Text>
        </View>

        <View style={styles.metaRow}>
          <ChannelBadge channel={item.channel} />
          <View style={[styles.urgencyBadge, { backgroundColor: `${urgencyColor}15`, borderColor: urgencyColor }]}>
            <Text style={[styles.urgencyText, { color: urgencyColor }]}>{item.urgency || 'High'} URGENCY</Text>
          </View>
        </View>

        <Text style={styles.reasonLabel}>Reason for Escalation:</Text>
        <Text style={styles.reasonText}>{item.escalationReason || 'No SOP keyword matched.'}</Text>
        
        <Text style={styles.messageLabel}>Customer Message:</Text>
        <Text style={styles.messageText} numberOfLines={3}>{item.message}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.resolveBtn}
            onPress={() => handleResolve(item.id, item.customerName)}
          >
            <Text style={styles.resolveBtnText}>✓ Resolve Escalation</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escalation Alerts</Text>
      <Text style={styles.subtitle}>Critical queries demanding immediate human attention</Text>

      <FlatList
        data={escalatedEnquiries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            emoji="🎉"
            title="All Clear!"
            description="No open escalations found. All customer enquiries are successfully handled by Closira SOPs."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.sizes.xl + 2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl * 2,
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.statuses.escalated,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  customerName: {
    fontSize: theme.typography.sizes.md + 1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  timeText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  urgencyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs - 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    marginLeft: theme.spacing.sm,
  },
  urgencyText: {
    fontSize: theme.typography.sizes.xs - 1,
    fontWeight: theme.typography.weights.bold,
    textTransform: 'uppercase',
  },
  reasonLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  reasonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.statuses.escalated,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.sm,
  },
  messageLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  messageText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.lg,
  },
  actionsRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: theme.spacing.md,
    alignItems: 'flex-end',
  },
  resolveBtn: {
    backgroundColor: theme.colors.statuses.qualified,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  resolveBtnText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.sm,
  },
});
export default EscalationsScreen;
