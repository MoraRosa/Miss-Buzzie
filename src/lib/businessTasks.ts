/**
 * Business Tasks - Comprehensive task management for startups
 * Generates actionable tasks from all tabs and includes universal startup checklists
 */

// ============ Types ============

export type TaskCategory =
  | 'legal-admin'
  | 'financial-setup'
  | 'pre-launch'
  | 'launch'
  | 'post-launch'
  | 'canvas-tasks'
  | 'roadmap-tasks'
  | 'forecast-tasks'
  | 'swot-tasks'
  | 'org-tasks'
  | 'pitch-tasks'
  | 'porters-tasks'
  | 'brand-tasks'
  | 'plan-tasks'; // Business Plan comprehensive tasks (replaces market-tasks)

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskPhase = 'idea' | 'validate' | 'build' | 'launch' | 'grow';

export interface BusinessTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  phase: TaskPhase;
  estimatedTime?: string; // e.g., "30 min", "2 hours", "1 day"
  dependencies?: string[]; // IDs of tasks that must be done first
  sourceTab?: string; // Which tab generated this task
  contextData?: string; // Dynamic data from user input
}

export interface TaskCategoryInfo {
  id: TaskCategory;
  label: string;
  emoji: string;
  description: string;
  phase: TaskPhase;
}

// ============ Category Metadata ============

export const TASK_CATEGORIES: TaskCategoryInfo[] = [
  // Universal Checklists
  { id: 'legal-admin', label: 'Legal & Admin', emoji: '📋', description: 'Business registration, licenses, legal setup', phase: 'idea' },
  { id: 'financial-setup', label: 'Financial Setup', emoji: '💰', description: 'Banking, accounting, funding', phase: 'validate' },
  { id: 'pre-launch', label: 'Pre-Launch', emoji: '🔧', description: 'Website, social, email list setup', phase: 'build' },
  { id: 'launch', label: 'Launch', emoji: '🚀', description: 'Go-to-market execution', phase: 'launch' },
  { id: 'post-launch', label: 'Post-Launch', emoji: '📈', description: 'Growth, feedback, iteration', phase: 'grow' },
  // Tab-Generated
  { id: 'plan-tasks', label: 'Business Plan Actions', emoji: '📄', description: 'From your comprehensive business plan', phase: 'validate' },
  { id: 'canvas-tasks', label: 'Business Model', emoji: '📝', description: 'Tasks from your Canvas', phase: 'validate' },
  { id: 'brand-tasks', label: 'Brand Building', emoji: '✨', description: 'Brand identity actions', phase: 'build' },
  { id: 'pitch-tasks', label: 'Pitch Prep', emoji: '🎤', description: 'Investor & pitch readiness', phase: 'validate' },
  { id: 'roadmap-tasks', label: 'Milestones', emoji: '🗺️', description: 'From your roadmap', phase: 'build' },
  { id: 'org-tasks', label: 'Team Building', emoji: '👥', description: 'Hiring and team setup', phase: 'build' },
  { id: 'swot-tasks', label: 'Strategic Actions', emoji: '⚡', description: 'From SWOT analysis', phase: 'validate' },
  { id: 'porters-tasks', label: 'Competitive Strategy', emoji: '🏆', description: 'From Porter\'s analysis', phase: 'grow' },
  { id: 'forecast-tasks', label: 'Financial Goals', emoji: '📊', description: 'From your forecast', phase: 'grow' },
];

// ============ Universal Startup Checklists ============

