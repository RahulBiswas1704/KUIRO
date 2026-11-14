'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Smartphone,
  Instagram,
  Mail,
  Share2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Bot,
  User,
  Users,
  ShieldCheck,
  Tag,
  AlertCircle,
  Play,
  Pause,
  CornerDownRight,
  Plus,
  Sliders,
  BarChart3,
  PhoneCall,
  Calendar,
  DollarSign,
  TrendingUp,
  Zap,
  ArrowRight,
  Lock,
  Eye,
  Check,
  Building2,
  FileText,
  Paperclip,
  Smile,
  ChevronDown,
  X
} from 'lucide-react';
import {
  ConversationChannel,
  ConversationStatus,
  ConversationPriority,
  Conversation,
  InboxMessage,
  TeamMember,
  AutomationFlowRule,
  InboxAnalyticsSummary
} from '@/types';

// Mock Team Members
const teamMembers: TeamMember[] = [
  {
    id: 'agent-1',
    name: 'Rajesh Sharma',
    email: 'rajesh@sharmaheritage.in',
    role: 'specialist',
    avatar: 'RS',
    isOnline: true,
    activeChatsCount: 4,
  },
  {
    id: 'agent-2',
    name: 'Priya Patel',
    email: 'priya@sharmaheritage.in',
    role: 'sales',
    avatar: 'PP',
    isOnline: true,
    activeChatsCount: 6,
  },
  {
    id: 'agent-3',
    name: 'Amit Sen',
    email: 'support@sharmaheritage.in',
    role: 'receptionist',
    avatar: 'AS',
    isOnline: false,
    activeChatsCount: 2,
  },
  {
    id: 'agent-ai',
    name: 'KUIRO AI Co-Pilot',
    email: 'bot@kuiro.in',
    role: 'ai_bot',
    avatar: 'AI',
    isOnline: true,
    activeChatsCount: 18,
  },
];

