"use client";

import { Navbar } from "@/components/Navbar";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-ethereal-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {children}
          </div>
        </div>
      </div>
    </>
  );
} 