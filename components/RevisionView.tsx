import React, { useMemo } from 'react';
import { MistakeRecord } from '../types';
import { Button } from './Button';
import { ArrowLeft, Trash2, AlertTriangle, BookOpen, BarChart } from 'lucide-react';

interface RevisionViewProps {
  mistakes: MistakeRecord[];
  onBack: () => void;
  onClear: () => void;
}

export const RevisionView: React.FC<RevisionViewProps> = ({ mistakes, onBack, onClear }) => {
  
  // Analyze patterns
  const analysis = useMemo(() => {
    if (mistakes.length === 0) return null;

    const chapterCounts: {[key: number]: number} = {};
    mistakes.forEach(m => {
      chapterCounts[m.chapter] = (chapterCounts[m.chapter] || 0) + 1;
    });

    // Find weakest chapter
    let maxMistakes = 0;
    let weakestChapter = 0;
    Object.entries(chapterCounts).forEach(([chap, count]) => {
      if (count > maxMistakes) {
        maxMistakes = count;
        weakestChapter = parseInt(chap);
      }
    });

    return {
      total: mistakes.length,
      weakestChapter,
      weakestChapterCount: maxMistakes
    };
  }, [mistakes]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          முகப்பு (Home)
        </button>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-silver-300" />
          திருப்புதல் (Revision)
        </h2>
      </div>

      {mistakes.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">பிழைகள் எதுவும் இல்லை!</h3>
          <p className="text-gray-500 max-w-md">
            நீங்கள் மிகவும் சிறப்பாக செயல்படுகிறீர்கள். தவறான பதில்கள் இங்கு சேமிக்கப்படும், இதனால் நீங்கள் அவற்றை மறுபரிசீலனை செய்யலாம்.
          </p>
        </div>
      ) : (
        <>
          {/* Analysis Card */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="glass-panel p-6 rounded-xl border border-white/10 bg-gradient-to-br from-red-900/10 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <AlertTriangle className="w-24 h-24" />
                </div>
                <h3 className="text-gray-400 text-sm uppercase tracking-widest mb-1">மொத்த பிழைகள்</h3>
                <p className="text-4xl font-bold text-white">{analysis.total}</p>
                <p className="text-xs text-gray-500 mt-2">மீண்டும் பயிற்சி செய்யவும்</p>
              </div>

              <div className="glass-panel p-6 rounded-xl border border-white/10 bg-gradient-to-br from-orange-900/10 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <BarChart className="w-24 h-24" />
                </div>
                <h3 className="text-gray-400 text-sm uppercase tracking-widest mb-1">பலவீனமான அதிகாரம்</h3>
                <div className="flex items-baseline gap-2">
                   <p className="text-4xl font-bold text-orange-200">அதிகாரம் {analysis.weakestChapter}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {analysis.weakestChapterCount} பிழைகள் பதிவு செய்யப்பட்டுள்ளன
                </p>
              </div>
            </div>
          )}

          {/* List of Mistakes */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-300">பிழை வரலாறு</h3>
            <button 
              onClick={onClear}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              வரலாற்றை அழி
            </button>
          </div>

          <div className="space-y-4">
            {mistakes.slice().reverse().map((m) => (
              <div key={m.id} className="glass-panel p-6 rounded-xl border-l-4 border-l-red-500/50 hover:border-l-red-500 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">
                    அதிகாரம் {m.chapter} • {m.scriptureReference}
                  </span>
                  <span className="text-[10px] text-gray-600">{new Date(m.date).toLocaleDateString()}</span>
                </div>
                
                <h4 className="text-lg font-medium text-white mb-4 leading-snug">{m.question}</h4>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                    <span className="block text-red-400 text-xs font-bold uppercase mb-1">உங்கள் பதில்</span>
                    <p className="text-red-200">{m.userAnswer}</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                     <span className="block text-green-400 text-xs font-bold uppercase mb-1">சரியான பதில்</span>
                    <p className="text-green-200">{m.correctAnswer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};