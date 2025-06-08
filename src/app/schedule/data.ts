import { DaySchedule } from './types';

export const mockScheduleData: DaySchedule[] = [
  {
    date: '2024-01-15',
    tasks: [
      {
        id: '1',
        title: 'Advanced Machine Learning',
        type: 'class',
        startTime: '09:00',
        endTime: '10:30',
        location: 'CS-101',
        attendees: 35,
        description: 'Deep Learning Fundamentals'
      },
      {
        id: '2',
        title: 'Office Hours',
        type: 'office-hours',
        startTime: '11:00',
        endTime: '12:00',
        location: 'Faculty Office 204'
      },
      {
        id: '3',
        title: 'Lunch Break',
        type: 'break',
        startTime: '12:00',
        endTime: '13:00'
      },
      {
        id: '4',
        title: 'Research Meeting',
        type: 'research',
        startTime: '14:30',
        endTime: '15:30',
        location: 'Research Lab',
        attendees: 8,
        description: 'AI Ethics Project Discussion'
      },
      {
        id: '5',
        title: 'Data Structures',
        type: 'class',
        startTime: '16:00',
        endTime: '17:30',
        location: 'CS-203',
        attendees: 42,
        isOnline: false
      }
    ]
  },
  {
    date: '2024-01-16',
    tasks: [
      {
        id: '6',
        title: 'Faculty Meeting',
        type: 'meeting',
        startTime: '09:30',
        endTime: '11:00',
        location: 'Conference Room A',
        attendees: 15,
        description: 'Monthly department meeting'
      },
      {
        id: '7',
        title: 'Virtual Lecture',
        type: 'class',
        startTime: '14:00',
        endTime: '15:30',
        location: 'Online',
        attendees: 28,
        isOnline: true,
        description: 'Introduction to Neural Networks'
      },
      {
        id: '8',
        title: 'Student Consultations',
        type: 'office-hours',
        startTime: '16:00',
        endTime: '18:00',
        location: 'Faculty Office 204'
      }
    ]
  },
  {
    date: '2024-01-17',
    tasks: [
      {
        id: '9',
        title: 'Algorithms & Complexity',
        type: 'class',
        startTime: '10:00',
        endTime: '11:30',
        location: 'CS-105',
        attendees: 28,
        description: 'Graph Algorithms'
      },
      {
        id: '10',
        title: 'Personal Time',
        type: 'personal',
        startTime: '13:00',
        endTime: '14:00',
        description: 'Lunch and personal tasks'
      },
      {
        id: '11',
        title: 'Graduate Seminar',
        type: 'research',
        startTime: '15:00',
        endTime: '16:30',
        location: 'Research Hall 201',
        attendees: 12,
        description: 'PhD students presentations'
      }
    ]
  },
  {
    date: '2024-01-18',
    tasks: [
      {
        id: '12',
        title: 'Database Systems',
        type: 'class',
        startTime: '09:00',
        endTime: '10:30',
        location: 'CS-102',
        attendees: 38,
        description: 'NoSQL databases'
      },
      {
        id: '13',
        title: 'Department Meeting',
        type: 'meeting',
        startTime: '11:30',
        endTime: '12:30',
        location: 'Conference Room B',
        attendees: 20,
        description: 'Curriculum planning'
      },
      {
        id: '14',
        title: 'Research Lab',
        type: 'research',
        startTime: '14:00',
        endTime: '17:00',
        location: 'AI Lab',
        attendees: 6,
        description: 'Machine Learning project work'
      }
    ]
  },
  {
    date: '2024-01-19',
    tasks: [
      {
        id: '15',
        title: 'Software Engineering',
        type: 'class',
        startTime: '10:00',
        endTime: '12:00',
        location: 'CS-201',
        attendees: 45,
        description: 'Agile methodology'
      },
      {
        id: '16',
        title: 'Student Advising',
        type: 'office-hours',
        startTime: '13:00',
        endTime: '15:00',
        location: 'Faculty Office 204',
        description: 'One-on-one student meetings'
      },
      {
        id: '17',
        title: 'Research Paper Review',
        type: 'personal',
        startTime: '15:30',
        endTime: '17:00',
        description: 'Review submissions for conference'
      }
    ]
  }
];

export const getScheduleData = (): DaySchedule[] => {
  return mockScheduleData;
}; 