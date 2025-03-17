"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AlgorithmSelectorProps {
  category: string
  selectedAlgorithm: string
  onAlgorithmChange: (algorithm: string) => void
}

export default function AlgorithmSelector({ category, selectedAlgorithm, onAlgorithmChange }: AlgorithmSelectorProps) {
  const algorithms = {
    sorting: [
      { id: "bubbleSort", name: "Bubble Sort" },
      { id: "mergeSort", name: "Merge Sort" },
      { id: "quickSort", name: "Quick Sort" },
      { id: "insertionSort", name: "Insertion Sort" },
    ],
    pathfinding: [
      { id: "dijkstra", name: "Dijkstra's Algorithm" },
      { id: "aStar", name: "A* Algorithm" },
    ],
    graphTraversal: [
      { id: "bfs", name: "Breadth-First Search (BFS)" },
      { id: "dfs", name: "Depth-First Search (DFS)" },
    ],
  }

  const currentAlgorithms = algorithms[category as keyof typeof algorithms] || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Algorithm</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedAlgorithm} onValueChange={onAlgorithmChange} className="space-y-2">
          {currentAlgorithms.map((algorithm) => (
            <div key={algorithm.id} className="flex items-center space-x-2">
              <RadioGroupItem value={algorithm.id} id={algorithm.id} />
              <Label htmlFor={algorithm.id}>{algorithm.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

