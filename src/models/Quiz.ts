import mongoose, { Schema, Document } from 'mongoose';

export interface IOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface IBaseQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'multiselect' | 'tita' | 'descriptive';
  marks: number;
  order: number;
}

export interface IMultipleChoiceQuestion extends IBaseQuestion {
  type: 'multiple_choice';
  options: IOption[];
}

export interface IMultiselectQuestion extends IBaseQuestion {
  type: 'multiselect';
  options: IOption[];
}

export interface ITitaQuestion extends IBaseQuestion {
  type: 'tita';
  correctAnswer: string;
  caseSensitive: boolean;
}

export interface IDescriptiveQuestion extends IBaseQuestion {
  type: 'descriptive';
  sampleAnswer?: string;
}

export type IQuestion = IMultipleChoiceQuestion | IMultiselectQuestion | ITitaQuestion | IDescriptiveQuestion;

// Content interface for additional resources
export interface ILessonContent {
  id: string;
  type: 'video' | 'image' | 'pdf' | 'link';
  title: string;
  url: string;
  description?: string;
  order: number;
}

export interface IQuiz extends Document {
  _id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  totalMarks: number;
  totalQuestions: number;
  isPublished: boolean;
  scheduled: boolean;
  startDateTime?: Date;
  endDateTime?: Date;
  questions: IQuestion[];
  contents?: ILessonContent[]; // Additional resources
  courseId: string;
  lessonId?: string;
  createdBy: string;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema<IOption>({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Content Schema for additional resources
const ContentSchema = new Schema<ILessonContent>({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['video', 'image', 'pdf', 'link'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
}, { _id: false });

// Add validation middleware to ContentSchema
ContentSchema.pre('validate', function(next) {
  console.log('ContentSchema validation - this:', this);
  next();
});

const BaseQuestionSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'multiselect', 'tita', 'descriptive'],
    required: true,
  },
  marks: {
    type: Number,
    required: true,
    min: 1,
  },
  order: {
    type: Number,
    required: true,
  },
}, { discriminatorKey: 'type', _id: false });

// Multiple Choice Question Schema
const MultipleChoiceQuestionSchema = BaseQuestionSchema.clone();
MultipleChoiceQuestionSchema.add({
  options: {
    type: [OptionSchema],
    required: true,
    validate: {
      validator: function(options: IOption[]) {
        return options.length >= 2 && options.some(opt => opt.isCorrect);
      },
      message: 'Multiple choice questions must have at least 2 options with at least one correct answer'
    }
  },
});

// Multiselect Question Schema
const MultiselectQuestionSchema = BaseQuestionSchema.clone();
MultiselectQuestionSchema.add({
  options: {
    type: [OptionSchema],
    required: true,
    validate: {
      validator: function(options: IOption[]) {
        return options.length >= 2 && options.some(opt => opt.isCorrect);
      },
      message: 'Multiselect questions must have at least 2 options with at least one correct answer'
    }
  },
});

// TITA Question Schema
const TitaQuestionSchema = BaseQuestionSchema.clone();
TitaQuestionSchema.add({
  correctAnswer: {
    type: String,
    required: true,
  },
  caseSensitive: {
    type: Boolean,
    default: false,
  },
});

// Descriptive Question Schema
const DescriptiveQuestionSchema = BaseQuestionSchema.clone();
DescriptiveQuestionSchema.add({
  sampleAnswer: {
    type: String,
  },
});

// Main Quiz Schema
const QuizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    scheduled: {
      type: Boolean,
      default: false,
    },
    startDateTime: {
      type: Date,
    },
    endDateTime: {
      type: Date,
    },
    questions: [{
      type: Schema.Types.Mixed,
      default: {},
    }],
    contents: {
      type: [ContentSchema],
      default: [],
    },
    courseId: {
      type: String,
      required: true,
    },
    lessonId: {
      type: String,
    },
    createdBy: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate totals
QuizSchema.pre('save', function(this: IQuiz, next) {
  console.log('Pre-save middleware - this.contents:', this.contents);
  console.log('Pre-save middleware - full quiz object:', this.toObject());
  
  if (this.questions && this.questions.length > 0) {
    this.totalQuestions = this.questions.length;
    this.totalMarks = this.questions.reduce((sum: number, question: any) => sum + (question.marks || 0), 0);
  } else {
    this.totalQuestions = 0;
    this.totalMarks = 0;
  }
  next();
});

// Post-save middleware to debug the contents field
QuizSchema.post('save', function(doc) {
  console.log('Post-save middleware - doc.contents:', doc.contents);
  console.log('Post-save middleware - full doc:', doc.toObject());
});

// Validation for scheduled quizzes
QuizSchema.pre('save', function(this: IQuiz, next) {
  if (this.scheduled) {
    if (!this.startDateTime || !this.endDateTime) {
      return next(new Error('Start and end date/time are required for scheduled quizzes'));
    }
    if (this.startDateTime >= this.endDateTime) {
      return next(new Error('Start date/time must be before end date/time'));
    }
  }
  next();
});

// Indexes
QuizSchema.index({ courseId: 1 });
QuizSchema.index({ lessonId: 1 });
QuizSchema.index({ isPublished: 1 });
QuizSchema.index({ scheduled: 1, startDateTime: 1 });
QuizSchema.index({ createdBy: 1 });

// Clear any existing Quiz model to ensure we use the updated schema
if (mongoose.models.Quiz) {
  delete mongoose.models.Quiz;
}

export default mongoose.model<IQuiz>('Quiz', QuizSchema); 