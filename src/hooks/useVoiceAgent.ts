import { useState, useRef, useCallback, useEffect } from "react";

export interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UseVoiceAgentProps {
  onTranscript: (transcript: string) => Promise<string>;
}

interface UseVoiceAgentReturn {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  messages: VoiceMessage[];
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  addMessage: (role: "user" | "assistant", content: string) => void;
  clearMessages: () => void;
}

export const useVoiceAgent = ({ onTranscript }: UseVoiceAgentProps): UseVoiceAgentReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldStopRef = useRef(false);
  const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  const isSupported = typeof window !== "undefined" && 
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) &&
    "speechSynthesis" in window;

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    const message: VoiceMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Text-to-speech
  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Process transcript and get response
  const processTranscript = useCallback(async (transcript: string) => {
    addMessage("user", transcript);
    
    try {
      const response = await onTranscript(transcript);
      addMessage("assistant", response);
      speak(response);
    } catch (error) {
      const errorMessage = "Sorry, I had trouble processing that. Could you try again?";
      addMessage("assistant", errorMessage);
      speak(errorMessage);
    }
  }, [onTranscript, addMessage, speak]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) return;

    shouldStopRef.current = false;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      
      if (!transcript) return;

      // Clear any existing timeout
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }

      // Wait 1.5 seconds for user to finish speaking
      commandTimeoutRef.current = setTimeout(() => {
        processTranscript(transcript);
      }, 1500);
    };

    // Auto-restart on end (unless intentionally stopped)
    recognition.onend = () => {
      if (!shouldStopRef.current) {
        try {
          recognition.start();
        } catch (error) {
          console.error("Error restarting recognition:", error);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Ignore expected errors
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
    }
  }, [isSupported, processTranscript]);

  // Stop listening
  const stopListening = useCallback(() => {
    shouldStopRef.current = true;
    
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        shouldStopRef.current = true;
        recognitionRef.current.stop();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
    };
  }, [isListening]);

  return {
    isListening,
    isSpeaking,
    isSupported,
    messages,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    addMessage,
    clearMessages,
  };
};

