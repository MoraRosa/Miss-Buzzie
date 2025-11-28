import { useState, useCallback, useEffect, useRef } from "react";
import { Mic, MicOff, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useVoiceAgent, type VoiceMessage } from "@/hooks/useVoiceAgent";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CanvasDataSchema, type CanvasData } from "@/lib/validators/schemas";
import { cn } from "@/lib/utils";
import { chat, getAISettings, isWebLLMSupported, type ChatMessage } from "@/lib/aiProvider";

const defaultCanvasData: CanvasData = {
  keyPartners: "",
  keyActivities: "",
  keyResources: "",
  valuePropositions: "",
  customerRelationships: "",
  channels: "",
  customerSegments: "",
  costStructure: "",
  revenueStreams: "",
};

const MizzieAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");
  const chatHistoryRef = useRef<ChatMessage[]>([]);

  // Get canvas data for context
  const [canvasData] = useLocalStorage<CanvasData>(
    "businessModelCanvas",
    defaultCanvasData,
    { schema: CanvasDataSchema }
  );

  // Handle transcript processing with AI
  const handleTranscript = useCallback(async (transcript: string): Promise<string> => {
    setIsLoading(true);

    try {
      // Add user message to history
      chatHistoryRef.current.push({ role: "user", content: transcript });

      // Get AI response
      const response = await chat(
        chatHistoryRef.current,
        (progress, text) => {
          setLoadingProgress(progress);
          setLoadingText(text);
        }
      );

      // Add assistant response to history
      chatHistoryRef.current.push({ role: "assistant", content: response });

      return response;
    } catch (error) {
      console.error("AI chat error:", error);
      const settings = getAISettings();
      if (settings.provider === "webllm" && !isWebLLMSupported()) {
        return "Sorry, your browser doesn't support WebLLM. Please go to Settings → AI Settings and configure Groq or OpenAI API instead.";
      }
      return `Sorry, I had trouble processing that. ${error instanceof Error ? error.message : "Please try again."}`;
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
      setLoadingText("");
    }
  }, []);

  const {
    isListening,
    isSpeaking,
    isSupported,
    messages,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    addMessage,
  } = useVoiceAgent({ onTranscript: handleTranscript });

  // Welcome message when dialog opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = "Hi! I'm Mizzie, your business planning assistant. Tell me about your business idea, and I'll help you fill out your Business Model Canvas!";
      addMessage("assistant", welcomeMessage);
    }
  }, [isOpen, messages.length, addMessage]);

  if (!isSupported) {
    return null; // Don't show if browser doesn't support speech
  }

  return (
    <>
      {/* Floating Mizzie Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 z-50 cursor-pointer",
          "bg-transparent border-none",
          "transition-transform hover:scale-125",
          isListening && "animate-pulse"
        )}
        aria-label="Open Mizzie Assistant"
      >
        <span className="text-4xl">🐝</span>
      </button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🐝</span>
              Mizzie Assistant
              {isSpeaking && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={stopSpeaking}
                  className="ml-auto h-8 w-8"
                >
                  <VolumeX className="h-4 w-4" />
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Loading Progress (for WebLLM download) */}
          {isLoading && loadingProgress > 0 && loadingProgress < 100 && (
            <div className="px-4 py-2 border-b">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading AI model...</span>
              </div>
              <Progress value={loadingProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 truncate">{loadingText}</p>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isListening && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
                  </div>
                  Listening...
                </div>
              )}
              {isLoading && !loadingText && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Controls */}
          <div className="p-4 border-t bg-muted/50">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={isListening ? stopListening : startListening}
                size="lg"
                disabled={isLoading}
                className={cn(
                  "h-16 w-16 rounded-full",
                  isListening
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-primary hover:bg-primary/90"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : isListening ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">
              {isLoading ? "Processing..." : isListening ? "Tap to stop listening" : "Tap to start talking to Mizzie"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Message bubble component
const MessageBubble = ({ message }: { message: VoiceMessage }) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

export default MizzieAssistant;

