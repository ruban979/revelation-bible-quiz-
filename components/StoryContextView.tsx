import React, { useState } from 'react';
import { ChapterContext } from '../types';
import { Button } from './Button';
import { Play, ArrowLeft, Book, ScrollText, BookOpen, Lightbulb, Layers, MessageSquareQuote, History, Anchor } from 'lucide-react';
import { FlashcardSection } from './FlashcardSection';

interface StoryContextViewProps {
  context: ChapterContext;
  onStartQuiz: () => void;
  onBack: () => void;
}

export const StoryContextView: React.FC<StoryContextViewProps> = ({ context, onStartQuiz, onBack }) => {
  const [activeTab, setActiveTab] = useState<'verses' | 'story' | 'flashcards' | 'commentary'>('verses');

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-[fadeIn_0.5s_ease-out]">
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 relative overflow-hidden min-h-[70vh] flex flex-col">
        
        {/* Decorative background element */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <button 
              onClick={onBack}
              className="flex items-center text-gray-400 hover:text-white transition-colors self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              திரும்ப
            </button>
            
            <div className="flex items-center gap-2">
               <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono uppercase tracking-widest text-silver-300 border border-white/10">
                வெளிப்படுத்தின விசேஷம் {context.chapter}
              </span>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight text-center md:text-left">
            {context.title}
          </h2>

          {/* Tabs */}
          <div className="flex p-1 bg-black/40 rounded-xl mb-6 self-start w-full md:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('verses')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'verses' 
                  ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              வேதாகமம்
            </button>
            <button
              onClick={() => setActiveTab('story')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'story' 
                  ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ScrollText className="w-4 h-4" />
              கதை
            </button>
            <button
              onClick={() => setActiveTab('commentary')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'commentary' 
                  ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <MessageSquareQuote className="w-4 h-4" />
              விளக்கவுரை
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === 'flashcards' 
                  ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Cards
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar mb-8">
            {activeTab === 'verses' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                  {context.fullText && context.fullText.length > 0 ? (
                    <div className="space-y-4">
                      {context.fullText.map((v) => (
                        <p key={v.number} className="text-gray-300 leading-relaxed text-lg">
                          <span className="text-silver-300 font-bold text-sm mr-2 align-top opacity-70">{v.number}</span>
                          {v.text}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-10">வசனங்கள் கிடைக்கவில்லை.</p>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'story' && (
              <div className="space-y-6 animate-fade-in">
                <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed text-justify">
                  {context.summary}
                </div>

                <div className="bg-gradient-to-br from-white/5 to-transparent rounded-xl p-6 border border-white/10">
                  <h3 className="flex items-center text-lg font-semibold text-silver-200 mb-4">
                    <Book className="w-5 h-5 mr-2" />
                    முக்கிய வசனங்கள்
                  </h3>
                  <ul className="space-y-4">
                    {context.keyVerses.map((verse, idx) => (
                      <li key={idx} className="relative pl-6 text-gray-400 italic text-base">
                        <span className="absolute left-0 top-0 text-silver-300 text-xl">"</span>
                        {verse}
                      </li>
                    ))}
                  </ul>
                </div>

                {context.hints && context.hints.length > 0 && (
                  <div className="bg-gradient-to-br from-yellow-900/10 to-transparent rounded-xl p-6 border border-yellow-500/10">
                    <h3 className="flex items-center text-lg font-semibold text-yellow-200/90 mb-4">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      முக்கிய குறிப்புகள் (Hints)
                    </h3>
                    <ul className="space-y-3">
                      {context.hints.map((hint, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-400 text-base">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 text-xs font-bold border border-yellow-500/20">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'commentary' && (
              <div className="space-y-6 animate-fade-in">
                {/* Cultural Context */}
                {context.commentary?.culturalContext && (
                  <div className="bg-gradient-to-br from-purple-900/10 to-transparent rounded-xl p-6 border border-purple-500/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                      <History className="w-24 h-24" />
                    </div>
                    <h3 className="flex items-center text-lg font-semibold text-purple-200 mb-4">
                      <History className="w-5 h-5 mr-2" />
                      வரலாற்றுப் பின்னணி (Context)
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-justify relative z-10">
                      {context.commentary.culturalContext}
                    </p>
                  </div>
                )}

                {/* Interpretations */}
                <div className="space-y-4">
                   <h3 className="flex items-center text-lg font-semibold text-silver-200 mb-2 mt-6">
                      <BookOpen className="w-5 h-5 mr-2" />
                      வசன விளக்கவுரை
                   </h3>
                   {context.commentary?.interpretations && context.commentary.interpretations.length > 0 ? (
                      context.commentary.interpretations.map((item, idx) => (
                        <div key={idx} className="glass-panel p-5 rounded-xl border-l-4 border-l-blue-500/30 hover:border-l-blue-500 transition-colors">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-white/10 rounded text-xs font-bold text-silver-200">
                               வசனம் {item.verseRef}
                            </span>
                          </div>
                          <p className="text-gray-300 leading-relaxed mb-4 text-justify">
                            {item.explanation}
                          </p>
                          
                          {/* Biblical Evidences / Cross Refs */}
                          {item.crossReferences && item.crossReferences.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
                              <span className="text-xs text-gray-500 uppercase font-bold flex items-center">
                                <Anchor className="w-3 h-3 mr-1" />
                                ஆதாரங்கள்:
                              </span>
                              {item.crossReferences.map((ref, rIdx) => (
                                <span key={rIdx} className="px-2 py-0.5 rounded-full bg-blue-900/20 border border-blue-500/20 text-blue-200 text-xs hover:bg-blue-900/40 transition-colors cursor-default">
                                  {ref}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                   ) : (
                     <p className="text-center text-gray-500 py-6">விளக்கவுரை விரைவில் இணைக்கப்படும்.</p>
                   )}
                </div>
              </div>
            )}

            {activeTab === 'flashcards' && (
               <FlashcardSection cards={context.flashcards} />
            )}
          </div>

          {/* Footer Action */}
          <div className="flex justify-center md:justify-end pt-4 border-t border-white/5">
            <Button onClick={onStartQuiz} className="w-full md:w-auto shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              வினாடி வினாவைத் தொடங்கவும் <Play className="w-4 h-4 ml-2 fill-current" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};