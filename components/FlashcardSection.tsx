import React, { useState } from 'react';
import { Flashcard } from '../types';
import { ChevronLeft, ChevronRight, RotateCw, Copy } from 'lucide-react';

interface FlashcardSectionProps {
  cards: Flashcard[];
}

export const FlashcardSection: React.FC<FlashcardSectionProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 200);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 200);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 glass-panel rounded-xl">
        <p className="text-gray-400">இந்த அதிகாரத்திற்கான நினைவு அட்டைகள் கிடைக்கவில்லை.</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-fade-in">
      
      {/* Controls Header */}
      <div className="flex items-center justify-between w-full mb-6 px-2">
        <span className="text-gray-400 text-sm font-mono tracking-widest">
          CARD {currentIndex + 1} / {cards.length}
        </span>
        <div className="flex gap-2">
            {/* Visual indicators for progress */}
            <div className="flex gap-1">
                {cards.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/20'}`}
                    />
                ))}
            </div>
        </div>
      </div>

      {/* 3D Card Container */}
      <div 
        className="relative w-full aspect-[4/3] md:aspect-[16/9] cursor-pointer group perspective-1000"
        onClick={handleFlip}
      >
        <div className={`w-full h-full relative transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front Face */}
          <div className="absolute inset-0 backface-hidden">
            <div className="w-full h-full glass-panel rounded-2xl flex flex-col items-center justify-center p-8 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-gradient-to-br from-white/5 to-transparent hover:border-white/20 transition-colors">
              <span className="absolute top-6 left-6 text-xs text-silver-300 font-bold uppercase tracking-widest border border-white/10 px-2 py-1 rounded">
                கேள்வி / குறியீடு
              </span>
              <p className="text-2xl md:text-3xl font-bold text-center text-white leading-relaxed">
                {currentCard.front}
              </p>
              <div className="absolute bottom-6 text-gray-500 text-sm flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                 <RotateCw className="w-4 h-4" />
                 திருப்புவதற்கு கிளிக் செய்யவும்
              </div>
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
             <div className="w-full h-full glass-panel rounded-2xl flex flex-col items-center justify-center p-8 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] bg-gradient-to-br from-black/60 to-black/40">
              <span className="absolute top-6 left-6 text-xs text-green-400 font-bold uppercase tracking-widest border border-green-500/20 bg-green-500/10 px-2 py-1 rounded">
                பதில் / விளக்கம்
              </span>
              <p className="text-xl md:text-2xl font-medium text-center text-gray-200 leading-relaxed">
                {currentCard.back}
              </p>
               <div className="absolute bottom-6 text-gray-500 text-sm flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                 <RotateCw className="w-4 h-4" />
                 வினாவிற்கு திரும்பவும்
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between w-full mt-8 gap-4">
        <button 
          onClick={handlePrev}
          className="p-4 rounded-full glass-panel hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button 
           onClick={handleFlip}
           className="px-6 py-3 rounded-xl glass-panel hover:bg-white/10 text-gray-300 text-sm font-semibold tracking-wide transition-all"
        >
           {isFlipped ? 'கேள்வியை காட்டு' : 'பதிலை காட்டு'}
        </button>

        <button 
          onClick={handleNext}
          className="p-4 rounded-full glass-panel hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};