export const UNIVERSAL_TASKS: BusinessTask[] = [
  // Legal & Admin
  { id: 'legal-1', title: 'Choose business structure', description: 'Decide between LLC, Corporation, Sole Proprietorship, or Partnership', category: 'legal-admin', priority: 'critical', phase: 'idea', estimatedTime: '2 hours' },
  { id: 'legal-2', title: 'Register business name', description: 'Check availability and register your business name with the state', category: 'legal-admin', priority: 'critical', phase: 'idea', estimatedTime: '1 day', dependencies: ['legal-1'] },
  { id: 'legal-3', title: 'Get EIN/Tax ID', description: 'Apply for Employer Identification Number from IRS (free)', category: 'legal-admin', priority: 'critical', phase: 'idea', estimatedTime: '30 min', dependencies: ['legal-2'] },
  { id: 'legal-4', title: 'Register for state/local taxes', description: 'Register for sales tax, state income tax as required', category: 'legal-admin', priority: 'high', phase: 'idea', estimatedTime: '2 hours', dependencies: ['legal-3'] },
  { id: 'legal-5', title: 'Get business licenses & permits', description: 'Research and obtain required licenses for your industry/location', category: 'legal-admin', priority: 'high', phase: 'idea', estimatedTime: '1 week' },
  { id: 'legal-6', title: 'Get business insurance', description: 'General liability, professional liability, or industry-specific coverage', category: 'legal-admin', priority: 'high', phase: 'validate', estimatedTime: '1 day' },
  { id: 'legal-7', title: 'Create operating agreement', description: 'Document ownership, roles, profit sharing (especially if partners)', category: 'legal-admin', priority: 'medium', phase: 'idea', estimatedTime: '3 hours' },
  { id: 'legal-8', title: 'Set up contracts & agreements', description: 'Client contracts, NDAs, terms of service templates', category: 'legal-admin', priority: 'medium', phase: 'build', estimatedTime: '1 day' },
  
  // Financial Setup
  { id: 'finance-1', title: 'Open business bank account', description: 'Separate personal and business finances', category: 'financial-setup', priority: 'critical', phase: 'idea', estimatedTime: '2 hours', dependencies: ['legal-3'] },
  { id: 'finance-2', title: 'Set up accounting system', description: 'Choose software: QuickBooks, Wave, Xero, or FreshBooks', category: 'financial-setup', priority: 'critical', phase: 'validate', estimatedTime: '3 hours' },
  { id: 'finance-3', title: 'Create initial budget', description: 'Project expenses for first 6-12 months', category: 'financial-setup', priority: 'high', phase: 'validate', estimatedTime: '4 hours' },
  { id: 'finance-4', title: 'Set up invoicing system', description: 'Create invoice templates and payment collection process', category: 'financial-setup', priority: 'high', phase: 'build', estimatedTime: '2 hours' },
  { id: 'finance-5', title: 'Determine pricing strategy', description: 'Research market rates and set your pricing', category: 'financial-setup', priority: 'critical', phase: 'validate', estimatedTime: '4 hours' },
  { id: 'finance-6', title: 'Set up payment processing', description: 'Stripe, Square, PayPal, or other payment gateway', category: 'financial-setup', priority: 'high', phase: 'build', estimatedTime: '2 hours' },
  { id: 'finance-7', title: 'Create financial projections', description: '3-year revenue, expense, and cash flow projections', category: 'financial-setup', priority: 'high', phase: 'validate', estimatedTime: '1 day' },
  { id: 'finance-8', title: 'Explore funding options', description: 'Research grants, loans, investors, or bootstrapping strategy', category: 'financial-setup', priority: 'medium', phase: 'validate', estimatedTime: '1 week' },
  
  // Pre-Launch
  { id: 'prelaunch-1', title: 'Build website or landing page', description: 'Create your online presence with clear value proposition', category: 'pre-launch', priority: 'critical', phase: 'build', estimatedTime: '1 week' },
  { id: 'prelaunch-2', title: 'Set up business email', description: 'Professional email with your domain (name@yourbusiness.com)', category: 'pre-launch', priority: 'high', phase: 'build', estimatedTime: '1 hour' },
  { id: 'prelaunch-3', title: 'Create social media accounts', description: 'Claim your handle on relevant platforms', category: 'pre-launch', priority: 'high', phase: 'build', estimatedTime: '2 hours' },
  { id: 'prelaunch-4', title: 'Set up email marketing', description: 'Choose platform (Mailchimp, ConvertKit) and create signup form', category: 'pre-launch', priority: 'high', phase: 'build', estimatedTime: '3 hours' },
  { id: 'prelaunch-5', title: 'Create lead magnet', description: 'Free resource to attract email signups', category: 'pre-launch', priority: 'medium', phase: 'build', estimatedTime: '1 day' },
  { id: 'prelaunch-6', title: 'Build waitlist/early access', description: 'Capture interest before launch', category: 'pre-launch', priority: 'medium', phase: 'build', estimatedTime: '2 hours' },
  { id: 'prelaunch-7', title: 'Create content calendar', description: 'Plan first 30 days of content', category: 'pre-launch', priority: 'medium', phase: 'build', estimatedTime: '3 hours' },
  { id: 'prelaunch-8', title: 'Set up analytics', description: 'Google Analytics, social analytics, conversion tracking', category: 'pre-launch', priority: 'high', phase: 'build', estimatedTime: '2 hours' },
  
  // Launch
  { id: 'launch-1', title: 'Finalize product/service', description: 'Ensure your offering is ready for customers', category: 'launch', priority: 'critical', phase: 'launch', estimatedTime: 'varies' },
  { id: 'launch-2', title: 'Test purchase/signup flow', description: 'Complete a test transaction end-to-end', category: 'launch', priority: 'critical', phase: 'launch', estimatedTime: '2 hours' },
  { id: 'launch-3', title: 'Prepare launch announcement', description: 'Email, social posts, press release ready', category: 'launch', priority: 'high', phase: 'launch', estimatedTime: '4 hours' },
  { id: 'launch-4', title: 'Notify your network', description: 'Personal outreach to warm contacts', category: 'launch', priority: 'high', phase: 'launch', estimatedTime: '2 hours' },
  { id: 'launch-5', title: 'Set up customer support', description: 'Email, chat, or phone support ready', category: 'launch', priority: 'high', phase: 'launch', estimatedTime: '3 hours' },
  { id: 'launch-6', title: 'Create onboarding flow', description: 'Welcome emails, getting started guides', category: 'launch', priority: 'medium', phase: 'launch', estimatedTime: '4 hours' },
  { id: 'launch-7', title: 'Prepare FAQ/Help docs', description: 'Answer common questions proactively', category: 'launch', priority: 'medium', phase: 'launch', estimatedTime: '3 hours' },
  { id: 'launch-8', title: 'Execute launch!', description: 'Go live and announce to the world', category: 'launch', priority: 'critical', phase: 'launch', estimatedTime: '1 day' },

  // Post-Launch  
  { id: 'postlaunch-1', title: 'Collect customer feedback', description: 'Survey first customers, interviews, reviews', category: 'post-launch', priority: 'critical', phase: 'grow', estimatedTime: 'ongoing' },
  { id: 'postlaunch-2', title: 'Monitor key metrics', description: 'Track revenue, conversions, customer acquisition cost', category: 'post-launch', priority: 'critical', phase: 'grow', estimatedTime: 'daily' },
  { id: 'postlaunch-3', title: 'Iterate based on feedback', description: 'Make improvements based on customer input', category: 'post-launch', priority: 'high', phase: 'grow', estimatedTime: 'ongoing' },
  { id: 'postlaunch-4', title: 'Build testimonials/case studies', description: 'Document customer success stories', category: 'post-launch', priority: 'high', phase: 'grow', estimatedTime: '1 week' },
  { id: 'postlaunch-5', title: 'Optimize conversion funnel', description: 'Improve signup/purchase rates', category: 'post-launch', priority: 'high', phase: 'grow', estimatedTime: 'ongoing' },
  { id: 'postlaunch-6', title: 'Scale marketing channels', description: 'Double down on what works', category: 'post-launch', priority: 'medium', phase: 'grow', estimatedTime: 'ongoing' },
  { id: 'postlaunch-7', title: 'Plan next product iteration', description: 'Roadmap for v2 based on learnings', category: 'post-launch', priority: 'medium', phase: 'grow', estimatedTime: '1 week' },
  { id: 'postlaunch-8', title: 'Review and adjust financials', description: 'Compare actual vs projected, adjust budget', category: 'post-launch', priority: 'high', phase: 'grow', estimatedTime: '4 hours' },
];

