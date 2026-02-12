
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
  const { setUser, setIsAdmin, setSubscriptionTier } = useFinancialStore();

  useEffect(() => {
    // Skip if Supabase client is not available (e.g., during build)
    if (!supabase) {
      console.warn('Supabase client not available');
      return;
    }

    // Function to fetch user profile
    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin, subscription_tier')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setIsAdmin(data.is_admin || false);
          setSubscriptionTier(data.subscription_tier || 'free');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsAdmin(false);
        setSubscriptionTier('free');
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setIsAdmin, setSubscriptionTier]);

  return (
    <html lang="tr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
