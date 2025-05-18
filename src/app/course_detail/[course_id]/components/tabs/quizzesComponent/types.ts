import { Quiz } from '../../../types';

// Different types of quiz questions
export type QuestionType = 'multiple_choice' | 'multiselect' | 'tita' | 'descriptive';

// Option for multiple choice and multiselect questions
export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

// Base interface for all question types
export interface BaseQuestion {
  id: string;
  text: string;
  type: QuestionType;
  marks: number;
  order: number;
}

// Multiple choice question (single answer)
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: Option[];
}

// Multiselect question (multiple answers)
export interface MultiselectQuestion extends BaseQuestion {
  type: 'multiselect';
  options: Option[];
}

// Type in the answer question
export interface TitaQuestion extends BaseQuestion {
  type: 'tita';
  correctAnswer: string;
  caseSensitive?: boolean;
}

// Descriptive answer question
export interface DescriptiveQuestion extends BaseQuestion {
  type: 'descriptive';
  wordLimit?: number;
  sampleAnswer?: string;
}

// Union type for all question types
export type Question = MultipleChoiceQuestion | MultiselectQuestion | TitaQuestion | DescriptiveQuestion;

// Interface for QuizModal props
export interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuiz: (quizData: Omit<Quiz, 'id'> & { questions: Question[] }) => void;
} 