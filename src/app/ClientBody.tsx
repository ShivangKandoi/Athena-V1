"use client";

import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationsInit } from "@/components/notifications-init";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Track whether we're mounted on the client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This runs only on the client after hydration
    setMounted(true);
    document.body.className = "antialiased";
  }, []);

  // During SSR and initial client-side render before hydration,
  // we don't want to display anything that might differ between server and client
  return (
    <body className="antialiased" suppressHydrationWarning>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
          {mounted && (
            <>
              <Toaster position="bottom-right" richColors />
              <NotificationsInit />
            </>
          )}
        </AuthProvider>
      </ThemeProvider>
    </body>
  );
}
