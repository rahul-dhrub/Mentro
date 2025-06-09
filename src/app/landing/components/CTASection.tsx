'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAnalytics } from '@/components/FirebaseAnalyticsProvider';

export default function CTASection() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const analytics = useAnalytics();

  const handleCTAClick = (role: 'learner' | 'tutor') => {
    analytics.trackEvent('cta_click', {
      cta_name: role === 'learner' ? 'join_as_learner' : 'become_tutor',
      cta_location: 'bottom_cta_section',
      user_role: role === 'learner' ? 'student' : 'instructor',
      is_signed_in: isSignedIn
    });

    if (!isSignedIn) {
      analytics.trackEvent('signup_redirect', {
        source: 'bottom_cta_section',
        intended_role: role === 'learner' ? 'student' : 'instructor'
      });
      router.push('/sign-in');
    } else {
      router.push('/feed');
    }
  };
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-8">
          Ready to Transform Your Journey?
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => handleCTAClick('learner')}
            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Join as a Learner
          </button>
          <button 
            onClick={() => handleCTAClick('tutor')}
            className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
          >
            Become a Tutor
          </button>
        </div>
      </div>
    </div>
  );
} 