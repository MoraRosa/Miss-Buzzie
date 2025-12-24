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

// ============ Brand Action Items ============

export interface BrandActionItem {
  id: string;
  title: string;
  description: string;
  category: 'voice-check' | 'weekly-action' | 'content-prompt' | 'brand-audit' | 'pitch-prep';
  archetype?: BrandArchetype; // If specific to an archetype
  frequency?: 'daily' | 'weekly' | 'monthly' | 'once';
}

// Static checklists that apply to everyone
export const STATIC_BRAND_ACTIONS: BrandActionItem[] = [
  // Brand Voice Check (Daily)
  { id: 'voice-1', title: 'Voice Alignment Check', description: 'Before posting: Does this sound like my brand archetype?', category: 'voice-check', frequency: 'daily' },
  { id: 'voice-2', title: 'Emotion Check', description: 'Does this content evoke the emotions I want my audience to feel?', category: 'voice-check', frequency: 'daily' },
  { id: 'voice-3', title: 'Tone Consistency', description: 'Is the tone consistent with my voice style across all platforms?', category: 'voice-check', frequency: 'daily' },

  // Brand Audit (Monthly)
  { id: 'audit-1', title: 'Origin Story Visibility', description: 'Is your origin story clearly visible on your About page?', category: 'brand-audit', frequency: 'monthly' },
  { id: 'audit-2', title: 'Brand Color Consistency', description: 'Are your brand colors consistent across website, social, and materials?', category: 'brand-audit', frequency: 'monthly' },
  { id: 'audit-3', title: 'Tagline Alignment', description: 'Does your tagline reflect your core truth and archetype?', category: 'brand-audit', frequency: 'monthly' },
  { id: 'audit-4', title: 'Visual Identity Check', description: 'Do all visuals (photos, graphics) match your brand personality?', category: 'brand-audit', frequency: 'monthly' },
  { id: 'audit-5', title: 'Social Bio Review', description: 'Do your social media bios communicate your brand clearly?', category: 'brand-audit', frequency: 'monthly' },

  // Pitch Prep (Before Meetings)
  { id: 'pitch-1', title: '30-Second Origin Story', description: 'Practice your origin story in 30 seconds or less', category: 'pitch-prep', frequency: 'once' },
  { id: 'pitch-2', title: 'Brand DNA Card Ready', description: 'Have your exported Brand DNA card ready to share', category: 'pitch-prep', frequency: 'once' },
  { id: 'pitch-3', title: 'Emotional Hook Prepared', description: 'Prepare your opening hook based on your core emotions', category: 'pitch-prep', frequency: 'once' },
  { id: 'pitch-4', title: 'Proof Points Listed', description: 'List 3 concrete examples that prove your core truth', category: 'pitch-prep', frequency: 'once' },
  { id: 'pitch-5', title: 'Know Your "Why"', description: 'Be ready to explain your catalyst story with passion', category: 'pitch-prep', frequency: 'once' },
];

