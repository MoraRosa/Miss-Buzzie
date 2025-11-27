import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExport } from './useExport';

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
    width: 1000,
    height: 800,
  }),
}));

// Mock jsPDF as a class
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

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('useExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Create a test element in the DOM
    const testElement = document.createElement('div');
    testElement.id = 'test-element';
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    const element = document.getElementById('test-element');
    if (element) {
      document.body.removeChild(element);
    }
  });

  describe('Initial state', () => {
    it('should return isExporting as false initially', () => {
      const { result } = renderHook(() =>
        useExport({ elementId: 'test-element', filename: 'test-file' })
      );

      expect(result.current.isExporting).toBe(false);
    });

    it('should return exportPNG and exportPDF functions', () => {
      const { result } = renderHook(() =>
        useExport({ elementId: 'test-element', filename: 'test-file' })
      );

      expect(typeof result.current.exportPNG).toBe('function');
      expect(typeof result.current.exportPDF).toBe('function');
    });
  });

  describe('exportPNG', () => {
    it('should call html2canvas with correct options', async () => {
      const html2canvas = (await import('html2canvas')).default;
      
      const { result } = renderHook(() =>
        useExport({ elementId: 'test-element', filename: 'test-file', scale: 3 })
      );

      await act(async () => {
        await result.current.exportPNG();
      });

      expect(html2canvas).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          scale: 3,
          useCORS: true,
          logging: false,
        })
      );
    });

    it('should show success toast on successful export', async () => {
      const { result } = renderHook(() =>
        useExport({ elementId: 'test-element', filename: 'test-file' })
      );

      await act(async () => {
        await result.current.exportPNG();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Export successful',
        description: 'test-file exported as PNG',
      });
    });

    it('should show error toast when element not found', async () => {
      const { result } = renderHook(() =>
        useExport({ elementId: 'non-existent', filename: 'test-file' })
      );

      await act(async () => {
        await result.current.exportPNG();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Export failed',
        description: 'Failed to export as PNG',
        variant: 'destructive',
      });
    });
  });

  describe('exportPDF', () => {
    it('should export PDF and show success toast', async () => {
      const { result } = renderHook(() =>
        useExport({ elementId: 'test-element', filename: 'test-file' })
      );

      await act(async () => {
        await result.current.exportPDF();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Export successful',
        description: 'test-file exported as PDF',
      });
    });

    it('should show error toast when PDF export fails', async () => {
      const { result } = renderHook(() =>
        useExport({ elementId: 'non-existent-element', filename: 'test-file' })
      );

      await act(async () => {
        await result.current.exportPDF();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Export failed',
        description: 'Failed to export as PDF',
        variant: 'destructive',
      });
    });
  });

  describe('Loading state', () => {
    it('should set isExporting to true during export', async () => {
      const { result } = renderHook(() =>
        useExport({ elementId: 'test-element', filename: 'test-file' })
      );

      // Start export but don't await
      const exportPromise = act(async () => {
        await result.current.exportPNG();
      });

      // After the promise resolves, isExporting should be false
      await exportPromise;
      expect(result.current.isExporting).toBe(false);
    });
  });
});

