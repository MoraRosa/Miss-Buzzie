/**
 * Brand Strategy Storage and Types
 * Manages the strategic brand identity data (archetypes, voice, emotions, story)
 */

// ============ Types ============

export type BrandArchetype = 
  | 'hero' | 'rebel' | 'creator' | 'caregiver' 
  | 'explorer' | 'sage' | 'innocent' | 'jester'
  | 'lover' | 'ruler' | 'magician' | 'everyman';

export type BrandEmotion = 
  | 'empowered' | 'safe' | 'excited' | 'inspired' 
  | 'understood' | 'curious' | 'confident' | 'joyful'
  | 'trusted' | 'ambitious' | 'peaceful' | 'rebellious';

export type VoiceStyle = 
  | 'formal' | 'casual' | 'bold' | 'warm' 
  | 'witty' | 'authoritative' | 'friendly' | 'provocative';

export interface BrandAssociation {
  id: string;
  word: string;
}

export interface BrandStory {
  catalyst: string;      // Why the brand exists
  coreTruth: string;     // What makes you different
  proof: string;         // How you reinforce identity
}

export interface BrandVoice {
  primaryStyle: VoiceStyle | '';
  secondaryStyle: VoiceStyle | '';
  topicFocus: string;    // The 80% topic they want to be known for
  toneSamples: string[]; // Example phrases in their voice
}

export interface BrandStrategy {
  // Station 1: The Destination
  brandName: string;
  associations: BrandAssociation[];
  desiredOutcome: string;
  
  // Station 2: The Archetype
  primaryArchetype: BrandArchetype | '';
  secondaryArchetype: BrandArchetype | '';
  
  // Station 3: The Origin Story
  story: BrandStory;
  
  // Station 4: The Voice
  voice: BrandVoice;
  
  // Station 5: The Emotion
  emotions: BrandEmotion[];
  emotionalPromise: string; // "When people think of us, they feel..."
  
  // Meta
  currentStation: number;
  completedStations: number[];
  lastUpdated: string;
}

// ============ Default Values ============

export const DEFAULT_BRAND_STRATEGY: BrandStrategy = {
  brandName: '',
  associations: [],
  desiredOutcome: '',
  primaryArchetype: '',
  secondaryArchetype: '',
  story: {
    catalyst: '',
    coreTruth: '',
    proof: '',
  },
  voice: {
    primaryStyle: '',
    secondaryStyle: '',
    topicFocus: '',
    toneSamples: [],
  },
  emotions: [],
  emotionalPromise: '',
  currentStation: 1,
  completedStations: [],
  lastUpdated: new Date().toISOString(),
};

// ============ Storage ============

const STORAGE_KEY = 'brandStrategy';

export const saveBrandStrategy = (strategy: BrandStrategy): void => {
  const updated = {
    ...strategy,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('brandStrategyChanged', { detail: updated }));
};

export const getBrandStrategy = (): BrandStrategy => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_BRAND_STRATEGY;
  
  try {
    const parsed = JSON.parse(stored);
    // Merge with defaults to handle any missing fields from older versions
    return { ...DEFAULT_BRAND_STRATEGY, ...parsed };
  } catch (error) {
    console.error('[brandStrategy] Failed to parse stored data:', error);
    return DEFAULT_BRAND_STRATEGY;
  }
};

export const updateBrandStrategy = (updates: Partial<BrandStrategy>): BrandStrategy => {
  const current = getBrandStrategy();
  const updated = { ...current, ...updates };
  saveBrandStrategy(updated);
  return updated;
};

// ============ Archetype Data ============

export interface ArchetypeInfo {
  id: BrandArchetype;
  name: string;
  tagline: string;
  traits: string[];
  brands: string[];
  color: string;
  emoji: string;
}

