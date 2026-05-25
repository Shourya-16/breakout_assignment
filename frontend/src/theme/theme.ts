export const theme = {
  colors: {
    background: '#0B0F19',
    cardBg: '#161F30',
    cardBorder: '#233554',
    primary: '#6366F1', // Indigo
    primaryHover: '#4F46E5',
    textPrimary: '#F3F4F6',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    white: '#FFFFFF',
    divider: '#1F2937',
    
    // Channel mapping
    channels: {
      whatsapp: '#10B981', // Green
      email: '#3B82F6',    // Blue
      call: '#F59E0B',     // Amber
    },

    // Status mapping
    statuses: {
      new: '#3B82F6',      // Blue
      qualified: '#10B981',// Green
      escalated: '#EF4444',// Red
    },

    // Urgency levels
    urgency: {
      high: '#EF4444',
      medium: '#F59E0B',
      low: '#10B981',
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 22,
      title: 26,
    },
    weights: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    }
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    round: 9999,
  }
};