// ============ Tab-Specific Task Generators ============

import type { CanvasData, SWOTData, Milestone, ForecastData, Role, Slide, PortersData, BusinessPlanData } from '@/lib/validators/schemas';
import type { BrandStrategy } from '@/lib/brandStrategy';

// Canvas Tasks Generator
export const generateCanvasTasks = (canvas: CanvasData): BusinessTask[] => {
  const tasks: BusinessTask[] = [];

  if (canvas.valuePropositions) {
    tasks.push({
      id: 'canvas-vp-1',
      title: 'Validate value proposition',
      description: `Test "${canvas.valuePropositions.substring(0, 50)}..." with 5 potential customers`,
      category: 'canvas-tasks',
      priority: 'critical',
      phase: 'validate',
      sourceTab: 'Canvas',
      estimatedTime: '1 week',
    });
  }

  if (canvas.customerSegments) {
    tasks.push({
      id: 'canvas-cs-1',
      title: 'Interview target customers',
      description: `Conduct 10 customer interviews with your target segment`,
      category: 'canvas-tasks',
      priority: 'critical',
      phase: 'validate',
      sourceTab: 'Canvas',
      estimatedTime: '2 weeks',
    });
  }

  if (canvas.channels) {
    tasks.push({
      id: 'canvas-ch-1',
      title: 'Test distribution channels',
      description: `Run small experiments on your planned channels to find best fit`,
      category: 'canvas-tasks',
      priority: 'high',
      phase: 'validate',
      sourceTab: 'Canvas',
      estimatedTime: '2 weeks',
    });
  }

  if (canvas.keyPartners) {
    tasks.push({
      id: 'canvas-kp-1',
      title: 'Reach out to potential partners',
      description: `Contact 3 potential key partners for initial conversations`,
      category: 'canvas-tasks',
      priority: 'medium',
      phase: 'build',
      sourceTab: 'Canvas',
      estimatedTime: '1 week',
    });
  }

  if (canvas.revenueStreams) {
    tasks.push({
      id: 'canvas-rs-1',
      title: 'Validate pricing with customers',
      description: `Test your pricing model with 5 potential paying customers`,
      category: 'canvas-tasks',
      priority: 'critical',
      phase: 'validate',
      sourceTab: 'Canvas',
      estimatedTime: '1 week',
    });
  }

  return tasks;
};

