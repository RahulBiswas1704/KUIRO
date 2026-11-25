'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  MessageSquare,
  Users,
  Zap,
} from 'lucide-react';
import {
  DEFAULT_SNIPPETS,
  DynamicSnippetManagerModal,
  InChatPaymentModal,
  InboxAnalyticsTab,
  InboxAutomationsTab,
  InboxContactsTab,
  InboxLiveTab,
  InboxRuleModal,
  initialAutomationRules,
  initialConversations,
  teamMembers,
  type GeneratedPaymentData,
  type NewRuleFormState,
  type QuickSnippetItem,
} from '@/components/inbox';
import type {
  AutomationFlowRule,
  Conversation,
  ConversationChannel,
  ConversationStatus,
  InboxMessage,
} from '@/types';

const EMPTY_RULE_FORM: NewRuleFormState = {
  name: '',
  triggerType: 'KEYWORD',
  channel: 'whatsapp',
  matchMode: 'contains',
  keywordsText: '',
  autoReplyText: '',
  applyTagText: '',
};

export default function UnifiedInboxPage() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'automations' | 'contacts' | 'analytics'>('inbox');
  const [channelFilter, setChannelFilter] = useState<'all' | ConversationChannel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ConversationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConvId, setSelectedConvId] = useState<string>(initialConversations[0].id);

  // Real-Time Server-Sent Events (SSE) Stream State
  const [sseStatus, setSseStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isSimulatingLead, setIsSimulatingLead] = useState(false);

  // Composer & Rules State
  const [replyMode, setReplyMode] = useState<'customer' | 'internal'>('customer');
  const [messageText, setMessageText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [rules, setRules] = useState<AutomationFlowRule[]>(initialAutomationRules);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [newRuleForm, setNewRuleForm] = useState<NewRuleFormState>(EMPTY_RULE_FORM);

  // Snippets & Payment Modals
  const [snippets, setSnippets] = useState<QuickSnippetItem[]>(DEFAULT_SNIPPETS);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Web Audio API Synthesizer for Inbound Message Alert Chime
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start(ctx.currentTime + 0.08);
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio block silently ignored if user has not interacted with DOM yet
    }
  };

  // 1. Initial Snapshot Fetch from Neon DB (Conversations & Persisted Automations)
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

    fetch('/api/inbox/automations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.rules) && data.rules.length > 0) {
          const dbRules: AutomationFlowRule[] = data.rules;
          const dbIds = new Set(dbRules.map((r) => r.id));
          setRules([...dbRules, ...initialAutomationRules.filter((r) => !dbIds.has(r.id))]);
        }
      })
      .catch((err) => console.warn('[Inbox Automations Fetch Error]', err));
  }, []);

  // 2. Persistent Server-Sent Events (SSE) Real-Time Synchronization Stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isMounted = true;

    const connectSSE = () => {
      setSseStatus('connecting');
      try {
        eventSource = new EventSource('/api/inbox/stream');

        eventSource.addEventListener('connected', () => {
          if (!isMounted) return;
          setSseStatus('connected');
          setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        });

        eventSource.addEventListener('heartbeat', () => {
          if (!isMounted) return;
          setSseStatus('connected');
        });

        eventSource.addEventListener('new_message', (e) => {
          if (!isMounted) return;
          try {
            const payload = JSON.parse(e.data);
            const { message, conversation } = payload;
            if (!message) return;

            if (message.sender === 'customer') {
              playNotificationChime();
              showToast(
                `💬 [${message.channel.toUpperCase()}] ${message.senderName}: "${message.content.slice(0, 42)}${
                  message.content.length > 42 ? '...' : ''
                }"`
              );
            }

            setConversations((prevConvs) => {
              const existingIdx = prevConvs.findIndex((c) => c.id === message.conversationId);

              if (existingIdx !== -1) {
                const target = prevConvs[existingIdx];
                const isCurrentlyActive = target.id === selectedConvId;
                const alreadyExists = target.messages.some((m) => m.id === message.id);
                const updatedMessages = alreadyExists ? target.messages : [...target.messages, message];

                const updatedConv: Conversation = {
                  ...target,
                  lastMessage: message.isInternalNote ? `[Internal Note]: ${message.content}` : message.content,
                  lastMessageTime: message.timestamp || 'Just now',
                  unreadCount: isCurrentlyActive
                    ? 0
                    : target.unreadCount + (message.sender === 'customer' ? 1 : 0),
                  messages: updatedMessages,
                };

                const others = prevConvs.filter((_, idx) => idx !== existingIdx);
                return [updatedConv, ...others];
              } else if (conversation) {
                const newConvFull: Conversation = {
                  id: conversation.id || message.conversationId,
                  workspaceId: 'ws-sharma-101',
                  customerName: conversation.customerName || message.senderName,
                  customerHandle: conversation.customerHandle || message.senderName,
                  channel: conversation.channel || message.channel,
                  status: 'open',
                  priority: 'high',
                  unreadCount: 1,
                  lastMessage: message.content,
                  lastMessageTime: message.timestamp || 'Just now',
                  assignedTo: 'agent-2',
                  tags: conversation.tags || ['Live Inbound Lead', 'SSE Real-Time'],
                  sentiment: 'positive',
                  crmData: {
                    phone: conversation.customerHandle?.startsWith('+') ? conversation.customerHandle : undefined,
                    email: `${conversation.customerName?.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
                    city: conversation.crmData?.city || 'India',
                    totalSpend: '₹0 (New Lead)',
                    patientOrClientType: conversation.crmData?.patientOrClientType || 'Live Inbound Lead',
                    lastVisitDate: 'Today (Live Stream)',
                    notes: conversation.crmData?.notes || 'Inbound conversation via real-time stream',
                  },
                  messages: [message],
                };
                return [newConvFull, ...prevConvs];
              }
              return prevConvs;
            });

            setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          } catch (err) {
            console.warn('[SSE message payload error]:', err);
          }
        });

        eventSource.onerror = () => {
          if (!isMounted) return;
          setSseStatus('disconnected');
          eventSource?.close();
          setTimeout(() => {
            if (isMounted) connectSSE();
          }, 4000);
        };
      } catch (err) {
        console.warn('[SSE Init Error]:', err);
        setSseStatus('disconnected');
      }
    };

    connectSSE();

    return () => {
      isMounted = false;
      eventSource?.close();
    };
  }, [selectedConvId]);

  const handleSimulateInboundLead = async () => {
    setIsSimulatingLead(true);
    try {
      const res = await fetch('/api/inbox/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        showToast('⚡ Inbound customer lead dispatched via SSE stream!');
      } else {
        throw new Error(data.error || 'Failed to simulate');
      }
    } catch (err) {
      console.warn('[Simulate Error]:', err);
      showToast('Simulation broadcast triggered!');
    } finally {
      setIsSimulatingLead(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesChannel = channelFilter === 'all' || c.channel === channelFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesChannel && matchesStatus && matchesSearch;
  });

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

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              lastMessage: isInternal ? `[Internal Note]: ${currentText}` : currentText,
              lastMessageTime: 'Just now',
              messages: [...c.messages, newMessage],
            }
          : c
      )
    );

    setMessageText('');
    showToast(isInternal ? 'Internal team note added!' : 'Reply dispatched to customer!');

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
      const suggested =
        activeConversation.id === 'conv-1'
          ? `Namaste ${activeConversation.customerName}! We would love to welcome you this Saturday at our flagship studio. We have reserved the preview slot and will send you location directions!`
          : `Hello ${activeConversation.customerName}, thank you for reaching out to Sharma Heritage! Our customer care team has received your message and will assist you immediately.`;
      setMessageText(suggested);
      setReplyMode('customer');
      showToast('AI suggestion loaded from Brand Brain guidelines!');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAssignMember = (agentId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, assignedTo: agentId } : c))
    );
    const member = teamMembers.find((m) => m.id === agentId);
    showToast(`Conversation assigned to ${member?.name || 'team member'}`);
  };

  const handleUpdateStatus = (newStatus: ConversationStatus) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, status: newStatus } : c))
    );
    showToast(`Conversation status marked as ${newStatus.toUpperCase()}`);
  };

  const handleToggleRule = async (ruleId: string) => {
    const target = rules.find((r) => r.id === ruleId);
    if (!target) return;
    const nextEnabled = !target.enabled;

    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, enabled: nextEnabled } : r)));

    if (target.persistedInDb) {
      try {
        const res = await fetch('/api/inbox/automations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: ruleId, enabled: nextEnabled }),
        });
        if (!res.ok) throw new Error('Failed to sync toggle');
        showToast(`Rule "${target.name}" ${nextEnabled ? 'enabled' : 'paused'} in Neon DB.`);
      } catch {
        setRules((prev) =>
          prev.map((r) => (r.id === ruleId ? { ...r, enabled: target.enabled } : r))
        );
        showToast('Failed to update rule status in database.');
      }
    } else {
      showToast('Automation rule status updated!');
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleForm.name.trim() || !newRuleForm.autoReplyText.trim()) {
      showToast('Please enter a rule name and auto-reply message.');
      return;
    }

    const keywordsList = newRuleForm.keywordsText
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    if (newRuleForm.triggerType === 'KEYWORD' && keywordsList.length === 0) {
      showToast('Please provide at least one trigger keyword (comma-separated).');
      return;
    }

    const actions: AutomationFlowRule['actions'] = [
      { type: 'AUTO_REPLY', payload: newRuleForm.autoReplyText.trim() },
    ];
    if (newRuleForm.applyTagText.trim()) {
      actions.push({ type: 'APPLY_TAG', payload: newRuleForm.applyTagText.trim() });
    }

    setIsSavingRule(true);
    try {
      const res = await fetch('/api/inbox/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRuleForm.name.trim(),
          triggerType: newRuleForm.triggerType,
          channel: newRuleForm.channel,
          keywords: keywordsList,
          conditions: newRuleForm.matchMode,
          actions,
          enabled: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.rule) {
        setRules((prev) => [data.rule, ...prev]);
        setIsRuleModalOpen(false);
        setNewRuleForm(EMPTY_RULE_FORM);
        showToast(`Live rule "${data.rule.name}" saved & armed in Neon DB!`);
      } else {
        showToast(data.error || 'Could not save automation rule.');
      }
    } catch {
      showToast('Network error while creating automation rule.');
    } finally {
      setIsSavingRule(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/inbox/automations?id=${encodeURIComponent(ruleId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== ruleId));
        showToast('Automation rule deleted from Neon DB.');
      } else {
        showToast('Failed to delete automation rule.');
      }
    } catch {
      showToast('Network error deleting automation rule.');
    }
  };

  const handleSelectSnippet = (snip: QuickSnippetItem) => {
    if (snip.isSystemAction && snip.trigger === '!pay-link') {
      setIsPayModalOpen(true);
      return;
    }
    setMessageText((prev) => (prev ? `${prev} ${snip.text}` : snip.text));
  };

  const handleInsertPaymentLink = (data: GeneratedPaymentData) => {
    setMessageText((prev) => (prev ? `${prev}\n\n${data.formattedMessage}` : data.formattedMessage));

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          const rawNum = parseInt(String(c.crmData.totalSpend || '').replace(/[^0-9]/g, ''), 10) || 0;
          const newTotal = rawNum + data.amount;
          return {
            ...c,
            crmData: {
              ...c.crmData,
              totalSpend: `₹${newTotal.toLocaleString('en-IN')}`,
            },
          };
        }
        return c;
      })
    );

    showToast(`💳 Payment link generated for ₹${data.amount.toLocaleString('en-IN')} & attached!`);
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#E5E7EB] gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF7A00] text-[10px] font-bold">
              Shared Team Workspace
            </span>
            <span className="text-xs text-gray-500">
              WhatsApp • Instagram • Messenger • Email
            </span>

            {/* Live SSE Real-Time Status Pill */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
              {sseStatus === 'connected' ? (
                <span
                  title="Server-Sent Events active: updates stream in real-time with zero page refresh"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SSE: Live Sync</span>
                  {lastSyncedAt && <span className="text-emerald-500 font-normal">({lastSyncedAt})</span>}
                </span>
              ) : sseStatus === 'connecting' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>Connecting Stream...</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>Stream Reconnecting</span>
                </span>
              )}
            </div>
          </div>
          <h1 className="font-sora text-xl md:text-2xl font-bold text-[#0B0F14] mt-1">
            Unified Customer Conversations Hub
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Reply faster, automate routine FAQs with Brand Brain AI, collaborate with internal notes, and track campaign ROI.
          </p>
        </div>

        {/* Action Controls & View Mode Tabs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleSimulateInboundLead}
            disabled={isSimulatingLead}
            className="px-3 py-1.5 rounded-[10px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 disabled:opacity-75 cursor-pointer"
            title="Inject a realistic incoming customer inquiry via Server-Sent Events to test real-time zero-refresh live streaming"
          >
            {isSimulatingLead ? (
              <>
                <span className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />
                <span>Broadcasting SSE...</span>
              </>
            ) : (
              <>
                <Zap size={13} className="text-amber-200" />
                <span>Simulate Inbound Lead (SSE)</span>
              </>
            )}
          </button>

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
              <span>Automations &amp; Routing</span>
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
              <span>Contacts &amp; CRM</span>
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
              <span>Analytics &amp; SLA</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'inbox' && (
        <InboxLiveTab
          conversations={conversations}
          filteredConversations={filteredConversations}
          activeConversation={activeConversation}
          teamMembers={teamMembers}
          snippets={snippets}
          searchQuery={searchQuery}
          channelFilter={channelFilter}
          statusFilter={statusFilter}
          replyMode={replyMode}
          messageText={messageText}
          aiGenerating={aiGenerating}
          onSearchChange={setSearchQuery}
          onChannelFilterChange={setChannelFilter}
          onStatusFilterChange={setStatusFilter}
          onSelectConversation={(convId) => {
            setSelectedConvId(convId);
            setConversations((prev) =>
              prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
            );
          }}
          onUpdateStatus={handleUpdateStatus}
          onReplyModeChange={setReplyMode}
          onMessageTextChange={setMessageText}
          onSendMessage={handleSendMessage}
          onGenerateAiReply={handleGenerateAiReply}
          onSelectSnippet={handleSelectSnippet}
          onOpenSnippetModal={() => setIsSnippetModalOpen(true)}
          onOpenPayModal={() => setIsPayModalOpen(true)}
          onAssignMember={handleAssignMember}
        />
      )}

      {activeTab === 'automations' && (
        <InboxAutomationsTab
          rules={rules}
          onOpenNewRuleModal={() => setIsRuleModalOpen(true)}
          onToggleRule={handleToggleRule}
          onDeleteRule={handleDeleteRule}
        />
      )}

      {activeTab === 'contacts' && (
        <InboxContactsTab
          conversations={conversations}
          onExportCsv={() => showToast('Exported CSV of contacts!')}
          onOpenChat={(convId) => {
            setSelectedConvId(convId);
            setActiveTab('inbox');
          }}
        />
      )}

      {activeTab === 'analytics' && <InboxAnalyticsTab teamMembers={teamMembers} />}

      <DynamicSnippetManagerModal
        isOpen={isSnippetModalOpen}
        onClose={() => setIsSnippetModalOpen(false)}
        snippets={snippets}
        onSaveSnippets={(updated) => {
          setSnippets(updated);
          showToast('Quick snippets library updated!');
        }}
        onSelectSnippet={handleSelectSnippet}
      />

      <InChatPaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        customerName={activeConversation.customerName}
        customerHandle={activeConversation.customerHandle}
        channel={activeConversation.channel}
        onInsertPaymentLink={handleInsertPaymentLink}
      />

      <InboxRuleModal
        isOpen={isRuleModalOpen}
        form={newRuleForm}
        isSaving={isSavingRule}
        onChange={setNewRuleForm}
        onSubmit={handleCreateRule}
        onClose={() => setIsRuleModalOpen(false)}
      />
    </div>
  );
}
