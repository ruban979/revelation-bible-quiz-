import React from 'react';
import { BookOpen, Trophy, PlayCircle, Mic, Timer, BrainCircuit } from 'lucide-react';

interface ChapterSelectionProps {
  onSelectChapter: (chapter: number) => void;
  onStartStandardMockExam: () => void;
  onStartAudioMockExam: () => void;
}

export const ChapterSelection: React.FC<ChapterSelectionProps> = ({ onSelectChapter, onStartStandardMockExam, onStartAudioMockExam }) => {
  // Revelation has 22 chapters
  const chapters = Array.from({ length: 22 }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 silver-text-gradient">
          வெளிப்படுத்தின விசேஷம்
        </h1>
        <p className="text-gray-400 text-lg">
          வினாடி வினாவுக்கான அதிகாரத்தைத் தேர்ந்தெடுக்கவும்
        </p>
      </div>

      {/* Mock Exam Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        
        {/* Standard Mock Exam */}
        <div 
          onClick={onStartStandardMockExam}
          className="glass-panel p-6 rounded-2xl flex flex-col items-center md:items-start cursor-pointer group hover:bg-white/5 transition-all duration-300 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
        >
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border border-purple-400/30 group-hover:scale-110 transition-transform duration-500">
               <BrainCircuit className="w-6 h-6 text-purple-200" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white group-hover:text-purple-100 transition-colors">
                   Full Mock Exam
                </h2>
                <span className="text-xs text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Standard MCQ</span>
             </div>
          </div>
          <p className="text-gray-400 text-sm mb-6 text-center md:text-left">
            22 அதிகாரங்களிலிருந்தும் 25 கேள்விகள் (தெரிவுகளுடன்).
          </p>
          <div className="w-full mt-auto">
             <button className="w-full flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-100 px-4 py-3 rounded-xl border border-purple-500/30 transition-all">
                <span className="font-semibold">Start Exam</span>
                <BookOpen className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Audio Speed Exam */}
        <div 
          onClick={onStartAudioMockExam}
          className="glass-panel p-6 rounded-2xl flex flex-col items-center md:items-start cursor-pointer group hover:bg-white/5 transition-all duration-300 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
        >
           <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-400/30 group-hover:scale-110 transition-transform duration-500">
               <Mic className="w-6 h-6 text-blue-200" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors">
                   Audio Speed Test
                </h2>
                <span className="text-xs text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">10s Timer</span>
             </div>
          </div>
          <p className="text-gray-400 text-sm mb-6 text-center md:text-left">
            கேள்வி கேட்கப்படும். 10 வினாடிகளில் விடையளிக்க வேண்டும்.
          </p>
           <div className="w-full mt-auto">
             <button className="w-full flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 px-4 py-3 rounded-xl border border-blue-500/30 transition-all">
                <span className="font-semibold">Start Audio Test</span>
                <PlayCircle className="w-4 h-4" />
             </button>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {chapters.map((num) => (
          <button
            key={num}
            onClick={() => onSelectChapter(num)}
            className="glass-panel aspect-square flex flex-col items-center justify-center p-4 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
          >
            <span className="text-3xl font-bold text-gray-300 group-hover:text-white mb-2">{num}</span>
            <BookOpen className="w-5 h-5 text-gray-500 group-hover:text-silver-300" />
          </button>
        ))}
      </div>
      
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Powered by Google Gemini AI & Tamil Bible Knowledge</p>
      </div>
    </div>
  );
};
