import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { useApp } from '../context/AppContext';
import ChannelBadge from '../components/ChannelBadge';
import StatusBadge from '../components/StatusBadge';

export const ConversationDetailScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { enquiryId } = route.params;
  const { enquiries, resolveEscalation, scheduleFollowUp, escalateEnquiry } = useApp();
  
  const [followUpModalVisible, setFollowUpModalVisible] = useState(false);
  const [escalateModalVisible, setEscalateModalVisible] = useState(false);
  const [delay, setDelay] = useState('30');
  const [template, setTemplate] = useState('');
  const [escalateReason, setEscalateReason] = useState('');

  const enquiry = enquiries.find(e => e.id === enquiryId);

  if (!enquiry) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Enquiry not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Generate realistic AI summary text based on enquiry state
  const getAiSummary = () => {
    if (enquiry.status === 'Escalated') {
      return `CRITICAL: customer is reporting "${enquiry.escalationReason || 'an issue'}". No automatic SOP matched. Action needed: manual agent follow-up via ${enquiry.channel.toUpperCase()}.`;
    }
    if (enquiry.sopLabel === 'Pricing Enquiry') {
      return `LEAD CONVERSION: Customer is inquiring about product pricing & plans. Closira matched the Pricing SOP and suggested standard tier options. Follow-up is recommended to qualify discount opportunities.`;
    }
    if (enquiry.sopLabel === 'Booking Enquiry') {
      return `SCHEDULING: Customer requested booking details. Closira matched the Booking SOP and shared the calendar scheduling portal. Awaiting calendar slot booking confirmation.`;
    }
    if (enquiry.sopLabel === 'Support Request') {
      return `SUPPORT TICKET: Customer reported a technical issue. Closira matched the Support SOP, created a backend ticket, and instructed customer on checking logs.`;
    }
    return `INBOUND QUERY: Customer sent a message via ${enquiry.channel}. Closira has recorded the lead. Awaiting classification updates.`;
  };

  const handleResolve = () => {
    resolveEscalation(enquiry.id);
    Alert.alert('Success', 'Escalation resolved!');
  };

  const handleScheduleFollowUp = () => {
    const delayMins = parseInt(delay);
    if (isNaN(delayMins) || delayMins <= 0) {
      Alert.alert('Error', 'Please enter a valid positive number of minutes.');
      return;
    }
    scheduleFollowUp(enquiry.id, delayMins, template);
    setFollowUpModalVisible(false);
    setDelay('30');
    setTemplate('');
    Alert.alert('Success', `Follow-up scheduled in ${delayMins} minutes.`);
  };

  const handleManualEscalate = () => {
    if (!escalateReason.trim()) {
      Alert.alert('Error', 'Please enter a reason for escalation.');
      return;
    }
    escalateEnquiry(enquiry.id, escalateReason);
    setEscalateModalVisible(false);
    setEscalateReason('');
    Alert.alert('Success', 'Enquiry escalated to human agent.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.iconBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{ width: 60 }} /> {/* balance layout */}
      </View>

      {/* Customer Info Card */}
      <View style={styles.customerCard}>
        <View style={styles.customerRow}>
          <Text style={styles.customerName}>{enquiry.customerName}</Text>
          <StatusBadge status={enquiry.status} />
        </View>
        <View style={styles.channelRow}>
          <ChannelBadge channel={enquiry.channel} />
          <Text style={styles.timestampText}>
            Received: {new Date(enquiry.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Message Content */}
      <Text style={styles.sectionTitle}>Inbound Message</Text>
      <View style={styles.messageBox}>
        <Text style={styles.messageContentText}>{enquiry.message}</Text>
      </View>

      {/* SOP Suggested Response Block */}
      {enquiry.suggestedResponse ? (
        <>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Suggested AI Response</Text>
            <View style={styles.sopLabelBadge}>
              <Text style={styles.sopLabelText}>{enquiry.sopLabel}</Text>
            </View>
          </View>
          <View style={[styles.messageBox, styles.aiResponseBox]}>
            <Text style={styles.messageContentText}>{enquiry.suggestedResponse}</Text>
          </View>
        </>
      ) : null}

      {/* AI Summary Block */}
      <Text style={styles.sectionTitle}>AI Case Summary</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{getAiSummary()}</Text>
      </View>

      {/* Historical Status Timeline */}
      <Text style={styles.sectionTitle}>Status Timeline & Logs</Text>
      <View style={styles.timelineContainer}>
        {enquiry.timeline.map((evt, idx) => (
          <View key={evt.id} style={styles.timelineRow}>
            <View style={styles.timelineLeft}>
              <View style={[
                styles.timelineDot,
                idx === enquiry.timeline.length - 1 ? styles.timelineDotActive : null
              ]} />
              {idx < enquiry.timeline.length - 1 ? <View style={styles.timelineLine} /> : null}
            </View>
            <View style={styles.timelineRight}>
              <View style={styles.timelineHeader}>
                <Text style={styles.timelineStatus}>{evt.statusUpdate}</Text>
                <Text style={styles.timelineTime}>
                  {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.timelineLog}>{evt.logMessage}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons Panel */}
      <View style={styles.actionPanel}>
        {enquiry.status === 'Escalated' ? (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.colors.statuses.qualified }]}
            onPress={handleResolve}
          >
            <Text style={styles.actionBtnText}>✓ Resolve Escalation</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.colors.statuses.escalated, marginBottom: theme.spacing.md }]}
            onPress={() => setEscalateModalVisible(true)}
          >
            <Text style={styles.actionBtnText}>⚠ Escalate to Agent</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => setFollowUpModalVisible(true)}
        >
          <Text style={styles.actionBtnText}>⏰ Schedule Follow-up</Text>
        </TouchableOpacity>
      </View>

      {/* Follow-up Scheduling Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={followUpModalVisible}
        onRequestClose={() => setFollowUpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Follow-up</Text>
            
            <Text style={styles.modalLabel}>Delay (Minutes)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={delay}
              onChangeText={setDelay}
            />

            <Text style={styles.modalLabel}>Message Template (Optional)</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="e.g. Hi customer, checking back on the details shared."
              placeholderTextColor={theme.colors.textMuted}
              multiline={true}
              numberOfLines={3}
              value={template}
              onChangeText={setTemplate}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setFollowUpModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSubmitBtn]}
                onPress={handleScheduleFollowUp}
              >
                <Text style={styles.modalSubmitBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Escalate Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={escalateModalVisible}
        onRequestClose={() => setEscalateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escalate to Human Agent</Text>
            
            <Text style={styles.modalLabel}>Reason for Escalation</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="e.g. Customer demands to speak with a human manager immediately."
              placeholderTextColor={theme.colors.textMuted}
              multiline={true}
              numberOfLines={3}
              value={escalateReason}
              onChangeText={setEscalateReason}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setEscalateModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSubmitBtn, { backgroundColor: theme.colors.statuses.escalated }]}
                onPress={handleManualEscalate}
              >
                <Text style={styles.modalSubmitBtnText}>Escalate</Text>
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
  errorContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.lg,
    marginBottom: theme.spacing.lg,
  },
  backBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  backBtnText: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  iconBackBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
  },
  iconBackText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.sm,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  customerCard: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  customerName: {
    fontSize: theme.typography.sizes.lg + 1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timestampText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sopLabelBadge: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  sopLabelText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  messageBox: {
    backgroundColor: theme.colors.cardBg + '50',
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  aiResponseBox: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '05',
  },
  messageContentText: {
    fontSize: theme.typography.sizes.sm + 1,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  summaryBox: {
    backgroundColor: '#1E293B',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderColor: '#334155',
    borderWidth: 1,
  },
  summaryText: {
    fontSize: theme.typography.sizes.sm,
    color: '#CBD5E1',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  timelineContainer: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.textMuted,
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: theme.colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: theme.spacing.lg,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineStatus: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  timelineTime: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  timelineLog: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  actionPanel: {
    marginBottom: theme.spacing.xxl * 2,
  },
  actionBtn: {
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.sm + 1,
  },
  // Modal Styles
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
  modalLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
  },
  modalTextArea: {
    height: 70,
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
  modalCancelBtn: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
  },
  modalCancelBtnText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold,
  },
  modalSubmitBtn: {
    backgroundColor: theme.colors.primary,
  },
  modalSubmitBtnText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
  },
});
export default ConversationDetailScreen;
