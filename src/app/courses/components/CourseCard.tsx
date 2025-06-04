'use client';

import Link from 'next/link';
import { FiStar, FiUsers, FiClock, FiShoppingCart, FiCheck, FiHeart } from 'react-icons/fi';
import { Course } from '../types';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const courseInCart = isInCart(course.id);
  const courseInWishlist = isInWishlist(course.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    if (!courseInCart) {
      addToCart(course);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    
    if (courseInWishlist) {
      removeFromWishlist(course.id);
    } else {
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
    <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 relative">
      <Link href={`/courses/${course.id}`} className="block cursor-pointer">
        {/* Course Thumbnail */}
        <div className="aspect-video relative">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium">
              View Course
            </span>
          </div>
        </div>

        {/* Course Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
            {course.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <span className="mr-4">{course.instructor.name}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
            <div className="flex items-center">
              <FiStar className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span>{course.rating}</span>
              <span className="text-gray-500 ml-1">({course.reviews})</span>
            </div>
            <div className="flex items-center">
              <FiUsers className="w-4 h-4 mr-1" />
              <span>{course.students.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-800">
              <FiClock className="mr-1" />
              <span>{course.duration}</span>
            </div>
            <div className="text-sm">
              {course.originalPrice && course.originalPrice !== course.price ? (
                <div className="flex items-center">
                  <span className="text-gray-900 font-bold">${course.price}</span>
                  <span className="text-gray-600 line-through ml-2">${course.originalPrice}</span>
                </div>
              ) : (
                <span className="text-gray-900 font-bold">${course.price}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Wishlist Button - Top Left */}
      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleWishlistToggle}
          className={`p-2 rounded-full shadow-lg transition-colors cursor-pointer ${
            courseInWishlist
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          title={courseInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart className={`w-5 h-5 ${courseInWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Add to Cart Button - Top Right */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleAddToCart}
          className={`p-2 rounded-full shadow-lg transition-colors cursor-pointer ${
            courseInCart
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          title={courseInCart ? 'Added to cart' : 'Add to cart'}
        >
          {courseInCart ? (
            <FiCheck className="w-5 h-5" />
          ) : (
            <FiShoppingCart className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
} 