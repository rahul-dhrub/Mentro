import { FiAward, FiDollarSign } from 'react-icons/fi';

interface ProfileInfoProps {
  bio: string;
  expertise: string[];
  achievements: string[];
  onDonate: () => void;
}

export default function ProfileInfo({ bio, expertise, achievements, onDonate }: ProfileInfoProps) {
  return (
    <div className="space-y-6">
      {/* About Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
        <p className="text-gray-800">{bio}</p>
      </div>

      {/* Expertise Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Expertise</h2>
        <div className="flex flex-wrap gap-2">
          {expertise.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Achievements</h2>
        <ul className="space-y-2">
          {achievements.map((achievement, index) => (
            <li key={index} className="flex items-start gap-2">
              <FiAward className="text-yellow-500 mt-1 flex-shrink-0" />
              <span className="text-gray-800">{achievement}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Donation Section */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Support</h2>
        <p className="text-gray-800 mb-4">
          If you find my content valuable, consider supporting my work!
        </p>
        <button
          onClick={onDonate}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiDollarSign />
          <span>Donate</span>
        </button>
      </div>
    </div>
  );
}
