import React, { useState, useEffect } from 'react';
import { ChapterSelection } from './components/ChapterSelection';
import { StoryContextView } from './components/StoryContextView';
import { QuizGame } from './components/QuizGame';
import { ResultView } from './components/ResultView';
import { RevisionView } from './components/RevisionView';
import { AppView, QuizState, MistakeRecord } from './types';
import { fetchChapterContext, fetchChapterQuestions, fetchMockExamQuestions } from './services/geminiService';
import { Loader2, Flame, CalendarClock, History } from 'lucide-react';

const initialState: QuizState = {
  currentChapter: 1,
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  answers: [],
  contextData: null,
  isMock: false,
  isAudioMock: false,
};

export default function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [state, setState] = useState<QuizState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [streak, setStreak] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);

  // Initialize Data
  useEffect(() => {
    // 1. Load Streak
    const storedStreak = localStorage.getItem('bible_quiz_streak');
    const lastPlayDate = localStorage.getItem('bible_quiz_last_date');
    if (storedStreak && lastPlayDate) {
      const today = new Date().toDateString();
      const last = new Date(lastPlayDate).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (today === last || yesterday === last) {
        setStreak(parseInt(storedStreak));
      } else {
        setStreak(0);
        localStorage.setItem('bible_quiz_streak', '0');
      }
    } else {
      setStreak(0);
    }

    // 2. Load Mistakes
    const storedMistakes = localStorage.getItem('bible_quiz_mistakes');
    if (storedMistakes) {
      try {
        setMistakes(JSON.parse(storedMistakes));
      } catch (e) {
        console.error("Failed to parse mistakes", e);
      }
    }

    // 3. Calculate Countdown
    const examDate = new Date('2026-01-18');
    const now = new Date();
    const diffTime = examDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(diffDays);

  }, []);

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastPlayDate = localStorage.getItem('bible_quiz_last_date');
    const currentStreakStr = localStorage.getItem('bible_quiz_streak') || '0';
    let currentStreak = parseInt(currentStreakStr);

    if (lastPlayDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastPlayDate === yesterday) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
      setStreak(currentStreak);
      localStorage.setItem('bible_quiz_streak', currentStreak.toString());
      localStorage.setItem('bible_quiz_last_date', today);
    }
  };

  const handleSelectChapter = async (chapter: number) => {
    setIsLoading(true);
    setLoadingText("அதிகாரத்தின் வசனங்கள் மற்றும் பின்னணியை ஏற்றுகிறது...");
    try {
      const context = await fetchChapterContext(chapter);
      setState(prev => ({ ...prev, currentChapter: chapter, contextData: context, isMock: false, isAudioMock: false }));
      setView(AppView.CONTEXT);
    } catch (e) {
      console.error(e);
      alert("Error loading content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStandardMockExam = async () => {
    setIsLoading(true);
    setLoadingText("முழு மாதிரி தேர்வு கேள்விகளை உருவாக்குகிறது (Generating Standard Mock Exam)...");
    try {
      const questions = await fetchMockExamQuestions(25, 'standard');
      if (questions.length === 0) throw new Error("No questions generated");

      setState(prev => ({
        ...prev,
        questions,
        currentQuestionIndex: 0,
        score: 0,
        answers: [],
        isMock: true, // Mark as mock
        isAudioMock: false, // NOT Audio mode
        contextData: null
      }));
      setView(AppView.QUIZ);
    } catch (e) {
      console.error(e);
      alert("Failed to generate mock exam. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAudioMockExam = async () => {
    setIsLoading(true);
    setLoadingText("ஆடியோ தேர்வுக்கான கேள்விகளை உருவாக்குகிறது (Generating Audio Quiz)...");
    try {
      const questions = await fetchMockExamQuestions(25, 'audio');
      if (questions.length === 0) throw new Error("No questions generated");

      setState(prev => ({
        ...prev,
        questions,
        currentQuestionIndex: 0,
        score: 0,
        answers: [],
        isMock: true, // Mark as mock
        isAudioMock: true, // Enable Audio Mode
        contextData: null
      }));
      setView(AppView.QUIZ);
    } catch (e) {
      console.error(e);
      alert("Failed to generate audio exam. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    setIsLoading(true);
    setLoadingText("கேள்விகளை உருவாக்குகிறது...");
    try {
      const questions = await fetchChapterQuestions(state.currentChapter, 20);
      if (questions.length === 0) throw new Error("No questions generated");

      setState(prev => ({
        ...prev,
        questions,
        currentQuestionIndex: 0,
        score: 0,
        answers: [],
        isMock: false,
        isAudioMock: false
      }));
      setView(AppView.QUIZ);
    } catch (e) {
      console.error(e);
      alert("Failed to generate questions. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = (score: number, answers: number[]) => {
    // 1. Identify Mistakes
    const newMistakes: MistakeRecord[] = [];
    state.questions.forEach((q, idx) => {
      const userAnswerIdx = answers[idx];
      // For Audio Mock, userAnswerIdx is -1 if wrong, or correct index if correct
      // For Standard, it's just the index
      const isCorrect = userAnswerIdx === q.correctAnswerIndex;
      
      if (!isCorrect) {
        newMistakes.push({
          id: Date.now() + '-' + q.id,
          question: q.question,
          userAnswer: state.isAudioMock ? "தெரியவில்லை (Skipped/Unknown)" : q.options[userAnswerIdx],
          correctAnswer: q.options[q.correctAnswerIndex],
          scriptureReference: q.scriptureReference,
          chapter: state.isMock ? (q.chapter || 0) : state.currentChapter, 
          date: new Date().toISOString()
        });
      }
    });

    // 2. Save Mistakes
    if (newMistakes.length > 0) {
      const updatedMistakes = [...mistakes, ...newMistakes];
      setMistakes(updatedMistakes);
      localStorage.setItem('bible_quiz_mistakes', JSON.stringify(updatedMistakes));
    }

    // 3. Update State
    setState(prev => ({ ...prev, score, answers }));
    updateStreak();
    setView(AppView.RESULT);
  };

  const handleClearMistakes = () => {
    if (confirm("நிச்சயமாக அனைத்து பிழை வரலாற்றையும் அழிக்க விரும்புகிறீர்களா?")) {
      setMistakes([]);
      localStorage.removeItem('bible_quiz_mistakes');
    }
  };

  const handleRetry = () => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
    }));
    setView(AppView.QUIZ);
  };

  const handleHome = () => {
    setState(initialState);
    setView(AppView.HOME);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-white/20 selection:text-white pb-10">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative">
             <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
             </div>
           </div>
           <p className="mt-6 text-gray-300 font-medium tracking-wide animate-pulse">{loadingText}</p>
        </div>
      )}

      <header className="p-4 md:p-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-40 bg-black/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center justify-between w-full md:w-auto">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={handleHome}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/20 to-transparent border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all">
                <span className="text-xl font-bold">R</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-wider text-gray-200 group-hover:text-white transition-colors leading-none">
                  REVELATION
                </span>
                <span className="text-[10px] text-gray-500 font-normal tracking-[0.2em]">QUIZ TAMIL</span>
              </div>
            </div>

            {/* Mobile Revision Button */}
            <button 
              onClick={() => setView(AppView.REVISION)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <History className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-3 md:gap-6 justify-between md:justify-end w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            
            {/* Exam Countdown */}
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10 whitespace-nowrap">
              <CalendarClock className="w-4 h-4 text-blue-400" />
              <div className="flex flex-col md:flex-row md:items-baseline md:gap-1">
                 <span className="text-xs text-blue-300/70 uppercase font-bold tracking-wider">Exam In</span>
                 <span className="text-sm font-bold text-blue-200">{daysLeft} Days</span>
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/5 border border-orange-500/10 whitespace-nowrap">
              <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-600'} transition-all`} />
              <div className="flex flex-col md:flex-row md:items-baseline md:gap-1">
                 <span className="text-xs text-orange-300/70 uppercase font-bold tracking-wider">Streak</span>
                 <span className={`text-sm font-bold ${streak > 0 ? 'text-orange-200' : 'text-gray-500'}`}>{streak} Days</span>
              </div>
            </div>

             {/* Desktop Revision Button */}
            <button
               onClick={() => setView(AppView.REVISION)} 
               className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm text-gray-300 hover:text-white"
            >
               <History className="w-4 h-4" />
               Revision ({mistakes.length})
            </button>

          </div>
        </div>
      </header>

      <main className="container mx-auto mt-8 px-4">
        {view === AppView.HOME && (
          <ChapterSelection 
            onSelectChapter={handleSelectChapter} 
            onStartStandardMockExam={handleStartStandardMockExam}
            onStartAudioMockExam={handleStartAudioMockExam}
          />
        )}

        {view === AppView.CONTEXT && state.contextData && (
          <StoryContextView 
            context={state.contextData} 
            onStartQuiz={handleStartQuiz} 
            onBack={handleHome}
          />
        )}

        {view === AppView.QUIZ && (
          <QuizGame 
            questions={state.questions} 
            onComplete={handleQuizComplete} 
            onExit={handleHome}
            isMock={state.isMock}
            isAudioMock={state.isAudioMock}
          />
        )}

        {view === AppView.RESULT && (
          <ResultView 
            score={state.score} 
            total={state.questions.length} 
            questions={state.questions}
            userAnswers={state.answers}
            onRetry={handleRetry}
            onHome={handleHome}
          />
        )}

        {view === AppView.REVISION && (
          <RevisionView 
            mistakes={mistakes}
            onBack={handleHome}
            onClear={handleClearMistakes}
          />
        )}
      </main>
    </div>
  );
}
