import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AlgorithmInfoProps {
  category: string
  algorithm: string
}

export default function AlgorithmInfo({ category, algorithm }: AlgorithmInfoProps) {
  const algorithmInfo = {
    sorting: {
      bubbleSort: {
        title: "Bubble Sort",
        description:
          "A simple comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
      },
      mergeSort: {
        title: "Merge Sort",
        description:
          "A divide-and-conquer algorithm that divides the input array into two halves, recursively sorts them, and then merges the sorted halves.",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
      },
      quickSort: {
        title: "Quick Sort",
        description:
          "A divide-and-conquer algorithm that selects a 'pivot' element and partitions the array around the pivot, then recursively sorts the sub-arrays.",
        timeComplexity: "O(n log n) average, O(n²) worst case",
        spaceComplexity: "O(log n)",
      },
      insertionSort: {
        title: "Insertion Sort",
        description:
          "Builds the sorted array one item at a time by repeatedly taking the next element and inserting it into its correct position.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
      },
    },
    pathfinding: {
      dijkstra: {
        title: "Dijkstra's Algorithm",
        description:
          "Finds the shortest path between nodes in a graph. It uses a priority queue to greedily select the closest vertex that has not been processed yet.",
        timeComplexity: "O((V + E) log V) with binary heap",
        spaceComplexity: "O(V)",
      },
      aStar: {
        title: "A* Algorithm",
        description:
          "An extension of Dijkstra's that uses heuristics to guide the search more efficiently toward the goal.",
        timeComplexity: "O(E)",
        spaceComplexity: "O(V)",
      },
    },
    graphTraversal: {
      bfs: {
        title: "Breadth-First Search (BFS)",
        description:
          "Explores all neighbor nodes at the present depth before moving to nodes at the next depth level. Uses a queue data structure.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
      },
      dfs: {
        title: "Depth-First Search (DFS)",
        description:
          "Explores as far as possible along each branch before backtracking. Uses a stack data structure (or recursion).",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
      },
    },
  }

  const info = algorithmInfo[category as keyof typeof algorithmInfo]?.[algorithm as any] || {
    title: "Algorithm Information",
    description: "Select an algorithm to see its description.",
    timeComplexity: "-",
    spaceComplexity: "-",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{info.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">{info.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-medium">Time Complexity</p>
            <p className="text-sm">{info.timeComplexity}</p>
          </div>
          <div>
            <p className="text-xs font-medium">Space Complexity</p>
            <p className="text-sm">{info.spaceComplexity}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