export const ARCHETYPES: ArchetypeInfo[] = [
  {
    id: 'hero',
    name: 'The Hero',
    tagline: 'Where there\'s a will, there\'s a way',
    traits: ['Courageous', 'Determined', 'Strong', 'Inspiring'],
    brands: ['Nike', 'Adidas', 'FedEx', 'BMW'],
    color: '#DC2626',
    emoji: '🦸',
  },
  {
    id: 'rebel',
    name: 'The Rebel',
    tagline: 'Rules are made to be broken',
    traits: ['Disruptive', 'Bold', 'Revolutionary', 'Fearless'],
    brands: ['Red Bull', 'Harley-Davidson', 'Virgin', 'Diesel'],
    color: '#7C3AED',
    emoji: '🔥',
  },
  {
    id: 'creator',
    name: 'The Creator',
    tagline: 'If it can be imagined, it can be created',
    traits: ['Innovative', 'Artistic', 'Visionary', 'Original'],
    brands: ['Apple', 'Lego', 'Adobe', 'Pinterest'],
    color: '#F59E0B',
    emoji: '🎨',
  },
  {
    id: 'caregiver',
    name: 'The Caregiver',
    tagline: 'Love your neighbor as yourself',
    traits: ['Nurturing', 'Compassionate', 'Generous', 'Protective'],
    brands: ['Johnson & Johnson', 'TOMS', 'Volvo', 'Pampers'],
    color: '#10B981',
    emoji: '💚',
  },
  {
    id: 'explorer',
    name: 'The Explorer',
    tagline: 'Don\'t fence me in',
    traits: ['Adventurous', 'Independent', 'Pioneering', 'Authentic'],
    brands: ['Patagonia', 'Jeep', 'The North Face', 'REI'],
    color: '#0891B2',
    emoji: '🧭',
  },
  {
    id: 'sage',
    name: 'The Sage',
    tagline: 'The truth will set you free',
    traits: ['Wise', 'Knowledgeable', 'Trusted', 'Thoughtful'],
    brands: ['Google', 'BBC', 'Harvard', 'TED'],
    color: '#1E40AF',
    emoji: '🦉',
  },
  {
    id: 'innocent',
    name: 'The Innocent',
    tagline: 'Free to be you and me',
    traits: ['Optimistic', 'Pure', 'Honest', 'Simple'],
    brands: ['Coca-Cola', 'Dove', 'Nintendo', 'Innocent Drinks'],
    color: '#FBBF24',
    emoji: '🌟',
  },
  {
    id: 'jester',
    name: 'The Jester',
    tagline: 'You only live once',
    traits: ['Fun', 'Playful', 'Witty', 'Irreverent'],
    brands: ['M&Ms', 'Old Spice', 'Dollar Shave Club', 'Mailchimp'],
    color: '#F97316',
    emoji: '🃏',
  },
  {
    id: 'lover',
    name: 'The Lover',
    tagline: 'I only have eyes for you',
    traits: ['Passionate', 'Sensual', 'Intimate', 'Romantic'],
    brands: ['Chanel', 'Victoria\'s Secret', 'Häagen-Dazs', 'Godiva'],
    color: '#EC4899',
    emoji: '❤️',
  },
  {
    id: 'ruler',
    name: 'The Ruler',
    tagline: 'Power isn\'t everything, it\'s the only thing',
    traits: ['Commanding', 'Refined', 'Articulate', 'Authoritative'],
    brands: ['Mercedes-Benz', 'Rolex', 'American Express', 'Microsoft'],
    color: '#1F2937',
    emoji: '👑',
  },
  {
    id: 'magician',
    name: 'The Magician',
    tagline: 'I make dreams come true',
    traits: ['Visionary', 'Transformative', 'Charismatic', 'Imaginative'],
    brands: ['Disney', 'Tesla', 'Dyson', 'Polaroid'],
    color: '#8B5CF6',
    emoji: '✨',
  },
  {
    id: 'everyman',
    name: 'The Everyman',
    tagline: 'All people are created equal',
    traits: ['Relatable', 'Authentic', 'Humble', 'Hardworking'],
    brands: ['IKEA', 'Target', 'Budweiser', 'Gap'],
    color: '#6B7280',
    emoji: '🤝',
  },
];

// ============ Emotion Data ============

export interface EmotionInfo {
  id: BrandEmotion;
  name: string;
  description: string;
  colorHint: string;
  emoji: string;
}

export const EMOTIONS: EmotionInfo[] = [
  { id: 'empowered', name: 'Empowered', description: 'They feel capable and in control', colorHint: 'Bold reds and oranges', emoji: '💪' },
  { id: 'safe', name: 'Safe', description: 'They feel protected and secure', colorHint: 'Blues and greens', emoji: '🛡️' },
  { id: 'excited', name: 'Excited', description: 'They feel energized and eager', colorHint: 'Vibrant yellows and oranges', emoji: '🎉' },
  { id: 'inspired', name: 'Inspired', description: 'They feel motivated to act', colorHint: 'Purples and teals', emoji: '✨' },
  { id: 'understood', name: 'Understood', description: 'They feel seen and heard', colorHint: 'Warm earth tones', emoji: '🤝' },
  { id: 'curious', name: 'Curious', description: 'They want to learn more', colorHint: 'Teals and bright blues', emoji: '🔍' },
  { id: 'confident', name: 'Confident', description: 'They trust their decision', colorHint: 'Deep blues and blacks', emoji: '😎' },
  { id: 'joyful', name: 'Joyful', description: 'They feel happy and delighted', colorHint: 'Bright yellows and pinks', emoji: '😊' },
  { id: 'trusted', name: 'Trusted', description: 'They believe in your reliability', colorHint: 'Navy blues and greens', emoji: '🤲' },
  { id: 'ambitious', name: 'Ambitious', description: 'They dream bigger', colorHint: 'Golds and deep purples', emoji: '🚀' },
  { id: 'peaceful', name: 'Peaceful', description: 'They feel calm and relaxed', colorHint: 'Soft blues and greens', emoji: '🕊️' },
  { id: 'rebellious', name: 'Rebellious', description: 'They feel bold and defiant', colorHint: 'Black, red, electric colors', emoji: '🔥' },
];

// ============ Voice Style Data ============

export interface VoiceStyleInfo {
  id: VoiceStyle;
  name: string;
  description: string;
  example: string;
}

export const VOICE_STYLES: VoiceStyleInfo[] = [
  { id: 'formal', name: 'Formal Expert', description: 'Professional, polished, authoritative', example: 'Our comprehensive methodology ensures optimal outcomes for stakeholders.' },
  { id: 'casual', name: 'Friendly Neighbor', description: 'Approachable, conversational, warm', example: 'Hey! We figured out a way to make this whole thing way easier.' },
  { id: 'bold', name: 'Bold Challenger', description: 'Direct, confident, provocative', example: 'Everyone else is doing it wrong. Here\'s what actually works.' },
  { id: 'warm', name: 'Supportive Guide', description: 'Empathetic, nurturing, encouraging', example: 'We know this is hard. We\'ve been there too, and we\'re here to help.' },
  { id: 'witty', name: 'Clever Entertainer', description: 'Humorous, smart, memorable', example: 'Plot twist: business doesn\'t have to be boring. Who knew?' },
  { id: 'authoritative', name: 'Trusted Authority', description: 'Knowledgeable, reliable, clear', example: 'Based on our research, these are the three key factors to consider.' },
  { id: 'friendly', name: 'Enthusiastic Friend', description: 'Excited, positive, energetic', example: 'You\'re going to love this! We\'ve been so excited to share it with you!' },
  { id: 'provocative', name: 'Thought Provoker', description: 'Challenging, thought-provoking, edgy', example: 'What if everything you believed about success was backwards?' },
];

