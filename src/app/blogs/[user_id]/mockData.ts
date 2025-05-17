export type Author = {
  id: string;
  name: string;
  avatar: string;
};

export type Blog = {
  id: string;
  _id?: string; // MongoDB document ID
  title: string;
  content: string;
  coverImage: string;
  excerpt: string;
  author: Author;
  createdAt: string;
  tags: string[];
  readTime: number;
};

export const mockAuthors: Author[] = [
  {
    id: '101',
    name: 'Dr. Sarah Johnson',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson',
  },
  {
    id: '102',
    name: 'Dr. Michael Chen',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Chen',
  },
  {
    id: '103',
    name: 'Dr. Emily Rodriguez',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez',
  },
  {
    id: '104',
    name: 'Dr. James Wilson',
    avatar: 'https://ui-avatars.com/api/?name=James+Wilson',
  },
];

export const mockBlogs: Blog[] = [
  {
    id: '1',
    title: 'The Future of AI in Education',
    content: `
      <p>Artificial Intelligence is transforming education in remarkable ways. This post explores how machine learning is being used to personalize learning experiences.</p>
      
      <h2>Personalized Learning</h2>
      <p>AI systems can adapt to individual student needs, providing customized learning paths and resources.</p>
      
      <h2>Automated Grading</h2>
      <p>Machine learning algorithms can assess student work, providing immediate feedback and freeing up instructor time.</p>
      
      <h2>Intelligent Tutoring Systems</h2>
      <p>AI-powered tutors can provide one-on-one assistance to students, answering questions and guiding learning.</p>
      
      <h2>Predictive Analytics</h2>
      <p>By analyzing patterns in student data, AI can help identify students at risk of falling behind or dropping out.</p>
      
      <h2>Conclusion</h2>
      <p>As AI technology continues to advance, its role in education will likely expand, creating more personalized and effective learning experiences for students around the world.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    excerpt: 'AI is transforming education in remarkable ways. This post explores how machine learning is being used to personalize learning experiences.',
    author: mockAuthors[0],
    createdAt: '2023-11-10T14:30:00Z',
    tags: ['AI', 'Education', 'Technology'],
    readTime: 7,
  },
  {
    id: '2',
    title: 'Innovations in STEM Teaching',
    content: `
      <p>Modern teaching approaches are revolutionizing STEM education. Learn about project-based learning and practical applications.</p>
      
      <h2>Project-Based Learning</h2>
      <p>Engaging students in real-world projects helps them develop practical skills and deeper understanding.</p>
      
      <h2>Interdisciplinary Approaches</h2>
      <p>Breaking down barriers between subjects creates more holistic learning experiences.</p>
      
      <h2>Technology Integration</h2>
      <p>Using digital tools and simulations enhances student engagement and understanding of complex concepts.</p>
      
      <h2>Inclusion and Diversity</h2>
      <p>Making STEM accessible to all students requires innovative approaches to teaching and assessment.</p>
      
      <h2>Conclusion</h2>
      <p>By embracing new teaching methods, educators can make STEM subjects more engaging, relevant, and accessible to diverse student populations.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    excerpt: 'Modern teaching approaches are revolutionizing STEM education. Learn about project-based learning and practical applications.',
    author: mockAuthors[1],
    createdAt: '2023-11-05T09:15:00Z',
    tags: ['STEM', 'Education', 'Teaching'],
    readTime: 5,
  },
  {
    id: '3',
    title: 'Research Ethics in the Digital Age',
    content: `
      <p>Navigating ethical considerations in modern research environments presents new challenges. This article explores digital ethics.</p>
      
      <h2>Data Privacy</h2>
      <p>Protecting participant data is more complex than ever in the age of big data and cloud storage.</p>
      
      <h2>Informed Consent</h2>
      <p>Digital research methods require rethinking how we obtain and maintain informed consent.</p>
      
      <h2>AI and Algorithmic Bias</h2>
      <p>Using AI in research introduces new concerns about bias and fairness in data analysis.</p>
      
      <h2>Open Science</h2>
      <p>Balancing transparency with privacy creates tension in the open science movement.</p>
      
      <h2>Conclusion</h2>
      <p>Researchers must adapt ethical frameworks to address new challenges while maintaining core principles of respect, beneficence, and justice.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1532619187608-e5375cab36aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    excerpt: 'Navigating ethical considerations in modern research environments presents new challenges. This article explores digital ethics.',
    author: mockAuthors[2],
    createdAt: '2023-10-28T16:45:00Z',
    tags: ['Ethics', 'Research', 'Digital'],
    readTime: 9,
  },
  {
    id: '4',
    title: 'Effective Assessment Strategies',
    content: `
      <p>Modern assessment approaches that go beyond traditional exams. Discover how formative assessment can improve learning outcomes.</p>
      
      <h2>Formative vs. Summative</h2>
      <p>Understanding the difference between assessment for learning and assessment of learning.</p>
      
      <h2>Authentic Assessment</h2>
      <p>Creating assessments that measure real-world skills and applications.</p>
      
      <h2>Technology-Enhanced Assessment</h2>
      <p>Using digital tools to provide immediate feedback and personalized assessment experiences.</p>
      
      <h2>Self and Peer Assessment</h2>
      <p>Developing students' metacognitive skills through reflection and evaluation.</p>
      
      <h2>Conclusion</h2>
      <p>A balanced assessment strategy incorporates diverse methods to provide a more complete picture of student learning.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    excerpt: 'Modern assessment approaches that go beyond traditional exams. Discover how formative assessment can improve learning outcomes.',
    author: mockAuthors[3],
    createdAt: '2023-10-20T11:30:00Z',
    tags: ['Assessment', 'Education', 'Teaching'],
    readTime: 6,
  },
]; 