// Archetype-specific weekly actions
export const ARCHETYPE_WEEKLY_ACTIONS: Record<BrandArchetype, BrandActionItem[]> = {
  hero: [
    { id: 'hero-1', title: 'Share a Challenge Overcome', description: 'Post about a challenge you or a customer conquered this week', category: 'weekly-action', archetype: 'hero', frequency: 'weekly' },
    { id: 'hero-2', title: 'Inspire with a Goal', description: 'Share an ambitious goal and invite others to join the journey', category: 'weekly-action', archetype: 'hero', frequency: 'weekly' },
    { id: 'hero-3', title: 'Highlight Courage', description: 'Recognize someone (customer, team member) who showed courage', category: 'weekly-action', archetype: 'hero', frequency: 'weekly' },
  ],
  rebel: [
    { id: 'rebel-1', title: 'Challenge Industry Assumption', description: 'Post questioning a common belief in your industry', category: 'weekly-action', archetype: 'rebel', frequency: 'weekly' },
    { id: 'rebel-2', title: 'Share Unconventional Approach', description: 'Explain why you do something differently than "the norm"', category: 'weekly-action', archetype: 'rebel', frequency: 'weekly' },
    { id: 'rebel-3', title: 'Spotlight a Rule You Broke', description: 'Share a story of breaking convention and the results', category: 'weekly-action', archetype: 'rebel', frequency: 'weekly' },
  ],
  creator: [
    { id: 'creator-1', title: 'Show Work in Progress', description: 'Share behind-the-scenes of your creative process', category: 'weekly-action', archetype: 'creator', frequency: 'weekly' },
    { id: 'creator-2', title: 'Share an Innovation', description: 'Post about a new idea, feature, or creative solution', category: 'weekly-action', archetype: 'creator', frequency: 'weekly' },
    { id: 'creator-3', title: 'Inspire Creativity', description: 'Share something that inspired you and why', category: 'weekly-action', archetype: 'creator', frequency: 'weekly' },
  ],
  caregiver: [
    { id: 'caregiver-1', title: 'Share Customer Success Story', description: 'Highlight how you helped someone succeed or feel supported', category: 'weekly-action', archetype: 'caregiver', frequency: 'weekly' },
    { id: 'caregiver-2', title: 'Offer Genuine Help', description: 'Post a tip, resource, or offer to help your community', category: 'weekly-action', archetype: 'caregiver', frequency: 'weekly' },
    { id: 'caregiver-3', title: 'Express Gratitude', description: 'Thank your community, customers, or team publicly', category: 'weekly-action', archetype: 'caregiver', frequency: 'weekly' },
  ],
  explorer: [
    { id: 'explorer-1', title: 'Share a Discovery', description: 'Post about something new you learned or explored', category: 'weekly-action', archetype: 'explorer', frequency: 'weekly' },
    { id: 'explorer-2', title: 'Invite Adventure', description: 'Encourage your audience to try something new', category: 'weekly-action', archetype: 'explorer', frequency: 'weekly' },
    { id: 'explorer-3', title: 'Document the Journey', description: 'Share a step in your business journey authentically', category: 'weekly-action', archetype: 'explorer', frequency: 'weekly' },
  ],
  sage: [
    { id: 'sage-1', title: 'Teach Something Valuable', description: 'Share a piece of wisdom or expert insight', category: 'weekly-action', archetype: 'sage', frequency: 'weekly' },
    { id: 'sage-2', title: 'Curate Quality Content', description: 'Share and add commentary on an industry article or study', category: 'weekly-action', archetype: 'sage', frequency: 'weekly' },
    { id: 'sage-3', title: 'Answer a Common Question', description: 'Address a FAQ with depth and clarity', category: 'weekly-action', archetype: 'sage', frequency: 'weekly' },
  ],
  innocent: [
    { id: 'innocent-1', title: 'Share Simple Joy', description: 'Post something that brings simple happiness', category: 'weekly-action', archetype: 'innocent', frequency: 'weekly' },
    { id: 'innocent-2', title: 'Keep It Simple', description: 'Explain something complex in the simplest terms possible', category: 'weekly-action', archetype: 'innocent', frequency: 'weekly' },
    { id: 'innocent-3', title: 'Spread Optimism', description: 'Share a hopeful message or positive outlook', category: 'weekly-action', archetype: 'innocent', frequency: 'weekly' },
  ],
  jester: [
    { id: 'jester-1', title: 'Make Them Laugh', description: 'Post something genuinely funny or entertaining', category: 'weekly-action', archetype: 'jester', frequency: 'weekly' },
    { id: 'jester-2', title: 'Playful Take on News', description: 'Add humor to an industry trend or current event', category: 'weekly-action', archetype: 'jester', frequency: 'weekly' },
    { id: 'jester-3', title: 'Self-Deprecating Moment', description: 'Share a funny mistake or blunder (and what you learned)', category: 'weekly-action', archetype: 'jester', frequency: 'weekly' },
  ],
  lover: [
    { id: 'lover-1', title: 'Create Desire', description: 'Post content that evokes beauty, passion, or longing', category: 'weekly-action', archetype: 'lover', frequency: 'weekly' },
    { id: 'lover-2', title: 'Celebrate Connection', description: 'Highlight a meaningful relationship or partnership', category: 'weekly-action', archetype: 'lover', frequency: 'weekly' },
    { id: 'lover-3', title: 'Sensory Storytelling', description: 'Use rich, sensory language to describe your product/service', category: 'weekly-action', archetype: 'lover', frequency: 'weekly' },
  ],
  ruler: [
    { id: 'ruler-1', title: 'Share Leadership Insight', description: 'Post a perspective on leadership or excellence', category: 'weekly-action', archetype: 'ruler', frequency: 'weekly' },
    { id: 'ruler-2', title: 'Set the Standard', description: 'Explain your high standards and why they matter', category: 'weekly-action', archetype: 'ruler', frequency: 'weekly' },
    { id: 'ruler-3', title: 'Command Authority', description: 'Take a strong stance on an industry issue', category: 'weekly-action', archetype: 'ruler', frequency: 'weekly' },
  ],
  magician: [
    { id: 'magician-1', title: 'Reveal Behind-the-Magic', description: 'Show how you create transformative experiences', category: 'weekly-action', archetype: 'magician', frequency: 'weekly' },
    { id: 'magician-2', title: 'Share a Transformation', description: 'Post a before/after or transformation story', category: 'weekly-action', archetype: 'magician', frequency: 'weekly' },
    { id: 'magician-3', title: 'Spark Wonder', description: 'Share something that creates a sense of possibility', category: 'weekly-action', archetype: 'magician', frequency: 'weekly' },
  ],
  everyman: [
    { id: 'everyman-1', title: 'Be Relatable', description: 'Share a common struggle or everyday moment', category: 'weekly-action', archetype: 'everyman', frequency: 'weekly' },
    { id: 'everyman-2', title: 'Celebrate Your Community', description: 'Highlight regular customers or community members', category: 'weekly-action', archetype: 'everyman', frequency: 'weekly' },
    { id: 'everyman-3', title: 'Keep It Real', description: 'Post something authentic and down-to-earth', category: 'weekly-action', archetype: 'everyman', frequency: 'weekly' },
  ],
};

