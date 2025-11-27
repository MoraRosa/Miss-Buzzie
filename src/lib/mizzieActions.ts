/**
 * Mizzie Actions - Execute voice commands and update business data
 */

import { parseBusinessDescription, generateSuggestions, isQuestion, type ParsedBusinessInfo } from "./mizzieParser";
import type { CanvasData } from "@/lib/validators/schemas";

export interface MizzieContext {
  canvas: CanvasData;
  setCanvas: (data: CanvasData | ((prev: CanvasData) => CanvasData)) => void;
  saveCanvas: () => void;
}

export interface MizzieResponse {
  message: string;
  action?: "filled_canvas" | "asked_question" | "suggestion" | "greeting" | "help";
  data?: ParsedBusinessInfo;
}

// Greeting responses
const GREETINGS = [
  "Hi! I'm Mizzie, your business planning assistant. Tell me about your business idea!",
  "Hello! Ready to help you build your business plan. What's your business about?",
  "Hey there! I'm excited to help. Tell me about the business you're starting.",
];

// Acknowledgment responses
const ACKNOWLEDGMENTS = [
  "Great! I've added that to your Business Model Canvas.",
  "Perfect! I've updated your canvas with that information.",
  "Got it! I've filled in some sections based on what you told me.",
];

// Process user input and return response
export const processUserInput = (
  transcript: string,
  context: MizzieContext,
  conversationHistory: string[]
): MizzieResponse => {
  const lowerTranscript = transcript.toLowerCase().trim();

  // Check for greetings
  if (isGreeting(lowerTranscript)) {
    return {
      message: GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
      action: "greeting",
    };
  }

  // Check for help requests
  if (isHelpRequest(lowerTranscript)) {
    return {
      message: getHelpMessage(),
      action: "help",
    };
  }

  // Check if it's a question
  if (isQuestion(transcript)) {
    return handleQuestion(transcript, context);
  }

  // Parse the business description
  const parsed = parseBusinessDescription(transcript);

  // If we found business info, update the canvas
  if (Object.keys(parsed.canvas).length > 0) {
    updateCanvas(context, parsed.canvas);
    
    const suggestions = generateSuggestions(parsed);
    let message = ACKNOWLEDGMENTS[Math.floor(Math.random() * ACKNOWLEDGMENTS.length)];
    
    if (suggestions.length > 0) {
      message += ` ${suggestions[0]}`;
    }

    return {
      message,
      action: "filled_canvas",
      data: parsed,
    };
  }

  // Couldn't parse anything useful - ask for more info
  return {
    message: "I'm listening! Tell me more about what your business does, who your customers are, or how you plan to make money.",
    action: "asked_question",
  };
};

// Update the canvas with parsed data
const updateCanvas = (context: MizzieContext, newData: Partial<CanvasData>) => {
  context.setCanvas((prev) => {
    const updated = { ...prev };
    
    Object.entries(newData).forEach(([key, value]) => {
      const field = key as keyof CanvasData;
      if (value && typeof value === "string") {
        // Append to existing content if there's already data
        if (updated[field]) {
          updated[field] = `${updated[field]}\n• ${value}`;
        } else {
          updated[field] = `• ${value}`;
        }
      }
    });
    
    return updated;
  });
  
  // Auto-save after update
  context.saveCanvas();
};

// Check if input is a greeting
const isGreeting = (text: string): boolean => {
  const greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "start", "begin"];
  return greetings.some((g) => text.startsWith(g) || text === g);
};

// Check if input is asking for help
const isHelpRequest = (text: string): boolean => {
  const helpPhrases = ["help", "what can you do", "how does this work", "how do i use", "instructions"];
  return helpPhrases.some((h) => text.includes(h));
};

// Get help message
const getHelpMessage = (): string => {
  return `I can help you fill out your Business Model Canvas! Just tell me about your business naturally. For example:

"I'm starting a dog treat business using organic ingredients, targeting health-conscious pet owners in Calgary."

I'll extract the key information and fill in your canvas automatically. You can also ask me questions like "What should I put for key partners?"`;
};

// Handle question-type inputs
const handleQuestion = (text: string, context: MizzieContext): MizzieResponse => {
  const lowerText = text.toLowerCase();

  // Questions about specific canvas sections
  if (lowerText.includes("value proposition") || lowerText.includes("unique")) {
    return {
      message: "Your value proposition is what makes your product or service valuable to customers. Think about: What problem do you solve? What need do you satisfy? What makes you different from competitors?",
      action: "suggestion",
    };
  }

  if (lowerText.includes("customer segment") || lowerText.includes("target customer")) {
    return {
      message: "Customer segments are the different groups of people you aim to reach. Consider: Who are you creating value for? What are their demographics, behaviors, and needs?",
      action: "suggestion",
    };
  }

  if (lowerText.includes("channel")) {
    return {
      message: "Channels are how you reach and communicate with your customers. This includes: How will they find you? How will you deliver your product? Online, physical store, partners?",
      action: "suggestion",
    };
  }

  if (lowerText.includes("revenue") || lowerText.includes("money") || lowerText.includes("price")) {
    return {
      message: "Revenue streams represent how you'll make money. Consider: What are customers willing to pay for? How would they prefer to pay? Will you charge per product, subscription, or service?",
      action: "suggestion",
    };
  }

  if (lowerText.includes("partner")) {
    return {
      message: "Key partners are the network of suppliers and partners that make your business work. Think about: Who are your key suppliers? What resources do you get from partners?",
      action: "suggestion",
    };
  }

  // General question
  return {
    message: "That's a great question! Tell me more about your business, and I can help you figure that out.",
    action: "asked_question",
  };
};

