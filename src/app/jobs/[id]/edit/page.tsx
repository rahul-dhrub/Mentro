'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiSave,
  FiLoader,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface CustomQuestion {
  _id?: string;
  question: string;
  required: boolean;
  type: 'text' | 'textarea' | 'select' | 'multiselect';
  options: string[];
}

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
  customQuestions: CustomQuestion[];
  deadline?: string;
  recruiterEmail: string;
}

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [workType, setWorkType] = useState('remote');
  const [employmentType, setEmploymentType] = useState('full-time');
  const [description, setDescription] = useState('');
  const [easyApply, setEasyApply] = useState(true);
  const [externalLink, setExternalLink] = useState('');

  // Additional fields
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [categories, setCategories] = useState<string[]>(['']);
  const [skills, setSkills] = useState<string[]>(['']);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [experienceMin, setExperienceMin] = useState('');
  const [experienceMax, setExperienceMax] = useState('');
  const [deadline, setDeadline] = useState('');

  // Custom questions
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  const predefinedCategories = [
    'Software Development',
    'Data Science',
    'Design',
    'Marketing',
    'Sales',
    'Customer Support',
    'HR',
    'Finance',
    'Operations',
    'Product Management',
  ];

  // Load job data and check authorization
  useEffect(() => {
    const fetchJobAndCheckAuth = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/jobs/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          const jobData = data.job;
          
          // Check if user is authorized to edit this job
          const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
          const jobOwnerEmail = jobData.recruiterEmail?.toLowerCase();
          
          if (userEmail !== jobOwnerEmail) {
            toast.error('You are not authorized to edit this job');
            router.push(`/jobs/${params.id}`);
            return;
          }

          setJob(jobData);
          setIsAuthorized(true);
          
          // Populate form fields
          setTitle(jobData.title || '');
          setCompany(jobData.company || '');
          setLocation(jobData.location || '');
          setWorkType(jobData.workType || 'remote');
          setEmploymentType(jobData.employmentType || 'full-time');
          setDescription(jobData.description || '');
          setEasyApply(jobData.easyApply ?? true);
          setExternalLink(jobData.externalLink || '');
          
          setRequirements(jobData.requirements?.length ? jobData.requirements : ['']);
          setResponsibilities(jobData.responsibilities?.length ? jobData.responsibilities : ['']);
          setCategories(jobData.categories?.length ? jobData.categories : ['']);
          setSkills(jobData.skills?.length ? jobData.skills : ['']);
          
          if (jobData.salaryRange) {
            setSalaryMin(jobData.salaryRange.min > 0 ? jobData.salaryRange.min.toString() : '');
            setSalaryMax(jobData.salaryRange.max > 0 ? jobData.salaryRange.max.toString() : '');
            setCurrency(jobData.salaryRange.currency || 'USD');
          }
          
          if (jobData.experience) {
            setExperienceMin(jobData.experience.min?.toString() || '');
            setExperienceMax(jobData.experience.max?.toString() || '');
          }
          
          if (jobData.deadline) {
            const deadlineDate = new Date(jobData.deadline);
            setDeadline(deadlineDate.toISOString().split('T')[0]);
          }
          
          setCustomQuestions(jobData.customQuestions || []);
          
        } else {
          toast.error('Job not found');
          router.push('/jobs');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Error loading job details');
        router.push('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndCheckAuth();
  }, [params.id, isLoaded, user, router]);

  // Helper functions for array fields
  const addArrayField = (
    array: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter([...array, '']);
  };

  const removeArrayField = (
    index: number,
    array: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newArray = array.filter((_, i) => i !== index);
    setter(newArray.length > 0 ? newArray : ['']);
  };

  const updateArrayField = (
    index: number,
    value: string,
    array: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  // Custom questions handlers
  const addCustomQuestion = () => {
    const newQuestion: CustomQuestion = {
      question: '',
      required: false,
      type: 'text',
      options: [],
    };
    setCustomQuestions([...customQuestions, newQuestion]);
  };

  const removeCustomQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const updateCustomQuestion = (index: number, field: keyof CustomQuestion, value: any) => {
    const newQuestions = [...customQuestions];
    (newQuestions[index] as any)[field] = value;
    setCustomQuestions(newQuestions);
  };

  const addQuestionOption = (questionIndex: number) => {
    const newQuestions = [...customQuestions];
    newQuestions[questionIndex].options.push('');
    setCustomQuestions(newQuestions);
  };

  const removeQuestionOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...customQuestions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    setCustomQuestions(newQuestions);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...customQuestions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setCustomQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !company || !location || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!easyApply && !externalLink) {
      toast.error('External application link is required when easy apply is disabled');
      return;
    }

    // Validate custom questions with select/multiselect types have options
    for (const question of customQuestions) {
      if ((question.type === 'select' || question.type === 'multiselect') && 
          question.options.filter(opt => opt.trim()).length === 0) {
        toast.error('Select and multiselect questions must have at least one option');
        return;
      }
    }

    setSaving(true);

    try {
      const jobData = {
        title,
        company,
        location,
        workType,
        employmentType,
        description,
        requirements: requirements.filter(req => req.trim()),
        responsibilities: responsibilities.filter(resp => resp.trim()),
        categories: categories.filter(cat => cat.trim()),
        skills: skills.filter(skill => skill.trim()),
        salaryRange: salaryMin && salaryMax ? {
          min: parseInt(salaryMin),
          max: parseInt(salaryMax),
          currency
        } : { min: 0, max: 0, currency },
        experience: experienceMin && experienceMax ? {
          min: parseInt(experienceMin),
          max: parseInt(experienceMax)
        } : { min: 0, max: 10 },
        deadline: deadline || undefined,
        easyApply,
        externalLink: easyApply ? undefined : externalLink,
        customQuestions: customQuestions
          .filter(q => q.question.trim())
          .map(q => ({
            ...q,
            options: (q.type === 'select' || q.type === 'multiselect') 
              ? q.options.filter(opt => opt.trim()) 
              : []
          })),
      };

      const response = await fetch(`/api/jobs/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        toast.success('Job updated successfully!');
        router.push(`/jobs/${params.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Error updating job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthorized || !job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You are not authorized to edit this job.</p>
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
        <div className="mb-8">
          <Link
            href={`/jobs/${params.id}`}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <FiArrowLeft size={20} />
            <span>Back to Job Details</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Job: {job.title}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Company name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. New York, NY or Remote"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Work Type *
                </label>
                <select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employment Type *
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                required
              />
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Job Details
            </h2>
            
            {/* Requirements */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Requirements
              </label>
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateArrayField(index, e.target.value, requirements, setRequirements)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Requirement ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayField(index, requirements, setRequirements)}
                    className="text-red-600 hover:text-red-800 p-2"
                    disabled={requirements.length === 1}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField(requirements, setRequirements)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mt-2"
              >
                <FiPlus size={16} />
                <span>Add Requirement</span>
              </button>
            </div>

            {/* Responsibilities */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Responsibilities
              </label>
              {responsibilities.map((resp, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => updateArrayField(index, e.target.value, responsibilities, setResponsibilities)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Responsibility ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayField(index, responsibilities, setResponsibilities)}
                    className="text-red-600 hover:text-red-800 p-2"
                    disabled={responsibilities.length === 1}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField(responsibilities, setResponsibilities)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mt-2"
              >
                <FiPlus size={16} />
                <span>Add Responsibility</span>
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Categories
              </label>
              <div className="mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {predefinedCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        if (!categories.includes(cat)) {
                          setCategories(prev => {
                            const newCategories = [...prev];
                            const emptyIndex = newCategories.findIndex(c => !c.trim());
                            if (emptyIndex !== -1) {
                              newCategories[emptyIndex] = cat;
                            } else {
                              newCategories.push(cat);
                            }
                            return newCategories;
                          });
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        categories.includes(cat)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              {categories.map((cat, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={cat}
                    onChange={(e) => updateArrayField(index, e.target.value, categories, setCategories)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Category ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayField(index, categories, setCategories)}
                    className="text-red-600 hover:text-red-800 p-2"
                    disabled={categories.length === 1}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField(categories, setCategories)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mt-2"
              >
                <FiPlus size={16} />
                <span>Add Category</span>
              </button>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Required Skills
              </label>
              {skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateArrayField(index, e.target.value, skills, setSkills)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Skill ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayField(index, skills, setSkills)}
                    className="text-red-600 hover:text-red-800 p-2"
                    disabled={skills.length === 1}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField(skills, setSkills)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mt-2"
              >
                <FiPlus size={16} />
                <span>Add Skill</span>
              </button>
            </div>
          </div>

          {/* Compensation & Experience */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Compensation & Experience
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Salary Range */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Salary Range
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="number"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Minimum salary"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Maximum salary"
                    />
                  </div>
                  <div>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Experience Range */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Experience Required (Years)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      value={experienceMin}
                      onChange={(e) => setExperienceMin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Minimum years"
                      min="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={experienceMax}
                      onChange={(e) => setExperienceMax(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Maximum years"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Application Settings
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="easyApply"
                  checked={easyApply}
                  onChange={(e) => setEasyApply(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="easyApply" className="text-sm text-gray-700 dark:text-gray-300">
                  Enable Easy Apply
                </label>
              </div>
              
              {!easyApply && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    External Application Link *
                  </label>
                  <input
                    type="url"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://company.com/careers/apply"
                    required={!easyApply}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Custom Questions */}
          {easyApply && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Custom Application Questions
              </h2>
              
              {customQuestions.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No custom questions added. Click the button below to add screening questions for applicants.
                </p>
              ) : (
                <div className="space-y-6 mb-6">
                  {customQuestions.map((question, questionIndex) => (
                    <div key={questionIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Question {questionIndex + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeCustomQuestion(questionIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Question Text *
                          </label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => updateCustomQuestion(questionIndex, 'question', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your question"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Question Type
                            </label>
                            <select
                              value={question.type}
                              onChange={(e) => updateCustomQuestion(questionIndex, 'type', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="text">Short Text</option>
                              <option value="textarea">Long Text</option>
                              <option value="select">Single Select</option>
                              <option value="multiselect">Multiple Select</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`required-${questionIndex}`}
                              checked={question.required}
                              onChange={(e) => updateCustomQuestion(questionIndex, 'required', e.target.checked)}
                              className="w-4 h-4 text-blue-600 mr-2"
                            />
                            <label htmlFor={`required-${questionIndex}`} className="text-sm text-gray-700 dark:text-gray-300">
                              Required
                            </label>
                          </div>
                        </div>
                        
                        {(question.type === 'select' || question.type === 'multiselect') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Options *
                            </label>
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2 mb-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeQuestionOption(questionIndex, optionIndex)}
                                  className="text-red-600 hover:text-red-800 p-2"
                                  disabled={question.options.length === 1}
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addQuestionOption(questionIndex)}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mt-2"
                            >
                              <FiPlus size={16} />
                              <span>Add Option</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                type="button"
                onClick={addCustomQuestion}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiPlus size={18} />
                <span>Add Custom Question</span>
              </button>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href={`/jobs/${params.id}`}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving && <FiLoader className="animate-spin" size={18} />}
              <FiSave size={18} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 