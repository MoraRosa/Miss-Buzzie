/**
 * Station 1: The Destination
 * 
 * Users define their brand name and the associations they want people
 * to have when they hear it. This is outcome-based branding.
 */

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Lightbulb } from "lucide-react";
import { StationProps } from "./types";
import { BrandAssociation } from "@/lib/brandStrategy";

// Suggested associations to inspire users
const SUGGESTED_ASSOCIATIONS = [
  "Innovative", "Trustworthy", "Bold", "Friendly", "Premium",
  "Sustainable", "Fast", "Reliable", "Creative", "Expert",
  "Affordable", "Luxurious", "Fun", "Professional", "Authentic",
];

const DestinationStation = ({ strategy, updateStrategy }: StationProps) => {
  const [newAssociation, setNewAssociation] = useState("");

  const addAssociation = (word: string) => {
    const trimmed = word.trim();
    if (!trimmed) return;
    
    // Check for duplicates
    if (strategy.associations.some(a => a.word.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }

    const newItem: BrandAssociation = {
      id: `assoc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      word: trimmed,
    };

    updateStrategy({
      associations: [...strategy.associations, newItem],
    });
    setNewAssociation("");
  };

  const removeAssociation = (id: string) => {
    updateStrategy({
      associations: strategy.associations.filter(a => a.id !== id),
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAssociation(newAssociation);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Brand Name Input */}
      <div className="space-y-2 sm:space-y-3">
        <Label htmlFor="brand-name" className="text-base sm:text-lg font-semibold">
          What's your brand called?
        </Label>
        <Input
          id="brand-name"
          value={strategy.brandName}
          onChange={(e) => updateStrategy({ brandName: e.target.value })}
          placeholder="Enter your brand name..."
          className="text-lg sm:text-xl h-12 sm:h-14 text-center font-medium"
        />
      </div>

      {/* Association Builder */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <Label className="text-base sm:text-lg font-semibold leading-snug">
            When people hear "{strategy.brandName || 'your brand'}", what should they think?
          </Label>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Add 3-5 words that capture what you want your brand to be known for.
          </p>
        </div>

        {/* Current Associations */}
        <div className="min-h-[70px] sm:min-h-[80px] p-3 sm:p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30">
          {strategy.associations.length === 0 ? (
            <p className="text-center text-muted-foreground text-xs sm:text-sm py-3 sm:py-4">
              Your brand associations will appear here...
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {strategy.associations.map((assoc) => (
                <Badge
                  key={assoc.id}
                  variant="secondary"
                  className="text-sm sm:text-base px-2.5 sm:px-4 py-1 sm:py-2 gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 hover:from-amber-200 hover:to-orange-200 transition-all"
                >
                  {assoc.word}
                  <button
                    onClick={() => removeAssociation(assoc.id)}
                    className="ml-0.5 sm:ml-1 hover:text-destructive transition-colors"
                    aria-label={`Remove ${assoc.word}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Add Association Input */}
        <div className="flex gap-2">
          <Input
            value={newAssociation}
            onChange={(e) => setNewAssociation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type and press Enter..."
            className="flex-1 text-sm sm:text-base"
          />
          <Button
            onClick={() => addAssociation(newAssociation)}
            disabled={!newAssociation.trim()}
            className="px-3 sm:px-4"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>Need inspiration? Tap to add:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {SUGGESTED_ASSOCIATIONS.filter(
              s => !strategy.associations.some(a => a.word.toLowerCase() === s.toLowerCase())
            ).slice(0, 8).map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer hover:bg-muted transition-colors text-xs sm:text-sm px-2 sm:px-2.5 py-0.5 sm:py-1"
                onClick={() => addAssociation(suggestion)}
              >
                + {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationStation;