// Initial Multi-Channel Conversations
const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    workspaceId: 'ws-demo',
    customerName: 'Ananya Mukherjee',
    customerHandle: '+91 98312 44589',
    channel: 'whatsapp',
    status: 'open',
    priority: 'high',
    unreadCount: 1,
    lastMessage: 'Can I order 3 bespoke Banarasi silk dupattas from the new catalogue for immediate delivery?',
    lastMessageTime: '10:42 AM',
    assignedTo: 'agent-2',
    tags: ['Artisanal Silks', 'VIP Buyer', 'Festive Order'],
    sentiment: 'positive',
    campaignAttribution: {
      campaignName: 'Diwali Festive Prosperity & Heritage Weaves Broadcast',
      triggerDate: 'Nov 8, 2026',
      channel: 'whatsapp',
    },
    crmData: {
      phone: '+91 98312 44589',
      email: 'ananya.m@gmail.com',
      city: 'Kolkata, Salt Lake',
      totalSpend: '₹14,500',
      patientOrClientType: 'VIP Retail Buyer',
      lastVisitDate: 'October 12, 2026',
      notes: 'Interested in bespoke pure silk Banarasi dupattas for wedding season. Very prompt on WhatsApp.',
    },
    messages: [
      {
        id: 'm1',
        conversationId: 'conv-1',
        channel: 'whatsapp',
        sender: 'customer',
        senderName: 'Ananya Mukherjee',
        content: 'Hello! I saw your festive handloom campaign message on WhatsApp about the new zari collection. Are bespoke orders still open?',
        timestamp: '10:35 AM',
        status: 'read',
      },
      {
        id: 'm2',
        conversationId: 'conv-1',
        channel: 'whatsapp',
        sender: 'ai_bot',
        senderName: 'KUIRO AI Co-Pilot',
        content: 'Namaste Ananya! 🙏 Yes, our festive artisanal handloom collection is open for orders! We offer bespoke color customization and express dispatch across India. Would you like us to share our digital lookbook?',
        timestamp: '10:36 AM',
        status: 'read',
        aiGenerated: true,
      },
      {
        id: 'm3',
        conversationId: 'conv-1',
        channel: 'whatsapp',
        sender: 'agent',
        senderName: 'Priya Patel',
        content: '@Rajesh Sharma, Ananya previously ordered handloom stoles. Shall I block the 3 bespoke pieces for her?',
        timestamp: '10:38 AM',
        isInternalNote: true,
      },
      {
        id: 'm4',
        conversationId: 'conv-1',
        channel: 'whatsapp',
        sender: 'customer',
        senderName: 'Ananya Mukherjee',
        content: 'Can I order 3 bespoke Banarasi silk dupattas from the new catalogue for immediate delivery?',
        timestamp: '10:42 AM',
        status: 'read',
      },
    ],
  },
  {
    id: 'conv-2',
    workspaceId: 'ws-demo',
    customerName: 'Rohit Verma',
    customerHandle: '@rohit_founder',
    channel: 'instagram',
    status: 'open',
    priority: 'urgent',
    unreadCount: 2,
    lastMessage: 'Hey! We love your advisory masterclass. Do you have slots open for Q2 founder coaching?',
    lastMessageTime: '10:15 AM',
    assignedTo: 'agent-1',
    tags: ['Founder Advisory', 'Growth Masterclass', 'High Priority'],
    sentiment: 'urgent',
    campaignAttribution: {
      campaignName: 'Instagram Reel: 3 Scalable Growth Principles',
      triggerDate: 'Nov 6, 2026',
      channel: 'instagram',
    },
    crmData: {
      phone: '+91 97110 32890',
      email: 'rohit@fitlife.co',
      city: 'Delhi NCR / South Ext',
      totalSpend: '₹0 (New Lead)',
      patientOrClientType: 'Growth Stage Founder',
      lastVisitDate: 'First Inquiry',
      notes: 'Series-A founder looking for strategic quarterly advisory and sprint mentoring.',
    },
    messages: [
      {
        id: 'm20',
        conversationId: 'conv-2',
        channel: 'instagram',
        sender: 'customer',
        senderName: 'Rohit Verma',
        content: 'Hey! We love your advisory masterclass. Do you have slots open for Q2 founder coaching?',
        timestamp: '10:15 AM',
        status: 'read',
      },
      {
        id: 'm21',
        conversationId: 'conv-2',
        channel: 'instagram',
        sender: 'ai_bot',
        senderName: 'KUIRO AI Co-Pilot',
        content: 'Hi Rohit! Thank you for following our work. Yes, our Q2 advisory sprint has 2 founder slots open. Please share your current ARR and core growth bottleneck so we can send the syllabus and onboarding deck!',
        timestamp: '10:16 AM',
        status: 'delivered',
        aiGenerated: true,
      },
      {
        id: 'm22',
        conversationId: 'conv-2',
        channel: 'instagram',
        sender: 'agent',
        senderName: 'Arjun Sen',
        content: 'Flagged for initial screening call. Sending the syllabus deck.',
        timestamp: '10:18 AM',
        isInternalNote: true,
      },
    ],
  },
  {
    id: 'conv-3',
    workspaceId: 'ws-demo',
    customerName: 'Meera Deshmukh',
    customerHandle: 'meera.deshmukh@tcs.com',
    channel: 'email',
    status: 'waiting',
    priority: 'normal',
    unreadCount: 0,
    lastMessage: 'Thank you for sending the corporate wholesale pricing proposal. We will review it in our committee on Monday.',
    lastMessageTime: '09:20 AM',
    assignedTo: 'agent-2',
    tags: ['Corporate Plan', 'B2B Wholesale', 'Corporate Gifting'],
    sentiment: 'positive',
    campaignAttribution: {
      campaignName: 'Corporate Gifting & Wholesale Catalogue Newsletter #42',
      triggerDate: 'Nov 4, 2026',
      channel: 'email',
    },
    crmData: {
      phone: '+91 98200 81123',
      email: 'meera.deshmukh@tcs.com',
      city: 'Mumbai, BKC',
      totalSpend: '₹1,20,000 (Group Deal)',
      patientOrClientType: 'Corporate Partner HR',
      lastVisitDate: 'Quarterly Check',
      notes: 'HR lead for 250 executive corporate festive gifting hampers.',
    },
    messages: [
      {
        id: 'm30',
        conversationId: 'conv-3',
        channel: 'email',
        sender: 'customer',
        senderName: 'Meera Deshmukh',
        content: 'Dear Rajesh & Team, We received your festive corporate gifting catalogue. Could you provide a proposal and volume quote for 250 bespoke gift sets for our annual gala?',
        timestamp: 'Yesterday 3:45 PM',
        status: 'read',
      },
      {
        id: 'm31',
        conversationId: 'conv-3',
        channel: 'email',
        sender: 'agent',
        senderName: 'Priya Patel',
        content: 'Dear Meera, Thank you for reaching out! Attached is our customized corporate gifting proposal with premium artisan presentation boxes and tiered volume discounts for 250 units.',
        timestamp: 'Yesterday 5:10 PM',
        status: 'read',
      },
      {
        id: 'm32',
        conversationId: 'conv-3',
        channel: 'email',
        sender: 'customer',
        senderName: 'Meera Deshmukh',
        content: 'Thank you for sending the corporate wholesale pricing proposal. We will review it in our committee on Monday.',
        timestamp: '09:20 AM',
        status: 'read',
      },
    ],
  },
  {
    id: 'conv-4',
    workspaceId: 'ws-demo',
    customerName: 'Vikramaditya Rao',
    customerHandle: 'm.me/vikram.aditya.rao',
    channel: 'messenger',
    status: 'resolved',
    priority: 'normal',
    unreadCount: 0,
    lastMessage: 'Awesome, studio visiting hours noted. See you on Wednesday!',
    lastMessageTime: 'Yesterday',
    assignedTo: 'agent-3',
    tags: ['Showroom Visit', 'Timing Inquiry', 'Resolved'],
    sentiment: 'neutral',
    campaignAttribution: {
      campaignName: 'Facebook Showcase: Handcrafted Heritage Weaves',
      triggerDate: 'Nov 2, 2026',
      channel: 'facebook',
    },
    crmData: {
      phone: '+91 99401 12093',
      email: 'vikram.rao@outlook.com',
      city: 'Bangalore, Indiranagar',
      totalSpend: '₹18,500',
      patientOrClientType: 'Direct Consumer / Studio Visitor',
      lastVisitDate: 'August 14, 2026',
      notes: 'Inquired about artisan handloom collections and private showroom styling hours.',
    },
    messages: [
      {
        id: 'm40',
        conversationId: 'conv-4',
        channel: 'messenger',
        sender: 'customer',
        senderName: 'Vikramaditya Rao',
        content: 'Hi, is your design studio open on national holidays? Would love to drop by to view your handloom collection in person.',
        timestamp: 'Yesterday 11:00 AM',
        status: 'read',
      },
      {
        id: 'm41',
        conversationId: 'conv-4',
        channel: 'messenger',
        sender: 'agent',
        senderName: 'Amit Sen',
        content: 'Hello Vikram! Yes, our flagship studio and showroom are open on all major holidays from 10:00 AM to 6:00 PM. We look forward to welcoming you!',
        timestamp: 'Yesterday 11:05 AM',
        status: 'read',
      },
      {
        id: 'm42',
        conversationId: 'conv-4',
        channel: 'messenger',
        sender: 'customer',
        senderName: 'Vikramaditya Rao',
        content: 'Awesome, studio visiting hours noted. See you guys on Wednesday!',
        timestamp: 'Yesterday 11:08 AM',
        status: 'read',
      },
    ],
  },
];

