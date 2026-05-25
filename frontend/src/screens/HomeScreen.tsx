import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { useApp } from '../context/AppContext';
import MetricSummary from '../components/MetricSummary';
import ChannelBadge from '../components/ChannelBadge';
import { formatTimeAgo } from '../components/LeadCard';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { enquiries, addEnquiry, resetState } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'call'>('whatsapp');
  const [message, setMessage] = useState('');

  // 1. Calculate KPI Metrics
  const totalLeads = enquiries.length;
  
  // Missed/unattended enquiries: Status is 'New'
  const missedEnquiries = enquiries.filter(e => e.status === 'New').length;
  
  // Open Escalations
  const openEscalations = enquiries.filter(e => e.status === 'Escalated').length;
  
  // Follow-ups due (not completed)
  const followUpsDue = enquiries.filter(e => e.followUpDue && !e.followUpDone).length;

  // 2. Aggregate recent timeline events across all enquiries for the Activity Feed
  const allEvents = enquiries.flatMap(enquiry => 
    enquiry.timeline.map(evt => ({
      ...evt,
      customerName: enquiry.customerName,
      enquiryId: enquiry.id,
      channel: enquiry.channel
    }))
  );
  
  // Sort events chronologically descending
  const recentActivities = allEvents
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const handleCreateEnquiry = () => {
    if (!name.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in customer name and message.');
      return;
    }
    addEnquiry(name, channel, message);
    setModalVisible(false);
    setName('');
    setMessage('');
    Alert.alert('Success', 'Enquiry simulated successfully!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Dashboard</Text>
      <Text style={styles.headerSubtitle}>Real-time customer communication tracking</Text>

      {/* KPI Grid */}
      <View style={styles.kpiGrid}>
        <MetricSummary 
          value={totalLeads} 
          label="Total Leads Today" 
          borderColor={theme.colors.primary} 
        />
        <MetricSummary 
          value={missedEnquiries} 
          label="Missed Enquiries" 
          borderColor={theme.colors.statuses.new} 
        />
        <MetricSummary 
          value={openEscalations} 
          label="Open Escalations" 
          borderColor={theme.colors.statuses.escalated} 
        />
        <MetricSummary 
          value={followUpsDue} 
          label="Follow-ups Due" 
          borderColor={theme.colors.channels.call} 
        />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.actionBtnText}>➕ Add Test Enquiry</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.cardBorder, borderWidth: 1 }]}
          onPress={() => {
            resetState();
            Alert.alert('Success', 'Mock database has been reset.');
          }}
        >
          <Text style={[styles.actionBtnText, { color: theme.colors.textPrimary }]}>🔄 Reset State</Text>
        </TouchableOpacity>
      </View>

      {/* Activity Feed */}
      <Text style={styles.sectionTitle}>Recent Activity Feed</Text>
      <View style={styles.activityFeed}>
        {recentActivities.length === 0 ? (
          <Text style={styles.emptyText}>No recent activity logs.</Text>
        ) : (
          recentActivities.map((act) => (
            <TouchableOpacity 
              key={act.id} 
              style={styles.activityItem}
              onPress={() => navigation.navigate('ConversationDetail', { enquiryId: act.enquiryId })}
            >
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityName}>{act.customerName}</Text>
                  <Text style={styles.activityTime}>{formatTimeAgo(act.timestamp)}</Text>
                </View>
                <Text style={styles.activityLog}>{act.logMessage}</Text>
                <View style={styles.activityFooter}>
                  <Text style={styles.activityStatus}>{act.statusUpdate}</Text>
                  <ChannelBadge channel={act.channel} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Simulator Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Simulate Inbound Enquiry</Text>
            
            <Text style={styles.label}>Customer Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Jane Doe"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Channel</Text>
            <View style={styles.channelRow}>
              {(['whatsapp', 'email', 'call'] as const).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.channelSelectBtn,
                    channel === c ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.background }
                  ]}
                  onPress={() => setChannel(c)}
                >
                  <Text style={styles.channelSelectText}>{c.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Message Text</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter customer message. SOPs match pricing, booking, support, info."
              placeholderTextColor={theme.colors.textMuted}
              multiline={true}
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={handleCreateEnquiry}
              >
                <Text style={styles.submitBtnText}>Simulate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.title,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginTop: theme.spacing.md,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.md,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  actionBtnText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.sm + 1,
  },
  activityFeed: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  activityName: {
    fontSize: theme.typography.sizes.sm + 1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  activityTime: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  activityLog: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityStatus: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.xs,
  },
  channelSelectBtn: {
    flex: 1,
    height: 38,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
  },
  channelSelectText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xs + 1,
    fontWeight: theme.typography.weights.bold,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  cancelBtn: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
  },
  cancelBtnText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
  },
  submitBtnText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
  },
});
export default HomeScreen;
