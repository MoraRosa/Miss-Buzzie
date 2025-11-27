import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SWOTAnalysis from './SWOTAnalysis';

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

describe('SWOTAnalysis', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render all four SWOT quadrants', () => {
    render(<SWOTAnalysis />);

    expect(screen.getByText('Strengths')).toBeInTheDocument();
    expect(screen.getByText('Weaknesses')).toBeInTheDocument();
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Threats')).toBeInTheDocument();
  });

  it('should render the main heading', () => {
    render(<SWOTAnalysis />);

    expect(screen.getByText('SWOT Analysis')).toBeInTheDocument();
  });

  it('should have input fields for each quadrant', () => {
    render(<SWOTAnalysis />);

    // Check for placeholder text in inputs (partial match)
    expect(screen.getByPlaceholderText(/strong brand recognition/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/limited budget/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/growing market demand/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/strong competition/i)).toBeInTheDocument();
  });

  it('should have add buttons for each quadrant', () => {
    render(<SWOTAnalysis />);

    // Check for aria-labels on add buttons
    const addButtons = screen.getAllByRole('button', { name: /add/i });
    expect(addButtons.length).toBeGreaterThanOrEqual(4);
  });

  it('should add a strength item when input is filled and add button clicked', async () => {
    render(<SWOTAnalysis />);

    const strengthInput = screen.getByPlaceholderText(/strong brand recognition/i);
    const addStrengthButton = screen.getByRole('button', { name: /add strength/i });

    fireEvent.change(strengthInput, { target: { value: 'Great team culture' } });
    fireEvent.click(addStrengthButton);

    await waitFor(() => {
      expect(screen.getByText('Great team culture')).toBeInTheDocument();
    });
  });

  it('should add a weakness item', async () => {
    render(<SWOTAnalysis />);

    const weaknessInput = screen.getByPlaceholderText(/limited budget/i);
    const addWeaknessButton = screen.getByRole('button', { name: /add weakness/i });

    fireEvent.change(weaknessInput, { target: { value: 'Small team size' } });
    fireEvent.click(addWeaknessButton);

    await waitFor(() => {
      expect(screen.getByText('Small team size')).toBeInTheDocument();
    });
  });

  it('should have a save button', () => {
    render(<SWOTAnalysis />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should have an export dropdown', () => {
    render(<SWOTAnalysis />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('should load saved data from localStorage', () => {
    const savedData = {
      strengths: [{ id: '1', text: 'Saved strength' }],
      weaknesses: [],
      opportunities: [],
      threats: [],
    };
    localStorage.setItem('swotAnalysis', JSON.stringify(savedData));

    render(<SWOTAnalysis />);

    expect(screen.getByText('Saved strength')).toBeInTheDocument();
  });

  it('should clear input after adding an item', async () => {
    render(<SWOTAnalysis />);

    const strengthInput = screen.getByPlaceholderText(/strong brand recognition/i) as HTMLInputElement;

    fireEvent.change(strengthInput, { target: { value: 'New strength' } });
    fireEvent.click(screen.getByRole('button', { name: /add strength/i }));

    await waitFor(() => {
      expect(strengthInput.value).toBe('');
    });
  });
});

