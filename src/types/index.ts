/**
 * Central Type Definitions for KUIRO
 * Organized by domain models: Workspace, Campaign, Inbox, ROI, and Channels.
 */

// Domain Types
export * from './workspace';
export * from './campaign';
export * from './inbox';
export * from './roi';

// Multi-Tenant Persona Simulator & Channel Vault Types
export type { PersonaKey, PersonaConfig } from '@/constants/personas';
export type { PlatformKey, ChannelConfig } from '@/constants/channels';

// Re-export Modal Component Types
export type { PlanTier } from '@/components/billing';
export type { MilestoneCategory } from '@/components/calendar';
export type { QuickSnippetItem, GeneratedPaymentData } from '@/components/inbox';
