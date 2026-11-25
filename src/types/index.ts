/**
 * Central Type Definitions for KUIRO
 * Organized by core domain models: Workspace, Campaign, Inbox, ROI, and Channel/Persona config types.
 */

// Domain Types
export * from './workspace';
export * from './campaign';
export * from './inbox';
export * from './roi';

// Multi-Tenant Persona Simulator & Channel Vault Types
export type { PersonaKey, PersonaConfig } from '@/constants/personas';
export type { PlatformKey, ChannelConfig } from '@/constants/channels';
