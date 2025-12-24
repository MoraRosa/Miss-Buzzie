import { useMemo, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { getBrandColors, type BrandColors, getCompanyLogo } from "@/lib/assetManager";
import {
  type BusinessTask,
  type TaskPhase,
} from "@/lib/businessTasks";

interface TaskSummaryPreviewProps {
  tasks: BusinessTask[];
  completedTasks: string[];
  brandName?: string;
}

// Phase order and metadata
const PHASES: { id: TaskPhase; label: string; emoji: string }[] = [
  { id: 'idea', label: 'Ideation', emoji: '💡' },
  { id: 'validate', label: 'Validation', emoji: '✅' },
  { id: 'build', label: 'Build', emoji: '🔧' },
  { id: 'launch', label: 'Launch', emoji: '🚀' },
  { id: 'grow', label: 'Growth', emoji: '📈' },
];

// Custom progress bar that accepts a color
const BrandProgress = ({ value, color, className }: { value: number; color: string; className?: string }) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-muted ${className || ''}`}>
    <div
      className="h-full transition-all duration-300"
      style={{
        width: `${value}%`,
        backgroundColor: color,
      }}
    />
  </div>
);

const TaskSummaryPreview = ({ tasks, completedTasks, brandName }: TaskSummaryPreviewProps) => {
  const [brandColors, setBrandColors] = useState<BrandColors>(getBrandColors());
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    setBrandColors(getBrandColors());
    setLogo(getCompanyLogo());

    const handleColorsChange = (e: CustomEvent<BrandColors>) => {
      setBrandColors(e.detail);
    };
    window.addEventListener('brandColorsChanged', handleColorsChange as EventListener);
    return () => window.removeEventListener('brandColorsChanged', handleColorsChange as EventListener);
  }, []);

  // Group tasks by phase
  const tasksByPhase = useMemo(() => {
    const grouped: Record<TaskPhase, BusinessTask[]> = {
      idea: [],
      validate: [],
      build: [],
      launch: [],
      grow: [],
    };
    tasks.forEach(task => {
      grouped[task.phase].push(task);
    });
    return grouped;
  }, [tasks]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  }, [tasks, completedTasks]);

  // Calculate phase progress
  const phaseProgress = useMemo(() => {
    return PHASES.map(phase => {
      const phaseTasks = tasksByPhase[phase.id];
      const completed = phaseTasks.filter(t => completedTasks.includes(t.id)).length;
      return {
        ...phase,
        total: phaseTasks.length,
        completed,
        percent: phaseTasks.length > 0 ? Math.round((completed / phaseTasks.length) * 100) : 0,
      };
    });
  }, [tasksByPhase, completedTasks]);

  return (
    <div 
      className="bg-background p-8 min-w-[800px]" 
      data-task-summary-preview
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <div className="flex items-center gap-4">
          {logo && (
            <img src={logo} alt="Logo" className="h-12 w-12 object-contain rounded" />
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: brandColors.primary }}>
              {brandName || 'Business'} Launch Checklist
            </h1>
            <p className="text-sm text-muted-foreground">
              {completedTasks.length} of {tasks.length} tasks completed
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold" style={{ color: brandColors.primary }}>
            {overallProgress}%
          </div>
          <p className="text-sm text-muted-foreground">Overall Progress</p>
        </div>
      </div>

      {/* Phase Progress Bars */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {phaseProgress.map((phase) => (
          <div key={phase.id} className="text-center">
            <div className="text-2xl mb-1">{phase.emoji}</div>
            <div className="text-sm font-medium mb-1">{phase.label}</div>
            <BrandProgress
              value={phase.percent}
              color={brandColors.primary}
              className="mb-1"
            />
            <div className="text-xs text-muted-foreground">
              {phase.completed}/{phase.total}
            </div>
          </div>
        ))}
      </div>

      {/* Tasks by Phase */}
      <div className="space-y-6">
        {PHASES.map((phase, index) => {
          const phaseTasks = tasksByPhase[phase.id];
          if (phaseTasks.length === 0) return null;

          const phaseCompleted = phaseTasks.filter(t => completedTasks.includes(t.id)).length;
          const phasePercent = Math.round((phaseCompleted / phaseTasks.length) * 100);

          return (
            <Card
              key={phase.id}
              className="p-4 overflow-hidden"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: brandColors.primary,
              }}
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <span className="text-xl">{phase.emoji}</span>
                <h3 className="font-semibold" style={{ color: brandColors.primary }}>
                  {phase.label} Phase
                </h3>
                <div className="ml-auto flex items-center gap-3">
                  <BrandProgress value={phasePercent} color={brandColors.primary} className="w-20" />
                  <span className="text-sm text-muted-foreground">
                    {phaseCompleted}/{phaseTasks.length}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {phaseTasks.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-2 text-sm p-2 rounded bg-muted/30"
                  >
                    <Checkbox
                      checked={completedTasks.includes(task.id)}
                      disabled
                      className="mt-0.5"
                      style={completedTasks.includes(task.id) ? {
                        backgroundColor: brandColors.primary,
                        borderColor: brandColors.primary,
                      } : undefined}
                    />
                    <span className={completedTasks.includes(task.id) ? 'line-through text-muted-foreground' : ''}>
                      {task.title}
                    </span>
                  </div>
                ))}
                {phaseTasks.length > 10 && (
                  <div className="text-sm text-muted-foreground p-2">
                    +{phaseTasks.length - 10} more tasks...
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
        Generated by Miss Buzzie • {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default TaskSummaryPreview;

