import React from 'react';
import { Button } from './Button';
import { QuizQuestion } from '../types';
import { RefreshCw, Home, Award, BookOpenCheck } from 'lucide-react';

interface ResultViewProps {
  score: number;
  total: number;
  questions: QuizQuestion[];
  userAnswers: number[];
  onRetry: () => void;
  onHome: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ score, total, questions, userAnswers, onRetry, onHome }) => {
  const percentage = Math.round((score / total) * 100);
  const incorrectCount = total - score;
  
  let message = "";
  if (percentage >= 90) message = "அற்புதம்! மிகச் சிறப்பான அறிவு.";
  else if (percentage >= 70) message = "நன்று! நீங்கள் நன்றாக செய்திருக்கிறீர்கள்.";
  else if (percentage >= 50) message = "பரவாயில்லை, இன்னும் முயற்சி செய்யவும்.";
  else message = "மேலும் படிக்கவும்.";

  return (
    <div className="w-full max-w-2xl mx-auto p-4 animate-fade-in pb-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-full border border-white/10 mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
           <Award className={`w-12 h-12 ${percentage > 70 ? 'text-yellow-400' : 'text-gray-400'}`} />
        </div>
        <h2 className="text-4xl font-bold text-white mb-2">{score} / {total}</h2>
        <p className="text-xl text-silver-300 mb-2">{message}</p>
        
        {incorrectCount > 0 && (
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-200 animate-pulse-slow">
            <BookOpenCheck className="w-4 h-4" />
            <span>{incorrectCount} தவறான பதில்கள் "Revision" பிரிவில் சேர்க்கப்பட்டன.</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 mb-8">
        <h3 className="text-lg font-semibold text-white mb-2 ml-1">பதில் விவரம்</h3>
        {questions.map((q, idx) => {
          const isCorrect = userAnswers[idx] === q.correctAnswerIndex;
          return (
            <div key={q.id} className={`glass-panel p-4 rounded-xl border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-gray-200 font-medium text-sm md:text-base pr-4">{idx + 1}. {q.question}</p>
                {isCorrect ? <span className="text-green-400 text-xs font-bold bg-green-900/30 px-2 py-1 rounded">சரி</span> : <span className="text-red-400 text-xs font-bold bg-red-900/30 px-2 py-1 rounded">தவறு</span>}
              </div>
              <div className="text-sm space-y-1">
                {!isCorrect && (
                  <p className="text-red-300/70">
                    உங்கள் பதில்: {q.options[userAnswers[idx]]}
                  </p>
                )}
                <p className="text-green-300/70">
                  சரியான பதில்: {q.options[q.correctAnswerIndex]}
                </p>
                <p className="text-gray-500 text-xs mt-2 italic">
                  வசனம்: {q.scriptureReference}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 justify-center sticky bottom-6 bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
        <Button onClick={onRetry} variant="secondary">
          <RefreshCw className="w-4 h-4 mr-2" /> மீண்டும் முயற்சி
        </Button>
        <Button onClick={onHome}>
          <Home className="w-4 h-4 mr-2" /> முகப்பு
        </Button>
      </div>
    </div>
  );
};