// SWOT Tasks Generator
export const generateSwotTasks = (swot: SWOTData): BusinessTask[] => {
  const tasks: BusinessTask[] = [];

  // Address top weaknesses
  swot.weaknesses?.slice(0, 2).forEach((weakness, i) => {
    if (weakness.text) {
      tasks.push({
        id: `swot-w-${i}`,
        title: `Address weakness: ${weakness.text.substring(0, 40)}...`,
        description: `Create action plan to mitigate or improve this weakness`,
        category: 'swot-tasks',
        priority: 'high',
        phase: 'validate',
        sourceTab: 'SWOT',
        contextData: weakness.text,
      });
    }
  });

  // Capitalize on opportunities
  swot.opportunities?.slice(0, 2).forEach((opp, i) => {
    if (opp.text) {
      tasks.push({
        id: `swot-o-${i}`,
        title: `Capitalize on: ${opp.text.substring(0, 40)}...`,
        description: `Develop strategy to take advantage of this opportunity`,
        category: 'swot-tasks',
        priority: 'high',
        phase: 'grow',
        sourceTab: 'SWOT',
        contextData: opp.text,
      });
    }
  });

  // Mitigate threats
  swot.threats?.slice(0, 2).forEach((threat, i) => {
    if (threat.text) {
      tasks.push({
        id: `swot-t-${i}`,
        title: `Mitigate threat: ${threat.text.substring(0, 40)}...`,
        description: `Create contingency plan for this potential threat`,
        category: 'swot-tasks',
        priority: 'medium',
        phase: 'validate',
        sourceTab: 'SWOT',
        contextData: threat.text,
      });
    }
  });

  return tasks;
};

// Roadmap Tasks Generator
export const generateRoadmapTasks = (milestones: Milestone[]): BusinessTask[] => {
  return milestones.map((milestone, i) => ({
    id: `roadmap-${milestone.id || i}`,
    title: milestone.title,
    description: milestone.description || `Complete by ${milestone.timeframe}`,
    category: 'roadmap-tasks' as TaskCategory,
    priority: milestone.category === '1-year' ? 'critical' as TaskPriority : milestone.category === '5-year' ? 'medium' as TaskPriority : 'low' as TaskPriority,
    phase: milestone.category === '1-year' ? 'build' as TaskPhase : 'grow' as TaskPhase,
    sourceTab: 'Roadmap',
    contextData: milestone.timeframe,
  }));
};

