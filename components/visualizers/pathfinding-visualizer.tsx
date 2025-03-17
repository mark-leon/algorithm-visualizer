"use client"

import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface PathfindingVisualizerProps {
  algorithm: string
  speed: number
  isPlaying: boolean
  isReset: boolean
}

type CellType = "empty" | "wall" | "start" | "end" | "visited" | "path" | "current"

interface Cell {
  row: number
  col: number
  type: CellType
  distance: number
  isVisited: boolean
  previousNode: { row: number; col: number } | null
  f?: number // For A* algorithm
  g?: number // For A* algorithm
  h?: number // For A* algorithm
}

export default function PathfindingVisualizer({ algorithm, speed, isPlaying, isReset }: PathfindingVisualizerProps) {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [mouseIsPressed, setMouseIsPressed] = useState(false)
  const [isMovingStart, setIsMovingStart] = useState(false)
  const [isMovingEnd, setIsMovingEnd] = useState(false)
  const [startNode, setStartNode] = useState({ row: 10, col: 15 })
  const [endNode, setEndNode] = useState({ row: 10, col: 35 })
  const [isVisualizing, setIsVisualizing] = useState(false)
  const [isPathFound, setIsPathFound] = useState(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Initialize grid
  useEffect(() => {
    initializeGrid()
  }, [])

  // Reset grid when isReset changes
  useEffect(() => {
    if (isReset) {
      resetGrid()
    }
  }, [isReset])

  // Start/stop visualization based on isPlaying state
  useEffect(() => {
    if (isPlaying && !isVisualizing && !isPathFound) {
      visualizeAlgorithm()
    } else if (!isPlaying && isVisualizing) {
      stopVisualization()
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [isPlaying, isVisualizing, isPathFound])

  const initializeGrid = () => {
    const rows = 20
    const cols = 50
    const newGrid: Cell[][] = []

    for (let row = 0; row < rows; row++) {
      const currentRow: Cell[] = []
      for (let col = 0; col < cols; col++) {
        currentRow.push(createNode(row, col))
      }
      newGrid.push(currentRow)
    }

    setGrid(newGrid)
  }

  const createNode = (row: number, col: number): Cell => {
    return {
      row,
      col,
      type:
        row === startNode.row && col === startNode.col
          ? "start"
          : row === endNode.row && col === endNode.col
            ? "end"
            : "empty",
      distance: Number.POSITIVE_INFINITY,
      isVisited: false,
      previousNode: null,
      f: 0,
      g: 0,
      h: 0,
    }
  }

  const resetGrid = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }

    initializeGrid()
    setIsVisualizing(false)
    setIsPathFound(false)
  }

  const handleMouseDown = (row: number, col: number) => {
    if (isVisualizing) return

    setMouseIsPressed(true)

    if (grid[row][col].type === "start") {
      setIsMovingStart(true)
      return
    }

    if (grid[row][col].type === "end") {
      setIsMovingEnd(true)
      return
    }

    const newGrid = toggleWall(grid, row, col)
    setGrid(newGrid)
  }

  const handleMouseEnter = (row: number, col: number) => {
    if (!mouseIsPressed || isVisualizing) return

    if (isMovingStart) {
      const newGrid = moveStartNode(grid, row, col)
      setGrid(newGrid)
      setStartNode({ row, col })
      return
    }

    if (isMovingEnd) {
      const newGrid = moveEndNode(grid, row, col)
      setGrid(newGrid)
      setEndNode({ row, col })
      return
    }

    const newGrid = toggleWall(grid, row, col)
    setGrid(newGrid)
  }

  const handleMouseUp = () => {
    setMouseIsPressed(false)
    setIsMovingStart(false)
    setIsMovingEnd(false)
  }

  const toggleWall = (grid: Cell[][], row: number, col: number) => {
    const newGrid = [...grid]
    const node = newGrid[row][col]

    if (node.type !== "start" && node.type !== "end") {
      const newNode = {
        ...node,
        type: node.type === "wall" ? "empty" : "wall",
      }
      newGrid[row][col] = newNode
    }

    return newGrid
  }

  const moveStartNode = (grid: Cell[][], row: number, col: number) => {
    const newGrid = [...grid]

    // Reset old start node
    newGrid[startNode.row][startNode.col] = {
      ...newGrid[startNode.row][startNode.col],
      type: "empty",
    }

    // Set new start node
    if (newGrid[row][col].type !== "end") {
      newGrid[row][col] = {
        ...newGrid[row][col],
        type: "start",
      }
    }

    return newGrid
  }

  const moveEndNode = (grid: Cell[][], row: number, col: number) => {
    const newGrid = [...grid]

    // Reset old end node
    newGrid[endNode.row][endNode.col] = {
      ...newGrid[endNode.row][endNode.col],
      type: "empty",
    }

    // Set new end node
    if (newGrid[row][col].type !== "start") {
      newGrid[row][col] = {
        ...newGrid[row][col],
        type: "end",
      }
    }

    return newGrid
  }

  const visualizeAlgorithm = () => {
    setIsVisualizing(true)

    const startNodeObj = grid[startNode.row][startNode.col]
    const endNodeObj = grid[endNode.row][endNode.col]

    let visitedNodesInOrder: Cell[] = []
    let nodesInShortestPathOrder: Cell[] = []

    switch (algorithm) {
      case "dijkstra":
        visitedNodesInOrder = dijkstra(grid, startNodeObj, endNodeObj)
        nodesInShortestPathOrder = getNodesInShortestPathOrder(endNodeObj)
        break
      case "aStar":
        visitedNodesInOrder = aStar(grid, startNodeObj, endNodeObj)
        nodesInShortestPathOrder = getNodesInShortestPathOrder(endNodeObj)
        break
      default:
        visitedNodesInOrder = dijkstra(grid, startNodeObj, endNodeObj)
        nodesInShortestPathOrder = getNodesInShortestPathOrder(endNodeObj)
    }

    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder)
  }

  const stopVisualization = () => {
    setIsVisualizing(false)
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
  }

  // Dijkstra's Algorithm
  const dijkstra = (grid: Cell[][], startNode: Cell, endNode: Cell): Cell[] => {
    const visitedNodesInOrder: Cell[] = []
    startNode.distance = 0
    const unvisitedNodes = getAllNodes(grid)

    while (unvisitedNodes.length) {
      sortNodesByDistance(unvisitedNodes)
      const closestNode = unvisitedNodes.shift()

      if (!closestNode) break

      // If we encounter a wall, skip it
      if (closestNode.type === "wall") continue

      // If the closest node is at a distance of infinity,
      // we must be trapped and should stop
      if (closestNode.distance === Number.POSITIVE_INFINITY) return visitedNodesInOrder

      closestNode.isVisited = true
      visitedNodesInOrder.push(closestNode)

      // If we've reached the end node, we're done
      if (closestNode.row === endNode.row && closestNode.col === endNode.col) {
        return visitedNodesInOrder
      }

      updateUnvisitedNeighbors(closestNode, grid)
    }

    return visitedNodesInOrder
  }

  // A* Algorithm
  const aStar = (grid: Cell[][], startNode: Cell, endNode: Cell): Cell[] => {
    const visitedNodesInOrder: Cell[] = []
    const openSet: Cell[] = []

    // Initialize start node
    startNode.g = 0
    startNode.h = heuristic(startNode, endNode)
    startNode.f = startNode.h
    openSet.push(startNode)

    while (openSet.length > 0) {
      // Find node with lowest f value
      sortNodesByF(openSet)
      const current = openSet.shift()

      if (!current) break

      // Skip walls
      if (current.type === "wall") continue

      // Mark as visited
      current.isVisited = true
      visitedNodesInOrder.push(current)

      // If we've reached the end node, we're done
      if (current.row === endNode.row && current.col === endNode.col) {
        return visitedNodesInOrder
      }

      // Check neighbors
      const neighbors = getNeighbors(current, grid)

      for (const neighbor of neighbors) {
        if (neighbor.isVisited || neighbor.type === "wall") continue

        // Calculate g score (distance from start)
        const tentativeG = (current.g || 0) + 1

        // If this path is better than previous one
        if (tentativeG < (neighbor.g || Number.POSITIVE_INFINITY)) {
          // Update path
          neighbor.previousNode = { row: current.row, col: current.col }
          neighbor.g = tentativeG
          neighbor.h = heuristic(neighbor, endNode)
          neighbor.f = neighbor.g + neighbor.h

          // Add to open set if not already there
          if (!openSet.some((node) => node.row === neighbor.row && node.col === neighbor.col)) {
            openSet.push(neighbor)
          }
        }
      }
    }

    return visitedNodesInOrder
  }

  // Manhattan distance heuristic for A*
  const heuristic = (a: Cell, b: Cell): number => {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
  }

  const sortNodesByF = (nodes: Cell[]) => {
    nodes.sort((a, b) => (a.f || 0) - (b.f || 0))
  }

  const sortNodesByDistance = (unvisitedNodes: Cell[]) => {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance)
  }

  const updateUnvisitedNeighbors = (node: Cell, grid: Cell[][]) => {
    const neighbors = getNeighbors(node, grid)
    for (const neighbor of neighbors) {
      neighbor.distance = node.distance + 1
      neighbor.previousNode = { row: node.row, col: node.col }
    }
  }

  const getNeighbors = (node: Cell, grid: Cell[][]) => {
    const neighbors: Cell[] = []
    const { row, col } = node

    if (row > 0) neighbors.push(grid[row - 1][col])
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col])
    if (col > 0) neighbors.push(grid[row][col - 1])
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1])

    return neighbors.filter((neighbor) => !neighbor.isVisited)
  }

  const getAllNodes = (grid: Cell[][]) => {
    const nodes: Cell[] = []
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node)
      }
    }
    return nodes
  }

  const getNodesInShortestPathOrder = (finishNode: Cell) => {
    const nodesInShortestPathOrder: Cell[] = []
    let currentNode: Cell | null = finishNode

    while (currentNode) {
      nodesInShortestPathOrder.unshift(currentNode)
      if (!currentNode.previousNode) break
      currentNode = grid[currentNode.previousNode.row][currentNode.previousNode.col]
    }

    return nodesInShortestPathOrder
  }

  const animateAlgorithm = (visitedNodesInOrder: Cell[], nodesInShortestPathOrder: Cell[]) => {
    const animationSpeed = 101 - speed // Invert speed so higher value = faster

    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        animationTimeoutRef.current = setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder)
        }, animationSpeed * i)
        return
      }

      animationTimeoutRef.current = setTimeout(() => {
        const node = visitedNodesInOrder[i]

        setGrid((prevGrid) => {
          const newGrid = [...prevGrid]
          const newNode = {
            ...newGrid[node.row][node.col],
            type:
              newGrid[node.row][node.col].type === "start" || newGrid[node.row][node.col].type === "end"
                ? newGrid[node.row][node.col].type
                : "visited",
          }
          newGrid[node.row][node.col] = newNode
          return newGrid
        })
      }, animationSpeed * i)
    }
  }

  const animateShortestPath = (nodesInShortestPathOrder: Cell[]) => {
    const animationSpeed = 101 - speed // Invert speed so higher value = faster

    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      animationTimeoutRef.current = setTimeout(() => {
        const node = nodesInShortestPathOrder[i]

        setGrid((prevGrid) => {
          const newGrid = [...prevGrid]
          const newNode = {
            ...newGrid[node.row][node.col],
            type:
              newGrid[node.row][node.col].type === "start" || newGrid[node.row][node.col].type === "end"
                ? newGrid[node.row][node.col].type
                : "path",
          }
          newGrid[node.row][node.col] = newNode
          return newGrid
        })

        if (i === nodesInShortestPathOrder.length - 1) {
          setIsVisualizing(false)
          setIsPathFound(true)
          toast({
            title: "Pathfinding Complete",
            description: `${algorithm === "dijkstra" ? "Dijkstra's" : "A*"} algorithm found the shortest path.`,
          })
        }
      }, animationSpeed * i)
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-background">
      <div className="mb-4 flex gap-2 items-center text-sm">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
          <span>Start</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
          <span>End</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-800 rounded-sm"></div>
          <span>Wall</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-300 rounded-sm"></div>
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
          <span>Path</span>
        </div>
      </div>

      <div
        className="grid gap-0 border border-gray-300 rounded"
        style={{
          gridTemplateRows: `repeat(${grid.length}, 1fr)`,
          gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 1fr)`,
          width: "100%",
          height: "100%",
        }}
        onMouseLeave={handleMouseUp}
      >
        {grid.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              className={`
                w-full h-full border border-gray-100
                ${cell.type === "wall" ? "bg-gray-800" : ""}
                ${cell.type === "start" ? "bg-green-500" : ""}
                ${cell.type === "end" ? "bg-red-500" : ""}
                ${cell.type === "visited" ? "bg-blue-300" : ""}
                ${cell.type === "path" ? "bg-yellow-400" : ""}
                ${cell.type === "current" ? "bg-purple-500" : ""}
              `}
              onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
              onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
              onMouseUp={handleMouseUp}
            ></div>
          )),
        )}
      </div>

      <div className="mt-2 text-sm text-center">
        <p>Click and drag to draw walls. Drag the start (green) and end (red) nodes to reposition them.</p>
      </div>
    </div>
  )
}

