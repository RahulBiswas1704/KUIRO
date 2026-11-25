'use client';

import React from 'react';
import {
  Bot,
  CreditCard,
  Instagram,
  Lock,
  Mail,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Send,
  Share2,
  Smartphone,
  Smile,
  Sparkles,
} from 'lucide-react';
import type { QuickSnippetItem } from './DynamicSnippetManagerModal';
import type {
  Conversation,
  ConversationChannel,
  ConversationStatus,
  TeamMember,
} from '@/types';

interface InboxLiveTabProps {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  activeConversation: Conversation;
  teamMembers: TeamMember[];
  snippets: QuickSnippetItem[];
  searchQuery: string;
  channelFilter: 'all' | ConversationChannel;
  statusFilter: 'all' | ConversationStatus;
  replyMode: 'customer' | 'internal';
  messageText: string;
  aiGenerating: boolean;
  onSearchChange: (q: string) => void;
  onChannelFilterChange: (ch: 'all' | ConversationChannel) => void;
  onStatusFilterChange: (st: 'all' | ConversationStatus) => void;
  onSelectConversation: (id: string) => void;
  onUpdateStatus: (newStatus: ConversationStatus) => void;
  onReplyModeChange: (mode: 'customer' | 'internal') => void;
  onMessageTextChange: (text: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onGenerateAiReply: () => void;
  onSelectSnippet: (snip: QuickSnippetItem) => void;
  onOpenSnippetModal: () => void;
  onOpenPayModal: () => void;
  onAssignMember: (agentId: string) => void;
}

export default function InboxLiveTab({
  conversations,
  filteredConversations,
  activeConversation,
  teamMembers,
  snippets,
  searchQuery,
  channelFilter,
  statusFilter,
  replyMode,
  messageText,
  aiGenerating,
  onSearchChange,
  onChannelFilterChange,
  onStatusFilterChange,
  onSelectConversation,
  onUpdateStatus,
  onReplyModeChange,
  onMessageTextChange,
  onSendMessage,
  onGenerateAiReply,
  onSelectSnippet,
  onOpenSnippetModal,
  onOpenPayModal,
  onAssignMember,
}: InboxLiveTabProps) {
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search customer, tag, or message..."
              className="w-full pl-9 pr-3 py-1.5 rounded-[8px] bg-gray-50 border border-gray-200 text-xs text-[#0B0F14] focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          {/* Multi-Channel Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-[11px] font-medium">
            <button
              onClick={() => onChannelFilterChange('all')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition ${
                channelFilter === 'all'
                  ? 'bg-[#0B0F14] text-white font-semibold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({conversations.length})
            </button>
            <button
              onClick={() => onChannelFilterChange('whatsapp')}
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
              onClick={() => onChannelFilterChange('instagram')}
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
              onClick={() => onChannelFilterChange('messenger')}
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
              onClick={() => onChannelFilterChange('email')}
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
                  onClick={() => onStatusFilterChange(s)}
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
                  onClick={() => onSelectConversation(conv.id)}
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
              onChange={(e) => onUpdateStatus(e.target.value as ConversationStatus)}
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
            <span>Priya Patel &amp; Rajesh Sharma are currently viewing this thread</span>
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
            onClick={onGenerateAiReply}
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
        <div className="px-3.5 py-1.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-gray-400 text-[10px] shrink-0 font-mono">Quick Snippets:</span>
            {snippets.map((snip) => (
              <button
                key={snip.id}
                type="button"
                onClick={() => onSelectSnippet(snip)}
                title={snip.label}
                className={`px-2 py-0.5 rounded border text-[10px] whitespace-nowrap transition flex items-center gap-1 ${
                  snip.trigger === '!pay-link'
                    ? 'bg-orange-50 border-orange-300 text-[#FF7A00] font-semibold hover:bg-orange-100 hover:border-orange-400 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                {snip.trigger === '!pay-link' && <CreditCard size={10} />}
                <span>{snip.trigger}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onOpenSnippetModal}
            className="px-2 py-0.5 rounded text-[10px] font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-200 border border-transparent whitespace-nowrap shrink-0 flex items-center gap-1 transition"
            title="Manage canned shortcuts"
          >
            <Plus size={11} />
            <span>Manage</span>
          </button>
        </div>

        {/* Input Composer Box */}
        <form onSubmit={onSendMessage} className="p-3 border-t border-[#E5E7EB] bg-white space-y-2">
          {/* Dual Mode Switcher: Customer Reply vs Internal Note */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onReplyModeChange('customer')}
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
                onClick={() => onReplyModeChange('internal')}
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
              onChange={(e) => onMessageTextChange(e.target.value)}
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
            <div className="flex items-center gap-1.5 text-gray-400">
              <button type="button" className="hover:text-gray-600 p-1" title="Attach Media">
                <Paperclip size={15} />
              </button>
              <button type="button" className="hover:text-gray-600 p-1" title="Emoji">
                <Smile size={15} />
              </button>
              <button
                type="button"
                onClick={onOpenPayModal}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-50 text-[#FF7A00] border border-orange-200 hover:bg-orange-100 transition text-[11px] font-semibold active:scale-95"
                title="Generate instant UPI payment link"
              >
                <CreditCard size={12} />
                <span>Pay Link</span>
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
            onChange={(e) => onAssignMember(e.target.value)}
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
            CRM Context &amp; Client Notes:
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
  );
}
