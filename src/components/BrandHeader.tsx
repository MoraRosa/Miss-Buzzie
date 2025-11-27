import { useEffect, useState } from "react";
import { getCompanyLogo } from "@/lib/assetManager";

const BrandHeader = () => {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    setLogo(getCompanyLogo());

    // Listen for logo changes
    const handleLogoChange = (event: CustomEvent<string>) => {
      setLogo(event.detail);
    };

    window.addEventListener('companyLogoChanged', handleLogoChange as EventListener);

    return () => {
      window.removeEventListener('companyLogoChanged', handleLogoChange as EventListener);
    };
  }, []);

  if (!logo) return null;

  return (
    <div className="mb-6 pb-4 border-b flex justify-center print:mb-4">
      <img
        src={logo}
        alt="Company Logo"
        className="max-h-16 md:max-h-20 w-auto object-contain"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default BrandHeader;
