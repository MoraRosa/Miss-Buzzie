/**
 * Station 3: The Origin Story
 *
 * Users craft their brand narrative using the Brand Story Framework:
 * - The Catalyst: Why the brand exists
 * - The Core Truth: What makes them different
 * - The Proof: How they reinforce their identity
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Zap, Diamond, Shield, Mic, MicOff } from "lucide-react";
import { StationProps } from "./types";
import { useToast } from "@/hooks/use-toast";

interface StoryPage {
  id: 'catalyst' | 'coreTruth' | 'proof';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  prompt: string;
  placeholder: string;
  example: string;
}

const STORY_PAGES: StoryPage[] = [
  {
    id: 'catalyst',
    title: 'The Catalyst',
    subtitle: 'Why Your Brand Exists',
    icon: Zap,
    prompt: 'Every great brand starts with frustration or inspiration. What problem made you say "enough, I\'ll fix this myself"?',
    placeholder: 'I started this because...',
    example: 'Example: "I was tired of seeing small businesses struggle with expensive, complicated software that was built for enterprises..."',
  },
  {
    id: 'coreTruth',
    title: 'The Core Truth',
    subtitle: 'Your Fundamental Conviction',
    icon: Diamond,
    prompt: 'What do you BELIEVE that others in your space don\'t? This isn\'t about features—it\'s about your worldview. Yvon Chouinard (Patagonia) believed "Let my people go surfing"—that employees should surf when the waves are good. What\'s YOUR conviction about how things SHOULD be?',
    placeholder: 'I fundamentally believe that...',
    example: 'Example: "I believe humans shouldn\'t waste their lives working just to survive. We can evolve beyond the grind—people should work on what they love, not what pays the bills."',
  },
  {
    id: 'proof',
    title: 'The Proof',
    subtitle: 'How You Live Your Truth',
    icon: Shield,
    prompt: 'How do you reinforce this belief in everything you do? What will people consistently see that proves you actually believe what you say? What do people already compliment you on?',
    placeholder: 'We prove this by...',
    example: 'Example: "We never ask \'can we charge more?\' We ask \'can we give more?\' Every feature is free until we can\'t sustain it..."',
  },
];

const StoryStation = ({ strategy, updateStrategy }: StationProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldStopRef = useRef(false);
  const strategyRef = useRef(strategy);
  const { toast } = useToast();

  // Keep strategy ref up to date
  useEffect(() => {
    strategyRef.current = strategy;
  }, [strategy]);

  const page = STORY_PAGES[currentPage];
  const Icon = page.icon;

  // Check for Web Speech API support
  const isSpeechSupported = typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const updateStoryField = useCallback((field: 'catalyst' | 'coreTruth' | 'proof', value: string) => {
    updateStrategy({
      story: {
        ...strategyRef.current.story,
        [field]: value,
      },
    });
  }, [updateStrategy]);

  // Voice input handlers
  const startListening = useCallback(() => {
    if (!isSpeechSupported) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    shouldStopRef.current = false;
    const currentPageId = STORY_PAGES[currentPage].id;

    const SpeechRecognition = (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      // Append to existing text
      const currentText = strategyRef.current.story[currentPageId];
      const newText = currentText ? `${currentText} ${transcript}` : transcript;
      updateStoryField(currentPageId, newText);
    };

    recognition.onerror = (event) => {
      // Ignore no-speech and aborted - these are expected
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast({
          title: "Voice Error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      if (!shouldStopRef.current) {
        // Auto-restart on silence
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      toast({
        title: "🎤 Listening...",
        description: "Speak your thoughts. Click the mic again to stop.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not start voice input.",
        variant: "destructive",
      });
    }
  }, [isSpeechSupported, currentPage, toast, updateStoryField]);

  const stopListening = useCallback(() => {
    shouldStopRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount or page change
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        shouldStopRef.current = true;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [currentPage]);

  const goToPrevPage = () => {
    stopListening();
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    stopListening();
    if (currentPage < STORY_PAGES.length - 1) setCurrentPage(currentPage + 1);
  };

  const currentValue = strategy.story[page.id];

  return (
    <div className="space-y-6">
      {/* Page Indicator */}
      <div className="flex justify-center gap-2">
        {STORY_PAGES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setCurrentPage(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === currentPage 
                ? 'bg-amber-500 scale-125' 
                : strategy.story[p.id] 
                  ? 'bg-green-500' 
                  : 'bg-muted-foreground/30'
            }`}
            aria-label={`Go to ${p.title}`}
          />
        ))}
      </div>

      {/* Storybook Card */}
      <Card className="relative overflow-hidden">
        {/* Book-like decorative spine */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 sm:w-2 bg-gradient-to-r from-amber-600 to-amber-500" />

        <div className="p-4 sm:p-6 md:p-8 pl-5 sm:pl-8">
          {/* Page Header */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 sm:h-7 sm:w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                Chapter {currentPage + 1} of {STORY_PAGES.length}
              </p>
              <h3 className="text-lg sm:text-2xl font-bold">{page.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{page.subtitle}</p>
            </div>
          </div>

          {/* Prompt */}
          <div className="mb-4 p-4 bg-muted/50 rounded-lg border-l-4 border-amber-500">
            <p className="text-sm leading-relaxed">{page.prompt}</p>
          </div>

          {/* Text Area with Voice Input */}
          <div className="relative">
            <Textarea
              value={currentValue}
              onChange={(e) => updateStoryField(page.id, e.target.value)}
              placeholder={isListening ? "Listening... speak your thoughts" : page.placeholder}
              className={`min-h-[150px] text-base leading-relaxed resize-none pr-12 ${
                isListening ? 'border-amber-500 ring-2 ring-amber-500/20' : ''
              }`}
            />
            {/* Voice Input Button */}
            {isSpeechSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
                title={isListening ? "Stop listening" : "Use voice input"}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          {/* Voice hint + Example */}
          <div className="flex items-center justify-between mt-3 gap-2">
            <p className="text-xs text-muted-foreground italic flex-1">{page.example}</p>
            {isSpeechSupported && (
              <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
                🎤 Voice input available
              </span>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-4 sm:mt-6 gap-2">
            <Button
              variant="outline"
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className="gap-1 sm:gap-2 text-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous Chapter</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            <Button
              onClick={goToNextPage}
              disabled={currentPage === STORY_PAGES.length - 1}
              className="gap-1 sm:gap-2 text-sm"
            >
              <span className="hidden sm:inline">Next Chapter</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Story Progress */}
      <div className="text-center text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4 inline-block mr-2" />
        {Object.values(strategy.story).filter(v => v.trim().length > 0).length} of 3 chapters written
      </div>
    </div>
  );
};

export default StoryStation;

