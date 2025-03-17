"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw } from "lucide-react"

interface VisualizationControlsProps {
  isPlaying: boolean
  speed: number
  onPlayPause: () => void
  onReset: () => void
  onSpeedChange: (value: number) => void
}

export default function VisualizationControls({
  isPlaying,
  speed,
  onPlayPause,
  onReset,
  onSpeedChange,
}: VisualizationControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
        <Button variant="outline" size="icon" onClick={onReset} aria-label="Reset">
          <RotateCcw size={20} />
        </Button>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-1/2">
        <span className="text-sm whitespace-nowrap">Speed:</span>
        <Slider
          value={[speed]}
          min={1}
          max={100}
          step={1}
          onValueChange={(value) => onSpeedChange(value[0])}
          aria-label="Visualization speed"
        />
      </div>
    </div>
  )
}

