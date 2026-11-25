import React from 'react';
import KuiroLoader from '@/components/brand/KuiroLoader';

export default function DashboardLoading() {
  return (
    <KuiroLoader
      variant="inline"
      mode="loop"
      theme="dark"
      label="Syncing autopilot workspace..."
      className="min-h-[65vh]"
    />
  );
}
