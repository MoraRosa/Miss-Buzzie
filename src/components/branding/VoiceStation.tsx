/**
 * Station 4: The Voice
 * 
 * Users discover their brand voice through an interactive game
 * where they pick which communication style sounds most like them.
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw } from "lucide-react";
import { StationProps } from "./types";
import { VOICE_STYLES, VoiceStyle, VoiceStyleInfo } from "@/lib/brandStrategy";

// Sample messages that users will see in different voice styles
const SAMPLE_SCENARIOS = [
  {
    context: "Announcing a new product feature",
    messages: {
      formal: "We are pleased to announce the release of our latest enhancement, designed to optimize your workflow efficiency.",
      casual: "Hey! Guess what? We just shipped something awesome that's going to make your life so much easier.",
      bold: "Forget everything you know. We just changed the game. Again.",
      warm: "We heard you, and we listened. Here's something we built just for you.",
    },
  },
  {
    context: "Handling a customer complaint",
    messages: {
      formal: "We sincerely apologize for any inconvenience. Our team is investigating this matter with utmost priority.",
      casual: "Ugh, that's frustrating - we totally get it! Let's figure this out together, okay?",
      bold: "We messed up. No excuses. Here's exactly how we're fixing it.",
      warm: "We're so sorry you're going through this. We're here for you, and we won't rest until this is right.",
    },
  },
];

interface VoiceOptionProps {
  style: VoiceStyleInfo;
  isSelected: boolean;
  isPrimary: boolean;
  onClick: () => void;
}

const VoiceOption = ({ style, isSelected, isPrimary, onClick }: VoiceOptionProps) => (
  <Card
    onClick={onClick}
    className={`p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md ${
      isSelected ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/20' : ''
    }`}
  >
    <div className="flex items-start justify-between mb-1.5 sm:mb-2 gap-2">
      <h4 className="font-semibold text-sm sm:text-base">{style.name}</h4>
      {isSelected && (
        <Badge className={`text-xs shrink-0 ${isPrimary ? 'bg-amber-500' : 'bg-blue-500'}`}>
          {isPrimary ? 'Primary' : 'Secondary'}
        </Badge>
      )}
    </div>
    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{style.description}</p>
    <div className="p-2 sm:p-3 bg-muted/50 rounded-lg text-xs sm:text-sm italic">
      "{style.example}"
    </div>
  </Card>
);

const VoiceStation = ({ strategy, updateStrategy }: StationProps) => {
  const [gameMode, setGameMode] = useState<'game' | 'select'>('select');
  const [currentScenario, setCurrentScenario] = useState(0);

  const handleStyleSelect = (styleId: VoiceStyle) => {
    if (strategy.voice.primaryStyle === styleId) {
      // Deselect if clicking the same primary
      updateStrategy({
        voice: { ...strategy.voice, primaryStyle: '' },
      });
    } else if (strategy.voice.secondaryStyle === styleId) {
      // Deselect if clicking the same secondary
      updateStrategy({
        voice: { ...strategy.voice, secondaryStyle: '' },
      });
    } else if (!strategy.voice.primaryStyle) {
      // Set as primary if none selected
      updateStrategy({
        voice: { ...strategy.voice, primaryStyle: styleId },
      });
    } else if (!strategy.voice.secondaryStyle) {
      // Set as secondary if primary already selected
      updateStrategy({
        voice: { ...strategy.voice, secondaryStyle: styleId },
      });
    } else {
      // Replace secondary if both are selected
      updateStrategy({
        voice: { ...strategy.voice, secondaryStyle: styleId },
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Instructions */}
      <div className="text-center">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Your voice is how you communicate. Select a <strong>primary</strong> style
          (your main voice) and optionally a <strong>secondary</strong> style (for variety).
        </p>
      </div>

      {/* Selection Summary */}
      {(strategy.voice.primaryStyle || strategy.voice.secondaryStyle) && (
        <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
          {strategy.voice.primaryStyle && (
            <Badge className="text-xs sm:text-sm py-0.5 sm:py-1 px-2 sm:px-3 bg-amber-500">
              Primary: {VOICE_STYLES.find(v => v.id === strategy.voice.primaryStyle)?.name}
            </Badge>
          )}
          {strategy.voice.secondaryStyle && (
            <Badge className="text-xs sm:text-sm py-0.5 sm:py-1 px-2 sm:px-3 bg-blue-500">
              Secondary: {VOICE_STYLES.find(v => v.id === strategy.voice.secondaryStyle)?.name}
            </Badge>
          )}
        </div>
      )}

      {/* Voice Style Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {VOICE_STYLES.map((style) => (
          <VoiceOption
            key={style.id}
            style={style}
            isSelected={strategy.voice.primaryStyle === style.id || strategy.voice.secondaryStyle === style.id}
            isPrimary={strategy.voice.primaryStyle === style.id}
            onClick={() => handleStyleSelect(style.id)}
          />
        ))}
      </div>

      {/* Topic Focus */}
      <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
        <Label htmlFor="topic-focus" className="text-sm sm:text-base font-semibold">
          What's the ONE topic you want to be known for? (The 80%)
        </Label>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Start narrow. Be the go-to expert for one thing before expanding.
        </p>
        <Input
          id="topic-focus"
          value={strategy.voice.topicFocus}
          onChange={(e) => updateStrategy({
            voice: { ...strategy.voice, topicFocus: e.target.value },
          })}
          placeholder="e.g., 'Making small business accounting simple'"
          className="text-sm sm:text-base"
        />
      </div>
    </div>
  );
};

export default VoiceStation;

