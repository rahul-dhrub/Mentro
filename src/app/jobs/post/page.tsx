'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface CustomQuestion {
  question: string;
  required: boolean;
  type: 'text' | 'textarea' | 'select' | 'multiselect';
  options: string[];
}

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Basic job info
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

  // Custom question management
  const addCustomQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      { question: '', required: false, type: 'text', options: [] }
    ]);
  };

  const removeCustomQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const updateCustomQuestion = (index: number, field: keyof CustomQuestion, value: any) => {
    const updated = [...customQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setCustomQuestions(updated);
  };

  const addQuestionOption = (questionIndex: number) => {
    const updated = [...customQuestions];
    updated[questionIndex].options.push('');
    setCustomQuestions(updated);
  };

  const removeQuestionOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...customQuestions];
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
    setCustomQuestions(updated);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...customQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setCustomQuestions(updated);
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

    setLoading(true);

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
        } : undefined,
        experience: experienceMin && experienceMax ? {
          min: parseInt(experienceMin),
          max: parseInt(experienceMax)
        } : undefined,
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

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Job posted successfully!');
        router.push(`/jobs/${data.job.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Error posting job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/jobs"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <FiArrowLeft size={20} />
            <span>Back to Jobs</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Post a New Job
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
                  placeholder="e.g. San Francisco, CA"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Work Type *
                </label>
                <select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
            
            <div className="space-y-6">
              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Requirements
                </label>
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateArrayField(index, e.target.value, requirements, setRequirements)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. 3+ years of experience in React"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, requirements, setRequirements)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField(requirements, setRequirements)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <FiPlus size={16} />
                  <span>Add Requirement</span>
                </button>
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Responsibilities
                </label>
                {responsibilities.map((resp, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) => updateArrayField(index, e.target.value, responsibilities, setResponsibilities)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. Develop and maintain web applications"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, responsibilities, setResponsibilities)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField(responsibilities, setResponsibilities)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <FiPlus size={16} />
                  <span>Add Responsibility</span>
                </button>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categories
                </label>
                {categories.map((cat, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <select
                      value={cat}
                      onChange={(e) => updateArrayField(index, e.target.value, categories, setCategories)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select a category</option>
                      {predefinedCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, categories, setCategories)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField(categories, setCategories)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <FiPlus size={16} />
                  <span>Add Category</span>
                </button>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skills
                </label>
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateArrayField(index, e.target.value, skills, setSkills)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. React, TypeScript, Node.js"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, skills, setSkills)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField(skills, setSkills)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <FiPlus size={16} />
                  <span>Add Skill</span>
                </button>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salary Range
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Min salary"
                  />
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Max salary"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>

              {/* Experience Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience Range (years)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={experienceMin}
                    onChange={(e) => setExperienceMin(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Min years"
                  />
                  <input
                    type="number"
                    value={experienceMax}
                    onChange={(e) => setExperienceMax(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Max years"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Custom Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Custom Application Questions (Optional)
            </h2>
            
            {customQuestions.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No custom questions added yet. These questions will be asked to applicants during the application process.
              </p>
            )}

            {customQuestions.map((question, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Question {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeCustomQuestion(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question Text
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateCustomQuestion(index, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. Why are you interested in this role?"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Question Type
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => updateCustomQuestion(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="select">Multiple Choice (Single)</option>
                        <option value="multiselect">Multiple Choice (Multiple)</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={question.required}
                        onChange={(e) => updateCustomQuestion(index, 'required', e.target.checked)}
                        className="w-4 h-4 text-blue-600 mr-2"
                      />
                      <label htmlFor={`required-${index}`} className="text-sm text-gray-700 dark:text-gray-300">
                        Required
                      </label>
                    </div>
                  </div>

                  {(question.type === 'select' || question.type === 'multiselect') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Options
                      </label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateQuestionOption(index, optionIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeQuestionOption(index, optionIndex)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addQuestionOption(index)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      >
                        <FiPlus size={16} />
                        <span>Add Option</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addCustomQuestion}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus size={16} />
              <span>Add Custom Question</span>
            </button>
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

          <div className="flex justify-end space-x-4">
            <Link
              href="/jobs"
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSave size={16} />
              <span>{loading ? 'Posting...' : 'Post Job'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 