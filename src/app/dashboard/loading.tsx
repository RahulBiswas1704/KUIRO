import React from 'react';
import KuiroLoader from '@/components/brand/KuiroLoader';

export default function DashboardLoading() {
  return (
    <KuiroLoader
      variant="inline"
      theme="dark"
      label="Syncing your autopilot workspace..."
      className="min-h-[65vh]"
    />
  );
}
