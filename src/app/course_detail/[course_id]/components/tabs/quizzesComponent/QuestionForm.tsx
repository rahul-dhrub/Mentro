import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { Question, QuestionType, Option, MultipleChoiceQuestion, MultiselectQuestion, TitaQuestion, DescriptiveQuestion } from './types';

interface QuestionFormProps {
  questions: Question[];
  onAddQuestion: (question: Omit<Question, 'id' | 'order'>) => void;
  onEditQuestion: (index: number, question: Partial<Question>) => void;
  onDeleteQuestion: (index: number) => void;
}

export default function QuestionForm({
  questions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion
}: QuestionFormProps) {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [questionText, setQuestionText] = useState('');
  const [questionMarks, setQuestionMarks] = useState('1');
  const [options, setOptions] = useState<Omit<Option, 'id'>[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [titaAnswer, setTitaAnswer] = useState('');
  const [titaCaseSensitive, setTitaCaseSensitive] = useState(false);
  const [wordLimit, setWordLimit] = useState('');
  const [sampleAnswer, setSampleAnswer] = useState('');

  const resetQuestionForm = () => {
    setIsAddingQuestion(false);
    setEditingQuestionIndex(null);
    setQuestionType('multiple_choice');
    setQuestionText('');
    setQuestionMarks('1');
    setOptions([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]);
    setTitaAnswer('');
    setTitaCaseSensitive(false);
    setWordLimit('');
    setSampleAnswer('');
  };

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return; // Keep at least 2 options
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleOptionCorrectToggle = (index: number) => {
    const newOptions = [...options];
    
    // For multiple choice, only one option can be correct
    if (questionType === 'multiple_choice') {
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      // For multiselect, toggle the current option
      newOptions[index].isCorrect = !newOptions[index].isCorrect;
    }
    
    setOptions(newOptions);
  };

  const handleSaveQuestion = () => {
    // Validation
    if (!questionText.trim()) return;
    
    if ((questionType === 'multiple_choice' || questionType === 'multiselect') &&
        (options.some(opt => !opt.text.trim()) || // all options must have text
         !options.some(opt => opt.isCorrect))) {  // at least one option must be correct
      return;
    }
    
    if (questionType === 'tita' && !titaAnswer.trim()) {
      return;
    }
    
    // Create question object based on type
    if (questionType === 'multiple_choice') {
      const questionData: Omit<MultipleChoiceQuestion, 'id' | 'order'> = {
        type: 'multiple_choice',
        text: questionText,
        marks: parseInt(questionMarks) || 1,
        options: options.map((opt, index) => ({
          id: `option-${Date.now()}-${index}`,
          ...opt
        }))
      };
      onAddQuestion(questionData);
    } else if (questionType === 'multiselect') {
      const questionData: Omit<MultiselectQuestion, 'id' | 'order'> = {
        type: 'multiselect',
        text: questionText,
        marks: parseInt(questionMarks) || 1,
        options: options.map((opt, index) => ({
          id: `option-${Date.now()}-${index}`,
          ...opt
        }))
      };
      onAddQuestion(questionData);
    } else if (questionType === 'tita') {
      const questionData: Omit<TitaQuestion, 'id' | 'order'> = {
        type: 'tita',
        text: questionText,
        marks: parseInt(questionMarks) || 1,
        correctAnswer: titaAnswer,
        caseSensitive: titaCaseSensitive
      };
      onAddQuestion(questionData);
    } else if (questionType === 'descriptive') {
      const questionData: Omit<DescriptiveQuestion, 'id' | 'order'> = {
        type: 'descriptive',
        text: questionText,
        marks: parseInt(questionMarks) || 1
      };
      
      // Only add optional fields if they have values
      if (wordLimit.trim()) {
        questionData.wordLimit = parseInt(wordLimit);
      }
      
      if (sampleAnswer.trim()) {
        questionData.sampleAnswer = sampleAnswer;
      }
      
      onAddQuestion(questionData);
    }
    
    resetQuestionForm();
  };

  const handleEditQuestion = (index: number) => {
    const question = questions[index];
    setEditingQuestionIndex(index);
    setQuestionType(question.type);
    setQuestionText(question.text);
    setQuestionMarks(question.marks.toString());
    
    if (question.type === 'multiple_choice' || question.type === 'multiselect') {
      setOptions(question.options.map(opt => ({
        text: opt.text,
        isCorrect: opt.isCorrect
      })));
    } else if (question.type === 'tita') {
      setTitaAnswer(question.correctAnswer);
      setTitaCaseSensitive(question.caseSensitive || false);
    } else if (question.type === 'descriptive') {
      setWordLimit(question.wordLimit?.toString() || '');
      setSampleAnswer(question.sampleAnswer || '');
    }
    
    setIsAddingQuestion(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Questions
        </label>
        {!isAddingQuestion && (
          <button
            type="button"
            onClick={() => setIsAddingQuestion(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm cursor-pointer"
          >
            <FiPlus size={16} />
            <span>Add Question</span>
          </button>
        )}
      </div>
      
      {/* Question list */}
      {questions.length > 0 && !isAddingQuestion && (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      question.type === 'multiple_choice' 
                        ? 'bg-blue-100 text-blue-800' 
                        : question.type === 'multiselect'
                          ? 'bg-purple-100 text-purple-800'
                          : question.type === 'tita'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                    }`}>
                      {question.type === 'multiple_choice' 
                        ? 'Multiple Choice' 
                        : question.type === 'multiselect'
                          ? 'Multiselect'
                          : question.type === 'tita'
                            ? 'Type Answer'
                            : 'Descriptive'}
                    </span>
                    <span className="ml-2 text-xs font-medium text-gray-500">
                      {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{question.text}</p>
                  
                  {(question.type === 'multiple_choice' || question.type === 'multiselect') && (
                    <ul className="ml-4 text-sm text-gray-600">
                      {question.options.map((option, optIndex) => (
                        <li key={option.id} className="flex items-center">
                          <span className={`w-4 h-4 mr-1 flex items-center justify-center rounded-full text-xs ${
                            option.isCorrect 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200'
                          }`}>
                            {option.isCorrect && <FiCheck size={10} />}
                          </span>
                          {option.text}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {question.type === 'tita' && (
                    <div className="ml-4 text-sm text-gray-600">
                      <span className="font-medium">Correct answer: </span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">{question.correctAnswer}</span>
                      {question.caseSensitive && (
                        <span className="ml-2 text-xs text-gray-500">(Case sensitive)</span>
                      )}
                    </div>
                  )}
                  
                  {question.type === 'descriptive' && (
                    <div className="ml-4 text-sm text-gray-600">
                      {question.wordLimit && (
                        <div className="mb-1">
                          <span className="font-medium">Word limit: </span>
                          <span>{question.wordLimit} words</span>
                        </div>
                      )}
                      {question.sampleAnswer && (
                        <div>
                          <div className="font-medium mb-1">Sample answer:</div>
                          <div className="bg-gray-100 p-2 rounded text-xs">{question.sampleAnswer}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEditQuestion(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <span className="sr-only">Edit</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteQuestion(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <span className="sr-only">Delete</span>
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add/Edit question form */}
      {isAddingQuestion && (
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
          {/* Question Type Selector */}
          <div className="flex flex-wrap border-b border-gray-200 pb-3">
            <button
              type="button"
              onClick={() => setQuestionType('multiple_choice')}
              className={`px-3 py-2 text-sm font-medium flex items-center mr-4 ${
                questionType === 'multiple_choice' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Multiple Choice
            </button>
            <button
              type="button"
              onClick={() => setQuestionType('multiselect')}
              className={`px-3 py-2 text-sm font-medium flex items-center mr-4 ${
                questionType === 'multiselect' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Multiselect
            </button>
            <button
              type="button"
              onClick={() => setQuestionType('tita')}
              className={`px-3 py-2 text-sm font-medium flex items-center mr-4 ${
                questionType === 'tita' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Type Answer
            </button>
            <button
              type="button"
              onClick={() => setQuestionType('descriptive')}
              className={`px-3 py-2 text-sm font-medium flex items-center ${
                questionType === 'descriptive' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Descriptive
            </button>
          </div>
          
          {/* Question Text */}
          <div>
            <label htmlFor="question-text" className="block text-sm font-medium text-gray-700 mb-1">
              Question *
            </label>
            <textarea
              id="question-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>
          
          {/* Marks */}
          <div>
            <label htmlFor="question-marks" className="block text-sm font-medium text-gray-700 mb-1">
              Marks *
            </label>
            <input
              id="question-marks"
              type="number"
              min="1"
              value={questionMarks}
              onChange={(e) => setQuestionMarks(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>
          
          {/* Multiple Choice and Multiselect Options */}
          {(questionType === 'multiple_choice' || questionType === 'multiselect') && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Options * 
                {questionType === 'multiple_choice' 
                  ? ' (Select one correct answer)' 
                  : ' (Select one or more correct answers)'}
              </label>
              {options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleOptionCorrectToggle(index)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                      option.isCorrect 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {option.isCorrect ? <FiCheck size={14} /> : null}
                  </button>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionTextChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    disabled={options.length <= 2}
                    className="ml-2 text-red-500 hover:text-red-700 disabled:text-gray-300"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddOption}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <FiPlus size={16} className="mr-1" />
                Add Option
              </button>
            </div>
          )}
          
          {/* Type In The Answer */}
          {questionType === 'tita' && (
            <div className="space-y-3">
              <div>
                <label htmlFor="tita-answer" className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Answer *
                </label>
                <input
                  id="tita-answer"
                  type="text"
                  value={titaAnswer}
                  onChange={(e) => setTitaAnswer(e.target.value)}
                  placeholder="Enter the correct answer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="case-sensitive"
                  type="checkbox"
                  checked={titaCaseSensitive}
                  onChange={(e) => setTitaCaseSensitive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="case-sensitive" className="ml-2 block text-sm text-gray-700">
                  Case sensitive
                </label>
              </div>
            </div>
          )}
          
          {/* Descriptive Answer */}
          {questionType === 'descriptive' && (
            <div className="space-y-3">
              <div>
                <label htmlFor="word-limit" className="block text-sm font-medium text-gray-700 mb-1">
                  Word Limit (optional)
                </label>
                <input
                  id="word-limit"
                  type="number"
                  min="1"
                  value={wordLimit}
                  onChange={(e) => setWordLimit(e.target.value)}
                  placeholder="Maximum number of words"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              <div>
                <label htmlFor="sample-answer" className="block text-sm font-medium text-gray-700 mb-1">
                  Sample Answer (optional)
                </label>
                <textarea
                  id="sample-answer"
                  value={sampleAnswer}
                  onChange={(e) => setSampleAnswer(e.target.value)}
                  placeholder="Enter a sample answer for reference (not shown to students)"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
            </div>
          )}
          
          {/* Button Group */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={resetQuestionForm}
              className="px-3 py-1 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveQuestion}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              disabled={!questionText.trim()}
            >
              {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </div>
      )}
      
      {questions.length === 0 && !isAddingQuestion && (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-500">No questions added yet. Click "Add Question" to get started.</p>
        </div>
      )}
    </div>
  );
} 