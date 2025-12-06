/**
 * Station 5: The Emotion
 * 
 * Users select the emotions they want their brand to evoke.
 * Brands that create emotional connections build loyalty.
 */

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StationProps } from "./types";
import { EMOTIONS, BrandEmotion, EmotionInfo } from "@/lib/brandStrategy";

interface EmotionCardProps {
  emotion: EmotionInfo;
  isSelected: boolean;
  selectionOrder: number | null;
  onToggle: () => void;
}

const EmotionCard = ({ emotion, isSelected, selectionOrder, onToggle }: EmotionCardProps) => (
  <Card
    onClick={onToggle}
    className={`p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md active:scale-[0.98] sm:hover:scale-[1.02] ${
      isSelected
        ? 'ring-2 ring-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30'
        : 'hover:bg-muted/50'
    }`}
  >
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="text-2xl sm:text-3xl">{emotion.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h4 className="font-semibold text-sm sm:text-base truncate">{emotion.name}</h4>
          {isSelected && selectionOrder !== null && (
            <Badge variant="secondary" className="h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[10px] sm:text-xs shrink-0">
              {selectionOrder + 1}
            </Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{emotion.description}</p>
      </div>
    </div>
    {isSelected && (
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t">
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          <span className="font-medium">Color hint:</span> {emotion.colorHint}
        </p>
      </div>
    )}
  </Card>
);

const EmotionStation = ({ strategy, updateStrategy }: StationProps) => {
  const MAX_EMOTIONS = 3;

  const toggleEmotion = (emotionId: BrandEmotion) => {
    const currentEmotions = strategy.emotions;
    
    if (currentEmotions.includes(emotionId)) {
      // Remove emotion
      updateStrategy({
        emotions: currentEmotions.filter(e => e !== emotionId),
      });
    } else if (currentEmotions.length < MAX_EMOTIONS) {
      // Add emotion
      updateStrategy({
        emotions: [...currentEmotions, emotionId],
      });
    }
    // If at max, do nothing (user must deselect first)
  };

  const getSelectionOrder = (emotionId: BrandEmotion): number | null => {
    const index = strategy.emotions.indexOf(emotionId);
    return index >= 0 ? index : null;
  };

  const selectedEmotionNames = strategy.emotions
    .map(id => EMOTIONS.find(e => e.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Instructions */}
      <div className="text-center space-y-1 sm:space-y-2">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Brands that evoke emotion create loyalty. Select up to <strong>{MAX_EMOTIONS} emotions</strong> you
          want people to feel when they interact with your brand.
        </p>
        <p className="text-xs text-muted-foreground">
          Selected: {strategy.emotions.length} / {MAX_EMOTIONS}
        </p>
      </div>

      {/* Selected Emotions Summary */}
      {strategy.emotions.length > 0 && (
        <div className="flex justify-center gap-1.5 sm:gap-2 flex-wrap">
          {strategy.emotions.map((emotionId, i) => {
            const emotion = EMOTIONS.find(e => e.id === emotionId);
            if (!emotion) return null;
            return (
              <Badge
                key={emotionId}
                className="text-xs sm:text-sm py-0.5 sm:py-1 px-2 sm:px-3 gap-1 sm:gap-2"
                style={{
                  backgroundColor: i === 0 ? '#f59e0b' : i === 1 ? '#3b82f6' : '#8b5cf6',
                }}
              >
                {emotion.emoji} {emotion.name}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Emotion Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {EMOTIONS.map((emotion) => (
          <EmotionCard
            key={emotion.id}
            emotion={emotion}
            isSelected={strategy.emotions.includes(emotion.id)}
            selectionOrder={getSelectionOrder(emotion.id)}
            onToggle={() => toggleEmotion(emotion.id)}
          />
        ))}
      </div>

      {/* Emotional Promise */}
      <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
        <Label htmlFor="emotional-promise" className="text-sm sm:text-base font-semibold">
          Complete the sentence:
        </Label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">
            "When people think of {strategy.brandName || 'our brand'}, they feel
          </span>
          <Input
            id="emotional-promise"
            value={strategy.emotionalPromise}
            onChange={(e) => updateStrategy({ emotionalPromise: e.target.value })}
            placeholder={selectedEmotionNames.join(', ') || 'empowered, inspired...'}
            className="flex-1 min-w-0 text-sm sm:text-base"
          />
          <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">"</span>
        </div>
      </div>
    </div>
  );
};

export default EmotionStation;

