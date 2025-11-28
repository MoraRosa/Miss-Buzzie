import { useState, useEffect } from "react";
import { Bot, Key, Cpu, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getAISettings,
  saveAISettings,
  isWebLLMSupported,
  type AIProviderType,
  type AISettings,
} from "@/lib/aiProvider";

interface AISettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AISettingsDialog = ({ open, onOpenChange }: AISettingsDialogProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AISettings>({ provider: "webllm" });
  const webGPUSupported = isWebLLMSupported();

  useEffect(() => {
    if (open) {
      setSettings(getAISettings());
    }
  }, [open]);

  const handleSave = () => {
    // Validate API key if using API provider
    if ((settings.provider === "groq" || settings.provider === "openai") && !settings.apiKey) {
      toast({
        title: "API key required",
        description: `Please enter your ${settings.provider === "groq" ? "Groq" : "OpenAI"} API key.`,
        variant: "destructive",
      });
      return;
    }

    saveAISettings(settings);
    toast({
      title: "Settings saved",
      description: `Mizzie will now use ${settings.provider === "webllm" ? "WebLLM (browser)" : settings.provider.toUpperCase() + " API"}.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Mizzie AI Settings
          </DialogTitle>
          <DialogDescription>
            Choose how Mizzie processes your requests. WebLLM runs locally in your browser (free & private).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={settings.provider}
              onValueChange={(value: AIProviderType) =>
                setSettings({ ...settings, provider: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webllm" disabled={!webGPUSupported}>
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    <span>WebLLM (Browser)</span>
                    {!webGPUSupported && <span className="text-xs text-destructive">Not supported</span>}
                  </div>
                </SelectItem>
                <SelectItem value="groq">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Groq API (Fast)</span>
                  </div>
                </SelectItem>
                <SelectItem value="openai">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <span>OpenAI API</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Provider Info */}
          {settings.provider === "webllm" && (
            <p className="text-sm text-muted-foreground">
              🔒 Runs 100% in your browser. First use downloads ~2GB model. Free & private.
            </p>
          )}

          {/* API Key Input */}
          {(settings.provider === "groq" || settings.provider === "openai") && (
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={`Enter your ${settings.provider === "groq" ? "Groq" : "OpenAI"} API key`}
                value={settings.apiKey || ""}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {settings.provider === "groq" ? (
                  <>Get a free key at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline">console.groq.com</a></>
                ) : (
                  <>Get a key at <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a></>
                )}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AISettingsDialog;