// Forecast Tasks Generator
export const generateForecastTasks = (forecast: ForecastData): BusinessTask[] => {
  const tasks: BusinessTask[] = [];

  if (forecast.year1Revenue) {
    const revenue = parseFloat(forecast.year1Revenue.replace(/[^0-9.]/g, ''));
    if (revenue > 0) {
      tasks.push({
        id: 'forecast-y1-rev',
        title: `Achieve Year 1 revenue: $${revenue.toLocaleString()}`,
        description: `Monthly target: ~$${Math.round(revenue/12).toLocaleString()}`,
        category: 'forecast-tasks',
        priority: 'critical',
        phase: 'grow',
        sourceTab: 'Forecast',
      });
    }
  }

  if (forecast.year1Expenses) {
    tasks.push({
      id: 'forecast-y1-exp',
      title: 'Set up expense tracking',
      description: `Monitor against projected Year 1 expenses of ${forecast.year1Expenses}`,
      category: 'forecast-tasks',
      priority: 'high',
      phase: 'validate',
      sourceTab: 'Forecast',
    });
  }

  // Break-even calculation
  if (forecast.year1Revenue && forecast.year1Expenses) {
    const rev = parseFloat(forecast.year1Revenue.replace(/[^0-9.]/g, ''));
    const exp = parseFloat(forecast.year1Expenses.replace(/[^0-9.]/g, ''));
    if (rev > 0 && exp > 0) {
      tasks.push({
        id: 'forecast-breakeven',
        title: rev > exp ? 'Maintain profitability' : 'Reach break-even',
        description: rev > exp
          ? `Projected profit margin: ${Math.round((rev-exp)/rev*100)}%`
          : `Gap to close: $${(exp-rev).toLocaleString()}`,
        category: 'forecast-tasks',
        priority: 'critical',
        phase: 'grow',
        sourceTab: 'Forecast',
      });
    }
  }

  return tasks;
};

// Org Tasks Generator
export const generateOrgTasks = (roles: Role[]): BusinessTask[] => {
  const tasks: BusinessTask[] = [];

  const unfilledRoles = roles.filter(r => !r.name || r.name === 'TBD' || r.name === '');

  unfilledRoles.forEach((role, i) => {
    tasks.push({
      id: `org-hire-${i}`,
      title: `Hire: ${role.title}`,
      description: role.responsibilities
        ? `Responsibilities: ${role.responsibilities.substring(0, 100)}...`
        : `Fill this role in ${role.department || 'your organization'}`,
      category: 'org-tasks',
      priority: i === 0 ? 'critical' : 'high',
      phase: 'build',
      sourceTab: 'Org Chart',
    });
  });

  if (roles.length > 0) {
    tasks.push({
      id: 'org-jd',
      title: 'Write job descriptions',
      description: `Create detailed job descriptions for ${unfilledRoles.length} open roles`,
      category: 'org-tasks',
      priority: 'high',
      phase: 'build',
      sourceTab: 'Org Chart',
    });
  }

  return tasks;
};

// Pitch Tasks Generator
export const generatePitchTasks = (slides: Slide[]): BusinessTask[] => {
  const tasks: BusinessTask[] = [];

  // Basic pitch prep
  tasks.push(
    {
      id: 'pitch-practice',
      title: 'Practice pitch 10 times',
      description: 'Rehearse until you can deliver smoothly without notes',
      category: 'pitch-tasks',
      priority: 'critical',
      phase: 'validate',
      sourceTab: 'Pitch',
      estimatedTime: '5 hours',
    },
    {
      id: 'pitch-feedback',
      title: 'Get pitch feedback from 3 mentors',
      description: 'Present to experienced entrepreneurs or investors for critique',
      category: 'pitch-tasks',
      priority: 'high',
      phase: 'validate',
      sourceTab: 'Pitch',
      estimatedTime: '1 week',
    },
    {
      id: 'pitch-qa',
      title: 'Prepare for investor Q&A',
      description: 'Anticipate tough questions and prepare confident answers',
      category: 'pitch-tasks',
      priority: 'high',
      phase: 'validate',
      sourceTab: 'Pitch',
      estimatedTime: '3 hours',
    }
  );

  // Check for incomplete slides
  const incompleteSlides = slides.filter(s => !s.content || s.content.length < 20);
  if (incompleteSlides.length > 0) {
    tasks.push({
      id: 'pitch-complete',
      title: `Complete ${incompleteSlides.length} pitch slides`,
      description: `Add content to: ${incompleteSlides.map(s => s.title).join(', ')}`,
      category: 'pitch-tasks',
      priority: 'critical',
      phase: 'validate',
      sourceTab: 'Pitch',
    });
  }

  return tasks;
};

