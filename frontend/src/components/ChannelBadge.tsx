import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface ChannelBadgeProps {
  channel: 'whatsapp' | 'email' | 'call' | string;
}

export const ChannelBadge: React.FC<ChannelBadgeProps> = ({ channel }) => {
  const chan = channel.toLowerCase();
  let badgeColor = theme.colors.channels.whatsapp;
  let iconEmoji = '💬';

  if (chan === 'email') {
    badgeColor = theme.colors.channels.email;
    iconEmoji = '✉️';
  } else if (chan === 'call') {
    badgeColor = theme.colors.channels.call;
    iconEmoji = '📞';
  } else if (chan === 'whatsapp') {
    badgeColor = theme.colors.channels.whatsapp;
    iconEmoji = '💬';
  }

  return (
    <View style={[styles.badge, { backgroundColor: `${badgeColor}15`, borderColor: badgeColor }]}>
      <Text style={styles.emoji}>{iconEmoji}</Text>
      <Text style={[styles.text, { color: badgeColor }]}>
        {channel.charAt(0).toUpperCase() + channel.slice(1)}
      </Text>
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
  emoji: {
    fontSize: theme.typography.sizes.xs + 2,
    marginRight: theme.spacing.xs,
  },
  text: {
    fontSize: theme.typography.sizes.xs + 1,
    fontWeight: theme.typography.weights.semibold,
  },
});
export default ChannelBadge;
