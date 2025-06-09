'use client';

import { FiCheck, FiShoppingCart, FiHeart, FiEdit } from 'react-icons/fi';
import { Course } from '../types';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { useAnalytics } from '@/components/FirebaseAnalyticsProvider';

interface CourseSidebarProps {
  course: Course;
  isStudent?: boolean;
  userRole?: string;
  onEditClick?: () => void;
}

export default function CourseSidebar({ course, isStudent = false, userRole, onEditClick }: CourseSidebarProps) {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const analytics = useAnalytics();

  const courseInCart = isInCart(course.id);
  const courseInWishlist = isInWishlist(course.id);
  
  // Check if user can edit this course
  const canEdit = userRole && (userRole.toLowerCase() === 'instructor' || userRole.toLowerCase() === 'admin');

  const handlePrimaryButtonClick = () => {
    if (isStudent) {
      if (courseInCart) {
        // Track cart navigation
        analytics.trackEvent('cart_navigation', {
          source: 'course_sidebar',
          course_id: course.id
        });
        // Navigate to cart if already in cart
        router.push('/cart');
      } else {
        // Track add to cart
        analytics.trackAddToCart(course.id, course.title, course.price);
        // Add to cart
        addToCart(course);
      }
    } else {
      // Track course detail navigation
      analytics.trackEvent('course_detail_navigation', {
        source: 'course_sidebar',
        course_id: course.id,
        course_name: course.title
      });
      // Navigate to course detail page
      router.push(`/course_detail/${course.id}`);
    }
  };

  const handleSecondaryButtonClick = () => {
    if (isStudent) {
      // Track buy now click
      analytics.trackEvent('buy_now_click', {
        course_id: course.id,
        course_name: course.title,
        course_price: course.price,
        source: 'course_sidebar'
      });
      // TODO: Buy now functionality
      console.log('Buy now:', course.id);
    } else {
      // Call edit functionality if user can edit, otherwise fallback
      if (canEdit && onEditClick) {
        analytics.trackEvent('course_edit_click', {
          course_id: course.id,
          course_name: course.title,
          source: 'course_sidebar'
        });
        onEditClick();
      } else {
        analytics.trackEvent('course_view_details_click', {
          course_id: course.id,
          course_name: course.title,
          source: 'course_sidebar'
        });
        console.log('View course details:', course.id);
      }
    }
  };

  const handleWishlistClick = () => {
    if (courseInWishlist) {
      analytics.trackEvent('remove_from_wishlist', {
        course_id: course.id,
        course_name: course.title,
        course_price: course.price,
        source: 'course_sidebar'
      });
      removeFromWishlist(course.id);
    } else {
      analytics.trackEvent('add_to_wishlist', {
        course_id: course.id,
        course_name: course.title,
        course_price: course.price,
        instructor_name: course.instructor.name,
        source: 'course_sidebar'
      });
      addToWishlist({
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        originalPrice: course.originalPrice,
        thumbnail: course.thumbnail,
        instructor: {
          name: course.instructor.name,
          avatar: course.instructor.image,
        },
        rating: course.rating,
        studentsCount: course.students,
        duration: course.duration,
        level: course.level,
        category: course.category,
      });
    }
  };

  return (
    <div className="w-full md:w-80 flex-shrink-0">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          {course.originalPrice && course.originalPrice !== course.price ? (
            <>
              <span className="text-2xl font-bold text-gray-900">${course.price}</span>
              <span className="text-lg text-gray-700 line-through">${course.originalPrice}</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-gray-900">${course.price}</span>
          )}
        </div>
        
        <button 
          className={`w-full py-3 rounded-lg font-medium mb-4 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            isStudent && courseInCart
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={handlePrimaryButtonClick}
        >
          {isStudent ? (
            courseInCart ? (
              <>
                <FiCheck className="w-5 h-5" />
                Added to Cart
              </>
            ) : (
              <>
                <FiShoppingCart className="w-5 h-5" />
                Add to Cart
              </>
            )
          ) : (
            'Go to Course'
          )}
        </button>
        
        <button 
          className={`w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 mb-4 transition-colors cursor-pointer ${
            canEdit ? 'flex items-center justify-center gap-2' : ''
          }`}
          onClick={handleSecondaryButtonClick}
        >
          {isStudent ? (
            'Buy Now'
          ) : canEdit ? (
            <>
              <FiEdit className="w-5 h-5" />
              Edit Course
            </>
          ) : (
            'View Details'
          )}
        </button>

        {/* Add to Wishlist Button - Only show for students */}
        {isStudent && (
          <button 
            className={`w-full border rounded-lg font-medium py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              courseInWishlist
                ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={handleWishlistClick}
          >
            <FiHeart className={`w-5 h-5 ${courseInWishlist ? 'fill-current' : ''}`} />
            {courseInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </button>
        )}
        
        <div className={`space-y-3 ${isStudent ? 'mt-6' : 'mt-0'}`}>
          <h3 className="font-medium text-gray-900">This course includes:</h3>
          <ul className="space-y-2">
            {course.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-center text-sm text-gray-700">
                <FiCheck className="text-green-500 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Features</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Level</span>
            <span className="font-medium text-gray-900">{course.level}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Duration</span>
            <span className="font-medium text-gray-900">{course.duration}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Category</span>
            <span className="font-medium text-gray-900">{course.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Last Updated</span>
            <span className="font-medium text-gray-900">
              {new Date(course.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 