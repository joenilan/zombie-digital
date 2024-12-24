"use client";

import { AdminSidebar } from './AdminSidebar';

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ethereal-dark">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-64 lg:min-h-screen p-4">
          <AdminSidebar />
        </div>
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
} 