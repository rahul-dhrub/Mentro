import React from 'react';
import { Course } from '../../types';
import CourseOverview from '../../components/CourseOverview';
import CourseCurriculum from '../../components/CourseCurriculum';

interface CourseContentProps {
  course: Course;
}

export default function CourseContent({ course }: CourseContentProps) {
  return (
    <div className="flex-1">
      <CourseOverview course={course} />
      <div className="mt-8">
        <CourseCurriculum course={course} />
      </div>
    </div>
  );
} 