import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TwitchUser, UserLevel } from "@/types/database";
import { hasPermission } from "@/utils/permissions";
import { EyeIcon, EyeOffIcon, ChevronDownIcon, ChevronUpIcon } from "@/components/icons";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface DataOverviewProps {
  session: any;
  user: TwitchUser;
  effectiveRole: UserLevel;
}

function SensitiveText({ text }: { text: string }) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="flex items-center gap-2 relative">
      <input
        type="text"
        value={text}
        readOnly
        className={`w-full font-mono bg-foreground/5 px-2 py-0.5 rounded text-right 
                   transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50
                   ${isRevealed ? "blur-none" : "blur-[4px]"}`}
      />
      <button
        type="button"
        onClick={() => setIsRevealed(!isRevealed)}
        className="flex-shrink-0 p-1.5 hover:bg-white/5 rounded-full transition-colors z-10"
        title={isRevealed ? "Hide sensitive data" : "Show sensitive data"}
      >
        {isRevealed ? (
          <EyeOffIcon size={14} className="opacity-60" />
        ) : (
          <EyeIcon size={14} className="opacity-60" />
        )}
      </button>
    </div>
  );
}

function CollapsibleSection({ 
  title, 
  children, 
  defaultExpanded = false 
}: { 
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="ethereal-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors rounded-t-lg"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        {isExpanded ? (
          <ChevronUpIcon size={20} className="opacity-60" />
        ) : (
          <ChevronDownIcon size={20} className="opacity-60" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DataSection({ title, items, defaultExpanded = false }: { 
  title: string; 
  items: { label: string; value: string; sensitive?: boolean }[];
  defaultExpanded?: boolean;
}) {
  return (
    <CollapsibleSection title={title} defaultExpanded={defaultExpanded}>
      <div className="space-y-2">
        {items.map(({ label, value, sensitive }, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <span className="text-sm text-foreground/70 flex-shrink-0 mr-4">{label}</span>
            <div className="text-sm font-medium flex-1 min-w-0">
              {sensitive ? (
                <SensitiveText text={value} />
              ) : (
                <input
                  type="text"
                  value={value}
                  readOnly
                  className="w-full bg-foreground/5 px-2 py-0.5 rounded text-right 
                           focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}

export function DataOverview({ session, user, effectiveRole }: DataOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!hasPermission(effectiveRole, "admin")) {
    return null;
  }

  const authInfo = [
    { label: "Auth Provider", value: session.user.app_metadata.provider },
    { label: "Access Token", value: session.access_token, sensitive: true },
    { label: "Refresh Token", value: session.refresh_token, sensitive: true },
    { label: "Token Expires", value: new Date(session.expires_at * 1000).toLocaleString() },
    { label: "Session ID", value: session.user.session_id, sensitive: true },
    { label: "Auth Role", value: session.user.role },
  ];

  const twitchInfo = [
    { label: "Broadcaster Type", value: user.raw_user_meta_data.custom_claims.broadcaster_type || "Regular" },
    { label: "User ID", value: user.twitch_id, sensitive: true },
    { label: "Provider ID", value: user.provider_id, sensitive: true },
    { label: "Email", value: user.email, sensitive: true },
    { label: "Username", value: user.username },
    { label: "Display Name", value: user.display_name },
    { label: "Site Role", value: user.site_role },
  ];

  const integrationInfo = [
    { label: "Provider Token", value: user.provider_token, sensitive: true },
    { label: "Provider Refresh", value: user.provider_refresh_token, sensitive: true },
    { label: "Token Expires", value: new Date(user.token_expires_at).toLocaleString() },
    { label: "Active Scopes", value: `${user.provider_scopes.length} Permissions` },
  ];

  const accountInfo = [
    { label: "Created At", value: new Date(user.created_at).toLocaleString() },
    { label: "Updated At", value: new Date(user.updated_at).toLocaleString() },
    { label: "Last Sign In", value: new Date(user.last_sign_in_at).toLocaleString() },
    { label: "Confirmed At", value: new Date(user.confirmed_at).toLocaleString() },
    { label: "Anonymous", value: user.is_anonymous ? "Yes" : "No" },
  ];

  return (
    <motion.div variants={itemVariants} className="mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors rounded-lg mb-2"
      >
        <h2 className="text-xl font-bold">Account Overview</h2>
        {isExpanded ? (
          <ChevronUpIcon size={20} className="opacity-60" />
        ) : (
          <ChevronDownIcon size={20} className="opacity-60" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <DataSection title="Authentication" items={authInfo} />
                <DataSection title="Account Details" items={accountInfo} />
              </div>
              <div className="space-y-6">
                <DataSection title="Twitch Account" items={twitchInfo} />
                <DataSection title="Integration" items={integrationInfo} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 