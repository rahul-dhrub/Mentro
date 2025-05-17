import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

export default function StatCard({ title, icon, children }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {icon}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
} 