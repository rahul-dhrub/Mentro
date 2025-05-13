import Image from 'next/image';
import { FiEdit2 } from 'react-icons/fi';

interface ProfileBannerProps {
  name: string;
  role: string;
  bannerImage: string;
  profileImage: string;
  totalStudents: number;
  totalCourses: number;
  averageRating: number;
  onEditClick: () => void;
}

export default function ProfileBanner({
  name,
  role,
  bannerImage,
  profileImage,
  totalStudents,
  totalCourses,
  averageRating,
  onEditClick,
}: ProfileBannerProps) {
  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="relative h-96 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900 to-amber-700" />
        <Image
          src={bannerImage}
          alt="Profile banner"
          fill
          className="object-cover mix-blend-overlay"
          priority
          sizes="100vw"
          quality={100}
          style={{ objectPosition: 'center 30%' }}
        />
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-32">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            {/* Profile Image */}
            <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-amber-100 overflow-hidden bg-gray-200 shadow-lg">
              <Image
                src={profileImage}
                alt={name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 640px) 128px, 160px"
                quality={100}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 drop-shadow-lg">{name}</h1>
                <button
                  onClick={onEditClick}
                  className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <FiEdit2 size={20} />
                </button>
              </div>
              <p className="text-lg text-cyan-400 mb-4 drop-shadow-lg">{role}</p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400 drop-shadow-lg">{totalStudents}</p>
                  <p className="text-sm text-cyan-400 drop-shadow-lg">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400 drop-shadow-lg">{totalCourses}</p>
                  <p className="text-sm text-cyan-400 drop-shadow-lg">Courses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400 drop-shadow-lg">{averageRating}</p>
                  <p className="text-sm text-cyan-400 drop-shadow-lg">Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 