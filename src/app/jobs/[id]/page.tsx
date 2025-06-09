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
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);

  // Application form data
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'resume');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const data = await response.json();
    return data.url;
  };

  const handleApply = async () => {
    if (!job) return;

    if (!resumeFile) {
      toast.error('Please upload your resume');
      return;
    }

    // Validate required custom questions
    for (const question of job.customQuestions) {
      if (question.required && !customAnswers[question._id]) {
        toast.error(`Please answer: ${question.question}`);
        return;
      }
    }

    setApplying(true);

    try {
      // Upload resume
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

      if (response.ok) {
        toast.success('Application submitted successfully! Please check your email for confirmation.');
        setShowApplyModal(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit application');
      }
    } catch (error) {
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
          <Link
            href="/jobs"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <FiArrowLeft size={20} />
            <span>Back to Jobs</span>
          </Link>
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
              {job.easyApply ? (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Easy Apply</span>
                </button>
              ) : (
                <button
                  onClick={handleExternalApply}
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
                  onClick={() => setShowApplyModal(false)}
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
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        {resumeFile ? resumeFile.name : 'Click to upload your resume (PDF, DOC, DOCX)'}
                      </p>
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
                    onClick={() => setShowApplyModal(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={applying || !resumeFile}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
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