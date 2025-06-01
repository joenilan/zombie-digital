'use client'

import { useState } from "react";
import { UserLevel } from "@/types/database";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const PREVIEW_ROLES: UserLevel[] = ["user", "moderator", "admin", "owner"];

interface RolePreviewProps {
  currentRole: UserLevel;
  previewRole: UserLevel | null;
  onPreviewChange: (role: UserLevel | null) => void;
}

export function RolePreview({ currentRole, previewRole, onPreviewChange }: RolePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Only show roles below or equal to the user's actual role
  const availableRoles = PREVIEW_ROLES.filter(
    role => PREVIEW_ROLES.indexOf(role) <= PREVIEW_ROLES.indexOf(currentRole)
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="ethereal"
          icon={<ArrowRight className="w-4 h-4" />}
        >
          {previewRole ? `Viewing as ${previewRole}` : 'Role Preview'}
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full right-0 mb-2 w-48 py-2 bg-glass backdrop-blur-xl 
                        border border-white/10 rounded-lg shadow-lg"
            >
              {previewRole && (
                <button
                  onClick={() => {
                    onPreviewChange(null);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors text-cyan-400"
                >
                  Exit Preview Mode
                </button>
              )}

              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onPreviewChange(role);
                    setIsOpen(false);
                  }}
                  disabled={role === previewRole}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors
                    ${role === previewRole
                      ? 'bg-white/10 text-foreground/50'
                      : 'hover:bg-white/5 text-foreground/90'
                    }`}
                >
                  Preview as {role}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 