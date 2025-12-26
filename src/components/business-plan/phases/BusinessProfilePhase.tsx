/**
 * Phase 2: Business Profile
 * 
 * Captures business identity including name, contact info, type, and classification.
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Globe } from "lucide-react";
import { PhaseProps } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "Corporation",
  "Limited Liability Company (LLC)",
  "Cooperative",
  "Non-Profit",
  "Other",
];

const BUSINESS_CLASSIFICATIONS = [
  "Retail",
  "Service",
  "Manufacturing",
  "Technology",
  "Food & Beverage",
  "Healthcare",
  "Education",
  "Construction",
  "Professional Services",
  "Creative/Media",
  "Other",
];

const SOCIAL_PLATFORMS = [
  "Facebook",
  "Instagram",
  "Twitter/X",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "Pinterest",
  "Other",
];

const BusinessProfilePhase = ({ data, updateData }: PhaseProps) => {
  const [newPlatform, setNewPlatform] = useState("");

  const addSocialMedia = (platform: string) => {
    if (!platform.trim()) return;
    const id = `social-${Date.now()}`;
    updateData({
      socialMediaUrls: [
        ...data.socialMediaUrls,
        { id, platform, url: "" },
      ],
    });
    setNewPlatform("");
  };

  const updateSocialUrl = (id: string, url: string) => {
    updateData({
      socialMediaUrls: data.socialMediaUrls.map(s =>
        s.id === id ? { ...s, url } : s
      ),
    });
  };

  const removeSocialMedia = (id: string) => {
    updateData({
      socialMediaUrls: data.socialMediaUrls.filter(s => s.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="business-name" className="text-base font-semibold">
          Business Name
        </Label>
        <Input
          id="business-name"
          value={data.businessName}
          onChange={(e) => updateData({ businessName: e.target.value })}
          placeholder="Enter your business name..."
          className="text-lg"
        />
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="business-email">Business Email</Label>
          <Input
            id="business-email"
            type="email"
            value={data.businessEmail}
            onChange={(e) => updateData({ businessEmail: e.target.value })}
            placeholder="contact@yourbusiness.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-website">Website</Label>
          <Input
            id="business-website"
            value={data.businessWebsite}
            onChange={(e) => updateData({ businessWebsite: e.target.value })}
            placeholder="https://yourbusiness.com"
          />
        </div>
      </div>

      {/* Business Address */}
      <div className="space-y-2">
        <Label htmlFor="business-address">Business Address</Label>
        <Textarea
          id="business-address"
          value={data.businessAddress}
          onChange={(e) => updateData({ businessAddress: e.target.value })}
          placeholder="Enter your business address..."
          className="min-h-[60px]"
        />
      </div>

      {/* Social Media */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Social Media Presence</Label>
        <div className="space-y-2">
          {data.socialMediaUrls.map((social) => (
            <div key={social.id} className="flex items-center gap-2">
              <Badge variant="secondary" className="min-w-[100px] justify-center">
                {social.platform}
              </Badge>
              <Input
                value={social.url}
                onChange={(e) => updateSocialUrl(social.id, e.target.value)}
                placeholder={`Your ${social.platform} URL...`}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSocialMedia(social.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Select value={newPlatform} onValueChange={setNewPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Add platform..." />
            </SelectTrigger>
            <SelectContent>
              {SOCIAL_PLATFORMS.filter(
                p => !data.socialMediaUrls.some(s => s.platform === p)
              ).map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => addSocialMedia(newPlatform)}
            disabled={!newPlatform}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Business Type & Classification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Business Type</Label>
          <Select
            value={data.businessType}
            onValueChange={(value) => updateData({ businessType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business type..." />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Business Classification</Label>
          <Select
            value={data.businessClassification}
            onValueChange={(value) => updateData({ businessClassification: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select classification..." />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_CLASSIFICATIONS.map((classification) => (
                <SelectItem key={classification} value={classification}>
                  {classification}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Business Plan */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="has-plan" className="text-base font-semibold">
            Do you have a current business plan?
          </Label>
          <Switch
            id="has-plan"
            checked={data.hasCurrentBusinessPlan}
            onCheckedChange={(checked) => updateData({ hasCurrentBusinessPlan: checked })}
          />
        </div>
      </div>

      {/* Business Idea */}
      <div className="space-y-2">
        <Label htmlFor="business-idea" className="text-base font-semibold">
          Describe your business idea
        </Label>
        <p className="text-sm text-muted-foreground">
          What problem do you solve? What makes your business unique?
        </p>
        <Textarea
          id="business-idea"
          value={data.businessIdea}
          onChange={(e) => updateData({ businessIdea: e.target.value })}
          placeholder="Describe your business idea in detail..."
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default BusinessProfilePhase;

