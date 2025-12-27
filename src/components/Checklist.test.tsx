import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Checklist from './Checklist';

// Mock the hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/hooks/useExport', () => ({
  useExport: () => ({
    isExporting: false,
    exportPNG: vi.fn(),
    exportPDF: vi.fn(),
  }),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

// Mock asset manager
vi.mock('@/lib/assetManager', () => ({
  getAssets: () => [],
  getCompanyLogo: () => null,
  getBrandColors: () => ({
    primary: '#E91E63',
    secondary: '#9C27B0',
    accent: '#FF4081',
    background: '#FFFFFF',
    text: '#212121',
  }),
}));

// Mock brand strategy
vi.mock('@/lib/brandStrategy', () => ({
  getBrandStrategy: () => ({ completedStations: [] }),
  generateBrandActions: () => [],
  ARCHETYPES: [],
  VOICE_STYLES: [],
}));

// Mock business tasks
vi.mock('@/lib/businessTasks', () => ({
  generateAllTasks: () => [],
  TASK_CATEGORIES: [],
}));

// Mock html2canvas and jsPDF
vi.mock('html2canvas', () => ({
  default: vi.fn(),
}));

vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}));

describe('Checklist', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render the main heading', () => {
    render(<Checklist />);
    expect(screen.getByText('Business Checklist')).toBeInTheDocument();
  });

  it('should render the description', () => {
    render(<Checklist />);
    expect(screen.getByText(/track tasks and milestones/i)).toBeInTheDocument();
  });

  it('should have a save button', () => {
    render(<Checklist />);
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should have Edit and Preview toggle buttons', () => {
    render(<Checklist />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
  });

  it('should have an Export dropdown', () => {
    render(<Checklist />);
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('should have three tabs: Launch, Brand, My Tasks', () => {
    render(<Checklist />);
    expect(screen.getByRole('tab', { name: /launch/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /brand/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /my/i })).toBeInTheDocument();
  });

  it('should render the tablist', () => {
    render(<Checklist />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('should render the default tab panel', () => {
    render(<Checklist />);
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  describe('Launch Checklist Tab (default)', () => {
    it('should show startup launch progress section', () => {
      render(<Checklist />);
      expect(screen.getByText(/startup launch progress/i)).toBeInTheDocument();
    });

    it('should show universal startup checklists section', () => {
      render(<Checklist />);
      expect(screen.getByText(/universal startup checklists/i)).toBeInTheDocument();
    });

    it('should show based on your business plan section', () => {
      render(<Checklist />);
      expect(screen.getByText(/based on your business plan/i)).toBeInTheDocument();
    });
  });
});

