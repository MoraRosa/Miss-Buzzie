import { useEffect, useState } from "react";
import { getAssets, BrandAsset } from "@/lib/assetManager";

const BrandHeader = () => {
  const [logoAsset, setLogoAsset] = useState<BrandAsset | null>(null);

  useEffect(() => {
    const assets = getAssets();
    const logo = assets.find(asset => asset.type === 'logo');
    setLogoAsset(logo || null);
  }, []);

  if (!logoAsset) return null;

  return (
    <div className="mb-6 pb-4 border-b flex justify-center print:mb-4">
      <img 
        src={logoAsset.dataUrl} 
        alt="Company Logo" 
        className="max-h-16 md:max-h-20 w-auto object-contain"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default BrandHeader;
