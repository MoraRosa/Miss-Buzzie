import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return default value when localStorage is empty', () => {
      const { result } = renderHook(() => 
        useLocalStorage('test-key', 'default-value')
      );

      expect(result.current[0]).toBe('default-value');
    });

    it('should load existing value from localStorage', () => {
      localStorage.setItem('test-key', JSON.stringify('stored-value'));

      const { result } = renderHook(() => 
        useLocalStorage('test-key', 'default-value')
      );

      expect(result.current[0]).toBe('stored-value');
    });

    it('should update state and localStorage when setting value', async () => {
      const { result } = renderHook(() => 
        useLocalStorage('test-key', 'initial')
      );

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'test-key',
          JSON.stringify('updated')
        );
      });
    });

    it('should handle complex objects', () => {
      const complexValue = { name: 'Test', items: [1, 2, 3], nested: { a: 'b' } };
      localStorage.setItem('test-key', JSON.stringify(complexValue));

      const { result } = renderHook(() => 
        useLocalStorage('test-key', {})
      );

      expect(result.current[0]).toEqual(complexValue);
    });
  });

  describe('Zod validation', () => {
    const userSchema = z.object({
      name: z.string(),
      age: z.number().min(0),
    });

    it('should accept valid data matching schema', () => {
      const validData = { name: 'John', age: 30 };
      localStorage.setItem('user', JSON.stringify(validData));

      const { result } = renderHook(() => 
        useLocalStorage('user', { name: '', age: 0 }, { schema: userSchema })
      );

      expect(result.current[0]).toEqual(validData);
    });

    it('should reject invalid data and keep default', () => {
      const invalidData = { name: 123, age: 'invalid' };
      localStorage.setItem('user', JSON.stringify(invalidData));
      const onError = vi.fn();

      const { result } = renderHook(() => 
        useLocalStorage('user', { name: 'Default', age: 0 }, { 
          schema: userSchema,
          onError
        })
      );

      expect(result.current[0]).toEqual({ name: 'Default', age: 0 });
      expect(onError).toHaveBeenCalled();
    });

    it('should handle schema with default values', () => {
      const schemaWithDefaults = z.object({
        name: z.string().default('Anonymous'),
        age: z.number().default(0),
      });

      // Empty object in storage
      localStorage.setItem('user', JSON.stringify({}));

      const { result } = renderHook(() => 
        useLocalStorage('user', { name: '', age: 0 }, { schema: schemaWithDefaults })
      );

      expect(result.current[0]).toEqual({ name: 'Anonymous', age: 0 });
    });
  });

  describe('Migration', () => {
    it('should apply migration function to stored data', () => {
      // Old data format
      localStorage.setItem('settings', JSON.stringify({ oldField: 'value' }));

      const migrate = (data: Record<string, unknown>) => ({
        newField: data.oldField || 'default',
      });

      const { result } = renderHook(() => 
        useLocalStorage('settings', { newField: '' }, { migrate })
      );

      expect(result.current[0]).toEqual({ newField: 'value' });
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON gracefully', () => {
      localStorage.getItem = vi.fn().mockReturnValue('not valid json {');
      const onError = vi.fn();

      const { result } = renderHook(() => 
        useLocalStorage('test-key', 'default', { onError })
      );

      expect(result.current[0]).toBe('default');
      expect(onError).toHaveBeenCalled();
    });

    it('should call onSaveSuccess when save succeeds', async () => {
      const onSaveSuccess = vi.fn();

      const { result } = renderHook(() => 
        useLocalStorage('test-key', 'initial', { onSaveSuccess })
      );

      act(() => {
        result.current[1]('new-value');
      });

      await waitFor(() => {
        expect(onSaveSuccess).toHaveBeenCalled();
      });
    });
  });
});

