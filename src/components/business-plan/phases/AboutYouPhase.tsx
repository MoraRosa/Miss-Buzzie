/**
 * Phase 1: About You
 * 
 * Captures founder profile information including language proficiency,
 * self-employment history, entrepreneurship programs, skills, and support needs.
 */

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { PhaseProps } from "../types";

const SUPPORT_AREAS = [
  { id: "business-planning", label: "Business Planning" },
  { id: "marketing", label: "Marketing & Sales" },
  { id: "financial-management", label: "Financial Management" },
  { id: "legal-regulatory", label: "Legal & Regulatory" },
  { id: "technology", label: "Technology & Digital" },
  { id: "operations", label: "Operations & Logistics" },
  { id: "hr-hiring", label: "HR & Hiring" },
  { id: "funding", label: "Funding & Investment" },
];

const AboutYouPhase = ({ data, updateData }: PhaseProps) => {
  const toggleSupportArea = (areaId: string, checked: boolean) => {
    const existing = data.supportAreasNeeded.find(a => a.id === areaId);
    if (existing) {
      updateData({
        supportAreasNeeded: data.supportAreasNeeded.map(a =>
          a.id === areaId ? { ...a, selected: checked } : a
        ),
      });
    } else {
      updateData({
        supportAreasNeeded: [
          ...data.supportAreasNeeded,
          { id: areaId, area: SUPPORT_AREAS.find(s => s.id === areaId)?.label || areaId, selected: checked },
        ],
      });
    }
  };

  const isSupportAreaSelected = (areaId: string) => {
    return data.supportAreasNeeded.find(a => a.id === areaId)?.selected || false;
  };

  return (
    <div className="space-y-6">
      {/* Language Proficiency */}
      <div className="space-y-2">
        <Label htmlFor="language" className="text-base font-semibold">
          What languages do you speak fluently?
        </Label>
        <Textarea
          id="language"
          value={data.languageProficiency}
          onChange={(e) => updateData({ languageProficiency: e.target.value })}
          placeholder="e.g., English (fluent), French (conversational), Spanish (basic)..."
          className="min-h-[80px]"
        />
      </div>

      {/* Self-Employment History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="self-employed" className="text-base font-semibold">
            Have you been self-employed before?
          </Label>
          <Switch
            id="self-employed"
            checked={data.hasBeenSelfEmployed}
            onCheckedChange={(checked) => updateData({ hasBeenSelfEmployed: checked })}
          />
        </div>
        {data.hasBeenSelfEmployed && (
          <Textarea
            value={data.selfEmploymentDetails}
            onChange={(e) => updateData({ selfEmploymentDetails: e.target.value })}
            placeholder="Describe your previous self-employment experience..."
            className="min-h-[80px]"
          />
        )}
      </div>

      {/* Entrepreneurship Programs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="programs" className="text-base font-semibold">
            Have you completed any entrepreneurship programs?
          </Label>
          <Switch
            id="programs"
            checked={data.hasEntrepreneurshipPrograms}
            onCheckedChange={(checked) => updateData({ hasEntrepreneurshipPrograms: checked })}
          />
        </div>
        {data.hasEntrepreneurshipPrograms && (
          <Textarea
            value={data.entrepreneurshipProgramDetails}
            onChange={(e) => updateData({ entrepreneurshipProgramDetails: e.target.value })}
            placeholder="List the programs you've completed (e.g., incubators, accelerators, courses)..."
            className="min-h-[80px]"
          />
        )}
      </div>

      {/* Relevant Skills */}
      <div className="space-y-2">
        <Label htmlFor="skills" className="text-base font-semibold">
          What relevant skills and experience do you bring?
        </Label>
        <Textarea
          id="skills"
          value={data.relevantSkills}
          onChange={(e) => updateData({ relevantSkills: e.target.value })}
          placeholder="Describe your relevant skills, education, and work experience..."
          className="min-h-[100px]"
        />
      </div>

      {/* License Requirements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="license" className="text-base font-semibold">
            Does your business require special licenses or certifications?
          </Label>
          <Switch
            id="license"
            checked={data.needsLicense}
            onCheckedChange={(checked) => updateData({ needsLicense: checked })}
          />
        </div>
        {data.needsLicense && (
          <Textarea
            value={data.licenseDetails}
            onChange={(e) => updateData({ licenseDetails: e.target.value })}
            placeholder="What licenses or certifications are required? Do you have them?"
            className="min-h-[80px]"
          />
        )}
      </div>

      {/* Support Areas Needed */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          What areas do you need support with?
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {SUPPORT_AREAS.map((area) => (
            <div key={area.id} className="flex items-center space-x-2">
              <Checkbox
                id={area.id}
                checked={isSupportAreaSelected(area.id)}
                onCheckedChange={(checked) => toggleSupportArea(area.id, checked as boolean)}
              />
              <Label htmlFor={area.id} className="text-sm font-normal cursor-pointer">
                {area.label}
              </Label>
            </div>
          ))}
        </div>
        <Textarea
          value={data.supportAreasOther}
          onChange={(e) => updateData({ supportAreasOther: e.target.value })}
          placeholder="Any other areas where you need support?"
          className="min-h-[60px]"
        />
      </div>

      {/* Personal Constraints */}
      <div className="space-y-2">
        <Label htmlFor="constraints" className="text-base font-semibold">
          Any personal constraints to consider?
        </Label>
        <p className="text-sm text-muted-foreground">
          Time availability, family commitments, health considerations, etc.
        </p>
        <Textarea
          id="constraints"
          value={data.personalConstraints}
          onChange={(e) => updateData({ personalConstraints: e.target.value })}
          placeholder="Describe any constraints that might affect your business..."
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
};

export default AboutYouPhase;

