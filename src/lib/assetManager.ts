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

export const saveAsset = (asset: Omit<BrandAsset, 'id' | 'uploadedAt'>): BrandAsset => {
  const assets = getAssets();
  const newAsset: BrandAsset = {
    ...asset,
    id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    uploadedAt: new Date().toISOString(),
  };
  assets.push(newAsset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  return newAsset;
};

export const getAssets = (): BrandAsset[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
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
  localStorage.setItem(COLORS_KEY, JSON.stringify(colors));
  // Dispatch custom event to notify components of color change
  window.dispatchEvent(new CustomEvent('brandColorsChanged', { detail: colors }));
};

export const getBrandColors = (): BrandColors => {
  const stored = localStorage.getItem(COLORS_KEY);
  return stored ? JSON.parse(stored) : {
    primary: '#FFA500',   // Mizzie orange
    secondary: '#6366F1', // Indigo
    accent: '#EC4899',    // Pink
  };
};

// Company Logo Management (separate from assets for easy access)
export const saveCompanyLogo = (dataUrl: string): void => {
  localStorage.setItem(LOGO_KEY, dataUrl);
  // Dispatch custom event to notify components of logo change
  window.dispatchEvent(new CustomEvent('companyLogoChanged', { detail: dataUrl }));
};

export const getCompanyLogo = (): string | null => {
  return localStorage.getItem(LOGO_KEY);
};
