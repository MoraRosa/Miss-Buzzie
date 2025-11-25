export interface BrandAsset {
  id: string;
  name: string;
  type: 'logo' | 'image' | 'other';
  dataUrl: string;
  uploadedAt: string;
}

const STORAGE_KEY = 'brandAssets';

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
