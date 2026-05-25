import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import StatusBadge from './StatusBadge';
import ChannelBadge from './ChannelBadge';

interface LeadCardProps {
  customerName: string;
  channel: 'whatsapp' | 'email' | 'call';
  message: string;
  status: 'New' | 'Qualified' | 'Escalated';
  createdAt: string;
  onPress: () => void;
}

// Simple time-ago formatter helper
export const formatTimeAgo = (isoString: string) => {
  try {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch (e) {
    return 'some time ago';
  }
};

export const LeadCard: React.FC<LeadCardProps> = ({
  customerName,
  channel,
  message,
  status,
  createdAt,
  onPress,
}) => {
  // Truncate message for preview
  const truncatedMessage = message.length > 85 ? `${message.substring(0, 85)}...` : message;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.header}>
        <Text style={styles.name}>{customerName}</Text>
        <Text style={styles.time}>{formatTimeAgo(createdAt)}</Text>
      </View>
      
      <Text style={styles.messagePreview}>{truncatedMessage}</Text>
      
      <View style={styles.footer}>
        <ChannelBadge channel={channel} />
        <StatusBadge status={status} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.sizes.md + 1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  time: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  messagePreview: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: theme.spacing.sm,
  },
});
export default LeadCard;
