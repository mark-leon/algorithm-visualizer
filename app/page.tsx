"use client";

import { useState } from "react";
import AlgorithmSelector from "@/components/algorithm-selector";
import VisualizationControls from "@/components/visualization-controls";
import SortingVisualizer from "@/components/visualizers/sorting-visualizer";
import PathfindingVisualizer from "@/components/visualizers/pathfinding-visualizer";
import GraphTraversalVisualizer from "@/components/visualizers/graph-traversal-visualizer";
import AlgorithmInfo from "@/components/algorithm-info";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("sorting");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("bubbleSort");
  const [speed, setSpeed] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReset, setIsReset] = useState(true);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsReset(true);
    setIsPlaying(false);

    // Set default algorithm for each category
    if (category === "sorting") setSelectedAlgorithm("bubbleSort");
    else if (category === "pathfinding") setSelectedAlgorithm("dijkstra");
    else if (category === "graphTraversal") setSelectedAlgorithm("bfs");
  };

  const handleAlgorithmChange = (algorithm: string) => {
    setSelectedAlgorithm(algorithm);
    setIsReset(true);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (isReset) setIsReset(false);
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsReset(true);
  };

  const handleSpeedChange = (value: number) => {
    setSpeed(value);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Algorithm Visualizer
      </h1>

      <Tabs
        defaultValue="sorting"
        onValueChange={handleCategoryChange}
        className="mb-8"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sorting">Sorting</TabsTrigger>
          <TabsTrigger value="pathfinding">Pathfinding</TabsTrigger>
          <TabsTrigger value="graphTraversal">Graph Traversal</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <AlgorithmSelector
            category={selectedCategory}
            selectedAlgorithm={selectedAlgorithm}
            onAlgorithmChange={handleAlgorithmChange}
          />

          <div className="mt-6">
            <AlgorithmInfo
              category={selectedCategory}
              algorithm={selectedAlgorithm}
            />
          </div>
        </div>

        <div className="lg:col-span-3 bg-card rounded-lg shadow-lg p-4">
          <VisualizationControls
            isPlaying={isPlaying}
            speed={speed}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onSpeedChange={handleSpeedChange}
          />

          <div className="mt-4 h-[500px] border rounded-lg overflow-hidden">
            {selectedCategory === "sorting" && (
              <SortingVisualizer
                algorithm={selectedAlgorithm}
                speed={speed}
                isPlaying={isPlaying}
                isReset={isReset}
              />
            )}

            {selectedCategory === "pathfinding" && (
              <PathfindingVisualizer
                algorithm={selectedAlgorithm}
                speed={speed}
                isPlaying={isPlaying}
                isReset={isReset}
              />
            )}

            {selectedCategory === "graphTraversal" && (
              <GraphTraversalVisualizer
                algorithm={selectedAlgorithm}
                speed={speed}
                isPlaying={isPlaying}
                isReset={isReset}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
