'use client';

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useAnalytics } from '@/components/FirebaseAnalyticsProvider';
import { useEffect } from 'react';

export default function SignUpPage() {
  const analytics = useAnalytics();

  useEffect(() => {
    // Track sign-up page view
    analytics.trackEvent('auth_page_view', {
      auth_type: 'sign_up',
      page_location: '/sign-up'
    });
  }, [analytics]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <SignUp
        appearance={{
          baseTheme: dark,
        }}
        afterSignInUrl="/"
        afterSignUpUrl="/"
      />
    </div>
  );
}

