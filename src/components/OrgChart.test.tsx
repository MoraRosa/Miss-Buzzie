import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrgChart from './OrgChart';

// Mock the hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
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

// Mock org chart export
vi.mock('@/lib/orgChartExport', () => ({
  exportOrgChartAsPNG: vi.fn(),
  exportOrgChartAsPDF: vi.fn(),
}));

describe('OrgChart', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render the main heading', () => {
    render(<OrgChart />);
    expect(screen.getByText('Organizational Chart')).toBeInTheDocument();
  });

  it('should render the description', () => {
    render(<OrgChart />);
    expect(screen.getByText(/define your team structure/i)).toBeInTheDocument();
  });

  it('should have input fields for adding roles', () => {
    render(<OrgChart />);

    expect(screen.getByPlaceholderText(/role title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/employee name/i)).toBeInTheDocument();
    // Use more specific placeholder to avoid matching search input
    expect(screen.getByPlaceholderText(/Department \(e\.g\./i)).toBeInTheDocument();
  });

  it('should have a save button', () => {
    render(<OrgChart />);
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should have an add role button', () => {
    render(<OrgChart />);
    const addButton = screen.getByRole('button', { name: /add role/i });
    expect(addButton).toBeInTheDocument();
  });

  it('should have edit and preview mode toggle', () => {
    render(<OrgChart />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
  });

  it('should add a role when form is filled and add button is clicked', async () => {
    render(<OrgChart />);

    const titleInput = screen.getByPlaceholderText(/role title/i);
    const nameInput = screen.getByPlaceholderText(/employee name/i);
    const deptInput = screen.getByPlaceholderText(/Department \(e\.g\./i);
    const addButton = screen.getByRole('button', { name: /add role/i });

    fireEvent.change(titleInput, { target: { value: 'CEO' } });
    fireEvent.change(nameInput, { target: { value: 'John Smith' } });
    fireEvent.change(deptInput, { target: { value: 'Executive' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('CEO')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });
  });

  it('should load saved roles from localStorage', () => {
    const savedData = [
      {
        id: '1',
        title: 'CTO',
        name: 'Jane Doe',
        department: 'Engineering',
        responsibilities: 'Technical leadership',
        reportsTo: 'CEO',
        photoAssetId: '',
      },
    ];
    localStorage.setItem('orgChart', JSON.stringify(savedData));

    render(<OrgChart />);

    expect(screen.getByText('CTO')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('should remove a role when delete button is clicked', async () => {
    const savedData = [
      {
        id: '1',
        title: 'Manager',
        name: 'Test Person',
        department: 'Sales',
        responsibilities: '',
        reportsTo: '',
        photoAssetId: '',
      },
    ];
    localStorage.setItem('orgChart', JSON.stringify(savedData));

    render(<OrgChart />);

    expect(screen.getByText('Manager')).toBeInTheDocument();

    // The aria-label includes the role title
    const removeButton = screen.getByRole('button', { name: /remove manager role/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('Manager')).not.toBeInTheDocument();
    });
  });

  it('should have a search input', () => {
    render(<OrgChart />);
    expect(screen.getByPlaceholderText(/search roles/i)).toBeInTheDocument();
  });

  it('should filter roles when searching', async () => {
    const savedData = [
      { id: '1', title: 'CEO', name: 'John', department: 'Executive', responsibilities: '', reportsTo: '', photoAssetId: '' },
      { id: '2', title: 'Developer', name: 'Jane', department: 'Engineering', responsibilities: '', reportsTo: 'CTO', photoAssetId: '' },
    ];
    localStorage.setItem('orgChart', JSON.stringify(savedData));

    render(<OrgChart />);

    const searchInput = screen.getByPlaceholderText(/search roles/i);
    fireEvent.change(searchInput, { target: { value: 'Developer' } });

    await waitFor(() => {
      expect(screen.getByText('Developer')).toBeInTheDocument();
      expect(screen.queryByText('CEO')).not.toBeInTheDocument();
    });
  });
});

