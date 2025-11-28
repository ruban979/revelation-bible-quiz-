import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion } from '../types';
import { Button } from './Button';
import { CheckCircle, XCircle, ArrowRight, Book, Trophy, Volume2, Timer, Check, X, BrainCircuit } from 'lucide-react';

interface QuizGameProps {
  questions: QuizQuestion[];
  onComplete: (score: number, answers: number[]) => void;
  onExit: () => void;
  isMock?: boolean;
  isAudioMock?: boolean; // New prop to distinguish audio mode
}

export const QuizGame: React.FC<QuizGameProps> = ({ questions, onComplete, onExit, isMock, isAudioMock }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Audio Mode specific states
  const [timeLeft, setTimeLeft] = useState(10);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioRevealed, setAudioRevealed] = useState(false); // True when time is up or manually revealed
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentQuestion = questions[currentIdx];

  const stopAudio = () => {
     window.speechSynthesis.cancel();
     setIsSpeaking(false);
  };

  const playAudio = (text: string) => {
    stopAudio();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ta-IN'; // Attempt Tamil
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Effect for Audio Mode Lifecycle
  useEffect(() => {
    // Only run this effect if it is strictly an AUDIO mock
    if (isMock && isAudioMock) {
      // Reset for new question
      setTimeLeft(10);
      setAudioRevealed(false);
      setSelectedOption(null);
      
      // Delay slightly to allow transition
      const timeout = setTimeout(() => {
        playAudio(currentQuestion.question);
      }, 500);

      // Start Timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setAudioRevealed(true); // Auto reveal when time is up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        stopAudio();
        clearTimeout(timeout);
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [currentIdx, isMock, isAudioMock]); // Only run when index changes

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAudio();
  }, []);

  // Standard Quiz Logic
  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    // In Audio mode, this shouldn't be called, but safe guard it
    if (isMock && isAudioMock) return; 
    
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
  };

  // Audio Quiz Self-Grading Logic
  const handleSelfGrade = (correct: boolean) => {
     const correctAnswerIdx = currentQuestion.correctAnswerIndex;
     // If user says they got it right, store correct index, else store -1 (wrong)
     const recordedAnswer = correct ? correctAnswerIdx : -1;
     
     const newAnswers = [...answers, recordedAnswer];
     setAnswers(newAnswers);

     // Move next immediately
     if (currentIdx < questions.length - 1) {
       setCurrentIdx(prev => prev + 1);
     } else {
       finishQuiz(newAnswers);
     }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz(answers);
    }
  };

  const finishQuiz = (finalAnswers: number[]) => {
    const score = finalAnswers.reduce((acc, ans, idx) => {
        return acc + (ans === questions[idx].correctAnswerIndex ? 1 : 0);
      }, 0);
    onComplete(score, finalAnswers);
  };
  
  const progressPercentage = ((currentIdx + 1) / questions.length) * 100;

  // --- RENDER AUDIO MODE ---
  // STRICT CHECK: Must be isMock AND isAudioMock
  if (isMock && isAudioMock) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 min-h-[70vh] flex flex-col items-center justify-center animate-fade-in relative">
         <div className="absolute top-0 right-0 p-4">
             <button onClick={onExit} className="text-gray-500 hover:text-white text-sm">Exit</button>
         </div>

         {/* Timer Ring */}
         <div className="relative mb-8">
            <svg className="w-40 h-40 transform -rotate-90">
               <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
               <circle 
                  cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  className={`transition-all duration-1000 ease-linear ${timeLeft < 4 ? 'text-red-500' : 'text-blue-500'}`}
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * timeLeft) / 10}
               />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
               <span className={`text-5xl font-bold ${timeLeft < 4 ? 'text-red-400' : 'text-white'}`}>{timeLeft}</span>
               <span className="text-xs uppercase tracking-widest text-gray-500 mt-1">Seconds</span>
            </div>
         </div>

         {/* Question Area */}
         <div className="glass-panel p-8 rounded-2xl w-full text-center mb-8 border border-white/10 min-h-[200px] flex flex-col items-center justify-center">
             
             {!audioRevealed && (
               <div className="animate-pulse mb-6">
                 <div className={`p-4 rounded-full ${isSpeaking ? 'bg-blue-500/20 ring-4 ring-blue-500/10' : 'bg-white/5'}`}>
                   <Volume2 className={`w-12 h-12 ${isSpeaking ? 'text-blue-400' : 'text-gray-400'}`} />
                 </div>
               </div>
             )}

             <h3 className={`text-2xl md:text-3xl font-bold text-white mb-4 leading-relaxed ${!audioRevealed ? 'opacity-90' : ''}`}>
               {currentQuestion.question}
             </h3>
             
             {audioRevealed && (
                <div className="animate-fade-in mt-4 bg-green-900/20 border border-green-500/30 p-4 rounded-xl w-full">
                   <p className="text-sm text-green-400 uppercase font-bold tracking-widest mb-1">சரியான பதில்</p>
                   <p className="text-2xl text-white">{currentQuestion.options[currentQuestion.correctAnswerIndex]}</p>
                   <p className="text-gray-400 text-sm mt-2 italic">Ref: {currentQuestion.scriptureReference}</p>
                </div>
             )}
         </div>

         {/* Interaction Area */}
         <div className="w-full">
            {!audioRevealed ? (
                <Button 
                  onClick={() => setAudioRevealed(true)} 
                  className="w-full py-4 text-lg bg-white/10 hover:bg-white/20"
                >
                  விடையைக் காட்டு (Show Answer)
                </Button>
            ) : (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                   <button 
                     onClick={() => handleSelfGrade(false)}
                     className="flex flex-col items-center justify-center p-4 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all group"
                   >
                      <X className="w-8 h-8 text-red-400 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-red-200 font-bold">தெரியவில்லை</span>
                   </button>
                   <button 
                     onClick={() => handleSelfGrade(true)}
                     className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-all group"
                   >
                      <Check className="w-8 h-8 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-green-200 font-bold">சரியாகச் சொன்னேன்</span>
                   </button>
                </div>
            )}
         </div>

         <div className="mt-8 text-gray-500 text-xs tracking-widest">
            QUESTION {currentIdx + 1} OF {questions.length} (AUDIO MOCK)
         </div>
      </div>
    );
  }

  // --- RENDER STANDARD MODE (Used for both Chapter Quiz & Standard Mock) ---
  return (
    <div className="w-full max-w-3xl mx-auto p-4 min-h-[60vh] flex flex-col justify-center animate-fade-in">
      {/* Header / Progress */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex flex-col w-full mr-4">
          <div className="flex justify-between items-center text-xs text-gray-400 mb-2 uppercase tracking-widest">
            <span>
              {isMock ? 'Mock Question' : 'கேள்வி'} {currentIdx + 1} / {questions.length}
            </span>
            <span>முன்னேற்றம்</span>
          </div>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white shadow-[0_0_10px_white] transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <button onClick={onExit} className="text-gray-500 hover:text-white text-sm transition-colors whitespace-nowrap">
          வெளியேறு
        </button>
      </div>

      {/* Question Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl mb-6 relative border border-white/10">
        
        {/* Badges */}
        <div className="flex justify-between items-start mb-4">
           {isMock ? (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                 <BrainCircuit className="w-3 h-3 mr-1" />
                 Chapter {currentQuestion.chapter}
              </span>
           ) : <div />}
           
           <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-silver-300 border border-white/10 shadow-sm ml-auto">
              <Book className="w-3 h-3 mr-2 opacity-70" />
              வசனம்: {currentQuestion.scriptureReference}
           </span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let itemClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ";
            
            if (isAnswered) {
              if (idx === currentQuestion.correctAnswerIndex) {
                itemClass += "bg-green-500/20 border-green-500/50 text-green-100";
              } else if (idx === selectedOption) {
                itemClass += "bg-red-500/20 border-red-500/50 text-red-100";
              } else {
                itemClass += "bg-black/20 border-white/5 text-gray-500 opacity-50";
              }
            } else {
              if (idx === selectedOption) {
                itemClass += "bg-white/10 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]";
              } else {
                itemClass += "bg-black/20 border-white/5 text-gray-300 hover:bg-white/5 hover:border-white/20";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={isAnswered}
                className={itemClass}
              >
                <span className="flex-1 text-base md:text-lg">{option}</span>
                {isAnswered && idx === currentQuestion.correctAnswerIndex && (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 ml-2" />
                )}
                {isAnswered && idx === selectedOption && idx !== currentQuestion.correctAnswerIndex && (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 ml-2" />
                )}
                {!isAnswered && idx === selectedOption && (
                  <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_8px_white] flex-shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="flex items-center justify-end min-h-[50px]">
         <div className="">
            {!isAnswered ? (
              <Button 
                onClick={handleSubmit} 
                disabled={selectedOption === null}
                className="w-32"
              >
                உறுதிப்படுத்து
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-32 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                {currentIdx === questions.length - 1 ? 'முடிவு' : 'அடுத்து'} <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Button>
            )}
         </div>
      </div>
    </div>
  );
};