// Porter's Five Forces Tasks Generator
export const generatePortersTasks = (porters: PortersData): BusinessTask[] => {
  const tasks: BusinessTask[] = [];

  // Find high-threat forces
  const forces = [
    { name: 'Supplier Power', data: porters.supplierPower },
    { name: 'Buyer Power', data: porters.buyerPower },
    { name: 'Competitive Rivalry', data: porters.competitiveRivalry },
    { name: 'Threat of Substitution', data: porters.threatOfSubstitution },
    { name: 'Threat of New Entry', data: porters.threatOfNewEntry },
  ];

  forces.forEach((force, i) => {
    if (force.data?.level === 'high') {
      tasks.push({
        id: `porters-${i}`,
        title: `Mitigate high ${force.name.toLowerCase()}`,
        description: `Develop strategies to reduce the impact of ${force.name.toLowerCase()}`,
        category: 'porters-tasks',
        priority: 'high',
        phase: 'grow',
        sourceTab: "Porter's Five Forces",
      });
    }
  });

  return tasks;
};

// ============ Business Plan Comprehensive Task Generator ============
// Extracts actionable tasks from ALL 11 phases of the business plan

export const generateBusinessPlanTasks = (plan: BusinessPlanData): BusinessTask[] => {
  const tasks: BusinessTask[] = [];
  const sourceTab = 'Business Plan';

  // ---- Phase 1: About You ----
  // Skill gaps become learning tasks
  if (plan.skillGaps && plan.skillGaps.length > 0) {
    plan.skillGaps.slice(0, 3).forEach((gap, i) => {
      tasks.push({
        id: `plan-skill-${i}`,
        title: `Address skill gap: ${gap.substring(0, 40)}`,
        description: 'Take a course, find a mentor, or hire for this skill',
        category: 'plan-tasks',
        priority: i === 0 ? 'high' : 'medium',
        phase: 'validate',
        sourceTab,
        contextData: gap,
      });
    });
  }

  // Support areas become tasks
  if (plan.supportAreas && plan.supportAreas.length > 0) {
    const selectedSupport = plan.supportAreas.filter(s => s.selected);
    selectedSupport.slice(0, 3).forEach((support, i) => {
      tasks.push({
        id: `plan-support-${i}`,
        title: `Get support: ${support.area}`,
        description: support.details || 'Find resources or help for this area',
        category: 'plan-tasks',
        priority: 'medium',
        phase: 'validate',
        sourceTab,
      });
    });
  }

  // ---- Phase 2: Business Profile ----
  // Social media links become setup tasks if empty
  if (!plan.socialFacebook && !plan.socialInstagram && !plan.socialLinkedin && !plan.socialTwitter) {
    tasks.push({
      id: 'plan-social-setup',
      title: 'Set up social media presence',
      description: 'Create business accounts on relevant social platforms',
      category: 'plan-tasks',
      priority: 'high',
      phase: 'build',
      sourceTab,
    });
  }

  if (!plan.website) {
    tasks.push({
      id: 'plan-website',
      title: 'Create business website',
      description: 'Build a professional website or landing page',
      category: 'plan-tasks',
      priority: 'critical',
      phase: 'build',
      sourceTab,
    });
  }

  // ---- Phase 3: Products & Services ----
  if (plan.productsServices && plan.productsServices.length > 0) {
    // Check for products without prices
    const unpricedProducts = plan.productsServices.filter(p => !p.price);
    if (unpricedProducts.length > 0) {
      tasks.push({
        id: 'plan-pricing',
        title: `Set pricing for ${unpricedProducts.length} product(s)`,
        description: 'Research market rates and define your pricing strategy',
        category: 'plan-tasks',
        priority: 'critical',
        phase: 'validate',
        sourceTab,
      });
    }

    // Generate launch tasks for each product
    plan.productsServices.slice(0, 3).forEach((product, i) => {
      if (product.name) {
        tasks.push({
          id: `plan-product-${i}`,
          title: `Launch: ${product.name}`,
          description: product.description?.substring(0, 80) || 'Prepare this product/service for market',
          category: 'plan-tasks',
          priority: i === 0 ? 'critical' : 'high',
          phase: 'launch',
          sourceTab,
        });
      }
    });
  }

  // ---- Phase 4: Market Analysis ----
  // TAM/SAM/SOM validation
  if (plan.tamCurrent || plan.samCurrent || plan.somCurrent) {
    tasks.push({
      id: 'plan-market-validate',
      title: 'Validate market size assumptions',
      description: 'Verify TAM/SAM/SOM with primary research or industry reports',
      category: 'plan-tasks',
      priority: 'high',
      phase: 'validate',
      sourceTab,
      estimatedTime: '1 week',
    });
  }

  if (plan.evidenceOfViability) {
    tasks.push({
      id: 'plan-viability-evidence',
      title: 'Gather more viability evidence',
      description: 'Collect customer testimonials, pre-orders, or LOIs',
      category: 'plan-tasks',
      priority: 'high',
      phase: 'validate',
      sourceTab,
    });
  }

  // ---- Phase 5: Customers ----
  if (plan.customerSegments && plan.customerSegments.length > 0) {
    // Interview tasks per segment
    plan.customerSegments.slice(0, 3).forEach((segment, i) => {
      if (segment.name) {
        tasks.push({
          id: `plan-interview-${i}`,
          title: `Interview 5+ customers: ${segment.name}`,
          description: segment.needs || 'Understand their pain points and needs',
          category: 'plan-tasks',
          priority: 'critical',
          phase: 'validate',
          sourceTab,
          estimatedTime: '1 week',
        });
      }
    });
  }

  // ---- Phase 6: Competition ----
  if (plan.competitors && plan.competitors.length > 0) {
    tasks.push({
      id: 'plan-competitor-analysis',
      title: 'Deep-dive competitor analysis',
      description: `Analyze ${plan.competitors.length} competitors: pricing, features, positioning`,
      category: 'plan-tasks',
      priority: 'high',
      phase: 'validate',
      sourceTab,
      estimatedTime: '3 hours',
    });
  }

  if (plan.competitiveAdvantage) {
    tasks.push({
      id: 'plan-advantage-proof',
      title: 'Prove your competitive advantage',
      description: 'Create evidence/demo that shows your differentiation',
      category: 'plan-tasks',
      priority: 'high',
      phase: 'build',
      sourceTab,
    });
  }

  // ---- Phase 7: Sales & Revenue ----
  if (plan.year1RevenueTarget) {
    tasks.push({
      id: 'plan-revenue-target',
      title: `Achieve Y1 revenue: ${plan.year1RevenueTarget}`,
      description: 'Break down into monthly targets and track progress',
      category: 'plan-tasks',
      priority: 'critical',
      phase: 'grow',
      sourceTab,
    });
  }

  if (plan.salesChannels) {
    tasks.push({
      id: 'plan-sales-channels',
      title: 'Set up sales channels',
      description: 'Configure and test your primary sales channels',
      category: 'plan-tasks',
      priority: 'high',
      phase: 'build',
      sourceTab,
    });
  }

  // ---- Phase 8: Financing ----
  if (plan.fundingSources && plan.fundingSources.length > 0) {
    plan.fundingSources.slice(0, 2).forEach((source, i) => {
      if (source.source) {
        tasks.push({
          id: `plan-funding-${i}`,
          title: `Secure funding: ${source.source}`,
          description: source.amount ? `Target: ${source.amount}` : 'Prepare application/pitch',
          category: 'plan-tasks',
          priority: 'critical',
          phase: 'validate',
          sourceTab,
        });
      }
    });
  }

  if (plan.cashRequirements) {
    tasks.push({
      id: 'plan-cash-runway',
      title: 'Ensure cash runway',
      description: `Secure cash to cover: ${plan.cashRequirements.substring(0, 60)}`,
      category: 'plan-tasks',
      priority: 'critical',
      phase: 'validate',
      sourceTab,
    });
  }

  // ---- Phase 9: Operations ----
  if (plan.distributionChannels) {
    tasks.push({
      id: 'plan-distribution',
      title: 'Set up distribution',
      description: 'Establish your distribution and fulfillment processes',
      category: 'plan-tasks',
      priority: 'high',
      phase: 'build',
      sourceTab,
    });
  }

  if (plan.regulatoryInfo) {
    tasks.push({
      id: 'plan-regulatory',
      title: 'Complete regulatory compliance',
      description: 'Obtain required permits, licenses, and certifications',
      category: 'plan-tasks',
      priority: 'critical',
      phase: 'validate',
      sourceTab,
      estimatedTime: '2-4 weeks',
    });
  }

  if (plan.procurementInfo) {
    tasks.push({
      id: 'plan-procurement',
      title: 'Establish supplier relationships',
      description: 'Negotiate terms with key suppliers/vendors',
      category: 'plan-tasks',
      priority: 'high',
      phase: 'build',
      sourceTab,
    });
  }

  // ---- Phase 10: Risks & Experiments ----
  // High-impact risks become mitigation tasks
  if (plan.risks && plan.risks.length > 0) {
    const highRisks = plan.risks.filter(r => r.impact === 'High' || r.likelihood === 'High');
    highRisks.slice(0, 3).forEach((risk, i) => {
      if (risk.description) {
        tasks.push({
          id: `plan-risk-${i}`,
          title: `Mitigate risk: ${risk.description.substring(0, 40)}`,
          description: `Likelihood: ${risk.likelihood}, Impact: ${risk.impact}`,
          category: 'plan-tasks',
          priority: 'high',
          phase: 'validate',
          sourceTab,
        });
      }
    });
  }

  // EXPERIMENTS - These become actionable validation tasks!
  if (plan.experiments && plan.experiments.length > 0) {
    plan.experiments.forEach((exp, i) => {
      if (exp.name) {
        tasks.push({
          id: `plan-exp-${exp.id || i}`,
          title: `🧪 Run experiment: ${exp.name}`,
          description: exp.description || `Cost: ${exp.costRange || 'TBD'}`,
          category: 'plan-tasks',
          priority: 'high',
          phase: 'validate',
          sourceTab,
          estimatedTime: exp.costRange || undefined,
          contextData: exp.description,
        });
      }
    });
  }

  // ---- Phase 11: Personal Finances ----
  if (plan.totalAssets || plan.totalLiabilities) {
    tasks.push({
      id: 'plan-personal-finance',
      title: 'Review personal financial position',
      description: 'Ensure personal finances can support business launch period',
      category: 'plan-tasks',
      priority: 'medium',
      phase: 'idea',
      sourceTab,
    });
  }

  return tasks;
};

