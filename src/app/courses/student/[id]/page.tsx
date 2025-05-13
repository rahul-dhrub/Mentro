'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import CourseHeader from '../components/CourseHeader';
import CourseOverview from '../components/CourseOverview';
import CourseCurriculum from '../components/CourseCurriculum';
import CourseSidebar from '../components/CourseSidebar';
import { Course } from '../types';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  // Mock course data (in a real app, fetch this based on params.id)
  const course: Course = {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    description: 'Learn web development from scratch. Master HTML, CSS, JavaScript, React, Node.js, and more.',
    instructor: {
      name: 'John Doe',
      image: 'https://observatory.tec.mx/wp-content/uploads/2020/09/maestroprofesorinstructor.jpg',
      rating: 4.8,
      reviews: 1250
    },
    rating: 4.7,
    reviews: 2500,
    students: 15000,
    price: 49.99,
    originalPrice: 199.99,
    thumbnail: 'https://wpassets.brainstation.io/app/uploads/2021/10/24135334/Web-Dev.jpg',
    category: 'Development',
    level: 'Beginner',
    duration: '45 hours',
    lastUpdated: new Date('2024-03-15'),
    features: ['Lifetime access', 'Certificate of completion', 'Downloadable resources'],
    requirements: ['Basic computer knowledge', 'No programming experience needed'],
    whatYouWillLearn: [
      'Build responsive websites',
      'Create web applications',
      'Deploy to production'
    ],
    curriculum: [
      {
        title: 'HTML & CSS Fundamentals',
        lectures: 25,
        duration: '10 hours',
        sections: [
          {
            title: 'Introduction to HTML',
            lectures: [
              {
                title: 'Welcome to the Course',
                duration: '5:00',
                type: 'video',
                preview: true
              },
              {
                title: 'Setting Up Your Development Environment',
                duration: '10:00',
                type: 'video'
              },
              {
                title: 'HTML Document Structure',
                duration: '15:00',
                type: 'video'
              },
              {
                title: 'HTML Elements and Tags',
                duration: '20:00',
                type: 'video'
              },
              {
                title: 'HTML Quiz 1',
                duration: '15:00',
                type: 'quiz'
              }
            ]
          },
          {
            title: 'CSS Basics',
            lectures: [
              {
                title: 'Introduction to CSS',
                duration: '10:00',
                type: 'video'
              },
              {
                title: 'CSS Selectors and Properties',
                duration: '20:00',
                type: 'video'
              },
              {
                title: 'CSS Box Model',
                duration: '15:00',
                type: 'video'
              },
              {
                title: 'CSS Layout Techniques',
                duration: '25:00',
                type: 'video'
              },
              {
                title: 'CSS Assignment 1',
                duration: '30:00',
                type: 'assignment'
              }
            ]
          }
        ]
      },
      {
        title: 'JavaScript Mastery',
        lectures: 30,
        duration: '15 hours',
        sections: [
          {
            title: 'JavaScript Fundamentals',
            lectures: [
              {
                title: 'Introduction to JavaScript',
                duration: '10:00',
                type: 'video',
                preview: true
              },
              {
                title: 'Variables and Data Types',
                duration: '15:00',
                type: 'video'
              },
              {
                title: 'Control Flow and Functions',
                duration: '20:00',
                type: 'video'
              },
              {
                title: 'JavaScript Reading Materials',
                duration: '30:00',
                type: 'reading'
              }
            ]
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        cartCount={2}
        favoriteCount={5}
        user={{
          name: 'John Doe',
          role: 'Student',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        }}
      />

      <CourseHeader course={course} />

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <CourseOverview course={course} />
            <div className="mt-8">
              <CourseCurriculum course={course} />
            </div>
          </div>

          {/* Sidebar */}
          <CourseSidebar course={course} />
        </div>
      </div>
    </div>
  );
} 