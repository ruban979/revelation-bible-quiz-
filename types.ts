export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  scriptureReference: string; // e.g., "Revelation 1:3"
  chapter?: number; // Optional, useful for Mock Exams where questions come from different chapters
}

export interface Verse {
  number: number;
  text: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface MistakeRecord {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  scriptureReference: string;
  chapter: number;
  date: string;
}

export interface VerseInterpretation {
  verseRef: string; // e.g., "1-3" or "4"
  explanation: string;
  crossReferences: string[]; // Biblical evidences e.g., ["Dan 7:13", "Isa 1:18"]
}

export interface Commentary {
  culturalContext: string; // Historical and cultural background
  interpretations: VerseInterpretation[];
}

export interface ChapterContext {
  chapter: number;
  title: string;
  summary: string; // The story-based context
  keyVerses: string[];
  hints: string[]; // 3 hints for the chapter
  flashcards: Flashcard[]; // Study flashcards
  fullText: Verse[];
  commentary: Commentary; // Deep theological commentary
}

export enum AppView {
  HOME = 'HOME',
  CONTEXT = 'CONTEXT',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT',
  LOADING = 'LOADING',
  REVISION = 'REVISION',
}

export interface QuizState {
  currentChapter: number;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  answers: number[]; // Index of selected answer for each question
  contextData: ChapterContext | null;
  isMock?: boolean; // Flag to identify if it is a full mock exam
  isAudioMock?: boolean; // Flag for the 10s audio speed exam
}