// Mock Automation & Smart Routing Rules
const initialAutomationRules: AutomationFlowRule[] = [
  {
    id: 'rule-1',
    name: 'Off-Hours Empathy & Store Link',
    description: 'When message arrives between 8:00 PM and 8:30 AM IST on WhatsApp or Instagram',
    triggerType: 'OFF_HOURS',
    channel: 'all',
    conditions: 'Time outside business operating hours (Mon-Sat 9AM-8PM)',
    actions: [
      { type: 'AUTO_REPLY', payload: 'Thank you for reaching out! Our studio team is currently offline, but we will be back at 9:00 AM. For immediate catalogue browsing or orders, visit: sharmaheritage.in/shop' },
      { type: 'APPLY_TAG', payload: 'Off-Hours Inquiry' },
    ],
    enabled: true,
    triggerCount: 142,
  },
  {
    id: 'rule-2',
    name: 'High-Intent Bulk & Wholesale Lead Qualification',
    description: 'Triggers when client mentions bulk, wholesale, corporate gifting, or custom orders',
    triggerType: 'KEYWORD',
    channel: 'all',
    keywords: ['bulk', 'wholesale', 'quote', 'custom', 'order', 'pricing', 'catalogue', 'corporate'],
    conditions: 'Message contains high-value B2B or wholesale purchase keywords',
    actions: [
      { type: 'ROUTE_SPECIALIST', payload: 'Rajesh Sharma' },
      { type: 'APPLY_TAG', payload: 'High-Intent B2B Lead' },
      { type: 'AUTO_REPLY', payload: 'Thank you for your interest! We offer dedicated volume pricing and bespoke orders. Would you like us to share our wholesale catalogue and terms?' },
    ],
    enabled: true,
    triggerCount: 89,
  },
  {
    id: 'rule-3',
    name: 'Diwali & Festival Campaign Responder',
    description: 'Automatically tags and prioritizes inbound replies from WhatsApp festival broadcasts',
    triggerType: 'CAMPAIGN_REPLY',
    channel: 'whatsapp',
    conditions: 'Customer replies within 48h of an active broadcast campaign',
    actions: [
      { type: 'APPLY_TAG', payload: 'Festive Broadcast Lead' },
      { type: 'ASSIGN_AGENT', payload: 'Priya Patel' },
    ],
    enabled: true,
    triggerCount: 64,
  },
  {
    id: 'rule-4',
    name: 'Priority Support & Delivery Triage',
    description: 'Immediately escalates delivery, tracking, damage, or urgent order issues to Priority: URGENT',
    triggerType: 'KEYWORD',
    channel: 'all',
    keywords: ['urgent', 'delay', 'tracking', 'damage', 'return', 'delivery', 'refund', 'missing'],
    conditions: 'Customer reports order delay, damage, or time-sensitive request',
    actions: [
      { type: 'ROUTE_SPECIALIST', payload: 'Priya Patel' },
      { type: 'APPLY_TAG', payload: 'URGENT Support' },
    ],
    enabled: true,
    triggerCount: 31,
  },
];

