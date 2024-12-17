import { useContext } from "react";
import { UserContext } from "@/app/dashboard/components/DashboardClient";

export function useUser() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserContext.Provider");
  }
  return context;
}
