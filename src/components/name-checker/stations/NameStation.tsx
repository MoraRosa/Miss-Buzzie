/**
 * Station 1: Brand Name Entry
 * 
 * Users enter their brand name and slogan.
 * Also shows name suggestions if needed.
 */

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, Lightbulb, Check, X, RefreshCw } from "lucide-react";
import type { StationProps, NameSuggestion } from "../types";

// Simple name suggestion generator
const generateSuggestions = (name: string): NameSuggestion[] => {
  if (!name || name.length < 2) return [];
  
  const suggestions: NameSuggestion[] = [];
  const prefixes = ["go", "get", "my", "the", "try", "use"];
  const suffixes = ["ly", "ify", "io", "hq", "app", "hub", "lab", "co"];
  
  // Add prefix suggestions
  prefixes.slice(0, 2).forEach(prefix => {
    suggestions.push({
      name: `${prefix}${name}`,
      type: "prefix",
      reason: `Professional prefix "${prefix}" adds action`,
    });
  });
  
  // Add suffix suggestions
  suffixes.slice(0, 3).forEach(suffix => {
    suggestions.push({
      name: `${name}${suffix}`,
      type: "suffix",
      reason: `Tech-friendly suffix "${suffix}"`,
    });
  });
  
  // Acronym if name has multiple words
  if (name.includes(" ") || name.length > 8) {
    const words = name.split(/(?=[A-Z])|[\s-]+/);
    if (words.length >= 2) {
      const acronym = words.map(w => w[0]).join("").toLowerCase();
      suggestions.push({
        name: acronym,
        type: "acronym",
        reason: "Short, memorable acronym",
      });
    }
  }
  
  return suggestions;
};

const NameStation = ({ brandName, currentSearch, data, updateSearch, updateData, markStationComplete }: StationProps) => {
  const [localName, setLocalName] = useState(brandName || "");
  const [localSlogan, setLocalSlogan] = useState(data.currentSlogan || "");
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (localName.length >= 2) {
      setSuggestions(generateSuggestions(localName));
    } else {
      setSuggestions([]);
    }
  }, [localName]);

  useEffect(() => {
    // Auto-complete station when name is entered
    if (localName.trim().length > 0) {
      markStationComplete();
    }
  }, [localName, markStationComplete]);

  const handleNameChange = (value: string) => {
    const cleanName = value.toLowerCase().replace(/\s+/g, "");
    setLocalName(cleanName);
    updateSearch({ name: cleanName });
    updateData({ currentBrandName: cleanName });
  };

  const handleSloganChange = (value: string) => {
    setLocalSlogan(value);
    updateSearch({ slogan: value });
    updateData({ currentSlogan: value });
  };

  const applySuggestion = (suggestion: NameSuggestion) => {
    handleNameChange(suggestion.name);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-6">
      {/* Main Name Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Brand Name *</label>
          <div className="relative">
            <Input
              placeholder="Enter your brand name..."
              value={localName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="text-xl h-14 pr-12 font-medium"
            />
            {localName && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Check className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Letters and numbers only. Spaces will be removed.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Slogan / Tagline (optional)</label>
          <Input
            placeholder="e.g., Making your dreams reality"
            value={localSlogan}
            onChange={(e) => handleSloganChange(e.target.value)}
            className="h-12"
          />
        </div>
      </div>

      {/* Name Preview */}
      {localName && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bold text-primary">{localName}</h3>
            {localSlogan && (
              <p className="text-muted-foreground italic">"{localSlogan}"</p>
            )}
          </div>
        </Card>
      )}

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            {showSuggestions ? "Hide" : "Show"} Name Alternatives ({suggestions.length})
          </Button>

          {showSuggestions && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => applySuggestion(s)}
                  className="p-3 text-left rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.reason}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NameStation;