export default function UnifiedInboxPage() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'inbox' | 'automations' | 'contacts' | 'analytics'>('inbox');
  const [channelFilter, setChannelFilter] = useState<'all' | ConversationChannel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ConversationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Conversations State
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConvId, setSelectedConvId] = useState<string>(initialConversations[0].id);

  // Sync with live Neon PostgreSQL Database & Meta WhatsApp Webhook
  useEffect(() => {
    fetch('/api/inbox/conversations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.conversations && data.conversations.length > 0) {
          const dbConvs: Conversation[] = data.conversations;
          const dbIds = new Set(dbConvs.map((c) => c.id));
          const filteredInitial = initialConversations.filter((c) => !dbIds.has(c.id));
          setConversations([...dbConvs, ...filteredInitial]);
          if (dbConvs.length > 0) {
            setSelectedConvId(dbConvs[0].id);
          }
        }
      })
      .catch((err) => console.warn('[Inbox Fetch Error]', err));
  }, []);

  // Message Input State
  const [replyMode, setReplyMode] = useState<'customer' | 'internal'>('customer');
  const [messageText, setMessageText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);

  // Automation Rules State
  const [rules, setRules] = useState<AutomationFlowRule[]>(initialAutomationRules);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesChannel = channelFilter === 'all' || c.channel === channelFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesChannel && matchesStatus && matchesSearch;
  });

  // Send Message / Add Internal Note Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const currentText = messageText.trim();
    const isInternal = replyMode === 'internal';

    const newMessage: InboxMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversation.id,
      channel: activeConversation.channel,
      sender: 'agent',
      senderName: isInternal ? 'Rajesh Sharma (Internal)' : 'Sharma Heritage Studio',
      content: currentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInternalNote: isInternal,
      status: 'sent',
    };

    // Optimistic UI update
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            lastMessage: isInternal ? `[Internal Note]: ${currentText}` : currentText,
            lastMessageTime: 'Just now',
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      })
    );

    setMessageText('');
    showToast(isInternal ? 'Internal team note added!' : 'Reply dispatched to customer!');

    // Persist to Neon PostgreSQL & trigger real WhatsApp / Email outbound delivery
    try {
      await fetch('/api/inbox/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          content: currentText,
          isInternalNote: isInternal,
          senderName: isInternal ? 'Rajesh Sharma (Internal)' : 'Sharma Heritage Studio',
        }),
      });
    } catch (err) {
      console.warn('[Inbox Reply Delivery Error]:', err);
    }
  };

  // Live Google Gemini 3.5 Flash Lite Brand Brain AI Suggestion
  const handleGenerateAiReply = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/inbox/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: activeConversation.customerName,
          lastMessage: activeConversation.lastMessage,
          channel: activeConversation.channel,
          brandName: 'Sharma Heritage Handlooms & Retail',
        }),
      });
      const data = await res.json();
      if (data.suggestion) {
        setMessageText(data.suggestion);
        setReplyMode('customer');
        showToast('AI suggestion generated via Google Gemini!');
      } else {
        throw new Error('No suggestion generated');
      }
    } catch {
      let suggested = '';
      if (activeConversation.id === 'conv-1') {
        suggested = `Namaste ${activeConversation.customerName}! We would love to welcome you this Saturday at our flagship studio. We have reserved the preview slot and will send you location directions!`;
      } else {
        suggested = `Hello ${activeConversation.customerName}, thank you for reaching out to Sharma Heritage! Our customer care team has received your message and will assist you immediately.`;
      }
      setMessageText(suggested);
      setReplyMode('customer');
      showToast('AI suggestion loaded from Brand Brain guidelines!');
    } finally {
      setAiGenerating(false);
    }
  };

  // Assign Team Member
  const handleAssignMember = (agentId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, assignedTo: agentId } : c))
    );
    const member = teamMembers.find((m) => m.id === agentId);
    showToast(`Conversation assigned to ${member?.name || 'team member'}`);
  };

  // Update Status
  const handleUpdateStatus = (newStatus: ConversationStatus) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, status: newStatus } : c))
    );
    showToast(`Conversation status marked as ${newStatus.toUpperCase()}`);
  };

  // Toggle Automation Rule
  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
    showToast('Automation rule status updated!');
  };

  // Quick Snippet Insert
  const handleInsertSnippet = (snippet: string) => {
    setMessageText((prev) => (prev ? `${prev} ${snippet}` : snippet));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-inter text-[#0B0F14]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B0F14] text-white px-4 py-3 rounded-[12px] shadow-2xl border border-white/10 flex items-center gap-2.5 animate-scale-up text-xs font-medium">
          <CheckCircle2 size={16} className="text-[#FF7A00]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E5E7EB] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF7A00] text-[10px] font-bold">
              Shared Team Workspace
            </span>
            <span className="text-xs text-gray-500">
              WhatsApp • Instagram • Messenger • Email
            </span>
          </div>
          <h1 className="font-sora text-xl md:text-2xl font-bold text-[#0B0F14] mt-1">
            Unified Customer Conversations Hub
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Reply faster, automate routine FAQs with Brand Brain AI, collaborate with internal notes, and track campaign ROI.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-gray-100 p-1 rounded-[12px] border border-gray-200 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3.5 py-1.5 rounded-[9px] text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'inbox'
                ? 'bg-white text-[#0B0F14] shadow-sm'
                : 'text-gray-600 hover:text-[#0B0F14]'
            }`}
          >
            <MessageSquare size={14} className={activeTab === 'inbox' ? 'text-[#FF7A00]' : ''} />
            <span>Live Inbox</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#FF7A00] text-white text-[10px] font-mono">
              {conversations.filter((c) => c.status === 'open').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('automations')}
            className={`px-3.5 py-1.5 rounded-[9px] text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'automations'
                ? 'bg-white text-[#0B0F14] shadow-sm'
                : 'text-gray-600 hover:text-[#0B0F14]'
            }`}
          >
            <Zap size={14} className={activeTab === 'automations' ? 'text-[#FF7A00]' : ''} />
            <span>Automations & Routing</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-3.5 py-1.5 rounded-[9px] text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'bg-white text-[#0B0F14] shadow-sm'
                : 'text-gray-600 hover:text-[#0B0F14]'
            }`}
          >
            <Users size={14} className={activeTab === 'contacts' ? 'text-[#FF7A00]' : ''} />
            <span>Contacts & CRM</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-[9px] text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-white text-[#0B0F14] shadow-sm'
                : 'text-gray-600 hover:text-[#0B0F14]'
            }`}
          >
            <BarChart3 size={14} className={activeTab === 'analytics' ? 'text-[#FF7A00]' : ''} />
            <span>Analytics & SLA</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: LIVE MULTI-CHANNEL INBOX (3-COLUMN WORKSPACE)
         ========================================================================= */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* COLUMN 1: Conversations List & Channel Filters (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-[14px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col h-[750px] overflow-hidden">
            {/* Search & Channel Switcher Header */}
            <div className="p-3.5 border-b border-[#E5E7EB] space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer, tag, or message..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-[8px] bg-gray-50 border border-gray-200 text-xs text-[#0B0F14] focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              {/* Multi-Channel Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-[11px] font-medium">
                <button
                  onClick={() => setChannelFilter('all')}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition ${
                    channelFilter === 'all'
                      ? 'bg-[#0B0F14] text-white font-semibold'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All ({conversations.length})
                </button>
                <button
                  onClick={() => setChannelFilter('whatsapp')}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition flex items-center gap-1 ${
                    channelFilter === 'whatsapp'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <Smartphone size={11} />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => setChannelFilter('instagram')}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition flex items-center gap-1 ${
                    channelFilter === 'instagram'
                      ? 'bg-pink-600 text-white font-semibold'
                      : 'bg-pink-50 text-pink-800 hover:bg-pink-100'
                  }`}
                >
                  <Instagram size={11} />
                  <span>Instagram</span>
                </button>
                <button
                  onClick={() => setChannelFilter('messenger')}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition flex items-center gap-1 ${
                    channelFilter === 'messenger'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  <MessageSquare size={11} />
                  <span>Messenger</span>
                </button>
                <button
                  onClick={() => setChannelFilter('email')}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition flex items-center gap-1 ${
                    channelFilter === 'email'
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <Mail size={11} />
                  <span>Email</span>
                </button>
              </div>

              {/* Status Filter Sub-bar */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span>Filter status:</span>
                <div className="flex items-center gap-1.5">
                  {(['all', 'open', 'waiting', 'resolved'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`capitalize px-2 py-0.5 rounded text-[10px] ${
                        statusFilter === s
                          ? 'bg-[#FF7A00]/15 text-[#FF7A00] font-bold'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No conversations match the current filter.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv.id === activeConversation.id;
                  const assignedAgent = teamMembers.find((m) => m.id === conv.assignedTo);

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`p-3.5 cursor-pointer transition flex items-start gap-3 relative ${
                        isSelected
                          ? 'bg-orange-50/60 border-l-4 border-[#FF7A00]'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Channel Icon Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs font-sora">
                          {conv.customerName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        {/* Channel Badge Overlay */}
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm ${
                            conv.channel === 'whatsapp'
                              ? 'bg-emerald-600'
                              : conv.channel === 'instagram'
                              ? 'bg-pink-600'
                              : conv.channel === 'messenger'
                              ? 'bg-blue-600'
                              : 'bg-amber-600'
                          }`}
                        >
                          {conv.channel === 'whatsapp' && <Smartphone size={9} />}
                          {conv.channel === 'instagram' && <Instagram size={9} />}
                          {conv.channel === 'messenger' && <MessageSquare size={9} />}
                          {conv.channel === 'email' && <Mail size={9} />}
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-sora font-semibold text-xs text-[#0B0F14] truncate">
                            {conv.customerName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-1">
                            {conv.lastMessageTime}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-600 truncate mt-0.5 leading-snug">
                          {conv.lastMessage}
                        </p>

                        {/* Tags & Assignment Row */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {conv.tags.slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium font-mono"
                            >
                              #{t}
                            </span>
                          ))}
                          {conv.priority === 'urgent' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold font-mono">
                              URGENT
                            </span>
                          )}
                          {assignedAgent && (
                            <span className="text-[9px] text-gray-400 ml-auto flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>{assignedAgent.name.split(' ')[0]}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 2: Active Chat Conversation Stream (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-[14px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col h-[750px] overflow-hidden">
            {/* Chat Top Header */}
            <div className="p-3.5 border-b border-[#E5E7EB] bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0B0F14] text-white flex items-center justify-center font-bold text-xs">
                  {activeConversation.customerName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sora font-bold text-xs text-[#0B0F14]">
                      {activeConversation.customerName}
                    </h3>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold text-white ${
                        activeConversation.channel === 'whatsapp'
                          ? 'bg-emerald-600'
                          : activeConversation.channel === 'instagram'
                          ? 'bg-pink-600'
                          : activeConversation.channel === 'messenger'
                          ? 'bg-blue-600'
                          : 'bg-amber-600'
                      }`}
                    >
                      {activeConversation.channel}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {activeConversation.customerHandle}
                  </span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-1.5">
                <select
                  value={activeConversation.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as ConversationStatus)}
                  className="text-[11px] font-medium bg-white border border-gray-300 rounded-[8px] px-2 py-1 focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value="open">🟢 Open</option>
                  <option value="waiting">⏳ Waiting</option>
                  <option value="resolved">✅ Resolved</option>
                  <option value="snoozed">💤 Snoozed</option>
                </select>
              </div>
            </div>

            {/* Campaign Attribution Banner (if customer arrived from broadcast) */}
            {activeConversation.campaignAttribution && (
              <div className="bg-orange-50/70 border-b border-orange-200/60 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-orange-900">
                <div className="flex items-center gap-1.5">
                  <Share2 size={12} className="text-[#FF7A00]" />
                  <span>
                    Attributed to: <strong>{activeConversation.campaignAttribution.campaignName}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-orange-700 font-mono">
                  {activeConversation.campaignAttribution.triggerDate}
                </span>
              </div>
            )}

            {/* Collision Detection Presence Bar */}
            <div className="bg-blue-50/80 px-3.5 py-1 border-b border-blue-200/50 flex items-center justify-between text-[10px] text-blue-800">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Priya Patel & Rajesh Sharma are currently viewing this thread</span>
              </span>
              <span className="font-mono text-blue-600">Zero-Collision Active</span>
            </div>

            {/* Scrollable Chat Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAFBFD]">
              {activeConversation.messages.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                const isInternal = msg.isInternalNote;

                if (isInternal) {
                  return (
                    <div
                      key={msg.id}
                      className="p-3 rounded-[10px] bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 my-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-800">
                        <span className="flex items-center gap-1">
                          <Lock size={11} />
                          <span>INTERNAL TEAM NOTE (VISIBLE ONLY TO STAFF)</span>
                        </span>
                        <span className="font-mono text-amber-600">{msg.timestamp}</span>
                      </div>
                      <p className="font-inter leading-relaxed">{msg.content}</p>
                      <div className="text-[10px] text-amber-700 font-mono">
                        Author: {msg.senderName}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[12px] p-3 text-xs leading-relaxed shadow-xs ${
                        isCustomer
                          ? 'bg-white text-[#0B0F14] border border-gray-200 rounded-tl-none'
                          : msg.aiGenerated
                          ? 'bg-gradient-to-br from-orange-50 to-amber-50 text-[#0B0F14] border border-orange-200 rounded-tr-none'
                          : 'bg-[#0B0F14] text-white rounded-tr-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] mb-1 opacity-75 font-mono">
                        <span className="font-bold flex items-center gap-1">
                          {msg.aiGenerated && <Sparkles size={11} className="text-[#FF7A00]" />}
                          <span>{msg.senderName}</span>
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <p className="whitespace-pre-line font-inter">{msg.content}</p>

                      {msg.status && !isCustomer && (
                        <div className="flex justify-end text-[9px] text-emerald-400 mt-1 font-mono">
                          <span>✓✓ Delivered</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Co-Pilot Recommendation Strip */}
            <div className="px-3.5 py-2 bg-gradient-to-r from-orange-50 via-white to-amber-50 border-t border-orange-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Bot size={15} className="text-[#FF7A00]" />
                <span className="text-[11px] font-semibold text-gray-800">
                  AI Co-Pilot: Smart Reply Ready
                </span>
              </div>
              <button
                type="button"
                onClick={handleGenerateAiReply}
                disabled={aiGenerating}
                className="px-2.5 py-1 rounded-[6px] bg-[#FF7A00] hover:bg-[#E66E00] text-white text-[11px] font-semibold transition flex items-center gap-1 shadow-xs disabled:opacity-75"
              >
                {aiGenerating ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full border border-white border-t-transparent animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    <span>Insert Brand Brain Reply</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Reply Snippets */}
            <div className="px-3.5 py-1.5 bg-gray-50 border-t border-gray-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
              <span className="text-gray-400 text-[10px] shrink-0 font-mono">Quick Snippets:</span>
              <button
                onClick={() => handleInsertSnippet('Saturday 11:30 AM studio visit confirmed! Flagship map: https://maps.app.goo.gl/kuiro')}
                className="px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 hover:border-gray-400 whitespace-nowrap text-[10px]"
              >
                !booking-confirm
              </button>
              <button
                onClick={() => handleInsertSnippet('Our studio timings are Mon-Sat, 9:30 AM to 8:00 PM. Walk-ins and private appointments welcome.')}
                className="px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 hover:border-gray-400 whitespace-nowrap text-[10px]"
              >
                !studio-hours
              </button>
              <button
                onClick={() => handleInsertSnippet('Bespoke handloom bridal sets start at ₹28,000 including custom fitting, artisan certificates, and insured dispatch.')}
                className="px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 hover:border-gray-400 whitespace-nowrap text-[10px]"
              >
                !bespoke-quote
              </button>
            </div>

            {/* Input Composer Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E5E7EB] bg-white space-y-2">
              {/* Dual Mode Switcher: Customer Reply vs Internal Note */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyMode('customer')}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                      replyMode === 'customer'
                        ? 'bg-[#0B0F14] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Reply to Customer ({activeConversation.channel})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyMode('internal')}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition flex items-center gap-1 ${
                      replyMode === 'internal'
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    <Lock size={11} />
                    <span>Internal Note (@team)</span>
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">Enter to send</span>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={
                    replyMode === 'internal'
                      ? 'Add a private note visible only to your team members...'
                      : `Type a response to ${activeConversation.customerName} on ${activeConversation.channel}...`
                  }
                  rows={2}
                  className={`w-full p-2.5 rounded-[10px] text-xs focus:outline-none transition ${
                    replyMode === 'internal'
                      ? 'bg-amber-50/60 border border-amber-300 text-amber-950 placeholder-amber-700/60'
                      : 'bg-gray-50 border border-gray-200 text-[#0B0F14] focus:border-[#FF7A00]'
                  }`}
                />
              </div>

              {/* Submit & Attachment Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <button type="button" className="hover:text-gray-600 p-1" title="Attach Media">
                    <Paperclip size={15} />
                  </button>
                  <button type="button" className="hover:text-gray-600 p-1" title="Emoji">
                    <Smile size={15} />
                  </button>
                </div>

                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-[8px] text-xs font-semibold font-sora flex items-center gap-1.5 shadow-sm transition active:scale-95 ${
                    replyMode === 'internal'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-[#FF7A00] hover:bg-[#E66E00] text-white'
                  }`}
                >
                  <span>{replyMode === 'internal' ? 'Save Internal Note' : 'Send Reply'}</span>
                  <Send size={12} />
                </button>
              </div>
            </form>
          </div>

          {/* COLUMN 3: Customer Context, CRM & Smart Routing Drawer (3 Cols) */}
          <div className="lg:col-span-3 bg-white rounded-[14px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-4 space-y-4 h-[750px] overflow-y-auto text-xs">
            {/* Customer Profile Card */}
            <div className="text-center pb-3 border-b border-gray-200">
              <div className="w-14 h-14 rounded-full bg-gray-900 text-white font-bold text-base mx-auto flex items-center justify-center font-sora shadow-sm">
                {activeConversation.customerName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <h4 className="font-sora font-bold text-sm text-[#0B0F14] mt-2">
                {activeConversation.customerName}
              </h4>
              <p className="text-[11px] text-gray-500 font-mono">
                {activeConversation.crmData.patientOrClientType}
              </p>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Verified Contact
                </span>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF7A00] text-[10px] font-bold">
                  {activeConversation.crmData.totalSpend} LTV
                </span>
              </div>
            </div>

            {/* Smart Routing & Team Assignment */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                Assign Conversation:
              </label>
              <select
                value={activeConversation.assignedTo}
                onChange={(e) => handleAssignMember(e.target.value)}
                className="w-full p-2 rounded-[8px] bg-gray-50 border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#FF7A00]"
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            {/* CRM Contact Attributes */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                CRM Details:
              </span>
              <div className="p-2.5 rounded-[8px] bg-gray-50 border border-gray-100 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-mono text-gray-800">{activeConversation.crmData.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-mono text-gray-800 truncate max-w-[140px]">
                    {activeConversation.crmData.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-800">{activeConversation.crmData.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Last Visit:</span>
                  <span className="font-mono text-gray-800">{activeConversation.crmData.lastVisitDate}</span>
                </div>
              </div>
            </div>

            {/* Customer CRM / Brand Notes */}
            <div className="space-y-1.5 pt-2 border-t border-gray-200">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                CRM Context & Client Notes:
              </span>
              <p className="p-2.5 rounded-[8px] bg-amber-50/50 border border-amber-200/50 text-amber-900 text-[11px] leading-relaxed">
                {activeConversation.crmData.notes}
              </p>
            </div>

            {/* Conversation Tags Manager */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                Applied Tags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeConversation.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-[6px] bg-gray-100 text-gray-700 text-[10px] font-mono flex items-center gap-1"
                  >
                    <span>#{tag}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Action Dial / WhatsApp Shortcut */}
            <div className="pt-3 border-t border-gray-200 space-y-2">
              <a
                href={`https://wa.me/${activeConversation.crmData.phone?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-[8px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Smartphone size={13} />
                <span>Open in WhatsApp Web</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: AUTOMATION, FLOWS & SMART ROUTING RULES
         ========================================================================= */}
      {activeTab === 'automations' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[14px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Autopilot Engine Active
                </span>
                <span className="text-xs text-gray-500">
                  {rules.filter((r) => r.enabled).length} of {rules.length} Active Flow Rules
                </span>
              </div>
              <h2 className="font-sora text-lg md:text-xl font-bold text-[#0B0F14] mt-1">
                Automation, Keyword Flows & Smart Routing
              </h2>
              <p className="text-xs text-gray-500 max-w-2xl mt-0.5">
                Automatically qualify leads, reply during off-hours, route high-value inquiries to specialists, and trigger WhatsApp utility templates without human delay.
              </p>
            </div>

            <button
              onClick={() => showToast('Flow builder modal ready for new rule!')}
              className="px-4 py-2.5 rounded-[10px] bg-[#FF7A00] text-white text-xs font-semibold hover:bg-[#E66E00] transition flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Plus size={15} />
              <span>Create New Routing Flow</span>
            </button>
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white rounded-[14px] border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4 hover:border-gray-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-bold uppercase">
                        {rule.triggerType}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {rule.triggerCount} Executions
                      </span>
                    </div>
                    <h3 className="font-sora text-sm font-bold text-[#0B0F14] mt-1.5">
                      {rule.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{rule.description}</p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      rule.enabled ? 'bg-[#FF7A00]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        rule.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Conditions & Trigger Criteria */}
                <div className="p-3 rounded-[10px] bg-gray-50 border border-gray-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                    <Filter size={13} className="text-[#FF7A00]" />
                    <span>Trigger Condition:</span>
                  </div>
                  <p className="text-gray-600 text-[11px] font-mono">{rule.conditions}</p>

                  {rule.keywords && (
                    <div className="flex items-center gap-1 pt-1 flex-wrap">
                      <span className="text-[10px] text-gray-400 font-mono">Matched keywords:</span>
                      {rule.keywords.map((kw, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-white text-gray-700 border border-gray-200 font-mono">
                          "{kw}"
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Performed */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                    Automated Actions ({rule.actions.length}):
                  </span>
                  <div className="space-y-1.5">
                    {rule.actions.map((act, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-[8px] bg-emerald-50/60 border border-emerald-200/50 flex items-start gap-2 text-[11px] text-emerald-950"
                      >
                        <Zap size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-mono text-[10px] uppercase">{act.type}: </strong>
                          <span>{act.payload}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CONTACTS & CRM DIRECTORY
         ========================================================================= */}
      {activeTab === 'contacts' && (
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-5 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-sora text-base font-bold text-[#0B0F14]">
                Customer Contacts & Omni-Channel Reachability
              </h2>
              <p className="text-xs text-gray-500">
                Directory of verified clients, retail buyers, and leads across WhatsApp, Instagram, Messenger, and Email.
              </p>
            </div>

            <button
              onClick={() => showToast('Exported CSV of contacts!')}
              className="px-3.5 py-2 rounded-[8px] bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition"
            >
              Export Contacts (CSV)
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-[10px] font-mono uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="p-3.5 font-bold">Contact Name</th>
                  <th className="p-3.5 font-bold">Primary Channel</th>
                  <th className="p-3.5 font-bold">Phone / Handle</th>
                  <th className="p-3.5 font-bold">Category</th>
                  <th className="p-3.5 font-bold">Lifetime Value</th>
                  <th className="p-3.5 font-bold">Attributed Campaign</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-inter">
                {conversations.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="p-3.5 font-medium text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-900 text-white font-bold text-[10px] flex items-center justify-center font-sora">
                        {c.customerName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <span>{c.customerName}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gray-100 text-gray-700">
                        {c.channel}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-gray-600">{c.customerHandle}</td>
                    <td className="p-3.5">{c.crmData.patientOrClientType}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700">
                      {c.crmData.totalSpend}
                    </td>
                    <td className="p-3.5 text-gray-500">
                      {c.campaignAttribution?.campaignName || 'Organic Walk-In'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedConvId(c.id);
                          setActiveTab('inbox');
                        }}
                        className="px-2.5 py-1 rounded bg-[#FF7A00]/15 text-[#FF7A00] font-semibold text-[11px] hover:bg-[#FF7A00] hover:text-white transition"
                      >
                        Open Chat →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ANALYTICS, SLA & AGENT METRICS
         ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top 4 Key Performance Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <span className="text-[11px] font-medium uppercase font-mono">First Response Time (FRT)</span>
                <Clock size={16} className="text-[#FF7A00]" />
              </div>
              <div className="text-2xl font-bold text-[#0B0F14] font-inter">1m 42s</div>
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                <span>92% faster with KUIRO AI Co-Pilot</span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <span className="text-[11px] font-medium uppercase font-mono">Total Volume (Monthly)</span>
                <MessageSquare size={16} className="text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-[#0B0F14] font-inter">1,284 Chats</div>
              <p className="text-[11px] text-gray-500 mt-1">
                WhatsApp: 54% • Instagram: 28% • Email: 18%
              </p>
            </div>

            <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <span className="text-[11px] font-medium uppercase font-mono">AI Autonomous Deflection</span>
                <Bot size={16} className="text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-[#0B0F14] font-inter">68.4%</div>
              <p className="text-[11px] text-gray-500 mt-1">
                Resolved without touching human agent
              </p>
            </div>

            <div className="bg-white p-4 rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <span className="text-[11px] font-medium uppercase font-mono">Customer CSAT</span>
                <ShieldCheck size={16} className="text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-[#0B0F14] font-inter">4.9 / 5.0 ⭐</div>
              <p className="text-[11px] text-gray-500 mt-1">
                Based on 312 post-inquiry ratings
              </p>
            </div>
          </div>

          {/* Team Workload & Channel Distribution Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Team Leaderboard */}
            <div className="lg:col-span-7 bg-white p-5 rounded-[14px] border border-[#E5E7EB] space-y-4">
              <h3 className="font-sora text-sm font-bold text-[#0B0F14] flex items-center justify-between">
                <span>Team Workload & Assignment Matrix</span>
                <span className="text-xs text-gray-500 font-mono font-normal">Active Today</span>
              </h3>

              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-[10px] bg-gray-50 border border-gray-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0B0F14] text-white font-bold text-xs flex items-center justify-center font-sora">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{member.name}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-gray-200 text-gray-700 capitalize">
                            {member.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400">{member.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-sm font-bold text-gray-900 font-mono block">
                          {member.activeChatsCount}
                        </span>
                        <span className="text-[10px] text-gray-400">Active Chats</span>
                      </div>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          member.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
                        }`}
                        title={member.isOnline ? 'Online' : 'Offline'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Inbound Conversion Attribution */}
            <div className="lg:col-span-5 bg-white p-5 rounded-[14px] border border-[#E5E7EB] space-y-4">
              <h3 className="font-sora text-sm font-bold text-[#0B0F14]">
                Inbound Inquiries by Broadcast Campaign
              </h3>

              <div className="space-y-2.5 text-xs font-inter">
                <div className="p-3 rounded-[10px] bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between font-semibold text-gray-800">
                    <span>Diwali Festive Prosperity Broadcast</span>
                    <span className="font-mono text-[#FF7A00]">44 Inquiries</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#FF7A00] rounded-full" style={{ width: '68%' }} />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">Conversion: 18 Studio Visits Booked</span>
                </div>

                <div className="p-3 rounded-[10px] bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between font-semibold text-gray-800">
                    <span>Instagram Reel: Scalable Artisan Weaves</span>
                    <span className="font-mono text-pink-600">22 Inquiries</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-pink-500 rounded-full" style={{ width: '42%' }} />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">Conversion: 7 Direct Wholesale Orders</span>
                </div>

                <div className="p-3 rounded-[10px] bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between font-semibold text-gray-800">
                    <span>Corporate Festive Gifting Newsletter</span>
                    <span className="font-mono text-amber-600">12 Inquiries</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '28%' }} />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">Conversion: 3 Group Corporate Deals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

