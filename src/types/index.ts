/**
 * Central Type Definitions for KUIRO
 * Organized by domain models: Workspace, Campaign, Inbox, ROI, Channels, Observability, and Events.
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

// Observability & Telemetry Types
export type {
  LogLevel,
  LogService,
  StructuredLogEvent,
} from '@/lib/observability/logger';
export type {
  AlertSeverity,
  AlertCategory,
  AlertInput,
} from '@/lib/observability/alerts';

// Durable Events & Idempotency Types
export type {
  EventStatus,
  ErrorClassification,
  IdempotencyExecutionOptions,
  IdempotencyExecutionResult,
} from '@/lib/events/idempotency';

// Real-Time Pub/Sub Types
export type {
  PubSubNotification,
} from '@/lib/realtime/pubsub';
