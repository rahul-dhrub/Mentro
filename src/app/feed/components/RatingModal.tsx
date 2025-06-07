'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiX, FiStar, FiFilter, FiThumbsUp, FiTrash2 } from 'react-icons/fi';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes: number;
  isLikedByCurrentUser: boolean;
}

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentUser: {
    id: string;
    name: string;
    avatar: string;
  };
  onReviewsChange?: () => void; // Callback to notify parent of review changes
  showGiveRatingTab?: boolean; // Whether to show the "Give Rating" tab
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  currentUser,
  onReviewsChange,
  showGiveRatingTab = true
}) => {
  const [activeTab, setActiveTab] = useState<'give' | 'view'>('view');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  // Refetch reviews when sort or filter changes
  useEffect(() => {
    if (isOpen && userId) {
      fetchReviews();
    }
  }, [sortBy, filterRating]);

  // Mock reviews data
  const mockReviews: Review[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Dr. Sarah Johnson',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      rating: 5,
      comment: 'Excellent professor! Very knowledgeable and always willing to help students understand complex concepts.',
      createdAt: '2024-01-15T10:30:00Z',
      likes: 12,
      isLikedByCurrentUser: false
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Prof. Michael Chen',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      rating: 4,
      comment: 'Great collaboration on the research project. Professional and dedicated to quality work.',
      createdAt: '2024-01-10T14:20:00Z',
      likes: 8,
      isLikedByCurrentUser: true
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Dr. Emily Rodriguez',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      rating: 5,
      comment: 'Outstanding mentor and researcher. Has contributed significantly to our department.',
      createdAt: '2024-01-08T09:15:00Z',
      likes: 15,
      isLikedByCurrentUser: false
    },
    {
      id: '4',
      userId: 'user4',
      userName: 'Prof. David Kim',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      rating: 3,
      comment: 'Good professional relationship. Could improve communication on project timelines.',
      createdAt: '2024-01-05T16:45:00Z',
      likes: 3,
      isLikedByCurrentUser: false
    }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen, userId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/reviews?limit=50&sortBy=${sortBy}${filterRating ? `&rating=${filterRating}` : ''}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
        setRatingDistribution(data.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      } else {
        console.error('Error fetching reviews:', response.statusText);
        // Fallback to mock data if API fails
        setReviews(mockReviews);
        setAverageRating(4.2);
        setTotalReviews(mockReviews.length);
        setRatingDistribution({ 1: 1, 2: 0, 3: 1, 4: 1, 5: 2 });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Fallback to mock data if API fails
      setReviews(mockReviews);
      setAverageRating(4.2);
      setTotalReviews(mockReviews.length);
      setRatingDistribution({ 1: 1, 2: 0, 3: 1, 4: 1, 5: 2 });
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${userId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh the reviews list
        await fetchReviews();
        setRating(0);
        setComment('');
        setActiveTab('view');
        // Notify parent component of review changes
        if (onReviewsChange) {
          onReviewsChange();
        }
      } else {
        const errorData = await response.json();
        console.error('Error submitting rating:', errorData.error);
        alert(errorData.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update the review in the state
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                likes: data.likes,
                isLikedByCurrentUser: data.isLiked 
              }
            : review
        ));
      } else {
        console.error('Error liking review:', response.statusText);
      }
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const handleDeleteReview = async (reviewId: string, reviewAuthor: string) => {
    if (!confirm(`Are you sure you want to delete your review? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh the reviews list to get updated counts
        await fetchReviews();
        // Notify parent component of review changes
        if (onReviewsChange) {
          onReviewsChange();
        }
      } else {
        const errorData = await response.json();
        console.error('Error deleting review:', errorData.error);
        alert(errorData.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  const getFilteredAndSortedReviews = () => {
    // Since the API already handles filtering and sorting, just return the reviews
    return reviews;
  };

  const getAverageRating = (): number => {
    return averageRating;
  };

  const getAverageRatingString = (): string => {
    return averageRating.toFixed(1);
  };

  const getRatingDistribution = () => {
    return ratingDistribution;
  };

  const renderStars = (currentRating: number, interactive = false, size = 20) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isFilled = starNumber <= (interactive ? (hoverRating || rating) : currentRating);
      
      return (
        <FiStar
          key={index}
          size={size}
          className={`${interactive ? 'cursor-pointer' : ''} transition-colors ${
            isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
          onClick={interactive ? () => setRating(starNumber) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(starNumber) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />
      );
    });
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Ratings & Reviews
                  </h2>
                  <p className="text-gray-600">{userName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('view')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                      activeTab === 'view'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    View Reviews ({totalReviews})
                  </button>
                  {showGiveRatingTab && (
                    <button
                      onClick={() => setActiveTab('give')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                        activeTab === 'give'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Give Rating
                    </button>
                  )}
                </nav>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                {activeTab === 'view' ? (
                  <div className="p-6">
                    {/* Rating Summary */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900 mb-2">
                            {getAverageRatingString()}
                          </div>
                          <div className="flex items-center justify-center mb-2">
                            {renderStars(getAverageRating())}
                          </div>
                          <p className="text-gray-600">Based on {totalReviews} reviews</p>
                        </div>
                        
                        <div className="flex-1 max-w-sm ml-8">
                          {Object.entries(getRatingDistribution()).reverse().map(([rating, count]) => (
                            <div key={rating} className="flex items-center mb-1">
                              <span className="text-sm text-gray-600 w-8">{rating}★</span>
                              <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full transition-all"
                                  style={{ width: `${totalReviews > 0 ? (count / totalReviews) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-8">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <FiFilter className="text-gray-500" size={16} />
                        <span className="text-sm font-medium text-gray-700">Filter by rating:</span>
                        <select
                          value={filterRating || ''}
                          onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 cursor-pointer bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        >
                          <option value="">All ratings</option>
                          <option value="5">5 stars</option>
                          <option value="4">4 stars</option>
                          <option value="3">3 stars</option>
                          <option value="2">2 stars</option>
                          <option value="1">1 star</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Sort by:</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest')}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 cursor-pointer bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        >
                          <option value="newest">Newest first</option>
                          <option value="oldest">Oldest first</option>
                          <option value="highest">Highest rating</option>
                          <option value="lowest">Lowest rating</option>
                        </select>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {getFilteredAndSortedReviews().map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                            <img
                              src={review.userAvatar}
                              alt={review.userName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900">{review.userName}</h4>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center">
                                      {renderStars(review.rating, false, 16)}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-700 mb-3">{review.comment}</p>
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => handleLikeReview(review.id)}
                                  className={`flex items-center space-x-1 text-sm transition-colors cursor-pointer ${
                                    review.isLikedByCurrentUser 
                                      ? 'text-blue-600' 
                                      : 'text-gray-500 hover:text-blue-600'
                                  }`}
                                >
                                  <FiThumbsUp size={16} />
                                  <span>{review.likes}</span>
                                </button>
                                
                                {/* Delete button - only show for current user's reviews */}
                                {review.userId === currentUser.id && (
                                  <button
                                    onClick={() => handleDeleteReview(review.id, review.userName)}
                                    className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                    title="Delete your review"
                                  >
                                    <FiTrash2 size={16} />
                                    <span>Delete</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {getFilteredAndSortedReviews().length === 0 && (
                      <div className="text-center py-12">
                        <FiStar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                        <p className="text-gray-500">
                          {filterRating ? `No reviews with ${filterRating} stars found.` : 'No reviews yet.'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="max-w-2xl mx-auto">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Rate {userName}
                      </h3>
                      
                      {/* Rating Stars */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Your Rating
                        </label>
                        <div className="flex items-center space-x-1">
                          {renderStars(rating, true, 32)}
                        </div>
                        {rating > 0 && (
                          <p className="text-sm text-gray-600 mt-2">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent"}
                          </p>
                        )}
                      </div>

                      {/* Comment */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Your Review (Optional)
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your experience working with this person..."
                          rows={4}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSubmitRating}
                          disabled={rating === 0 || isSubmitting}
                          className={`px-6 py-2 rounded-md font-medium transition-colors ${
                            rating === 0 || isSubmitting
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                          }`}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                        </button>
                        <button
                          onClick={() => {
                            setRating(0);
                            setComment('');
                            setActiveTab('view');
                          }}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RatingModal; 