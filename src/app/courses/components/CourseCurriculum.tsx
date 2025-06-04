import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiPlay, FiBook, FiFileText, FiAward, FiLock } from 'react-icons/fi';
import { Course } from '../types';

interface CourseCurriculumProps {
  course: Course;
}

export default function CourseCurriculum({ course }: CourseCurriculumProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['1']));

  const toggleChapter = (chapterId: string) => {
    const newExpandedChapters = new Set(expandedChapters);
    if (newExpandedChapters.has(chapterId)) {
      newExpandedChapters.delete(chapterId);
    } else {
      newExpandedChapters.add(chapterId);
    }
    setExpandedChapters(newExpandedChapters);
  };

  const getLectureIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FiPlay className="text-blue-500" />;
      case 'reading':
        return <FiBook className="text-green-500" />;
      case 'quiz':
        return <FiAward className="text-purple-500" />;
      case 'assignment':
        return <FiFileText className="text-orange-500" />;
      default:
        return <FiPlay className="text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Curriculum</h2>
      </div>
      <div className="px-6 pb-6">
        <div className="space-y-4">
          {course.curriculum.map((chapter: Course['curriculum'][0], chapterIndex: number) => (
            <div key={chapterIndex} className="border border-gray-200 rounded-lg">
              {/* Chapter Header */}
              <button
                onClick={() => toggleChapter(chapterIndex.toString())}
                className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg cursor-pointer"
              >
                <div className="flex items-center">
                  <span className="text-lg font-medium text-gray-900">{chapter.title}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({chapter.lectures} lectures • {chapter.duration})
                  </span>
                </div>
                {expandedChapters.has(chapterIndex.toString()) ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {/* Chapter Content */}
              {expandedChapters.has(chapterIndex.toString()) && (
                <div className="divide-y divide-gray-200">
                  {chapter.sections.map((section: Course['curriculum'][0]['sections'][0], sectionIndex: number) => (
                    <div key={sectionIndex} className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{section.title}</h4>
                      <div className="space-y-2">
                        {section.lectures.map((lecture: Course['curriculum'][0]['sections'][0]['lectures'][0], lectureIndex: number) => (
                          <div
                            key={lectureIndex}
                            className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center">
                              {getLectureIcon(lecture.type)}
                              <span className="ml-2 text-gray-800">{lecture.title}</span>
                              {lecture.preview && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Preview
                                </span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-2">{lecture.duration}</span>
                              {!lecture.preview && <FiLock className="text-gray-400" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 