'use client';

import { useHeartbeat } from '@/hooks/useHeartbeat';

interface OnlineStatusProviderProps {
  children: React.ReactNode;
}

export default function OnlineStatusProvider({ children }: OnlineStatusProviderProps) {
  useHeartbeat(true);
  
  return <>{children}</>;
} 