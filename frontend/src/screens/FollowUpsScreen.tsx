import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { useApp } from '../context/AppContext';
import ChannelBadge from '../components/ChannelBadge';
import EmptyState from '../components/EmptyState';

export const FollowUpsScreen: React.FC = () => {
  const { enquiries, markFollowUpDone } = useApp();

  // Filter for enquiries with follow-up scheduled and not completed
  const pendingFollowUps = enquiries.filter(e => e.followUpDue && !e.followUpDone);

  const formatDueTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = date.getTime() - Date.now();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 0) {
        return `OVERDUE by ${Math.abs(diffMins)}m`;
      }
      if (diffMins < 60) {
        return `Due in ${diffMins}m`;
      }
      const diffHours = Math.round(diffMins / 60);
      if (diffHours < 24) {
        return `Due in ${diffHours}h`;
      }
      return date.toLocaleDateString();
    } catch (e) {
      return 'Scheduled';
    }
  };

  const handleMarkAsDone = (id: string, name: string) => {
    markFollowUpDone(id);
    Alert.alert('Task Completed', `Follow-up for ${name} has been marked as Done.`);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isOverdue = new Date(item.followUpDue).getTime() < Date.now();
    const timeLabelColor = isOverdue ? theme.colors.urgency.high : theme.colors.channels.call;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={[styles.dueTimeText, { color: timeLabelColor, fontWeight: 'bold' }]}>
            {formatDueTime(item.followUpDue)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <ChannelBadge channel={item.channel} />
          <Text style={styles.scheduledTime}>
            Scheduled: {new Date(item.followUpDue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <Text style={styles.templateLabel}>Message Template:</Text>
        <Text style={styles.templateText}>
          "{item.followUpTemplate || 'Check-in on customer response.'}"
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.doneBtn}
            onPress={() => handleMarkAsDone(item.id, item.customerName)}
          >
            <Text style={styles.doneBtnText}>✓ Mark as Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Follow-ups</Text>
      <Text style={styles.subtitle}>Scheduled tasks to keep enquiries active and convert leads</Text>

      <FlatList
        data={pendingFollowUps}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            emoji="✅"
            title="All Caught Up!"
            description="No pending follow-ups due. Great job keeping in touch with your leads!"
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
  dueTimeText: {
    fontSize: theme.typography.sizes.xs + 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  scheduledTime: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
  templateLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  templateText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: theme.spacing.lg,
  },
  actionsRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: theme.spacing.md,
    alignItems: 'flex-end',
  },
  doneBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  doneBtnText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.sm,
  },
});
export default FollowUpsScreen;
