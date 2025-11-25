import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Image, X, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { saveAsset, getAssets, deleteAsset, convertFileToDataUrl, BrandAsset } from "@/lib/assetManager";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AssetManager = () => {
  const [assets, setAssets] = useState<BrandAsset[]>(getAssets());
  const [uploading, setUploading] = useState(false);
  const [assetType, setAssetType] = useState<'logo' | 'image' | 'other'>('logo');
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Image className="h-4 w-4 mr-2" />
          Brand Assets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Brand Assets</DialogTitle>
          <DialogDescription>
            Upload your logo and branding materials. These will be included in your exports.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset-type">Asset Type</Label>
            <Select value={assetType} onValueChange={(value: any) => setAssetType(value)}>
              <SelectTrigger id="asset-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logo">Logo</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
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

          {assets.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Uploaded Assets ({assets.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <Card key={asset.id} className="relative group overflow-hidden">
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
      </DialogContent>
    </Dialog>
  );
};

export default AssetManager;
