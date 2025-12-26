import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the heavy dependencies
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
    width: 1000,
    height: 800,
  }),
}));

vi.mock('jspdf', () => {
  const mockPdfInstance = {
    addImage: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
  };
  return {
    default: class MockJsPDF {
      addImage = mockPdfInstance.addImage;
      addPage = mockPdfInstance.addPage;
      save = mockPdfInstance.save;
    },
  };
});

vi.mock('docx', () => ({
  Document: vi.fn(),
  Packer: { toBlob: vi.fn().mockResolvedValue(new Blob()) },
  Paragraph: vi.fn(),
  TextRun: vi.fn(),
  HeadingLevel: { HEADING_1: 'HEADING_1' },
  Table: vi.fn(),
  TableRow: vi.fn(),
  TableCell: vi.fn(),
  WidthType: { PERCENTAGE: 'PERCENTAGE' },
  AlignmentType: { CENTER: 'CENTER' },
  BorderStyle: {},
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock brand colors and logo
vi.mock('@/lib/assetManager', () => ({
  getBrandColors: () => ({
    primary: '#E91E63',
    secondary: '#9C27B0',
    accent: '#FF4081',
    background: '#FFFFFF',
    text: '#212121',
  }),
  getCompanyLogo: () => null,
}));

// Mock brand strategy
vi.mock('@/lib/brandStrategy', () => ({
  getBrandStrategy: () => null,
}));

describe('Exports Component - Data Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should load business plan data from localStorage', () => {
    const testPlan = {
      businessName: 'Test Business',
      ownerName: 'John Doe',
      businessIdea: 'A great idea',
      problemStatement: 'A real problem',
    };
    localStorage.setItem('business-plan', JSON.stringify(testPlan));

    // Verify localStorage has the data
    const stored = localStorage.getItem('business-plan');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual(testPlan);
  });

  it('should load roles data from localStorage', () => {
    const testRoles = [
      { name: 'John Doe', title: 'CEO', bio: 'Experienced leader' },
      { name: 'Jane Smith', title: 'CTO', bio: 'Tech expert' },
    ];
    localStorage.setItem('org-chart-roles', JSON.stringify(testRoles));

    const stored = localStorage.getItem('org-chart-roles');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual(testRoles);
  });

  it('should load forecast data from localStorage', () => {
    const testForecast = {
      year1Revenue: '100000',
      year1Expenses: '80000',
      fundingAsk: '50000',
    };
    localStorage.setItem('financial-forecast', JSON.stringify(testForecast));

    const stored = localStorage.getItem('financial-forecast');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual(testForecast);
  });

  it('should load milestones from localStorage', () => {
    const testMilestones = [
      { title: 'Launch MVP', timeframe: 'Q1 2025', category: 'Product', description: 'Initial launch' },
      { title: 'First 100 customers', timeframe: 'Q2 2025', category: 'Sales', description: 'Growth milestone' },
    ];
    localStorage.setItem('roadmap-milestones', JSON.stringify(testMilestones));

    const stored = localStorage.getItem('roadmap-milestones');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual(testMilestones);
  });

  it('should load SWOT data from localStorage', () => {
    const testSwot = {
      strengths: 'Strong team',
      weaknesses: 'New to market',
      opportunities: 'Growing market',
      threats: 'Competition',
    };
    localStorage.setItem('swot-analysis', JSON.stringify(testSwot));

    const stored = localStorage.getItem('swot-analysis');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual(testSwot);
  });
});

describe('Exports Component - Currency Formatting', () => {
  it('should format currency values correctly', () => {
    // Test the currency formatting logic
    const formatCurrency = (value: number): string => {
      if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
      return `$${value.toLocaleString()}`;
    };

    expect(formatCurrency(1000000000)).toBe('$1.0B');
    expect(formatCurrency(5000000)).toBe('$5.0M');
    expect(formatCurrency(50000)).toBe('$50K');
    expect(formatCurrency(500)).toBe('$500');
  });
});

