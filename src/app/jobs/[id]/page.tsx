'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiCalendar,
  FiUpload,
  FiExternalLink,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAnalytics } from '@/components/FirebaseAnalyticsProvider';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  workType: 'remote' | 'onsite' | 'hybrid';
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string[];
  responsibilities: string[];
  categories: string[];
  skills: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  experience: {
    min: number;
    max: number;
  };
  easyApply: boolean;
  externalLink?: string;
  customQuestions: {
    _id: string;
    question: string;
    required: boolean;
    type: 'text' | 'textarea' | 'select' | 'multiselect';
    options?: string[];
  }[];
  recruiterName: string;
  recruiterEmail: string;
  totalApplications: number;
  postedDate: string;
  deadline?: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const analytics = useAnalytics();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);

  // Application form data
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    fetchJob();
    checkApplicationStatus();
  }, []);

  const checkApplicationStatus = async () => {
    try {
      setCheckingApplication(true);
      const response = await fetch(`/api/applications?type=sent&jobId=${params.id}&limit=1`);
      if (response.ok) {
        const data = await response.json();
        setHasApplied(data.applications && data.applications.length > 0);
        
        // Track application status check
        analytics.trackEvent('job_application_status_check', {
          job_id: params.id as string,
          has_applied: data.applications && data.applications.length > 0
        });
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    } finally {
      setCheckingApplication(false);
    }
  };

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
        
        // Track job page view
        analytics.trackEvent('job_page_view', {
          job_id: data.job._id,
          job_title: data.job.title,
          company: data.job.company,
          work_type: data.job.workType,
          employment_type: data.job.employmentType,
          location: data.job.location,
          easy_apply: data.job.easyApply,
          total_applications: data.job.totalApplications,
          salary_range: `${data.job.salaryRange.currency} ${data.job.salaryRange.min}-${data.job.salaryRange.max}`,
          posted_date: data.job.postedDate
        });
      } else {
        toast.error('Job not found');
        router.push('/jobs');
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Error loading job details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    setUploading(true);
    const startTime = Date.now();
    
    try {
      // Track resume upload start
      analytics.trackEvent('resume_upload_start', {
        job_id: job?._id,
        job_title: job?.title,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        upload_method: 'bunny_net'
      });

      // Upload resume to Bunny.net
      const response = await fetch('/api/bunny-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: `resume-${Date.now()}-${file.name}`,
          fileType: file.type,
          fileSize: file.size,
          folder: 'resumes' // organize resumes in a specific folder
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initialize resume upload');
      }
      
      const { uploadUrl, downloadUrl, headers, httpMethod } = await response.json();
      
      // Upload file to Bunny.net storage
      const uploadResponse = await fetch(uploadUrl, {
        method: httpMethod,
        headers: headers,
        body: file,
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Resume upload failed: ${uploadResponse.statusText}`);
      }
      
      const uploadDuration = Date.now() - startTime;
      
      // Track successful resume upload
      analytics.trackEvent('resume_upload_success', {
        job_id: job?._id,
        job_title: job?.title,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        upload_duration: uploadDuration,
        upload_method: 'bunny_net',
        download_url: downloadUrl
      });
      
      return downloadUrl;
    } catch (error) {
      const uploadDuration = Date.now() - startTime;
      
      // Track failed resume upload
      analytics.trackEvent('resume_upload_error', {
        job_id: job?._id,
        job_title: job?.title,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        upload_duration: uploadDuration,
        upload_method: 'bunny_net',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.error('Failed to upload resume to Bunny.net:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      analytics.trackEvent('resume_upload_validation_failed', {
        job_id: job?._id,
        job_title: job?.title,
        file_name: file.name,
        file_type: file.type,
        error_type: 'invalid_file_type'
      });
      
      toast.error('Please upload a PDF, DOC, or DOCX file');
      event.target.value = '';
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      analytics.trackEvent('resume_upload_validation_failed', {
        job_id: job?._id,
        job_title: job?.title,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        error_type: 'file_too_large'
      });
      
      toast.error('Resume file size must be less than 5MB');
      event.target.value = '';
      return;
    }

    // Track successful file validation
    analytics.trackEvent('resume_file_selected', {
      job_id: job?._id,
      job_title: job?.title,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size
    });

    setResumeFile(file);
  };

  const handleApply = async () => {
    if (!job) return;

    if (!resumeFile) {
      analytics.trackEvent('job_application_validation_failed', {
        job_id: job._id,
        job_title: job.title,
        company: job.company,
        error_type: 'missing_resume'
      });
      
      toast.error('Please upload your resume');
      return;
    }

    // Validate required custom questions
    for (const question of job.customQuestions) {
      if (question.required && !customAnswers[question._id]) {
        analytics.trackEvent('job_application_validation_failed', {
          job_id: job._id,
          job_title: job.title,
          company: job.company,
          error_type: 'missing_required_answer',
          question_id: question._id
        });
        
        toast.error(`Please answer: ${question.question}`);
        return;
      }
    }

    setApplying(true);
    const applicationStartTime = Date.now();

    try {
      // Track application submission start
      analytics.trackEvent('job_application_submit_start', {
        job_id: job._id,
        job_title: job.title,
        company: job.company,
        work_type: job.workType,
        employment_type: job.employmentType,
        has_cover_letter: !!coverLetter,
        has_mobile_number: !!mobileNumber,
        custom_questions_count: job.customQuestions.length,
        resume_file_name: resumeFile.name,
        resume_file_size: resumeFile.size
      });

      // Upload resume to Bunny.net
      const resumeUrl = await handleFileUpload(resumeFile);

      // Prepare custom answers
      const answersArray = job.customQuestions.map(question => ({
        questionId: question._id,
        question: question.question,
        answer: customAnswers[question._id] || '',
      }));

      // Submit application
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job._id,
          resumeUrl,
          coverLetter,
          mobileNumber,
          customAnswers: answersArray,
        }),
      });

      const applicationDuration = Date.now() - applicationStartTime;

      if (response.ok) {
        const responseData = await response.json();
        
        // Track successful application submission
        analytics.trackEvent('job_application_submit_success', {
          job_id: job._id,
          job_title: job.title,
          company: job.company,
          work_type: job.workType,
          employment_type: job.employmentType,
          application_duration: applicationDuration,
          resume_url: resumeUrl,
          has_cover_letter: !!coverLetter,
          has_mobile_number: !!mobileNumber,
          custom_questions_answered: answersArray.length,
          application_id: responseData.applicationId
        });

        toast.success('Application submitted successfully! Please check your email for confirmation.');
        setShowApplyModal(false);
        
        // Update application status
        setHasApplied(true);
        
        // Reset form
        setResumeFile(null);
        setCoverLetter('');
        setMobileNumber('');
        setCustomAnswers({});
      } else {
        const error = await response.json();
        
        // Track application submission error
        analytics.trackEvent('job_application_submit_error', {
          job_id: job._id,
          job_title: job.title,
          company: job.company,
          application_duration: applicationDuration,
          error_message: error.error || 'Failed to submit application',
          error_code: response.status,
          response_body: error
        });
        
        // Show specific error message to help debug
        const errorMessage = error.error || `Application failed with status ${response.status}`;
        toast.error(`${errorMessage}. Please check console for details.`);
        console.error('Application submission failed:', {
          status: response.status,
          error: error,
          requestData: {
            jobId: job._id,
            resumeUrl,
            hasCustomAnswers: !!answersArray && answersArray.length > 0
          }
        });
      }
    } catch (error) {
      const applicationDuration = Date.now() - applicationStartTime;
      
      // Track application submission error
      analytics.trackEvent('job_application_submit_error', {
        job_id: job._id,
        job_title: job.title,
        company: job.company,
        application_duration: applicationDuration,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        error_type: 'network_error'
      });
      
      console.error('Error submitting application:', error);
      toast.error('Error submitting application');
    } finally {
      setApplying(false);
    }
  };

  const handleExternalApply = () => {
    if (job?.externalLink) {
      window.open(job.externalLink, '_blank', 'noopener,noreferrer');
    }
  };

  const formatSalary = (salaryRange: Job['salaryRange']) => {
    if (salaryRange.min === 0 && salaryRange.max === 0) {
      return 'Salary not disclosed';
    }
    if (salaryRange.min === salaryRange.max) {
      return `${salaryRange.currency} ${salaryRange.min.toLocaleString()}`;
    }
    return `${salaryRange.currency} ${salaryRange.min.toLocaleString()} - ${salaryRange.max.toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCustomAnswerChange = (questionId: string, value: string | string[], type: string) => {
    setCustomAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job not found</h2>
          <Link href="/jobs" className="text-blue-600 hover:text-blue-800">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <FiArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        {/* Job Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {job.title}
              </h1>
              <p className="text-xl text-blue-600 dark:text-blue-400 mb-4">
                {job.company}
              </p>
              <div className="flex flex-wrap items-center text-gray-600 dark:text-gray-400 space-x-6 mb-4">
                <div className="flex items-center space-x-2">
                  <FiMapPin size={18} />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiBriefcase size={18} />
                  <span className="capitalize">{job.workType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiClock size={18} />
                  <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiDollarSign size={18} />
                  <span>{formatSalary(job.salaryRange)}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center text-gray-600 dark:text-gray-400 space-x-6">
                <div className="flex items-center space-x-2">
                  <FiUsers size={18} />
                  <span>{job.totalApplications} applicants</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCalendar size={18} />
                  <span>Posted {formatDate(job.postedDate)}</span>
                </div>
                {job.deadline && (
                  <div className="flex items-center space-x-2">
                    <FiCalendar size={18} />
                    <span>Deadline: {formatDate(job.deadline)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Apply Button */}
            <div className="ml-6">
              {checkingApplication ? (
                <button
                  disabled
                  className="flex items-center space-x-2 bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed"
                >
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Checking...</span>
                </button>
              ) : hasApplied ? (
                <button
                  disabled
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg cursor-not-allowed"
                >
                  <FiCheck size={18} />
                  <span>Applied</span>
                </button>
              ) : job.easyApply ? (
                <button
                  onClick={() => {
                    analytics.trackEvent('job_apply_modal_open', {
                      job_id: job._id,
                      job_title: job.title,
                      company: job.company,
                      work_type: job.workType,
                      employment_type: job.employmentType,
                      application_type: 'easy_apply'
                    });
                    setShowApplyModal(true);
                  }}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Easy Apply</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    analytics.trackEvent('job_external_apply_click', {
                      job_id: job._id,
                      job_title: job.title,
                      company: job.company,
                      work_type: job.workType,
                      employment_type: job.employmentType,
                      external_link: job.externalLink,
                      application_type: 'external'
                    });
                    handleExternalApply();
                  }}
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiExternalLink size={18} />
                  <span>Apply Now</span>
                </button>
              )}
            </div>
          </div>

          {/* Categories and Skills */}
          <div className="mb-6">
            {job.categories.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {job.categories.map((category, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Job Description
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        </div>

        {/* Requirements and Responsibilities */}
        {(job.requirements.length > 0 || job.responsibilities.length > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {job.requirements.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Requirements
                  </h3>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <FiCheck className="text-green-600 mt-1 flex-shrink-0" size={16} />
                        <span className="text-gray-700 dark:text-gray-300">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.responsibilities.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <FiCheck className="text-blue-600 mt-1 flex-shrink-0" size={16} />
                        <span className="text-gray-700 dark:text-gray-300">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Experience Required
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {job.experience.min} - {job.experience.max} years of experience
          </p>
        </div>

        {/* Recruiter Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            About the Recruiter
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Name:</strong> {job.recruiterName}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Email:</strong> {job.recruiterEmail}
          </p>
        </div>
      </div>

      {/* Easy Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Apply for {job.title}
                </h2>
                <button
                  onClick={() => {
                    analytics.trackEvent('job_apply_modal_close', {
                      job_id: job._id,
                      job_title: job.title,
                      company: job.company,
                      has_resume: !!resumeFile,
                      has_cover_letter: !!coverLetter,
                      has_mobile: !!mobileNumber
                    });
                    setShowApplyModal(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resume * <span className="text-red-500">Required</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeFileChange}
                      className="hidden"
                      id="resume-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="resume-upload" className={`cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploading ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-blue-600 dark:text-blue-400">Uploading to Bunny.net...</p>
                        </div>
                      ) : (
                        <>
                          <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">
                            {resumeFile ? (
                              <span className="flex items-center justify-center space-x-2">
                                <FiCheck className="text-green-600" />
                                <span>{resumeFile.name}</span>
                              </span>
                            ) : (
                              'Click to upload your resume (PDF, DOC, DOCX - Max 5MB)'
                            )}
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your mobile number"
                  />
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cover Letter <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Write a brief cover letter..."
                  />
                </div>

                {/* Custom Questions */}
                {job.customQuestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Additional Questions
                    </h3>
                    <div className="space-y-4">
                      {job.customQuestions.map((question) => (
                        <div key={question._id}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {question.question}
                            {question.required && <span className="text-red-500"> *</span>}
                          </label>
                          
                          {question.type === 'text' && (
                            <input
                              type="text"
                              value={(customAnswers[question._id] as string) || ''}
                              onChange={(e) => handleCustomAnswerChange(question._id, e.target.value, question.type)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              required={question.required}
                            />
                          )}
                          
                          {question.type === 'textarea' && (
                            <textarea
                              value={(customAnswers[question._id] as string) || ''}
                              onChange={(e) => handleCustomAnswerChange(question._id, e.target.value, question.type)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              required={question.required}
                            />
                          )}
                          
                          {question.type === 'select' && (
                            <select
                              value={(customAnswers[question._id] as string) || ''}
                              onChange={(e) => handleCustomAnswerChange(question._id, e.target.value, question.type)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              required={question.required}
                            >
                              <option value="">Select an option</option>
                              {question.options?.map((option, index) => (
                                <option key={index} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          {question.type === 'multiselect' && (
                            <div className="space-y-2">
                              {question.options?.map((option, index) => (
                                <label key={index} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={(customAnswers[question._id] as string[] || []).includes(option)}
                                    onChange={(e) => {
                                      const currentAnswers = (customAnswers[question._id] as string[]) || [];
                                      if (e.target.checked) {
                                        handleCustomAnswerChange(question._id, [...currentAnswers, option], question.type);
                                      } else {
                                        handleCustomAnswerChange(question._id, currentAnswers.filter(a => a !== option), question.type);
                                      }
                                    }}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <span className="text-gray-700 dark:text-gray-300">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => {
                      analytics.trackEvent('job_apply_cancel', {
                        job_id: job._id,
                        job_title: job.title,
                        company: job.company,
                        has_resume: !!resumeFile,
                        has_cover_letter: !!coverLetter,
                        has_mobile: !!mobileNumber
                      });
                      setShowApplyModal(false);
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={applying || uploading || !resumeFile}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {(applying || uploading) && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>
                      {uploading ? 'Uploading Resume...' : applying ? 'Submitting Application...' : 'Submit Application'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 