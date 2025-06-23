'use client'

import { useState } from "react";
import { UserLevel } from "@/types/database";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ViewButton } from "@/components/ui/action-button";
import { TooltipProvider } from "@/components/ui/tooltip";

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
        <TooltipProvider>
          <ViewButton
            onClick={() => setIsOpen(!isOpen)}
            tooltip={previewRole ? `Currently viewing as ${previewRole}` : 'Preview different user roles'}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {previewRole ? `Viewing as ${previewRole}` : 'Role Preview'}
          </ViewButton>
        </TooltipProvider>

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
                <TooltipProvider>
                  <ViewButton
                    onClick={() => {
                      onPreviewChange(null);
                      setIsOpen(false);
                    }}
                    size="sm"
                    tooltip="Return to your normal role view"
                    className="w-full text-left px-4 py-2 text-sm justify-start rounded-none text-cyan-400"
                  >
                    Exit Preview Mode
                  </ViewButton>
                </TooltipProvider>
              )}

              {availableRoles.map((role) => (
                <TooltipProvider key={role}>
                  <ViewButton
                    onClick={() => {
                      onPreviewChange(role);
                      setIsOpen(false);
                    }}
                    disabled={role === previewRole}
                    size="sm"
                    tooltip={`Preview the website as a ${role} user`}
                    className={`w-full text-left px-4 py-2 text-sm justify-start rounded-none
                      ${role === previewRole
                        ? 'bg-white/10 text-foreground/50'
                        : 'text-foreground/90'
                      }`}
                  >
                    Preview as {role}
                  </ViewButton>
                </TooltipProvider>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 