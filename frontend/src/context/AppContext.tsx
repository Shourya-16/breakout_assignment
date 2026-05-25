import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  statusUpdate: string;
  logMessage: string;
}

export interface Enquiry {
  id: string;
  customerName: string;
  channel: 'whatsapp' | 'email' | 'call';
  message: string;
  status: 'New' | 'Qualified' | 'Escalated';
  sopLabel?: string;
  suggestedResponse?: string;
  createdAt: string;
  escalationReason?: string;
  urgency?: 'High' | 'Medium' | 'Low';
  followUpDue?: string; // ISO String
  followUpTemplate?: string;
  followUpDone?: boolean;
  timeline: TimelineEvent[];
}

interface AppContextType {
  enquiries: Enquiry[];
  addEnquiry: (customerName: string, channel: 'whatsapp' | 'email' | 'call', message: string) => void;
  resolveEscalation: (id: string) => void;
  markFollowUpDone: (id: string) => void;
  scheduleFollowUp: (id: string, delayMinutes: number, template?: string) => void;
  escalateEnquiry: (id: string, reason: string) => void;
  resetState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_MOCK_DATA: Enquiry[] = [
  {
    id: '1',
    customerName: 'Alice Smith',
    channel: 'whatsapp',
    message: 'Hi, I am looking to get a price quote. How much do your SMB plans cost?',
    status: 'Qualified',
    sopLabel: 'Pricing Enquiry',
    suggestedResponse: 'Hi! Thanks for reaching out. Our standard package starts at $49/month, and our premium plan is $99/month. You can find our full pricing details at https://closira.com/pricing. Let me know if you would like to book a demo!',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    timeline: [
      { id: '1-1', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), statusUpdate: 'New', logMessage: 'Enquiry received via Whatsapp.' },
      { id: '1-2', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2000).toISOString(), statusUpdate: 'Qualified', logMessage: 'SOP matched: Pricing Enquiry. Suggested response generated.' }
    ]
  },
  {
    id: '2',
    customerName: 'Bob Johnson',
    channel: 'email',
    message: 'Hello, I want to book a slot for a meeting to discuss your standard onboarding procedures.',
    status: 'Qualified',
    sopLabel: 'Booking Enquiry',
    suggestedResponse: 'Hello! We would be happy to schedule a session for you. You can select a convenient time slot directly on our calendar: https://calendar.closira.com/booking. Looking forward to speaking with you!',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    followUpDue: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // due in 45 mins
    followUpTemplate: 'Hi Bob, checking in to confirm if you were able to book a calendar slot.',
    followUpDone: false,
    timeline: [
      { id: '2-1', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), statusUpdate: 'New', logMessage: 'Enquiry received via Email.' },
      { id: '2-2', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 1500).toISOString(), statusUpdate: 'Qualified', logMessage: 'SOP matched: Booking Enquiry. Suggested response generated.' },
      { id: '2-3', timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), statusUpdate: 'Follow-up Scheduled', logMessage: 'Follow-up task scheduled for Bob Johnson in 45 mins.' }
    ]
  },
  {
    id: '3',
    customerName: 'Charlie Brown',
    channel: 'call',
    message: 'My connection is broken, getting a database login error when I try to save. Help!',
    status: 'Escalated',
    escalationReason: 'System login error / Technical issue',
    urgency: 'High',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    timeline: [
      { id: '3-1', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), statusUpdate: 'New', logMessage: 'Call enquiry logged in system.' },
      { id: '3-2', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 3000).toISOString(), statusUpdate: 'Escalated', logMessage: 'No SOP matched keywords. System automatically escalated to human agent.' }
    ]
  },
  {
    id: '4',
    customerName: 'Diana Prince',
    channel: 'whatsapp',
    message: 'Hey there! I am just browsing around, having a lovely day.',
    status: 'Escalated',
    escalationReason: 'No SOP keywords matched',
    urgency: 'Medium',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    timeline: [
      { id: '4-1', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), statusUpdate: 'New', logMessage: 'Enquiry received via Whatsapp.' },
      { id: '4-2', timestamp: new Date(Date.now() - 30 * 60 * 1000 + 2000).toISOString(), statusUpdate: 'Escalated', logMessage: 'No matching SOP found. Automatically escalated to human agent.' }
    ]
  },
  {
    id: '5',
    customerName: 'Evan Wright',
    channel: 'whatsapp',
    message: 'Just registered. What services and features are included in Closira?',
    status: 'Qualified',
    sopLabel: 'General Info',
    suggestedResponse: 'Welcome to Closira! We are an AI-powered customer communication platform for SMBs, automating enquiries across WhatsApp, email, and calls. Learn more at https://closira.com/about.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    timeline: [
      { id: '5-1', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), statusUpdate: 'New', logMessage: 'Enquiry received via Whatsapp.' },
      { id: '5-2', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000 + 1000).toISOString(), statusUpdate: 'Qualified', logMessage: 'SOP matched: General Info. Suggested response generated.' }
    ]
  },
  {
    id: '6',
    customerName: 'Fiona Gallagher',
    channel: 'email',
    message: 'I have a question about my invoice from last month. Need billing help.',
    status: 'New',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
    timeline: [
      { id: '6-1', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), statusUpdate: 'New', logMessage: 'Enquiry received via Email.' }
    ]
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(INITIAL_MOCK_DATA);

  // Client-side SOP Keyword Matching rules (mimicking backend)
  const performSopMatching = (message: string) => {
    const msg = message.toLowerCase();
    
    // 1. Pricing
    if (['price', 'cost', 'how much', 'pricing', 'rate', 'quote', 'charge', 'payment'].some(kw => msg.includes(kw))) {
      return {
        status: 'Qualified' as const,
        sopLabel: 'Pricing Enquiry',
        suggestedResponse: 'Hi! Thanks for reaching out. Our standard package starts at $49/month, and our premium plan is $99/month. You can find our full pricing details at https://closira.com/pricing. Let me know if you would like to book a demo!'
      };
    }
    // 2. Booking
    if (['book', 'reserve', 'booking', 'appointment', 'schedule', 'slot', 'meeting', 'call'].some(kw => msg.includes(kw))) {
      return {
        status: 'Qualified' as const,
        sopLabel: 'Booking Enquiry',
        suggestedResponse: 'Hello! We would be happy to schedule a session for you. You can select a convenient time slot directly on our calendar: https://calendar.closira.com/booking. Looking forward to speaking with you!'
      };
    }
    // 3. Support
    if (['help', 'support', 'broken', 'issue', 'error', 'problem', 'bug', 'fail', 'not working', 'crash'].some(kw => msg.includes(kw))) {
      return {
        status: 'Support Request' as const, // will map to Qualified/Escalated, let's treat it as qualified
        sopLabel: 'Support Request',
        suggestedResponse: 'We\'re sorry to hear you\'re experiencing issues. A support ticket has been created, and our technical team will investigate this within the next hour. You can check updates on your ticket using our support portal.'
      };
    }
    // 4. General Info
    if (['info', 'information', 'about', 'features', 'what is', 'closira', 'services', 'product'].some(kw => msg.includes(kw))) {
      return {
        status: 'Qualified' as const,
        sopLabel: 'General Info',
        suggestedResponse: 'Welcome to Closira! We are an AI-powered customer communication platform for SMBs, automating enquiries across WhatsApp, email, and calls. Learn more at https://closira.com/about.'
      };
    }

    return null;
  };

  const addEnquiry = (customerName: string, channel: 'whatsapp' | 'email' | 'call', message: string) => {
    const newId = String(enquiries.length + 1);
    const now = new Date().toISOString();
    
    // Match SOP client-side to mimic backend
    const match = performSopMatching(message);
    
    let newEnquiry: Enquiry = {
      id: newId,
      customerName,
      channel,
      message,
      status: 'New',
      createdAt: now,
      timeline: [
        { id: `${newId}-1`, timestamp: now, statusUpdate: 'New', logMessage: `Enquiry received via ${channel.charAt(0).toUpperCase() + channel.slice(1)}.` }
      ]
    };

    if (match) {
      newEnquiry.status = 'Qualified';
      newEnquiry.sopLabel = match.sopLabel;
      newEnquiry.suggestedResponse = match.suggestedResponse;
      newEnquiry.timeline.push({
        id: `${newId}-2`,
        timestamp: new Date(Date.now() + 1000).toISOString(),
        statusUpdate: 'Qualified',
        logMessage: `SOP matched: ${match.sopLabel}. Automatic suggested response prepared.`
      });
    } else {
      newEnquiry.status = 'Escalated';
      newEnquiry.escalationReason = 'No SOP keywords matched';
      newEnquiry.urgency = 'High';
      newEnquiry.timeline.push({
        id: `${newId}-2`,
        timestamp: new Date(Date.now() + 1000).toISOString(),
        statusUpdate: 'Escalated',
        logMessage: 'No matching SOP found. Automatically escalated to human agent.'
      });
    }

    setEnquiries(prev => [newEnquiry, ...prev]);
  };

  const resolveEscalation = (id: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === id) {
        const now = new Date().toISOString();
        return {
          ...item,
          status: 'Qualified',
          urgency: undefined,
          timeline: [
            ...item.timeline,
            { id: `${id}-resolve-${Date.now()}`, timestamp: now, statusUpdate: 'Qualified', logMessage: 'Escalation resolved by human agent. Status marked as Qualified.' }
          ]
        };
      }
      return item;
    }));
  };

  const markFollowUpDone = (id: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === id) {
        const now = new Date().toISOString();
        return {
          ...item,
          followUpDone: true,
          timeline: [
            ...item.timeline,
            { id: `${id}-done-${Date.now()}`, timestamp: now, statusUpdate: 'Follow-up Completed', logMessage: 'Follow-up marked as Done.' }
          ]
        };
      }
      return item;
    }));
  };

  const scheduleFollowUp = (id: string, delayMinutes: number, template?: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === id) {
        const now = new Date().toISOString();
        const dueTime = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
        const templateMsg = template || 'Follow-up check-in';
        return {
          ...item,
          followUpDue: dueTime,
          followUpTemplate: templateMsg,
          followUpDone: false,
          timeline: [
            ...item.timeline,
            { id: `${id}-sched-${Date.now()}`, timestamp: now, statusUpdate: 'Follow-up Scheduled', logMessage: `Follow-up scheduled in ${delayMinutes} minutes. Template: "${templateMsg}"` }
          ]
        };
      }
      return item;
    }));
  };

  const escalateEnquiry = (id: string, reason: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === id) {
        const now = new Date().toISOString();
        return {
          ...item,
          status: 'Escalated',
          escalationReason: reason,
          urgency: 'Medium',
          timeline: [
            ...item.timeline,
            { id: `${id}-escalate-${Date.now()}`, timestamp: now, statusUpdate: 'Escalated', logMessage: `Manually escalated to human agent. Reason: ${reason}` }
          ]
        };
      }
      return item;
    }));
  };

  const resetState = () => {
    setEnquiries(INITIAL_MOCK_DATA);
  };

  return (
    <AppContext.Provider value={{
      enquiries,
      addEnquiry,
      resolveEscalation,
      markFollowUpDone,
      scheduleFollowUp,
      escalateEnquiry,
      resetState
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
