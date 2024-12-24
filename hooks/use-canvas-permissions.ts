import { useEffect, useState } from "react";
import { checkCanvasAccess, type CanvasRole } from "@/lib/canvas-permissions";
import { useUser } from "@/hooks/use-user";

interface CanvasPermissions {
  isLoading: boolean;
  error: Error | null;
  allowed: boolean;
  role: CanvasRole;
  canEdit: boolean;
}

export function useCanvasPermissions(canvasId: string) {
  const { user } = useUser();
  const [permissions, setPermissions] = useState<CanvasPermissions>({
    isLoading: true,
    error: null,
    allowed: false,
    role: null,
    canEdit: false,
  });

  useEffect(() => {
    async function checkPermissions() {
      try {
        const access = await checkCanvasAccess(canvasId, user?.id);
        setPermissions({
          isLoading: false,
          error: null,
          ...access,
        });
      } catch (error) {
        setPermissions({
          isLoading: false,
          error: error as Error,
          allowed: false,
          role: null,
          canEdit: false,
        });
      }
    }

    if (user) {
      checkPermissions();
    } else {
      setPermissions({
        isLoading: false,
        error: null,
        allowed: false,
        role: null,
        canEdit: false,
      });
    }
  }, [canvasId, user]);

  return permissions;
}
