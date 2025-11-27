import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BusinessModelCanvas from './BusinessModelCanvas';

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
}));

describe('BusinessModelCanvas', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render the main heading', () => {
    render(<BusinessModelCanvas />);
    expect(screen.getByText('Business Model Canvas')).toBeInTheDocument();
  });

  it('should render all 9 canvas sections', () => {
    render(<BusinessModelCanvas />);

    expect(screen.getByText('Key Partners')).toBeInTheDocument();
    expect(screen.getByText('Key Activities')).toBeInTheDocument();
    expect(screen.getByText('Key Resources')).toBeInTheDocument();
    expect(screen.getByText('Value Propositions')).toBeInTheDocument();
    expect(screen.getByText('Customer Relationships')).toBeInTheDocument();
    expect(screen.getByText('Channels')).toBeInTheDocument();
    expect(screen.getByText('Customer Segments')).toBeInTheDocument();
    expect(screen.getByText('Cost Structure')).toBeInTheDocument();
    expect(screen.getByText('Revenue Streams')).toBeInTheDocument();
  });

  it('should have textarea inputs for each section', () => {
    render(<BusinessModelCanvas />);

    // Check for textareas by placeholder text
    expect(screen.getByPlaceholderText(/list your key partnerships/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/describe your key activities/i)).toBeInTheDocument();
  });

  it('should have a save button', () => {
    render(<BusinessModelCanvas />);
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should have an export dropdown', () => {
    render(<BusinessModelCanvas />);
    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('should update textarea value when typing', async () => {
    render(<BusinessModelCanvas />);

    const keyPartnersTextarea = screen.getByPlaceholderText(/list your key partnerships/i) as HTMLTextAreaElement;

    fireEvent.change(keyPartnersTextarea, { target: { value: 'Test partner content' } });

    await waitFor(() => {
      expect(keyPartnersTextarea.value).toBe('Test partner content');
    });
  });

  it('should load saved data from localStorage', () => {
    const savedData = {
      keyPartners: 'Saved partner data',
      keyActivities: '',
      keyResources: '',
      valuePropositions: '',
      customerRelationships: '',
      channels: '',
      customerSegments: '',
      costStructure: '',
      revenueStreams: '',
    };
    localStorage.setItem('businessModelCanvas', JSON.stringify(savedData));

    render(<BusinessModelCanvas />);

    const keyPartnersTextarea = screen.getByPlaceholderText(/list your key partnerships/i) as HTMLTextAreaElement;
    expect(keyPartnersTextarea.value).toBe('Saved partner data');
  });

  it('should display description text for each section', () => {
    render(<BusinessModelCanvas />);

    // Check for description text
    expect(screen.getByText(/who are your key partners/i)).toBeInTheDocument();
    expect(screen.getByText(/what are your key activities/i)).toBeInTheDocument();
  });
});

