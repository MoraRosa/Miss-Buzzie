import { useState, useCallback, useEffect } from "react";
import { Mic, MicOff, X, Volume2, VolumeX, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useVoiceAgent, type VoiceMessage } from "@/hooks/useVoiceAgent";
import { processUserInput, type MizzieContext } from "@/lib/mizzieActions";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CanvasDataSchema, type CanvasData } from "@/lib/validators/schemas";
import { cn } from "@/lib/utils";

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
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);

  // Get canvas data for context
  const [canvasData, setCanvasData, { save: saveCanvas }] = useLocalStorage<CanvasData>(
    "businessModelCanvas",
    defaultCanvasData,
    { schema: CanvasDataSchema }
  );

  // Create context for actions
  const context: MizzieContext = {
    canvas: canvasData,
    setCanvas: setCanvasData,
    saveCanvas,
  };

  // Handle transcript processing
  const handleTranscript = useCallback(async (transcript: string): Promise<string> => {
    const result = processUserInput(transcript, context, conversationHistory);
    setConversationHistory((prev) => [...prev, transcript]);
    return result.message;
  }, [context, conversationHistory]);

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
            </div>
          </ScrollArea>

          {/* Controls */}
          <div className="p-4 border-t bg-muted/50">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={isListening ? stopListening : startListening}
                size="lg"
                className={cn(
                  "h-16 w-16 rounded-full",
                  isListening
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-primary hover:bg-primary/90"
                )}
              >
                {isListening ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">
              {isListening ? "Tap to stop listening" : "Tap to start talking to Mizzie"}
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

