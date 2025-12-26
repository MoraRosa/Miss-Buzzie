import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('should have input fields for adding tasks', () => {
    render(<Checklist />);

    expect(screen.getByPlaceholderText(/task title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
  });

  it('should have a save button', () => {
    render(<Checklist />);
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should have an add task button', () => {
    render(<Checklist />);
    const addButton = screen.getByRole('button', { name: /add task/i });
    expect(addButton).toBeInTheDocument();
  });

  it('should show 0% progress when no tasks exist', () => {
    render(<Checklist />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should add a task when form is filled and add button is clicked', async () => {
    render(<Checklist />);

    const titleInput = screen.getByPlaceholderText(/task title/i);
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  it('should toggle task completion when checkbox is clicked', async () => {
    // Pre-populate with a task
    const savedData = [
      {
        id: '1',
        title: 'Test Task',
        description: 'Test description',
        category: 'General',
        completed: false,
      },
    ];
    localStorage.setItem('checklist', JSON.stringify(savedData));

    render(<Checklist />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  it('should remove a task when delete button is clicked', async () => {
    // Pre-populate with a task
    const savedData = [
      {
        id: '1',
        title: 'Task to Delete',
        description: 'Test description',
        category: 'General',
        completed: false,
      },
    ];
    localStorage.setItem('checklist', JSON.stringify(savedData));

    render(<Checklist />);

    expect(screen.getByText('Task to Delete')).toBeInTheDocument();

    // Find the delete button by its aria-label
    const deleteButton = screen.getByRole('button', { name: /remove task to delete task/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
    });
  });

  it('should display progress when tasks are completed', () => {
    const savedData = [
      { id: '1', title: 'Task 1', description: '', category: 'General', completed: true },
      { id: '2', title: 'Task 2', description: '', category: 'General', completed: false },
    ];
    localStorage.setItem('checklist', JSON.stringify(savedData));

    render(<Checklist />);

    // 1 out of 2 tasks = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});

