"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useFinancialStore } from "@/lib/store";
import { LanguageProvider } from "@/lib/i18n-context";

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
    const fetchProfile = async (userId: string, email?: string) => {
      // Developer Override
      if (email === 'altintasbulut28@gmail.com' || email === 'altintasbulut93@gmail.com') {
        setIsAdmin(true);
        setSubscriptionTier('enterprise');
        console.log('Developer Mode: Admin granted to', email);
        return;
      }

      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin, subscription_tier')
          .eq('id', userId)
          .single();

        if (error) {
          // PGRST116: No object found - normal for first-time login if trigger hasn't run
          if (error.code === 'PGRST116') {
            console.warn('Profile not found for user, using default permissions.');
            setIsAdmin(false);
            setSubscriptionTier('free');
            return;
          }
          console.error('Error fetching profile:', error.message, '| Code:', error.code);
          return;
        }

        if (data) {
          setIsAdmin(data.is_admin || false);
          setSubscriptionTier(data.subscription_tier || 'free');
        } else {
          setIsAdmin(false);
          setSubscriptionTier('free');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    };

    // Check initial session
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email);
        }
      });

      // Listen for changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email);
        } else {
          setIsAdmin(false);
          setSubscriptionTier('free');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [setUser, setIsAdmin, setSubscriptionTier]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
