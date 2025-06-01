"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import UserMenu from "../UserMenu";
import ThemeToggle from "../ThemeToggle";
import { SiteNotification } from "../SiteNotification";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { useAuth } from "@/hooks/useAuth";

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isCanvasPage = pathname.startsWith('/canvas/');
  const isOverlay = pathname.startsWith('/overlay');
  const isCanvasView = pathname.startsWith('/canvas/') && !pathname.endsWith('/settings');

  // Don't render navigation on overlay or canvas pages
  if (isOverlay || isCanvasView) return null;

  return (
    <>
      <header className={isCanvasPage ? "fixed top-4 left-4 right-4 z-50 pointer-events-none" : "sticky top-0 z-50 bg-background/80 backdrop-blur-xl"}>
        <nav className={isCanvasPage ? "h-14 px-4 bg-transparent" : "nav-container px-4"}>
          <div className={isCanvasPage ? "h-full flex items-center justify-between" : "nav-content"}>
            <div className="flex items-center gap-6 pointer-events-auto">
              <Link
                href="/"
                className="text-lg font-heading font-bold"
              >
                <span className="gradient-brand">Zombie</span>
                <span className="text-foreground/90">.Digital</span>
              </Link>

              <DesktopNav user={user} pathname={pathname} />
            </div>

            <div className="flex items-center gap-3 pointer-events-auto">
              <ThemeToggle />
              {user && <UserMenu user={user} />}
            </div>
          </div>
        </nav>
        <SiteNotification user={user} />
      </header>

      <MobileNav user={user} pathname={pathname} />
    </>
  );
} 