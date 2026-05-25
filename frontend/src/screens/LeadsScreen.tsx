import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useApp } from '../context/AppContext';
import LeadCard from '../components/LeadCard';
import EmptyState from '../components/EmptyState';

export const LeadsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { enquiries } = useApp();
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Qualified'>('All');
  const [channelFilter, setChannelFilter] = useState<'All' | 'WhatsApp' | 'Email' | 'Call'>('All');

  // Filter out Escalated enquiries, as they belong strictly to the Escalations Screen
  const activeLeads = enquiries.filter(e => e.status !== 'Escalated');

  const filteredLeads = activeLeads.filter(lead => {
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesChannel = channelFilter === 'All' || lead.channel.toLowerCase() === channelFilter.toLowerCase();
    return matchesStatus && matchesChannel;
  });

  const renderItem = ({ item }: { item: any }) => (
    <LeadCard
      customerName={item.customerName}
      channel={item.channel}
      message={item.message}
      status={item.status}
      createdAt={item.createdAt}
      onPress={() => navigation.navigate('ConversationDetail', { enquiryId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leads Feed</Text>
      <Text style={styles.subtitle}>Active customer conversations matching business SOPs</Text>

      {/* Filter Chips Bar */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Status:</Text>
        <View style={styles.filterRow}>
          {(['All', 'New', 'Qualified'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.chip,
                statusFilter === f ? styles.chipActive : styles.chipInactive
              ]}
              onPress={() => setStatusFilter(f)}
            >
              <Text style={[
                styles.chipText,
                statusFilter === f ? styles.chipTextActive : styles.chipTextInactive
              ]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Channel:</Text>
        <View style={styles.filterRow}>
          {(['All', 'WhatsApp', 'Email', 'Call'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.chip,
                channelFilter === f ? styles.chipActive : styles.chipInactive
              ]}
              onPress={() => setChannelFilter(f)}
            >
              <Text style={[
                styles.chipText,
                channelFilter === f ? styles.chipTextActive : styles.chipTextInactive
              ]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Leads List */}
      <FlatList
        data={filteredLeads}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            emoji="🔍"
            title="No Leads Found"
            description="No active leads match the selected filters. Change filters or try simulating a new enquiry on the Dashboard."
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
    marginBottom: theme.spacing.md,
  },
  filterSection: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.cardBg + '80',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
  },
  filterLabel: {
    fontSize: theme.typography.sizes.xs + 1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipInactive: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.cardBorder,
  },
  chipText: {
    fontSize: theme.typography.sizes.xs + 1,
    fontWeight: theme.typography.weights.semibold,
  },
  chipTextActive: {
    color: theme.colors.white,
  },
  chipTextInactive: {
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl * 2,
  },
});
export default LeadsScreen;
