'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Blog, mockBlogs } from './mockData';

// Import components
import Background from '../components/Background';
import BlogHeader from '../components/BlogHeader';
import BlogContent from '../components/BlogContent';
import BlogActions from '../components/BlogActions';
import RelatedPosts from '../components/RelatedPosts';
import BlogError from '../components/BlogError';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  
  // Handle blog deletion
  const handleBlogDelete = () => {
    // Redirect to main blogs page after deletion
    router.push('/blogs');
  };

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      
      const blog_id = params.blog_id;
      
      if (!blog_id) {
        setError('Blog information is missing');
        setIsLoading(false);
        return;
      }
      
      try {
        // Try fetching from API first - now using blog ID directly
        const response = await fetch(`/api/blogs/${blog_id}`);
        
        if (response.ok) {
          const data = await response.json();
          setBlog(data.blog);
          
          // Fetch related blogs after getting the main blog
          const relatedBlogsData = await fetchRelatedBlogs();
          setRelatedBlogs(relatedBlogsData);
          
        } else {
          // Fall back to mock data
          const mockBlog = mockBlogs.find((b) => b.id === blog_id || b._id === blog_id);
          
          if (mockBlog) {
            setBlog(mockBlog);
            setRelatedBlogs(mockBlogs.filter((b) => b.id !== blog_id && b._id !== blog_id).slice(0, 2));
          } else {
            setError('Blog not found');
          }
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        
        // Check mock data
        const mockBlog = mockBlogs.find((b) => b.id === blog_id || b._id === blog_id);
        
        if (mockBlog) {
          setBlog(mockBlog);
          setRelatedBlogs(mockBlogs.filter((b) => b.id !== blog_id && b._id !== blog_id).slice(0, 2));
        } else {
          setError('Blog not found');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlog();
  }, [params.blog_id]);

  // Display related blogs (either from DB or mock data as fallback)
  const fetchRelatedBlogs = async () => {
    try {
      // Fetch some related blogs (could be filtered by tags in a more sophisticated implementation)
      const response = await fetch('/api/blogs?limit=3');
      
      if (response.ok) {
        const data = await response.json();
        return data.blogs.filter((b: any) => 
          (b._id !== params.blog_id && b.id !== params.blog_id)
        ).slice(0, 2);
      }
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    }
    
    // Fall back to mock data
    return mockBlogs.filter((b) => b.id !== params.blog_id && b._id !== params.blog_id).slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Background>
        <LoadingSpinner />
      </Background>
    );
  }

  if (error || !blog) {
    return (
      <Background>
        <BlogError error={error} userId={null} />
      </Background>
    );
  }

  return (
    <Background>
      <Link 
        href="/blogs" 
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 bg-white/90 px-4 py-2 rounded-md shadow-sm"
      >
        ← Back to blogs
      </Link>
      
      <article className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md overflow-hidden">
        <BlogHeader 
          title={blog.title}
          tags={blog.tags}
          author={blog.author}
          createdAt={blog.createdAt}
          readTime={blog.readTime}
          coverImage={blog.coverImage}
          formatDate={formatDate}
        />
        
        <div className="p-8">
          <BlogContent content={blog.content} />
          <BlogActions 
            blog={blog} 
            onDelete={handleBlogDelete}
          />
        </div>
      </article>
      
      <RelatedPosts relatedBlogs={relatedBlogs} formatDate={formatDate} />
    </Background>
  );
} 