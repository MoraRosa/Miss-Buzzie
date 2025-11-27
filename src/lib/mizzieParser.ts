/**
 * Mizzie Parser - Extracts business entities from natural language
 * 
 * Parses user speech/text to identify business model components
 */

import type { CanvasData } from "@/lib/validators/schemas";

export interface ParsedBusinessInfo {
  canvas: Partial<CanvasData>;
  businessName?: string;
  industry?: string;
  location?: string;
  confidence: number;
}

// Keywords that help identify different canvas sections
const PATTERNS = {
  valueProposition: [
    /(?:we|i|our company)\s+(?:offer|provide|sell|make|create|deliver)\s+(.+?)(?:\.|,|$)/gi,
    /(?:value|unique|special|different)\s+(?:is|being|because)\s+(.+?)(?:\.|,|$)/gi,
    /(?:organic|handmade|custom|premium|affordable|sustainable)\s+(.+?)(?:\.|,|$)/gi,
  ],
  customerSegments: [
    /(?:target|targeting|for|serve|serving)\s+(.+?)(?:who|that|in|$)/gi,
    /(?:customers?|clients?|audience|market)\s+(?:are|is|being)\s+(.+?)(?:\.|,|$)/gi,
    /(?:health-conscious|young|elderly|busy|professional|local)\s+(.+?)(?:\.|,|$)/gi,
  ],
  channels: [
    /(?:sell|selling|reach|reaching)\s+(?:through|via|on|at)\s+(.+?)(?:\.|,|$)/gi,
    /(?:online|website|store|shop|market|social media|instagram|facebook)\s*/gi,
  ],
  keyPartners: [
    /(?:partner|partnering|work|working)\s+with\s+(.+?)(?:\.|,|$)/gi,
    /(?:supplier|vendor|source|sourcing)\s+(?:from|is|are)\s+(.+?)(?:\.|,|$)/gi,
  ],
  keyActivities: [
    /(?:we|i)\s+(?:do|make|create|produce|manufacture|bake|cook|design)\s+(.+?)(?:\.|,|$)/gi,
    /(?:main|key|core)\s+(?:activity|activities|work)\s+(?:is|are)\s+(.+?)(?:\.|,|$)/gi,
  ],
  keyResources: [
    /(?:need|require|use|using)\s+(.+?)\s+(?:to|for)/gi,
    /(?:equipment|tools|ingredients|materials|staff|team)\s*/gi,
  ],
  revenueStreams: [
    /(?:make money|revenue|income|earn|charge)\s+(?:by|through|from)\s+(.+?)(?:\.|,|$)/gi,
    /(?:price|pricing|cost|costs?)\s+(?:is|are|at)\s+(.+?)(?:\.|,|$)/gi,
  ],
  costStructure: [
    /(?:costs?|expenses?|spend|spending)\s+(?:on|for|include)\s+(.+?)(?:\.|,|$)/gi,
    /(?:pay|paying)\s+for\s+(.+?)(?:\.|,|$)/gi,
  ],
  customerRelationships: [
    /(?:interact|relationship|connect|engage)\s+(?:with customers?|with clients?)\s+(.+?)(?:\.|,|$)/gi,
    /(?:customer service|support|community|loyalty)\s*/gi,
  ],
  location: [
    /(?:in|based in|located in|from)\s+(calgary|edmonton|vancouver|toronto|canada|[a-z]+(?:\s+[a-z]+)?)/gi,
  ],
  industry: [
    /(?:pet|food|tech|fashion|health|fitness|beauty|automotive|real estate)/gi,
  ],
};

export const parseBusinessDescription = (text: string): ParsedBusinessInfo => {
  const lowerText = text.toLowerCase();
  const result: ParsedBusinessInfo = {
    canvas: {},
    confidence: 0,
  };

  let matchCount = 0;

  // Extract value propositions
  const valueProps: string[] = [];
  PATTERNS.valueProposition.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        valueProps.push(match[1].trim());
        matchCount++;
      }
    }
  });
  if (valueProps.length > 0) {
    result.canvas.valuePropositions = valueProps.join("\n• ");
  }

  // Extract customer segments
  const segments: string[] = [];
  PATTERNS.customerSegments.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        segments.push(match[1].trim());
        matchCount++;
      }
    }
  });
  if (segments.length > 0) {
    result.canvas.customerSegments = segments.join("\n• ");
  }

  // Extract channels
  const channels: string[] = [];
  PATTERNS.channels.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[0]) {
        channels.push(match[0].trim());
        matchCount++;
      }
    }
  });
  if (channels.length > 0) {
    result.canvas.channels = channels.join("\n• ");
  }

  // Extract location
  PATTERNS.location.forEach((pattern) => {
    const match = text.match(pattern);
    if (match) {
      result.location = match[1];
      matchCount++;
    }
  });

  // Extract industry
  PATTERNS.industry.forEach((pattern) => {
    const match = lowerText.match(pattern);
    if (match) {
      result.industry = match[0];
      matchCount++;
    }
  });

  // Calculate confidence based on matches
  result.confidence = Math.min(matchCount / 5, 1);

  return result;
};

// Generate contextual suggestions based on parsed info
export const generateSuggestions = (parsed: ParsedBusinessInfo): string[] => {
  const suggestions: string[] = [];

  if (!parsed.canvas.valuePropositions) {
    suggestions.push("What makes your product or service unique?");
  }
  if (!parsed.canvas.customerSegments) {
    suggestions.push("Who are your target customers?");
  }
  if (!parsed.canvas.channels) {
    suggestions.push("How will you reach your customers?");
  }
  if (!parsed.canvas.revenueStreams) {
    suggestions.push("How will you make money?");
  }

  return suggestions;
};

// Check if text contains a command/question
export const isQuestion = (text: string): boolean => {
  const lowerText = text.toLowerCase().trim();
  return (
    lowerText.startsWith("what") ||
    lowerText.startsWith("how") ||
    lowerText.startsWith("why") ||
    lowerText.startsWith("can you") ||
    lowerText.startsWith("could you") ||
    lowerText.includes("?")
  );
};

