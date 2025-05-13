import { FiAward } from 'react-icons/fi';

interface StudentProfileInfoProps {
  bio: string;
  expertise: string[];
  achievements: string[];
}

export default function StudentProfileInfo({ bio, expertise, achievements }: StudentProfileInfoProps) {
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
    </div>
  );
} 