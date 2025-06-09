'use client';

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useAnalytics } from '@/components/FirebaseAnalyticsProvider';
import { useEffect } from 'react';

export default function SignInPage() {
  const analytics = useAnalytics();

  useEffect(() => {
    // Track sign-in page view
    analytics.trackEvent('auth_page_view', {
      auth_type: 'sign_in',
      page_location: '/sign-in'
    });
  }, [analytics]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <SignIn
        appearance={{
          baseTheme: dark,
        }}
        afterSignInUrl="/"
        afterSignUpUrl="/"
      />
    </div>
  );
}

