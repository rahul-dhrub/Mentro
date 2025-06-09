'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiEye,
  FiDownload,
  FiExternalLink,
  FiSearch,
  FiFilter,
  FiUser,
  FiBriefcase,
  FiCalendar,
  FiMail,
  FiPhone,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUsers,
  FiPlus,
  FiMapPin,
  FiDollarSign,
  FiEdit,
  FiList,
  FiToggleLeft,
  FiToggleRight,
  FiTrash2,
  FiAlertTriangle,
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
  status: 'active' | 'closed' | 'draft';
  totalApplications: number;
  postedDate: string;
  deadline?: string;
  easyApply: boolean;
  externalLink?: string;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
}

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    workType: string;
    employmentType: string;
  };
  applicantId: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  applicantName: string;
  applicantEmail: string;
  mobileNumber?: string;
  resumeUrl: string;
  coverLetter?: string;
  customAnswers: {
    questionId: string;
    question: string;
    answer: string | string[];
  }[];
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
  emailConfirmed: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const analytics = useAnalytics();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  
  // View states
  const [currentView, setCurrentView] = useState<'jobs' | 'applications'>('jobs');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('');
  
  // Filter states for applications view
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Application detail modal
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [cleanupInfo, setCleanupInfo] = useState<{ needsCleanup: boolean; invalid: number } | null>(null);
  
  // Job management
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState(false);
  const [updatingJobStatus, setUpdatingJobStatus] = useState<string>('');

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'hired', label: 'Hired' },
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    shortlisted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    hired: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  const statusIcons = {
    pending: FiClock,
    reviewed: FiEye,
    shortlisted: FiCheckCircle,
    rejected: FiXCircle,
    hired: FiUsers,
  };

  const jobStatusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    closed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  useEffect(() => {
    if (currentView === 'jobs') {
      fetchJobs();
    } else {
      fetchApplications();
    }
    checkCleanupStatus();
  }, [currentView, search, selectedStatus]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      analytics.trackEvent('recruiter_jobs_overview_view', {
        view_type: 'my_jobs'
      });

      const response = await fetch('/api/jobs/my-jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (page = 1) => {
    try {
      setLoading(true);
      
      analytics.trackEvent('recruiter_applications_page_view', {
        page,
        job_id: selectedJobId,
        job_title: selectedJobTitle,
        filters: {
          search: !!search,
          status: selectedStatus
        }
      });

      const params = new URLSearchParams({
        type: 'received',
        page: page.toString(),
        limit: '10',
      });

      if (selectedJobId) params.append('jobId', selectedJobId);
      if (search) params.append('search', search);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(`/api/applications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
        setPagination(data.pagination);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const checkCleanupStatus = async () => {
    try {
      const response = await fetch('/api/applications/cleanup');
      if (response.ok) {
        const data = await response.json();
        setCleanupInfo({
          needsCleanup: data.needsCleanup,
          invalid: data.invalid
        });
      }
    } catch (error) {
      console.log('Could not check cleanup status');
    }
  };

  const runCleanup = async () => {
    try {
      const response = await fetch('/api/applications/cleanup', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Cleanup completed: ${data.summary.fixed} fixed, ${data.summary.removed} removed`);
        if (currentView === 'applications') {
          fetchApplications();
        }
        checkCleanupStatus();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Cleanup failed');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Error running cleanup');
    }
  };

  const handleViewJobDetails = (job: Job) => {
    analytics.trackEvent('recruiter_job_detail_view', {
      job_id: job._id,
      job_title: job.title,
      applications_count: job.totalApplications
    });
    
    router.push(`/jobs/${job._id}`);
  };

  const handleViewJobSubmissions = (job: Job) => {
    analytics.trackEvent('recruiter_job_submissions_view', {
      job_id: job._id,
      job_title: job.title,
      applications_count: job.totalApplications
    });

    setSelectedJobId(job._id);
    setSelectedJobTitle(job.title);
    setCurrentView('applications');
  };

  const handleToggleJobStatus = async (job: Job) => {
    try {
      setUpdatingJobStatus(job._id);
      const newStatus = job.status === 'active' ? 'closed' : 'active';
      
      analytics.trackEvent('recruiter_job_status_toggle', {
        job_id: job._id,
        job_title: job.title,
        old_status: job.status,
        new_status: newStatus
      });

      const response = await fetch(`/api/jobs/${job._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Job ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        fetchJobs(); // Refresh the jobs list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Error updating job status');
    } finally {
      setUpdatingJobStatus('');
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      setDeletingJob(true);
      
      analytics.trackEvent('recruiter_job_delete', {
        job_id: jobToDelete._id,
        job_title: jobToDelete.title,
        applications_count: jobToDelete.totalApplications
      });

      const response = await fetch(`/api/jobs/${jobToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Job deleted successfully');
        fetchJobs(); // Refresh the jobs list
        setShowDeleteConfirm(false);
        setJobToDelete(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Error deleting job');
    } finally {
      setDeletingJob(false);
    }
  };

  const handleBackToJobs = () => {
    setCurrentView('jobs');
    setSelectedJobId('');
    setSelectedJobTitle('');
    setSearch('');
    setSelectedStatus('');
  };

  const handleOpenResume = (application: Application) => {
    analytics.trackEvent('recruiter_resume_open', {
      application_id: application._id,
      job_id: application.jobId._id,
      job_title: application.jobId.title,
      applicant_name: application.applicantName,
      resume_url: application.resumeUrl
    });

    window.open(application.resumeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadResume = async (application: Application) => {
    try {
      analytics.trackEvent('recruiter_resume_download', {
        application_id: application._id,
        job_id: application.jobId._id,
        job_title: application.jobId.title,
        applicant_name: application.applicantName,
        resume_url: application.resumeUrl
      });

      const link = document.createElement('a');
      link.href = application.resumeUrl;
      link.download = `${application.applicantName}-resume.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Resume download started');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    }
  };

  const handleViewApplication = (application: Application) => {
    analytics.trackEvent('recruiter_application_view', {
      application_id: application._id,
      job_id: application.jobId._id,
      job_title: application.jobId.title,
      applicant_name: application.applicantName,
      status: application.status
    });

    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      analytics.trackEvent('recruiter_application_status_update', {
        application_id: applicationId,
        old_status: selectedApplication?.status,
        new_status: newStatus,
        job_id: selectedApplication?.jobId._id,
        job_title: selectedApplication?.jobId.title
      });

      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Application status updated to ${newStatus}`);
        fetchApplications();
        if (selectedApplication) {
          setSelectedApplication({ ...selectedApplication, status: newStatus as any });
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating application status');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const renderCustomAnswers = (customAnswers: Application['customAnswers']) => {
    if (!customAnswers || customAnswers.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Custom Questions</h4>
        <div className="space-y-3">
          {customAnswers.map((answer, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                {answer.question}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading && (currentView === 'jobs' ? jobs.length === 0 : applications.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => currentView === 'applications' ? handleBackToJobs() : router.back()}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <FiArrowLeft size={24} />
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentView === 'jobs' ? 'My Posted Jobs' : `Applications for "${selectedJobTitle}"`}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {currentView === 'jobs' && (
                <Link
                  href="/jobs/post"
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPlus size={20} />
                  <span>Post New Job</span>
                </Link>
              )}
              <Link
                href="/jobs"
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiBriefcase size={20} />
                <span>Browse Jobs</span>
              </Link>
            </div>
          </div>

          {/* Search and Filters - Only show for applications view */}
          {currentView === 'applications' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by applicant name, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiFilter size={20} />
                  <span>Filters</span>
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cleanup Notification */}
        {cleanupInfo?.needsCleanup && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  Data Cleanup Required
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Found {cleanupInfo.invalid} applications with invalid data that need to be fixed.
                </p>
              </div>
              <button
                onClick={runCleanup}
                className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <span>Fix Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {currentView === 'jobs' ? (
          /* Jobs List */
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <FiBriefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Jobs Posted Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't posted any jobs yet. Start by posting your first job to receive applications.
                </p>
                <Link
                  href="/jobs/post"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPlus size={16} />
                  <span>Post Your First Job</span>
                </Link>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col">
                    {/* Main Content and Actions Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              {job.title}
                            </h3>
                            <p className="text-lg text-blue-600 dark:text-blue-400 mb-3">
                              {job.company}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${jobStatusColors[job.status]}`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <FiMapPin size={16} />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <FiBriefcase size={16} />
                            <span className="capitalize">{job.workType}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <FiClock size={16} />
                            <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <FiDollarSign size={16} />
                            <span>{formatSalary(job.salaryRange)}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div className="flex items-center space-x-1">
                            <FiUsers size={14} />
                            <span>{job.totalApplications} applications</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiCalendar size={14} />
                            <span>Posted {formatDate(job.postedDate)}</span>
                          </div>
                          {job.deadline && (
                            <div className="flex items-center space-x-1">
                              <FiCalendar size={14} />
                              <span>Deadline: {formatDate(job.deadline)}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                          {job.description}
                        </p>
                      </div>

                      {/* Main Action Buttons */}
                      <div className="flex items-center space-x-3 ml-6">
                        <button
                          onClick={() => handleViewJobDetails(job)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FiEye size={16} />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => handleViewJobSubmissions(job)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FiList size={16} />
                          <span>Submissions ({job.totalApplications})</span>
                        </button>
                      </div>
                    </div>

                    {/* Management Buttons at Bottom Right */}
                    <div className="flex justify-end items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => handleToggleJobStatus(job)}
                        disabled={updatingJobStatus === job._id}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                          job.status === 'active'
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        } ${updatingJobStatus === job._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={job.status === 'active' ? 'Deactivate Job' : 'Activate Job'}
                      >
                        {updatingJobStatus === job._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : job.status === 'active' ? (
                          <FiToggleRight size={14} />
                        ) : (
                          <FiToggleLeft size={14} />
                        )}
                        <span>{job.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setJobToDelete(job);
                          setShowDeleteConfirm(true);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        title="Delete Job"
                      >
                        <FiTrash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Applications List */
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Applications Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {search || selectedStatus 
                    ? 'No applications match your current filters.' 
                    : 'This job hasn\'t received any applications yet.'}
                </p>
                <button
                  onClick={handleBackToJobs}
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiArrowLeft size={16} />
                  <span>Back to Jobs</span>
                </button>
              </div>
            ) : (
              applications.map((application) => {
                const StatusIcon = statusIcons[application.status];
                return (
                  <div
                    key={application._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {application.applicantId.profilePicture ? (
                              <img
                                src={application.applicantId.profilePicture}
                                alt={application.applicantName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                <FiUser className="text-gray-600 dark:text-gray-400" size={24} />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {application.applicantName}
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                                <StatusIcon size={12} className="mr-1" />
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <FiMail size={14} />
                                  <span>{application.applicantEmail}</span>
                                </div>
                                {application.mobileNumber && (
                                  <div className="flex items-center space-x-1">
                                    <FiPhone size={14} />
                                    <span>{application.mobileNumber}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <FiCalendar size={14} />
                                <span>Applied {formatDate(application.appliedAt)}</span>
                              </div>
                            </div>

                            {application.coverLetter && (
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                  {application.coverLetter}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleOpenResume(application)}
                          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          title="Open Resume"
                        >
                          <FiExternalLink size={16} />
                          <span>Resume</span>
                        </button>
                        
                        <button
                          onClick={() => handleDownloadResume(application)}
                          className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          title="Download Resume"
                        >
                          <FiDownload size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleViewApplication(application)}
                          className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination for applications */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {applications.length} of {pagination.total} applications
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchApplications(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchApplications(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Application Detail Modal */}
        {showApplicationModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Application Details
                  </h2>
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiXCircle size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Applicant Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Applicant Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                      <p><strong>Name:</strong> {selectedApplication.applicantName}</p>
                      <p><strong>Email:</strong> {selectedApplication.applicantEmail}</p>
                      {selectedApplication.mobileNumber && (
                        <p><strong>Phone:</strong> {selectedApplication.mobileNumber}</p>
                      )}
                      <p><strong>Applied:</strong> {formatDate(selectedApplication.appliedAt)}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedApplication.status]}`}>
                          {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {selectedApplication.coverLetter && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Cover Letter
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {selectedApplication.coverLetter}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Custom Answers */}
                  {renderCustomAnswers(selectedApplication.customAnswers)}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => handleOpenResume(selectedApplication)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiExternalLink size={16} />
                      <span>View Resume</span>
                    </button>
                    
                    <button
                      onClick={() => handleDownloadResume(selectedApplication)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FiDownload size={16} />
                      <span>Download Resume</span>
                    </button>

                    {/* Status Update Buttons */}
                    <div className="flex space-x-2">
                      {['reviewed', 'shortlisted', 'rejected', 'hired'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateApplicationStatus(selectedApplication._id, status)}
                          disabled={selectedApplication.status === status}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedApplication.status === status
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                          }`}
                        >
                          Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && jobToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <FiAlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Delete Job
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Are you sure you want to delete this job? This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {jobToDelete.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {jobToDelete.company} • {jobToDelete.totalApplications} applications
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setJobToDelete(null);
                    }}
                    disabled={deletingJob}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteJob}
                    disabled={deletingJob}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingJob ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <FiTrash2 size={16} />
                    )}
                    <span>{deletingJob ? 'Deleting...' : 'Delete Job'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 