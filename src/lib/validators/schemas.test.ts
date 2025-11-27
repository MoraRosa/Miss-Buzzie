import { describe, it, expect } from 'vitest';
import {
  CanvasDataSchema,
  SWOTDataSchema,
  PortersDataSchema,
  RoadmapDataSchema,
  ChecklistDataSchema,
  ForecastDataSchema,
  OrgChartDataSchema,
  PitchDeckDataSchema,
  MarketResearchDataSchema,
  BrandAssetSchema,
  BrandColorsSchema,
  ImportDataSchema,
  validateDataItem,
} from './schemas';

describe('Zod Validation Schemas', () => {
  describe('CanvasDataSchema', () => {
    it('should accept valid canvas data', () => {
      const validData = {
        keyPartners: 'Partner 1',
        keyActivities: 'Activity 1',
        keyResources: 'Resource 1',
        valuePropositions: 'Value 1',
        customerRelationships: 'Relationship 1',
        channels: 'Channel 1',
        customerSegments: 'Segment 1',
        costStructure: 'Cost 1',
        revenueStreams: 'Revenue 1',
      };

      const result = CanvasDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should apply defaults for missing fields', () => {
      const partialData = { keyPartners: 'Partner 1' };
      const result = CanvasDataSchema.safeParse(partialData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.keyActivities).toBe('');
        expect(result.data.keyPartners).toBe('Partner 1');
      }
    });

    it('should reject invalid types', () => {
      const invalidData = { keyPartners: 123 }; // number instead of string
      const result = CanvasDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('SWOTDataSchema', () => {
    it('should accept valid SWOT data', () => {
      const validData = {
        strengths: [{ id: '1', text: 'Strong brand' }],
        weaknesses: [{ id: '2', text: 'Limited budget' }],
        opportunities: [{ id: '3', text: 'Market growth' }],
        threats: [{ id: '4', text: 'Competition' }],
      };

      const result = SWOTDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject items without required fields', () => {
      const invalidData = {
        strengths: [{ id: '1' }], // missing 'text'
        weaknesses: [],
        opportunities: [],
        threats: [],
      };

      const result = SWOTDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('PortersDataSchema', () => {
    it('should accept valid ratings', () => {
      const validData = {
        competitiveRivalry: { rating: 'high', factors: [], notes: '' },
        supplierPower: { rating: 'medium', factors: [], notes: '' },
        buyerPower: { rating: 'low', factors: [], notes: '' },
        threatOfSubstitutes: { rating: '', factors: [], notes: '' },
        threatOfNewEntrants: { rating: 'high', factors: [], notes: '' },
      };

      const result = PortersDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid ratings', () => {
      const invalidData = {
        competitiveRivalry: { rating: 'invalid', factors: [], notes: '' },
        supplierPower: { rating: 'medium', factors: [], notes: '' },
        buyerPower: { rating: 'low', factors: [], notes: '' },
        threatOfSubstitutes: { rating: '', factors: [], notes: '' },
        threatOfNewEntrants: { rating: 'high', factors: [], notes: '' },
      };

      const result = PortersDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('BrandColorsSchema', () => {
    it('should accept valid hex colors', () => {
      const validColors = {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
      };

      const result = BrandColorsSchema.safeParse(validColors);
      expect(result.success).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      const invalidColors = {
        primary: 'red', // not hex
        secondary: '#10B981',
        accent: '#F59E0B',
      };

      const result = BrandColorsSchema.safeParse(invalidColors);
      expect(result.success).toBe(false);
    });

    it('should reject 3-digit hex colors', () => {
      const shortHex = {
        primary: '#FFF', // 3-digit not allowed
        secondary: '#10B981',
        accent: '#F59E0B',
      };

      const result = BrandColorsSchema.safeParse(shortHex);
      expect(result.success).toBe(false);
    });
  });

  describe('validateDataItem helper', () => {
    it('should return success for valid JSON and schema match', () => {
      const validJson = JSON.stringify({ keyPartners: 'Test' });
      const result = validateDataItem(validJson, CanvasDataSchema);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.keyPartners).toBe('Test');
      }
    });

    it('should return error for invalid JSON', () => {
      const invalidJson = 'not valid json {';
      const result = validateDataItem(invalidJson, CanvasDataSchema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid JSON format');
      }
    });

    it('should return error for schema mismatch', () => {
      const invalidData = JSON.stringify({ keyPartners: 123 });
      const result = validateDataItem(invalidData, CanvasDataSchema);

      expect(result.success).toBe(false);
    });
  });
});