// Master generator that combines all sources
export const generateAllTasks = (data: {
  canvas?: CanvasData;
  swot?: SWOTData;
  milestones?: Milestone[];
  forecast?: ForecastData;
  roles?: Role[];
  slides?: Slide[];
  porters?: PortersData;
  brandStrategy?: BrandStrategy;
  businessPlan?: BusinessPlanData; // Comprehensive business plan (includes market research)
}): BusinessTask[] => {
  const allTasks: BusinessTask[] = [...UNIVERSAL_TASKS];

  // Business Plan tasks come first (most comprehensive - includes market, customers, competition)
  if (data.businessPlan) allTasks.push(...generateBusinessPlanTasks(data.businessPlan));

  // Then other tab-specific tasks
  if (data.canvas) allTasks.push(...generateCanvasTasks(data.canvas));
  if (data.swot) allTasks.push(...generateSwotTasks(data.swot));
  if (data.milestones) allTasks.push(...generateRoadmapTasks(data.milestones));
  if (data.forecast) allTasks.push(...generateForecastTasks(data.forecast));
  if (data.roles) allTasks.push(...generateOrgTasks(data.roles));
  if (data.slides) allTasks.push(...generatePitchTasks(data.slides));
  if (data.porters) allTasks.push(...generatePortersTasks(data.porters));

  return allTasks;
};

