import { Author, Post, Media } from './types';

export const mockAuthors: Author[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    avatar: 'https://media.istockphoto.com/id/814423752/photo/eye-of-model-with-colorful-art-make-up-close-up.jpg?s=612x612&w=0&k=20&c=l15OdMWjgCKycMMShP8UK94ELVlEGvt7GmB_esHWPYE=',
    title: 'Professor of Computer Science',
    department: 'Computer Science',
    bio: 'Research in AI, Machine Learning, and Data Science. Passionate about teaching and innovation.',
    followers: 245,
    following: 89,
    posts: 42
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@university.edu',
    avatar: 'https://static.vecteezy.com/system/resources/thumbnails/036/324/708/small/ai-generated-picture-of-a-tiger-walking-in-the-forest-photo.jpg',
    title: 'Associate Professor',
    department: 'Electrical Engineering',
    bio: 'Circuit design expert, IoT researcher, and electronics enthusiast.',
    followers: 189,
    following: 134,
    posts: 28
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@university.edu',
    avatar: 'https://media.istockphoto.com/id/1419410282/photo/silent-forest-in-spring-with-beautiful-bright-sun-rays.jpg?s=612x612&w=0&k=20&c=UHeb1pGOw6ozr6utsenXHhV19vW6oiPIxDqhKCS2Llk=',
    title: 'Assistant Professor',
    department: 'Mathematics',
    bio: 'Pure mathematics, topology, and mathematical modeling researcher.',
    followers: 167,
    following: 76,
    posts: 35
  },
  {
    id: '4',
    name: 'Dr. Alex Thompson',
    email: 'alex.thompson@university.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    title: 'Professor of Physics',
    department: 'Physics',
    bio: 'Quantum mechanics, particle physics, and theoretical research.',
    followers: 312,
    following: 156,
    posts: 67
  },
  {
    id: '5',
    name: 'Dr. Lisa Wang',
    email: 'lisa.wang@university.edu',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
    title: 'Associate Professor',
    department: 'Chemistry',
    bio: 'Organic chemistry, drug discovery, and molecular research.',
    followers: 198,
    following: 92,
    posts: 51
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    author: mockAuthors[0],
    content: 'Excited to announce our new research paper on AI and Machine Learning! Looking forward to your thoughts and feedback.',
    media: [
      {
        type: 'pdf',
        url: 'https://example.com/papers/ai-research.pdf',
        title: 'AI Research Paper 2024',
        size: '2.4 MB',
        pageCount: 15
      }
    ],
    likes: 24,
    comments: [
      {
        id: '1',
        author: mockAuthors[1],
        content: 'Congratulations! Looking forward to reading it.',
        timestamp: '1 hour ago',
        likes: 5
      }
    ],
    timestamp: '2 hours ago',
    tags: ['AI', 'Research', 'Machine Learning']
  },
  {
    id: '2',
    author: mockAuthors[1],
    content: 'Just finished teaching an amazing class on circuit design. Students came up with innovative solutions!',
    media: [
      {
        type: 'video',
        url: 'https://example.com/videos/circuit-design.mp4',
        thumbnail: 'https://media.istockphoto.com/id/1419410282/photo/silent-forest-in-spring-with-beautiful-bright-sun-rays.jpg?s=612x612&w=0&k=20&c=UHeb1pGOw6ozr6utsenXHhV19vW6oiPIxDqhKCS2Llk=',
        title: 'Circuit Design Tutorial',
        duration: '15:30'
      }
    ],
    likes: 15,
    comments: [],
    timestamp: '4 hours ago',
    tags: ['Teaching', 'Engineering']
  },
  {
    id: '3',
    author: mockAuthors[2],
    content: 'Our department is organizing a workshop on Advanced Mathematics next month. Stay tuned for more details!',
    media: [
      {
        type: 'image',
        url: 'https://media.istockphoto.com/id/1419410282/photo/silent-forest-in-spring-with-beautiful-bright-sun-rays.jpg?s=612x612&w=0&k=20&c=UHeb1pGOw6ozr6utsenXHhV19vW6oiPIxDqhKCS2Llk='
      },
      {
        type: 'document',
        url: 'https://example.com/documents/workshop-schedule.docx',
        title: 'Workshop Schedule',
        size: '1.2 MB'
      }
    ],
    likes: 32,
    comments: [
      {
        id: '2',
        author: mockAuthors[0],
        content: 'Sounds interesting! Will share with my students.',
        timestamp: '30 minutes ago',
        likes: 3
      }
    ],
    timestamp: '5 hours ago',
    tags: ['Workshop', 'Mathematics']
  }
];

export const mockPublications = [
  {
    id: '1',
    title: 'Machine Learning Approaches to Heart Disease Prediction: A Systematic Review',
    url: 'https://example.com/publications/ml-heart-disease',
    journal: 'Journal of Medical Informatics',
    year: 2022,
    authors: ['Jane Smith', 'John Doe', 'Robert Johnson'],
    citationCount: 42,
    abstract: 'This paper reviews recent machine learning techniques applied to heart disease prediction, evaluating their performance across multiple datasets and patient demographics.'
  },
  {
    id: '2',
    title: 'Quantum Computing for Optimization Problems in Engineering',
    url: 'https://example.com/publications/quantum-optimization',
    journal: 'IEEE Transactions on Quantum Engineering',
    year: 2021,
    authors: ['John Doe', 'Sarah Williams', 'Michael Brown'],
    citationCount: 28,
    abstract: 'We present novel quantum algorithms for solving large-scale optimization problems in engineering, demonstrating significant speedup over classical approaches.'
  },
  {
    id: '3',
    title: 'Explainable AI in Healthcare: Challenges and Opportunities',
    url: 'https://example.com/publications/xai-healthcare',
    journal: 'Nature Digital Medicine',
    year: 2023,
    authors: ['John Doe', 'Emily Chen', 'David Wilson'],
    citationCount: 15,
    abstract: 'This paper explores the challenges and opportunities of implementing explainable AI systems in healthcare settings, with a focus on clinical decision support.'
  }
];

// Add hashtags data for search
export const mockHashtags = [
  { id: '1', name: '#AI', posts: 156, description: 'Artificial Intelligence discussions and research' },
  { id: '2', name: '#MachineLearning', posts: 124, description: 'Machine Learning techniques and applications' },
  { id: '3', name: '#Research', posts: 89, description: 'Academic research and publications' },
  { id: '4', name: '#Teaching', posts: 67, description: 'Teaching methods and educational content' },
  { id: '5', name: '#Engineering', posts: 78, description: 'Engineering projects and innovations' },
  { id: '6', name: '#Mathematics', posts: 45, description: 'Mathematical concepts and theorems' },
  { id: '7', name: '#Physics', posts: 52, description: 'Physics experiments and theories' },
  { id: '8', name: '#Chemistry', posts: 38, description: 'Chemistry research and discoveries' }
]; 