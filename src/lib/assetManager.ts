import {
  BrandAssetSchema,
  AssetsDataSchema,
  BrandColorsSchema
} from './validators/schemas';

export interface BrandAsset {
  id: string;
  name: string;
  type: 'image' | 'other';
  dataUrl: string;
  uploadedAt: string;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

const STORAGE_KEY = 'brandAssets';
const COLORS_KEY = 'brandColors';
const LOGO_KEY = 'companyLogo';

const DEFAULT_COLORS: BrandColors = {
  primary: '#FFA500',   // Mizzie orange
  secondary: '#6366F1', // Indigo
  accent: '#EC4899',    // Pink
};

export const saveAsset = (asset: Omit<BrandAsset, 'id' | 'uploadedAt'>): BrandAsset => {
  const assets = getAssets();
  const newAsset: BrandAsset = {
    ...asset,
    id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    uploadedAt: new Date().toISOString(),
  };

  // Validate new asset before saving
  const validation = BrandAssetSchema.safeParse(newAsset);
  if (!validation.success) {
    console.error('[assetManager] Invalid asset data:', validation.error.errors);
    throw new Error('Invalid asset data');
  }

  assets.push(newAsset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  return newAsset;
};

export const getAssets = (): BrandAsset[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    const validation = AssetsDataSchema.safeParse(parsed);
    if (validation.success) {
      return validation.data;
    }
    console.warn('[assetManager] Invalid assets data, returning empty array:', validation.error.errors);
    return [];
  } catch (error) {
    console.error('[assetManager] Failed to parse assets:', error);
    return [];
  }
};

export const deleteAsset = (id: string): void => {
  const assets = getAssets().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
};

export const convertFileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Brand Colors Management
export const saveBrandColors = (colors: BrandColors): void => {
  // Validate colors before saving
  const validation = BrandColorsSchema.safeParse(colors);
  if (!validation.success) {
    console.error('[assetManager] Invalid brand colors:', validation.error.errors);
    throw new Error('Invalid brand colors');
  }

  localStorage.setItem(COLORS_KEY, JSON.stringify(colors));
  // Dispatch custom event to notify components of color change
  window.dispatchEvent(new CustomEvent('brandColorsChanged', { detail: colors }));
};

export const getBrandColors = (): BrandColors => {
  const stored = localStorage.getItem(COLORS_KEY);
  if (!stored) return DEFAULT_COLORS;

  try {
    const parsed = JSON.parse(stored);
    const validation = BrandColorsSchema.safeParse(parsed);
    if (validation.success) {
      return validation.data;
    }
    console.warn('[assetManager] Invalid brand colors, returning defaults:', validation.error.errors);
    return DEFAULT_COLORS;
  } catch (error) {
    console.error('[assetManager] Failed to parse brand colors:', error);
    return DEFAULT_COLORS;
  }
};

// Company Logo Management (separate from assets for easy access)
export const saveCompanyLogo = (dataUrl: string): void => {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    console.error('[assetManager] Invalid logo data URL');
    throw new Error('Invalid logo data URL');
  }

  localStorage.setItem(LOGO_KEY, dataUrl);
  // Dispatch custom event to notify components of logo change
  window.dispatchEvent(new CustomEvent('companyLogoChanged', { detail: dataUrl }));
};

export const getCompanyLogo = (): string | null => {
  const logo = localStorage.getItem(LOGO_KEY);
  // Validate it's a proper data URL
  if (logo && typeof logo === 'string' && logo.startsWith('data:')) {
    return logo;
  }
  return null;
};
