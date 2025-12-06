/**
 * Station 2: The Archetype
 * 
 * Users select their primary and secondary brand archetypes
 * from the 12 Jungian archetypes. Features interactive flip cards.
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { StationProps } from "./types";
import { ARCHETYPES, BrandArchetype, ArchetypeInfo } from "@/lib/brandStrategy";

interface ArchetypeCardProps {
  archetype: ArchetypeInfo;
  isPrimary: boolean;
  isSecondary: boolean;
  onSelect: (id: BrandArchetype, type: 'primary' | 'secondary') => void;
}

const ArchetypeCard = ({ archetype, isPrimary, isSecondary, onSelect }: ArchetypeCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const isSelected = isPrimary || isSecondary;

  // Toggle flip on tap for mobile, hover for desktop
  const handleTap = () => setIsFlipped(!isFlipped);

  return (
    <div
      className="relative h-[260px] sm:h-[280px] cursor-pointer perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={handleTap}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of card */}
        <Card
          className={`absolute inset-0 p-4 flex flex-col items-center justify-center text-center backface-hidden transition-all ${
            isSelected
              ? 'ring-2 ring-offset-2 shadow-lg'
              : 'hover:shadow-md'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            borderColor: isSelected ? archetype.color : undefined,
          }}
        >
          {/* Selection Badge */}
          {isPrimary && (
            <Badge className="absolute top-2 right-2 bg-amber-500">Primary</Badge>
          )}
          {isSecondary && (
            <Badge className="absolute top-2 right-2 bg-orange-500">Secondary</Badge>
          )}

          <span className="text-4xl mb-2">{archetype.emoji}</span>
          <h3 className="font-bold text-lg">{archetype.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 italic">"{archetype.tagline}"</p>
          <p className="text-xs text-muted-foreground mt-3 hidden sm:block">Hover to see more</p>
          <p className="text-xs text-muted-foreground mt-3 sm:hidden">Tap to flip</p>
        </Card>

        {/* Back of card */}
        <Card
          className="absolute inset-0 p-4 flex flex-col backface-hidden overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: `${archetype.color}10`,
            borderColor: archetype.color,
          }}
        >
          <h4 className="font-semibold text-sm mb-2" style={{ color: archetype.color }}>
            {archetype.name} Traits
          </h4>
          <div className="flex flex-wrap gap-1 mb-2">
            {archetype.traits.map((trait) => (
              <Badge key={trait} variant="outline" className="text-xs">
                {trait}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-1">Famous brands:</p>
          <p className="text-xs font-medium mb-3 line-clamp-1">{archetype.brands.join(', ')}</p>

          <div className="mt-auto flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(archetype.id, 'primary'); }}
              className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                isPrimary
                  ? 'bg-amber-500 text-white'
                  : 'bg-muted hover:bg-amber-100 dark:hover:bg-amber-900/30'
              }`}
            >
              {isPrimary ? <Check className="h-3 w-3 mx-auto" /> : 'Primary'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(archetype.id, 'secondary'); }}
              className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                isSecondary
                  ? 'bg-orange-500 text-white'
                  : 'bg-muted hover:bg-orange-100 dark:hover:bg-orange-900/30'
              }`}
            >
              {isSecondary ? <Check className="h-3 w-3 mx-auto" /> : 'Secondary'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ArchetypeStation = ({ strategy, updateStrategy }: StationProps) => {
  const handleSelect = (archetypeId: BrandArchetype, type: 'primary' | 'secondary') => {
    if (type === 'primary') {
      // If selecting as primary, remove from secondary if it was there
      const updates: { primaryArchetype: BrandArchetype; secondaryArchetype?: BrandArchetype | '' } = {
        primaryArchetype: archetypeId,
      };
      if (strategy.secondaryArchetype === archetypeId) {
        updates.secondaryArchetype = '';
      }
      updateStrategy(updates);
    } else {
      // If selecting as secondary, remove from primary if it was there
      const updates: { secondaryArchetype: BrandArchetype; primaryArchetype?: BrandArchetype | '' } = {
        secondaryArchetype: archetypeId,
      };
      if (strategy.primaryArchetype === archetypeId) {
        updates.primaryArchetype = '';
      }
      updateStrategy(updates);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Every iconic brand embodies an archetype. Select your <strong>primary</strong> (main personality)
          and optionally a <strong>secondary</strong> (supporting traits).
        </p>
      </div>

      {/* Selected Summary */}
      {(strategy.primaryArchetype || strategy.secondaryArchetype) && (
        <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
          {strategy.primaryArchetype && (
            <Badge className="text-xs sm:text-sm py-0.5 sm:py-1 px-2 sm:px-3 bg-amber-500">
              Primary: {ARCHETYPES.find(a => a.id === strategy.primaryArchetype)?.name}
            </Badge>
          )}
          {strategy.secondaryArchetype && (
            <Badge className="text-xs sm:text-sm py-0.5 sm:py-1 px-2 sm:px-3 bg-blue-500">
              Secondary: {ARCHETYPES.find(a => a.id === strategy.secondaryArchetype)?.name}
            </Badge>
          )}
        </div>
      )}

      {/* Archetype Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {ARCHETYPES.map((archetype) => (
          <ArchetypeCard
            key={archetype.id}
            archetype={archetype}
            isPrimary={strategy.primaryArchetype === archetype.id}
            isSecondary={strategy.secondaryArchetype === archetype.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default ArchetypeStation;

