import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Image, X, Upload, Palette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { saveAsset, getAssets, deleteAsset, convertFileToDataUrl, BrandAsset, saveBrandColors, getBrandColors, BrandColors, saveCompanyLogo, getCompanyLogo } from "@/lib/assetManager";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const AssetManager = () => {
  const [assets, setAssets] = useState<BrandAsset[]>(getAssets());
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [assetType, setAssetType] = useState<'image' | 'other'>('image');
  const [brandColors, setBrandColors] = useState<BrandColors>(getBrandColors());
  const [companyLogo, setCompanyLogo] = useState<string | null>(getCompanyLogo());
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const dataUrl = await convertFileToDataUrl(file);
      const newAsset = saveAsset({
        name: file.name,
        type: assetType,
        dataUrl,
      });

      setAssets([...assets, newAsset]);
      
      toast({
        title: "Asset uploaded",
        description: `${file.name} has been added to your brand assets`,
      });
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload asset",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAsset = (id: string) => {
    deleteAsset(id);
    setAssets(assets.filter(a => a.id !== id));
    toast({
      title: "Asset deleted",
      description: "The asset has been removed",
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingLogo(true);
    try {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const dataUrl = await convertFileToDataUrl(file);
      saveCompanyLogo(dataUrl);
      setCompanyLogo(dataUrl);

      toast({
        title: "Logo uploaded",
        description: "Your company logo has been saved and will be used across all tabs",
      });

      // Reset file input
      e.target.value = '';
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setUploadingLogo(true);
    try {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const dataUrl = await convertFileToDataUrl(file);
      saveCompanyLogo(dataUrl);
      setCompanyLogo(dataUrl);

      toast({
        title: "Logo uploaded",
        description: "Your company logo has been saved and will be used across all tabs",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleAssetDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const dataUrl = await convertFileToDataUrl(file);
      const newAsset = saveAsset({
        name: file.name,
        type: assetType,
        dataUrl,
      });

      setAssets([...assets, newAsset]);
      toast({
        title: "Asset uploaded",
        description: `${file.name} has been added to your brand assets`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload asset",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleColorChange = (colorType: keyof BrandColors, value: string) => {
    const newColors = { ...brandColors, [colorType]: value };
    setBrandColors(newColors);
    saveBrandColors(newColors);
    toast({
      title: "Colors updated",
      description: "Your brand colors have been saved",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 px-2 md:px-3">
          <Palette className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Brand Manager</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[85vh] md:max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Brand Manager</DialogTitle>
          <DialogDescription>
            Manage your brand colors, logo, and images. These will be used across all tabs and exports.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="colors">
              <Palette className="h-4 w-4 mr-2" />
              Brand Colors
            </TabsTrigger>
            <TabsTrigger value="assets">
              <Image className="h-4 w-4 mr-2" />
              Logo & Images
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-900 dark:text-blue-100">
                💡 <strong>Tip:</strong> Go to <strong>Pitch Deck → Preview Mode</strong> to see your brand colors in action!
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="primary-color"
                      type="color"
                      value={brandColors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={brandColors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="flex-1 font-mono"
                      placeholder="#FFA500"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Main brand color used in headers and accents</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={brandColors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={brandColors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="flex-1 font-mono"
                      placeholder="#6366F1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Supporting color for backgrounds and elements</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="accent-color"
                      type="color"
                      value={brandColors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={brandColors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="flex-1 font-mono"
                      placeholder="#EC4899"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Highlight color for call-to-actions and emphasis</p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="text-sm font-medium mb-3">Color Preview</h4>
                <div className="flex gap-2">
                  <div
                    className="flex-1 h-20 rounded-md border-2 border-border flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: brandColors.primary }}
                  >
                    Primary
                  </div>
                  <div
                    className="flex-1 h-20 rounded-md border-2 border-border flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: brandColors.secondary }}
                  >
                    Secondary
                  </div>
                  <div
                    className="flex-1 h-20 rounded-md border-2 border-border flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: brandColors.accent }}
                  >
                    Accent
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4 mt-4">
            <div className="space-y-6">
              {/* Company Logo Section */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="text-sm font-medium mb-3">Company Logo</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Upload your company logo. It will be used across all tabs (Pitch Deck, Canvas, etc.)
                </p>

                <div className="flex gap-4 items-start">
                  {companyLogo && (
                    <div className="w-32 h-32 border-2 border-border rounded-lg overflow-hidden bg-white flex items-center justify-center p-2">
                      <img
                        src={companyLogo}
                        alt="Company Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors"
                        onDrop={handleLogoDrop}
                        onDragOver={handleDragOver}
                      >
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-1">
                          {uploadingLogo ? "Uploading..." : companyLogo ? "Replace logo" : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WebP up to 5MB
                        </p>
                      </div>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploadingLogo}
                      />
                    </Label>
                  </div>
                </div>
              </div>

              {/* Other Assets Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Additional Brand Assets</h4>
                <p className="text-xs text-muted-foreground">
                  Upload images and assets to use in your pitch deck slides, presentations, and other materials
                </p>

                <div className="space-y-2">
                  <Label htmlFor="asset-type">Asset Type</Label>
                  <Select value={assetType} onValueChange={(value: 'image' | 'other') => setAssetType(value)}>
                    <SelectTrigger id="asset-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors"
                      onDrop={handleAssetDrop}
                      onDragOver={handleDragOver}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WebP up to 5MB
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </Label>
                </div>
              </div>

              {assets.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">
                    Uploaded Assets ({assets.length})
                    <span className="text-xs text-muted-foreground font-normal ml-2">
                      • Drag images to Pitch Deck slides
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {assets.map((asset) => (
                      <Card
                        key={asset.id}
                        className="relative group overflow-hidden cursor-move"
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('image/url', asset.dataUrl);
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                      >
                        <div className="aspect-square relative">
                          <img
                            src={asset.dataUrl}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteAsset(asset.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-2 border-t">
                          <p className="text-xs font-medium truncate">{asset.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{asset.type}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AssetManager;