// Content calendar prompts based on voice style
export const VOICE_CONTENT_PROMPTS: Record<VoiceStyle, string[]> = {
  formal: [
    'Industry analysis: What trend should your audience understand?',
    'Case study: Document results with data and methodology',
    'Expert opinion piece on a complex topic',
  ],
  casual: [
    'Quick tip that made your day easier',
    'Conversation starter: Ask your audience a simple question',
    '"Real talk" post about something you\'re working through',
  ],
  bold: [
    'Hot take: What does everyone get wrong?',
    'Direct advice: "Stop doing X, start doing Y"',
    'Challenge to your audience to step up',
  ],
  warm: [
    'Encouragement for someone struggling',
    'Story of a customer you helped',
    '"You\'re not alone" message about a common challenge',
  ],
  witty: [
    'Clever observation about your industry',
    'Unexpected analogy that explains your product',
    'Humor-infused lesson from a recent experience',
  ],
  authoritative: [
    'Research-backed insight with sources',
    'Step-by-step guide on a specific topic',
    'Definitive answer to a debated question',
  ],
  friendly: [
    'Exciting update or announcement',
    'Personal share about what you love about your work',
    'Celebration of a milestone (yours or a customer\'s)',
  ],
  provocative: [
    'Contrarian take on popular advice',
    'Question that makes people rethink assumptions',
    '"What if?" scenario that challenges the status quo',
  ],
};

// Helper to generate personalized tasks from Brand DNA
export const generateBrandActions = (strategy: BrandStrategy): BrandActionItem[] => {
  const actions: BrandActionItem[] = [];

  // Add static actions
  actions.push(...STATIC_BRAND_ACTIONS);

  // Add archetype-specific weekly actions
  if (strategy.primaryArchetype) {
    const archetypeActions = ARCHETYPE_WEEKLY_ACTIONS[strategy.primaryArchetype];
    if (archetypeActions) {
      actions.push(...archetypeActions);
    }
  }

  // Add secondary archetype actions (if different)
  if (strategy.secondaryArchetype && strategy.secondaryArchetype !== strategy.primaryArchetype) {
    const secondaryActions = ARCHETYPE_WEEKLY_ACTIONS[strategy.secondaryArchetype];
    if (secondaryActions) {
      // Only add the first action from secondary to avoid overwhelming
      actions.push(secondaryActions[0]);
    }
  }

  // Add content prompts as tasks based on voice
  if (strategy.voice.primaryStyle) {
    const prompts = VOICE_CONTENT_PROMPTS[strategy.voice.primaryStyle];
    if (prompts) {
      prompts.forEach((prompt, i) => {
        actions.push({
          id: `content-${strategy.voice.primaryStyle}-${i}`,
          title: 'Content Idea',
          description: prompt,
          category: 'content-prompt',
          frequency: 'weekly',
        });
      });
    }
  }

  return actions;
};

