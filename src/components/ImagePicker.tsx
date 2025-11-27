import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAssets, BrandAsset } from "@/lib/assetManager";
import { Image as ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImage: (imageUrl: string) => void;
}

const ImagePicker = ({ open, onOpenChange, onSelectImage }: ImagePickerProps) => {
  const [assets, setAssets] = useState<BrandAsset[]>([]);

  useEffect(() => {
    if (open) {
      // Refresh assets when modal opens
      const allAssets = getAssets();
      setAssets(allAssets);
    }
  }, [open]);

  const handleSelectImage = (imageUrl: string) => {
    onSelectImage(imageUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Select an image from your brand assets to insert into the slide
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No images uploaded yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload images in Brand Manager → Assets tab first
              </p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleSelectImage(asset.dataUrl)}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all hover:shadow-lg"
                >
                  <img
                    src={asset.dataUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center p-2">
                      <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs font-medium truncate">{asset.name}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePicker;

