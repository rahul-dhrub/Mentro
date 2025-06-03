'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiSave, FiEye, FiEdit2, FiClock, FiCalendar, FiPaperclip, FiFile, FiX, FiMaximize2, FiMinimize2, FiArrowLeft, FiUser, FiBookOpen, FiVideo, FiImage, FiLink, FiExternalLink, FiUpload, FiCheck, FiPlay, FiDownload, FiRefreshCw } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { assignmentAPI, submissionAPI } from '@/lib/api';
import { initializeVideoUpload, uploadVideoToBunny, waitForVideoProcessing } from '@/app/utils/videoUpload';
import { uploadFileToBunnyStorage } from '@/app/utils/fileUpload';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Component imports
import VideoPlayer from './components/VideoPlayer';
import PDFViewer from './components/PDFViewer';
import MediaPreviewModal from './components/MediaPreviewModal';
import AssignmentHeader from './components/AssignmentHeader';
import SubmissionsList from './components/SubmissionsList';

// Type imports
import { Assignment, Submission, Attachment } from '@/types/assignment';

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function AssignmentDetail() {
  const params = useParams();
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Media preview states
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  
  // Submission grading states
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [gradingData, setGradingData] = useState({ grade: '', feedback: '' });
  const [isGrading, setIsGrading] = useState(false);
  
  // Edit submission states
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [showEditSubmissionModal, setShowEditSubmissionModal] = useState(false);
  const [editSubmissionText, setEditSubmissionText] = useState('');
  const [editSubmissionFiles, setEditSubmissionFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [isUpdatingSubmission, setIsUpdatingSubmission] = useState(false);
  const [editNotesPreviewMode, setEditNotesPreviewMode] = useState<'edit' | 'preview'>('edit');
  
  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editTotalMarks, setEditTotalMarks] = useState('');
  
  // Submission states
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [fileName: string]: number }>({});
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [notesPreviewMode, setNotesPreviewMode] = useState<'edit' | 'preview'>('edit');
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch assignment data
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!params.assignment_id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await assignmentAPI.getById(params.assignment_id as string);
        
        if (result.success && result.data) {
          setAssignment(result.data as Assignment);
          // Fetch submissions for this assignment
          await fetchSubmissions(params.assignment_id as string);
        } else {
          setError(result.error || 'Failed to fetch assignment');
        }
      } catch (err) {
        setError('Failed to fetch assignment');
        console.error('Error fetching assignment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [params.assignment_id]);

  const fetchSubmissions = async (assignmentId: string) => {
    try {
      const result = await submissionAPI.getAll(assignmentId);
      
      if (result.success && result.data) {
        setSubmissions(result.data);
      } else {
        console.error('Error fetching submissions:', result.error);
        setError(result.error || 'Failed to fetch submissions');
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to fetch submissions');
    }
  };

  useEffect(() => {
    // No longer needed - LaTeX rendering is now handled by ReactMarkdown with rehypeKatex
  }, [assignment?.content, isPreview, isFullPreview]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !assignment) return;

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file)
    }));

    setAssignment(prev => prev ? ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }) : null);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAssignment(prev => prev ? ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }) : null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleContentChange = (value: string | undefined) => {
    if (value !== undefined && assignment) {
      setAssignment(prev => prev ? ({ ...prev, content: value }) : null);
    }
  };

  const handleSave = async () => {
    if (!assignment) return;
    
    try {
      const updateData = {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate,
        totalMarks: parseInt(editTotalMarks),
        content: assignment.content,
        attachments: assignment.attachments
      };

      const result = await assignmentAPI.update(assignment._id, updateData);
      
      if (result.success && result.data) {
        setAssignment(result.data as Assignment);
        setIsEditing(false);
        setError(null);
      } else {
        setError(result.error || 'Failed to update assignment');
      }
    } catch (err) {
      setError('Failed to update assignment');
      console.error('Error updating assignment:', err);
    }
  };

  const handleEdit = () => {
    if (!assignment) return;
    
    // Initialize edit form with current values
    setEditTitle(assignment.title);
    setEditDescription(assignment.description);
    setEditDueDate(assignment.dueDate.split('T')[0]);
    setEditTotalMarks(assignment.totalMarks.toString());
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset edit form values
    setEditTitle('');
    setEditDescription('');
    setEditDueDate('');
    setEditTotalMarks('');
    setIsEditing(false);
  };

  const handleGoBack = () => {
    if (assignment?.courseId?._id) {
      router.push(`/course_detail/${assignment.courseId._id}`);
    } else {
      router.back();
    }
  };

  const handleSubmissionFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    setSubmissionFiles(prev => [...prev, ...Array.from(files)]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setSubmissionFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const removeSubmissionFile = (index: number) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File): Promise<Attachment> => {
    const isVideo = file.type.startsWith('video/');
    
    if (isVideo) {
      setIsUploadingVideo(true);
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      try {
        // Initialize video upload to Bunny Stream
        const title = file.name.replace(/\.[^/.]+$/, "");
        const { guid, uploadUrl, httpMethod, headers } = await initializeVideoUpload(
          title,
          file.name
        );
        
        // Upload video to Bunny Stream
        await uploadVideoToBunny(
          file,
          uploadUrl,
          httpMethod,
          headers,
          (progress: number) => setUploadProgress(prev => ({ ...prev, [file.name]: progress }))
        );
        
        // Wait for video processing
        const processedVideo = await waitForVideoProcessing(guid);
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: 'video',
          size: file.size,
          url: processedVideo.streamingUrl
        };
      } finally {
        setIsUploadingVideo(false);
      }
    } else {
      // Upload regular files to Bunny Storage
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      const result = await uploadFileToBunnyStorage(
        file,
        (progress: number) => setUploadProgress(prev => ({ ...prev, [file.name]: progress }))
      );
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type === 'application/pdf' ? 'pdf' : 'document',
        size: file.size,
        url: result.downloadUrl
      };
    }
  };

  const handleSubmitAssignment = async () => {
    if (!assignment) return;
    
    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      // Upload all files first
      const uploadedAttachments: Attachment[] = [];
      
      for (const file of submissionFiles) {
        try {
          const attachment = await uploadFile(file);
          uploadedAttachments.push(attachment);
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          throw new Error(`Failed to upload ${file.name}. Please try again.`);
        }
      }
      
      // Create submission data
      const submissionData = {
        assignmentId: assignment._id,
        userId: 'current_user', // Replace with actual user ID from auth
        userName: 'Current User', // Replace with actual user name from auth
        userEmail: 'current.user@example.com', // Replace with actual user email from auth
        notes: submissionText,
        attachments: uploadedAttachments,
        dueDate: assignment.dueDate
      };
      
      // Submit to database
      const result = await submissionAPI.create(submissionData);
      
      if (result.success && result.data) {
        // Add to local state
        setSubmissions(prev => [result.data, ...prev]);
        
        // Close modal and reset state
        setShowSubmissionModal(false);
        setSubmissionFiles([]);
        setSubmissionText('');
        setUploadProgress({});
        setSubmissionError(null);
        
        // Refresh assignment data to update submission count
        const assignmentResult = await assignmentAPI.getById(assignment._id);
        if (assignmentResult.success && assignmentResult.data) {
          setAssignment(assignmentResult.data);
        }
      } else {
        throw new Error(result.error || 'Failed to submit assignment');
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setSubmissionError(err instanceof Error ? err.message : 'Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsUploadingVideo(false);
    }
  };

  const closeSubmissionModal = () => {
    setShowSubmissionModal(false);
    setSubmissionFiles([]);
    setSubmissionText('');
    setUploadProgress({});
    setSubmissionError(null);
    setIsSubmitting(false);
    setIsUploadingVideo(false);
    setDragActive(false);
    setNotesPreviewMode('edit');
  };

  const handleAttachmentClick = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setShowMediaModal(true);
  };

  const renderAttachmentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FiPlay className="text-red-500" size={20} />;
      case 'image':
        return <FiImage className="text-green-500" size={20} />;
      case 'pdf':
        return <FiFile className="text-blue-500" size={20} />;
      case 'document':
        return <FiFile className="text-orange-500" size={20} />;
      case 'link':
        return <FiLink className="text-purple-500" size={20} />;
      default:
        // Fallback: check if type contains video-like patterns
        if (type && (type.includes('video') || type.includes('mp4') || type.includes('mov') || type.includes('avi'))) {
          return <FiPlay className="text-red-500" size={20} />;
        }
        return <FiFile className="text-gray-400" size={20} />;
    }
  };

  const renderMediaPreview = () => {
    if (!selectedAttachment) return null;

    switch (selectedAttachment.type) {
      case 'video':
        return (
          <div className="w-full h-full">
            <VideoPlayer 
              src={selectedAttachment.url}
              title={selectedAttachment.name}
              height="100%"
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={selectedAttachment.url}
              alt={selectedAttachment.name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'text-center text-gray-600';
                errorDiv.innerHTML = `
                  <div class="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <p>Unable to load image</p>
                  <a href="${selectedAttachment.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline mt-2 inline-block">Open in New Tab</a>
                `;
                e.currentTarget.parentNode?.appendChild(errorDiv);
              }}
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="w-full h-full">
            <PDFViewer 
              src={selectedAttachment.url}
              title={selectedAttachment.name}
              height="100%"
            />
          </div>
        );
      
      case 'link':
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiExternalLink className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedAttachment.name}</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Click the button below to visit this external link
              </p>
              <a
                href={selectedAttachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
              >
                <FiExternalLink className="w-5 h-5" />
                <span>Visit Link</span>
              </a>
              <p className="text-xs text-gray-500 mt-4 break-all max-w-md mx-auto">
                {selectedAttachment.url}
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <p className="text-gray-600">Content type not supported</p>
          </div>
        );
    }
  };

  const renderLatexInElement = (element: HTMLElement) => {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    textNodes.forEach((textNode) => {
      const text = textNode.textContent || '';
      
      // Handle block math ($$...$$)
      if (text.includes('$$')) {
        const parts = text.split(/(.*?\$\$.*?\$\$.*?)/g);
        if (parts.length > 1) {
          const parent = textNode.parentNode;
          if (parent) {
            parts.forEach((part) => {
              if (part.includes('$$')) {
                const mathMatch = part.match(/\$\$(.*?)\$\$/);
                if (mathMatch) {
                  const mathDiv = document.createElement('div');
                  mathDiv.className = 'math-block';
                  mathDiv.style.textAlign = 'center';
                  mathDiv.style.margin = '1em 0';
                  try {
                    katex.render(mathMatch[1], mathDiv, {
                      throwOnError: false,
                      displayMode: true
                    });
                    parent.insertBefore(mathDiv, textNode);
                  } catch (e) {
                    mathDiv.textContent = part;
                    parent.insertBefore(mathDiv, textNode);
                  }
                }
              } else if (part.trim()) {
                parent.insertBefore(document.createTextNode(part), textNode);
              }
            });
            parent.removeChild(textNode);
          }
        }
      }
      // Handle inline math ($...$)
      else if (text.includes('$') && !text.includes('$$')) {
        const parts = text.split(/(\$[^$]+\$)/g);
        if (parts.length > 1) {
          const parent = textNode.parentNode;
          if (parent) {
            parts.forEach((part) => {
              if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
                const mathContent = part.slice(1, -1);
                const mathSpan = document.createElement('span');
                mathSpan.className = 'math-inline';
                try {
                  katex.render(mathContent, mathSpan, {
                    throwOnError: false,
                    displayMode: false
                  });
                  parent.insertBefore(mathSpan, textNode);
                } catch (e) {
                  mathSpan.textContent = part;
                  parent.insertBefore(mathSpan, textNode);
                }
              } else if (part.trim()) {
                parent.insertBefore(document.createTextNode(part), textNode);
              }
            });
            parent.removeChild(textNode);
          }
        }
      }
    });
  };

  const adjustTextareaHeight = () => {
    const textarea = notesTextareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to match the scrollHeight, with min and max constraints
      const newHeight = Math.max(120, Math.min(textarea.scrollHeight, 600));
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleNotesTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSubmissionText(e.target.value);
    // Adjust height after state update
    setTimeout(adjustTextareaHeight, 0);
  };

  // Adjust textarea height when text changes or component mounts
  useEffect(() => {
    adjustTextareaHeight();
  }, [submissionText]);

  useEffect(() => {
    if (typeof window !== 'undefined' && submissionText && notesPreviewMode === 'preview') {
      setTimeout(() => {
        const previewElement = document.querySelector('.submission-notes-preview');
        if (previewElement) {
          renderLatexInElement(previewElement as HTMLElement);
        }
      }, 100);
    }
  }, [submissionText, notesPreviewMode]);

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedSubmission?.notes && showGradingModal) {
      setTimeout(() => {
        const notesElement = document.querySelector('.grading-submission-notes');
        if (notesElement) {
          renderLatexInElement(notesElement as HTMLElement);
        }
      }, 100);
    }
  }, [selectedSubmission?.notes, showGradingModal]);

  const handleSubmissionClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradingData({
      grade: submission.grade?.toString() || '',
      feedback: submission.feedback || ''
    });
    setShowGradingModal(true);
  };

  const closeGradingModal = () => {
    setShowGradingModal(false);
    setSelectedSubmission(null);
    setGradingData({ grade: '', feedback: '' });
    setIsGrading(false);
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !assignment) return;
    
    setIsGrading(true);
    
    try {
      const gradeData = {
        grade: gradingData.grade ? parseInt(gradingData.grade) : undefined,
        feedback: gradingData.feedback,
        gradedBy: 'current_teacher' // Replace with actual teacher ID from auth
      };
      
      const result = await submissionAPI.update(selectedSubmission.id, gradeData);
      
      if (result.success && result.data) {
        // Update the submissions list
        setSubmissions(prev => 
          prev.map(sub => 
            sub.id === selectedSubmission.id ? result.data : sub
          )
        );
        
        closeGradingModal();
      } else {
        throw new Error(result.error || 'Failed to grade submission');
      }
    } catch (err) {
      console.error('Error grading submission:', err);
      setError('Failed to grade submission. Please try again.');
    } finally {
      setIsGrading(false);
    }
  };

  const handleEditSubmission = (submission: Submission) => {
    setEditingSubmission(submission);
    setEditSubmissionText(submission.notes || '');
    setExistingAttachments(submission.attachments);
    setEditSubmissionFiles([]);
    setEditNotesPreviewMode('edit');
    setShowEditSubmissionModal(true);
  };

  const closeEditSubmissionModal = () => {
    setShowEditSubmissionModal(false);
    setEditingSubmission(null);
    setEditSubmissionText('');
    setEditSubmissionFiles([]);
    setExistingAttachments([]);
    setIsUpdatingSubmission(false);
    setEditNotesPreviewMode('edit');
    setUploadProgress({});
    setSubmissionError(null);
  };

  const handleRemoveExistingAttachment = (attachmentId: string) => {
    setExistingAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleEditSubmissionFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    setEditSubmissionFiles(prev => [...prev, ...Array.from(files)]);
  };

  const removeEditSubmissionFile = (index: number) => {
    setEditSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSubmission = async () => {
    if (!editingSubmission || !assignment) return;
    
    setIsUpdatingSubmission(true);
    setSubmissionError(null);
    
    try {
      // Upload any new files
      const newUploadedAttachments: Attachment[] = [];
      
      for (const file of editSubmissionFiles) {
        try {
          const attachment = await uploadFile(file);
          newUploadedAttachments.push(attachment);
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          throw new Error(`Failed to upload ${file.name}. Please try again.`);
        }
      }
      
      // Combine existing attachments with new uploads
      const allAttachments = [...existingAttachments, ...newUploadedAttachments];
      
      // Update submission data
      const updateData = {
        notes: editSubmissionText,
        attachments: allAttachments
      };
      
      const result = await submissionAPI.update(editingSubmission.id, updateData);
      
      if (result.success && result.data) {
        // Update the submissions list
        setSubmissions(prev => 
          prev.map(sub => 
            sub.id === editingSubmission.id ? result.data : sub
          )
        );
        
        closeEditSubmissionModal();
      } else {
        throw new Error(result.error || 'Failed to update submission');
      }
    } catch (err) {
      console.error('Error updating submission:', err);
      setSubmissionError(err instanceof Error ? err.message : 'Failed to update submission. Please try again.');
    } finally {
      setIsUpdatingSubmission(false);
    }
  };

  const editNotesTextareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustEditTextareaHeight = () => {
    const textarea = editNotesTextareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.max(120, Math.min(textarea.scrollHeight, 600));
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleEditNotesTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditSubmissionText(e.target.value);
    setTimeout(adjustEditTextareaHeight, 0);
  };

  // Adjust edit textarea height when text changes
  useEffect(() => {
    adjustEditTextareaHeight();
  }, [editSubmissionText]);

  useEffect(() => {
    if (typeof window !== 'undefined' && editSubmissionText && editNotesPreviewMode === 'preview') {
      setTimeout(() => {
        const previewElement = document.querySelector('.edit-submission-notes-preview');
        if (previewElement) {
          renderLatexInElement(previewElement as HTMLElement);
        }
      }, 100);
    }
  }, [editSubmissionText, editNotesPreviewMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading assignment...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">{error || 'Assignment not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <div className="mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="mr-2" size={20} />
            <span>Back to Course</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Header */}
        <AssignmentHeader
          assignment={assignment}
          isEditing={isEditing}
          editTitle={editTitle}
          editDescription={editDescription}
          editDueDate={editDueDate}
          editTotalMarks={editTotalMarks}
          onEditTitleChange={setEditTitle}
          onEditDescriptionChange={setEditDescription}
          onEditDueDateChange={setEditDueDate}
          onEditTotalMarksChange={setEditTotalMarks}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onShowSubmissionModal={() => setShowSubmissionModal(true)}
        />

        {/* Attachments Section */}
        {(assignment.attachments.length > 0 || isEditing) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Attachments</h2>
              {isEditing && (
                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center space-x-2">
                  <FiPaperclip size={20} />
                  <span>Add Files</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                </label>
              )}
            </div>
            <div className="space-y-2">
              {assignment.attachments.map((attachment, index) => (
                <div
                  key={attachment.id || `attachment-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {/* Dynamic icon based on attachment type */}
                    {renderAttachmentIcon(attachment.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {attachment.type}
                        {attachment.size > 0 && ` • ${formatFileSize(attachment.size)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {['video', 'image', 'pdf'].includes(attachment.type) && (
                      <button
                        onClick={() => handleAttachmentClick(attachment)}
                        className="text-purple-600 hover:text-purple-700 flex items-center space-x-1 bg-purple-50 px-3 py-1 rounded"
                      >
                        <FiEye size={16} />
                        <span className="text-sm">Preview</span>
                      </button>
                    )}
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <FiExternalLink size={16} />
                      <span className="text-sm">Open</span>
                    </a>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiX size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {assignment.attachments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No attachments added yet
                </p>
              )}
            </div>
          </div>
        )}

        {/* Editor/Preview Toggle */}
        {isEditing && (
          <div className="flex justify-end mb-4 space-x-4">
            <button
              onClick={() => setIsFullPreview(!isFullPreview)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              {isFullPreview ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
              <span>{isFullPreview ? 'Split View' : 'Full Preview'}</span>
            </button>
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              {isPreview ? <FiEdit2 size={20} /> : <FiEye size={20} />}
              <span>{isPreview ? 'Edit' : 'Preview'}</span>
            </button>
          </div>
        )}

        {/* Content Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isEditing ? (
            <div className={`grid ${isFullPreview ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div data-color-mode="light" className="border-r border-gray-200">
                <MDEditor
                  value={assignment.content}
                  onChange={handleContentChange}
                  height={600}
                  preview={isPreview ? 'preview' : 'edit'}
                  hideToolbar={isPreview}
                  enableScroll={true}
                  className="!border-0"
                  textareaProps={{
                    placeholder: 'Write your assignment content here...'
                  }}
                />
              </div>
              {!isFullPreview && !isPreview && (
                <div className="p-4 overflow-auto assignment-preview" style={{ height: '600px' }}>
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeRaw, rehypeKatex]}
                      components={{
                        h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl font-semibold text-gray-800 mb-3">{children}</h2>,
                        h3: ({children}) => <h3 className="text-lg font-medium text-gray-800 mb-2">{children}</h3>,
                        p: ({children}) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                        strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                        ul: ({children}) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">{children}</ol>,
                        li: ({children}) => <li className="text-gray-700">{children}</li>,
                        a: ({href, children}) => (
                          <a 
                            href={href} 
                            className="text-blue-600 hover:text-blue-800 underline" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        code: ({children}) => (
                          <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-sm">
                            {children}
                          </code>
                        ),
                        pre: ({children}) => (
                          <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                            {children}
                          </pre>
                        ),
                        blockquote: ({children}) => (
                          <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">
                            {children}
                          </blockquote>
                        ),
                        table: ({children}) => (
                          <table className="border-collapse border border-gray-300 mb-4 w-full">
                            {children}
                          </table>
                        ),
                        th: ({children}) => (
                          <th className="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold text-left">
                            {children}
                          </th>
                        ),
                        td: ({children}) => (
                          <td className="border border-gray-300 px-3 py-2">
                            {children}
                          </td>
                        ),
                        hr: () => <hr className="border-gray-300 my-6" />
                      }}
                    >
                      {assignment.content || 'No content available for preview.'}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 assignment-content prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                  h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-semibold text-gray-800 mb-3">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-medium text-gray-800 mb-2">{children}</h3>,
                  p: ({children}) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                  strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                  ul: ({children}) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">{children}</ol>,
                  li: ({children}) => <li className="text-gray-700">{children}</li>,
                  a: ({href, children}) => (
                    <a 
                      href={href} 
                      className="text-blue-600 hover:text-blue-800 underline" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  code: ({children}) => (
                    <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-sm">
                      {children}
                    </code>
                  ),
                  pre: ({children}) => (
                    <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">
                      {children}
                    </blockquote>
                  ),
                  table: ({children}) => (
                    <table className="border-collapse border border-gray-300 mb-4 w-full">
                      {children}
                    </table>
                  ),
                  th: ({children}) => (
                    <th className="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold text-left">
                      {children}
                    </th>
                  ),
                  td: ({children}) => (
                    <td className="border border-gray-300 px-3 py-2">
                      {children}
                    </td>
                  ),
                  hr: () => <hr className="border-gray-300 my-6" />
                }}
              >
                {assignment.content || 'No content available for this assignment.'}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Submissions Section */}
        <SubmissionsList
          submissions={submissions}
          assignment={assignment}
          onSubmissionClick={handleSubmissionClick}
          onEditSubmission={handleEditSubmission}
        />

        {/* Submission Modal */}
        {showSubmissionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Submit Assignment</h3>
                <button
                  onClick={closeSubmissionModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Submission Notes */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Submission Notes (Optional)
                    </label>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setNotesPreviewMode('edit')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          notesPreviewMode === 'edit'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <FiEdit2 className="w-4 h-4 mr-1 inline" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotesPreviewMode('preview')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          notesPreviewMode === 'preview'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <FiEye className="w-4 h-4 mr-1 inline" />
                        Preview
                      </button>
                    </div>
                  </div>

                  {notesPreviewMode === 'edit' ? (
                    <div className="border-2 border-gray-200 rounded-lg p-4 focus-within:border-blue-500 transition-colors">
                      <textarea
                        ref={notesTextareaRef}
                        value={submissionText}
                        onChange={handleNotesTextChange}
                        style={{ minHeight: '120px', maxHeight: '600px' }}
                        placeholder="Add any notes about your submission, explanations, or additional context...

**Markdown supported:** You can use *italics*, **bold**, `code`, and LaTeX math like $x = y + z$ or block math:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$"
                        className="w-full resize-none border-0 outline-none text-gray-700 placeholder-gray-400 overflow-y-auto"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[160px] bg-gray-50">
                      {submissionText.trim() ? (
                        <div className="submission-notes-preview prose prose-sm max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeRaw, rehypeKatex]}
                            components={{
                              h1: ({children}) => <h1 className="text-lg font-bold text-gray-800 mb-2">{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-semibold text-gray-800 mb-2">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-semibold text-gray-800 mb-1">{children}</h3>,
                              p: ({children}) => <p className="text-gray-700 mb-2 text-sm">{children}</p>,
                              strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
                              em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                              ul: ({children}) => <ul className="list-disc list-inside text-gray-700 mb-2 text-sm">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal list-inside text-gray-700 mb-2 text-sm">{children}</ol>,
                              li: ({children}) => <li className="mb-1">{children}</li>,
                              a: ({href, children}) => (
                                <a 
                                  href={href} 
                                  className="text-blue-600 hover:text-blue-800 underline" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  {children}
                                </a>
                              ),
                              code: ({children}) => (
                                <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                                  {children}
                                </code>
                              ),
                              pre: ({children}) => (
                                <pre className="bg-gray-200 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                                  {children}
                                </pre>
                              ),
                              blockquote: ({children}) => (
                                <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600 mb-2">
                                  {children}
                                </blockquote>
                              ),
                              table: ({children}) => (
                                <table className="border-collapse border border-gray-300 mb-2 text-xs">
                                  {children}
                                </table>
                              ),
                              th: ({children}) => (
                                <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold text-left">
                                  {children}
                                </th>
                              ),
                              td: ({children}) => (
                                <td className="border border-gray-300 px-2 py-1">
                                  {children}
                                </td>
                              )
                            }}
                          >
                            {submissionText}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <div className="text-center">
                            <FiEye className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Preview will appear here</p>
                            <p className="text-xs">Start typing in the edit tab to see your formatted notes</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Markdown & LaTeX Help */}
                  <div className="mt-2 text-xs text-gray-500">
                    <p>
                      <strong>Formatting support:</strong> Markdown syntax and LaTeX math. 
                      Use $math$ for inline equations or $$math$$ for block equations.
                    </p>
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Upload Files
                  </label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDrag}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                  >
                    <input
                      type="file"
                      multiple
                      onChange={handleSubmissionFileUpload}
                      className="hidden"
                      id="submission-files"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mov,.avi,.mkv,.webm"
                    />
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <FiUpload size={48} className={`${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <label
                          htmlFor="submission-files"
                          className="cursor-pointer text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          Click to upload files or drag and drop
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          Supports: PDF, DOC, TXT, Images, Videos (MP4, MOV, AVI, etc.)
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Videos will be uploaded to streaming service for optimal playback
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selected Files */}
                  {submissionFiles.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700">Selected Files:</h4>
                      <div className="space-y-2">
                        {submissionFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                          >
                            <div className="flex items-center space-x-3">
                              {file.type.startsWith('video/') ? (
                                <FiPlay className="text-red-500" size={20} />
                              ) : file.type.startsWith('image/') ? (
                                <FiImage className="text-green-500" size={20} />
                              ) : file.type === 'application/pdf' ? (
                                <FiFile className="text-blue-500" size={20} />
                              ) : (
                                <FiFile className="text-gray-400" size={20} />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {file.type.startsWith('video/') ? 'Video' : 
                                   file.type.startsWith('image/') ? 'Image' :
                                   file.type === 'application/pdf' ? 'PDF' : 'Document'} • {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {/* Upload Progress */}
                              {uploadProgress[file.name] !== undefined && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${uploadProgress[file.name]}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-600">{uploadProgress[file.name]}%</span>
                                </div>
                              )}
                              <button
                                onClick={() => removeSubmissionFile(index)}
                                className="text-red-600 hover:text-red-800 p-1"
                                disabled={isSubmitting}
                              >
                                <FiX size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {submissionError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-red-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{submissionError}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={closeSubmissionModal}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAssignment}
                  disabled={isSubmitting || (submissionFiles.length === 0 && !submissionText.trim())}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isSubmitting || (submissionFiles.length === 0 && !submissionText.trim())
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>
                        {isUploadingVideo ? 'Uploading video...' : 'Submitting...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <FiCheck size={16} />
                      <span>Submit Assignment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Media Preview Modal */}
        {showMediaModal && selectedAttachment && (
          <MediaPreviewModal
            isOpen={showMediaModal}
            attachment={selectedAttachment}
            onClose={() => setShowMediaModal(false)}
            renderAttachmentIcon={renderAttachmentIcon}
            formatFileSize={formatFileSize}
          />
        )}

        {/* Submission Grading Modal */}
        {showGradingModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Grade Submission</h3>
                <button
                  onClick={closeGradingModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Student Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Student Information</h4>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                      {selectedSubmission.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedSubmission.userName}</p>
                      <p className="text-sm text-gray-600">{selectedSubmission.userEmail}</p>
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedSubmission.status === 'submitted'
                            ? 'bg-blue-100 text-blue-800'
                            : selectedSubmission.status === 'graded'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedSubmission.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submission Notes */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Submission Notes</h4>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[100px]">
                    {selectedSubmission.notes ? (
                      <div className="grading-submission-notes prose prose-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            h1: ({children}) => <h1 className="text-lg font-bold text-gray-800 mb-2">{children}</h1>,
                            h2: ({children}) => <h2 className="text-base font-semibold text-gray-800 mb-2">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-semibold text-gray-800 mb-1">{children}</h3>,
                            p: ({children}) => <p className="text-gray-700 mb-2 text-sm">{children}</p>,
                            strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
                            em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                            ul: ({children}) => <ul className="list-disc list-inside text-gray-700 mb-2 text-sm">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside text-gray-700 mb-2 text-sm">{children}</ol>,
                            li: ({children}) => <li className="mb-1">{children}</li>,
                            a: ({href, children}) => (
                              <a 
                                href={href} 
                                className="text-blue-600 hover:text-blue-800 underline" 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                            code: ({children}) => (
                              <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            ),
                            pre: ({children}) => (
                              <pre className="bg-gray-200 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                                {children}
                              </pre>
                            )
                          }}
                        >
                          {selectedSubmission.notes}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <FiUser className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No submission notes provided</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submitted Files */}
                {selectedSubmission.attachments.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Submitted Files</h4>
                    <div className="space-y-2">
                      {selectedSubmission.attachments.map((attachment, index) => (
                        <div
                          key={attachment.id || `grading-attachment-${index}`}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            {renderAttachmentIcon(attachment.type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-xs text-gray-500 capitalize">
                                {attachment.type} • {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {['video', 'image', 'pdf'].includes(attachment.type) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAttachmentClick(attachment);
                                }}
                                className="text-purple-600 hover:text-purple-700 flex items-center space-x-1 bg-purple-50 px-2 py-1 rounded text-xs"
                              >
                                <FiEye size={14} />
                                <span>Preview</span>
                              </button>
                            )}
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-xs"
                            >
                              <FiExternalLink size={14} />
                              <span>Open</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grading Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Grading</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                        Grade (out of {assignment.totalMarks})
                      </label>
                      <input
                        id="grade"
                        type="number"
                        min="0"
                        max={assignment.totalMarks}
                        value={gradingData.grade}
                        onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        placeholder={`Enter grade (0-${assignment.totalMarks})`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback (Optional)
                      </label>
                      <textarea
                        id="feedback"
                        value={gradingData.feedback}
                        onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        placeholder="Provide feedback to help the student understand their performance..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={closeGradingModal}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGradeSubmission}
                  disabled={isGrading || !gradingData.grade.trim()}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isGrading || !gradingData.grade.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isGrading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Grading...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck size={16} />
                      <span>Grade Submission</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Submission Modal */}
        {showEditSubmissionModal && editingSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Edit Submission</h3>
                <button
                  onClick={closeEditSubmissionModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Submission Notes */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Submission Notes
                    </label>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setEditNotesPreviewMode('edit')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          editNotesPreviewMode === 'edit'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <FiEdit2 className="w-4 h-4 mr-1 inline" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditNotesPreviewMode('preview')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          editNotesPreviewMode === 'preview'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <FiEye className="w-4 h-4 mr-1 inline" />
                        Preview
                      </button>
                    </div>
                  </div>

                  {editNotesPreviewMode === 'edit' ? (
                    <div className="border-2 border-gray-200 rounded-lg p-4 focus-within:border-blue-500 transition-colors">
                      <textarea
                        ref={editNotesTextareaRef}
                        value={editSubmissionText}
                        onChange={handleEditNotesTextChange}
                        style={{ minHeight: '120px', maxHeight: '600px' }}
                        placeholder="Add any notes about your submission, explanations, or additional context...

**Markdown supported:** You can use *italics*, **bold**, `code`, and LaTeX math like $x = y + z$ or block math:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$"
                        className="w-full resize-none border-0 outline-none text-gray-700 placeholder-gray-400 overflow-y-auto"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[160px] bg-gray-50">
                      {editSubmissionText.trim() ? (
                        <div className="edit-submission-notes-preview prose prose-sm max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeRaw, rehypeKatex]}
                            components={{
                              h1: ({children}) => <h1 className="text-lg font-bold text-gray-800 mb-2">{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-semibold text-gray-800 mb-2">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-semibold text-gray-800 mb-1">{children}</h3>,
                              p: ({children}) => <p className="text-gray-700 mb-2 text-sm">{children}</p>,
                              strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
                              em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                              ul: ({children}) => <ul className="list-disc list-inside text-gray-700 mb-2 text-sm">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal list-inside text-gray-700 mb-2 text-sm">{children}</ol>,
                              li: ({children}) => <li className="mb-1">{children}</li>,
                              a: ({href, children}) => (
                                <a 
                                  href={href} 
                                  className="text-blue-600 hover:text-blue-800 underline" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  {children}
                                </a>
                              ),
                              code: ({children}) => (
                                <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                                  {children}
                                </code>
                              ),
                              pre: ({children}) => (
                                <pre className="bg-gray-200 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                                  {children}
                                </pre>
                              ),
                              blockquote: ({children}) => (
                                <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600 mb-2">
                                  {children}
                                </blockquote>
                              ),
                              table: ({children}) => (
                                <table className="border-collapse border border-gray-300 mb-2 text-xs">
                                  {children}
                                </table>
                              ),
                              th: ({children}) => (
                                <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold text-left">
                                  {children}
                                </th>
                              ),
                              td: ({children}) => (
                                <td className="border border-gray-300 px-2 py-1">
                                  {children}
                                </td>
                              )
                            }}
                          >
                            {editSubmissionText}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <div className="text-center">
                            <FiEye className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Preview will appear here</p>
                            <p className="text-xs">Start typing in the edit tab to see your formatted notes</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Markdown & LaTeX Help */}
                  <div className="mt-2 text-xs text-gray-500">
                    <p>
                      <strong>Formatting support:</strong> Markdown syntax and LaTeX math. 
                      Use $math$ for inline equations or $$math$$ for block equations.
                    </p>
                  </div>
                </div>

                {/* Existing Files */}
                {existingAttachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Files:</h4>
                    <div className="space-y-2">
                      {existingAttachments.map((attachment, index) => (
                        <div
                          key={attachment.id || `existing-${index}`}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            {renderAttachmentIcon(attachment.type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-xs text-gray-500 capitalize">
                                {attachment.type} • {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {['video', 'image', 'pdf'].includes(attachment.type) && (
                              <button
                                onClick={() => handleAttachmentClick(attachment)}
                                className="text-purple-600 hover:text-purple-700 flex items-center space-x-1 bg-purple-50 px-2 py-1 rounded text-xs"
                              >
                                <FiEye size={14} />
                                <span>Preview</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveExistingAttachment(attachment.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Files */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Add New Files
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleEditSubmissionFileUpload}
                      className="hidden"
                      id="edit-submission-files"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mov,.avi,.mkv,.webm"
                    />
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <FiUpload size={32} className="text-gray-400" />
                      </div>
                      <div>
                        <label
                          htmlFor="edit-submission-files"
                          className="cursor-pointer text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          Click to upload additional files
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports: PDF, DOC, TXT, Images, Videos
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* New Files List */}
                  {editSubmissionFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">New Files:</h5>
                      {editSubmissionFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                        >
                          <div className="flex items-center space-x-3">
                            {renderAttachmentIcon(file.type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeEditSubmissionFile(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {submissionError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-red-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{submissionError}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={closeEditSubmissionModal}
                  disabled={isUpdatingSubmission}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubmission}
                  disabled={isUpdatingSubmission}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isUpdatingSubmission
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isUpdatingSubmission ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <FiSave size={16} />
                      <span>Update Submission</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
