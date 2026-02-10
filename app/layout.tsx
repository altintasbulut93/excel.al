
"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useFinancialStore } from "@/lib/store";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setUser } = useFinancialStore();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <html lang="tr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
