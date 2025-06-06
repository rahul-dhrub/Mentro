import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Course } from '../../types';
import { coursesAPI } from '@/lib/api/courses';
import Navbar from '../../components/Navbar';
import CourseHeader from '../../components/CourseHeader';
import CourseContent from './CourseContent';
import CourseSidebar from '../../components/CourseSidebar';
import EditCourseModal from './EditCourseModal';
import ConfirmationModal from './ConfirmationModal';

interface CourseLayoutProps {
  course: Course;
  user: {
    name: string;
    role: string;
    image: string;
  };
  onCourseUpdate?: (updatedCourse: Course) => void;
}

export default function CourseLayout({ course, user, onCourseUpdate }: CourseLayoutProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(course);
  
  // Action states
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'publish' | 'unpublish' | 'delete';
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'publish',
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => {}
  });
  
  // Check if user is a student
  const isStudent = user.role.toLowerCase() === 'student';

  const handleGoBack = () => {
    router.back();
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (updatedCourse: Course) => {
    setCurrentCourse(updatedCourse);
    if (onCourseUpdate) {
      onCourseUpdate(updatedCourse);
    }
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
  };

  // Confirmation modal handlers
  const openConfirmationModal = (
    type: 'publish' | 'unpublish' | 'delete',
    onConfirm: () => void
  ) => {
    const modalConfig = {
      publish: {
        title: 'Publish Course',
        message: 'Are you sure you want to publish this course? Once published, it will be visible to all students and they can enroll in it.',
        confirmText: 'Publish Course'
      },
      unpublish: {
        title: 'Unpublish Course',
        message: 'Are you sure you want to unpublish this course? This will hide it from students and they won\'t be able to enroll in it.',
        confirmText: 'Unpublish Course'
      },
      delete: {
        title: 'Delete Course',
        message: 'Are you sure you want to permanently delete this course? This action cannot be undone. All course content will be lost.',
        confirmText: 'Delete Course'
      }
    };

    const config = modalConfig[type];
    setConfirmationModal({
      isOpen: true,
      type,
      title: config.title,
      message: config.message,
      confirmText: config.confirmText,
      onConfirm
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  // Action handlers
  const handlePublishClick = () => {
    openConfirmationModal('publish', confirmPublish);
  };

  const confirmPublish = async () => {
    setIsPublishing(true);
    
    try {
      const response = await coursesAPI.publish(currentCourse.id, true);
      
      if (response.success && response.data) {
        setCurrentCourse(response.data);
        if (onCourseUpdate) {
          onCourseUpdate(response.data);
        }
        closeConfirmationModal();
      } else {
        console.error('Failed to publish course:', response.error);
        alert(`Failed to publish course: ${response.error}`);
      }
    } catch (error) {
      console.error('Error publishing course:', error);
      alert('An unexpected error occurred while publishing the course');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublishClick = () => {
    openConfirmationModal('unpublish', confirmUnpublish);
  };

  const confirmUnpublish = async () => {
    setIsUnpublishing(true);
    
    try {
      const response = await coursesAPI.publish(currentCourse.id, false);
      
      if (response.success && response.data) {
        setCurrentCourse(response.data);
        if (onCourseUpdate) {
          onCourseUpdate(response.data);
        }
        closeConfirmationModal();
      } else {
        console.error('Failed to unpublish course:', response.error);
        alert(`Failed to unpublish course: ${response.error}`);
      }
    } catch (error) {
      console.error('Error unpublishing course:', error);
      alert('An unexpected error occurred while unpublishing the course');
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleDeleteClick = () => {
    openConfirmationModal('delete', confirmDelete);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await coursesAPI.delete(currentCourse.id);
      
      if (response.success) {
        closeConfirmationModal();
        // Navigate back to courses list after successful deletion
        router.push('/courses');
      } else {
        console.error('Failed to delete course:', response.error);
        alert(`Failed to delete course: ${response.error}`);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('An unexpected error occurred while deleting the course');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={user}
        showBackButton={true}
        onBackClick={handleGoBack}
        backButtonText="Back"
      />

      <CourseHeader 
        course={currentCourse} 
        userRole={user.role}
        onPublishClick={handlePublishClick}
        onUnpublishClick={handleUnpublishClick}
        onDeleteClick={handleDeleteClick}
        isPublishing={isPublishing}
        isUnpublishing={isUnpublishing}
        isDeleting={isDeleting}
      />

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <CourseContent course={currentCourse} />

          {/* Sidebar */}
          <CourseSidebar 
            course={currentCourse} 
            isStudent={isStudent}
            userRole={user.role}
            onEditClick={handleEditClick}
          />
        </div>
      </div>

      {/* Edit Course Modal */}
      <EditCourseModal
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        course={currentCourse}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        courseTitle={currentCourse.title}
        actionType={confirmationModal.type}
        isLoading={
          confirmationModal.type === 'publish' ? isPublishing :
          confirmationModal.type === 'unpublish' ? isUnpublishing :
          isDeleting
        }
      />
    </div>
  );
} 