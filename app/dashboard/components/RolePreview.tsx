import { useState } from "react";
import { UserLevel } from "@/types/database";
import { motion, AnimatePresence } from "framer-motion";

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
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ethereal-button flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
          </svg>
          <span>
            {previewRole ? `Viewing as ${previewRole}` : 'Role Preview'}
          </span>
        </button>

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