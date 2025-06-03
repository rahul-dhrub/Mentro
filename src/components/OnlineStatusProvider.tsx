'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface OnlineStatusProviderProps {
  children: React.ReactNode;
}

export default function OnlineStatusProvider({ children }: OnlineStatusProviderProps) {
  useOnlineStatus();
  
  return <>{children}</>;
} 