"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface GraphTraversalVisualizerProps {
  algorithm: string
  speed: number
  isPlaying: boolean
  isReset: boolean
}

interface Node {
  id: number
  x: number
  y: number
  connections: number[]
  state: "default" | "visited" | "current" | "queued"
}

export default function GraphTraversalVisualizer({
  algorithm,
  speed,
  isPlaying,
  isReset,
}: GraphTraversalVisualizerProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  const [isVisualizing, setIsVisualizing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startNode, setStartNode] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Initialize graph
  useEffect(() => {
    generateRandomGraph()
  }, [])

  // Reset graph when isReset changes
  useEffect(() => {
    if (isReset) {
      resetGraph()
    }
  }, [isReset])

  // Start/stop visualization based on isPlaying state
  useEffect(() => {
    if (isPlaying && !isVisualizing && !isComplete) {
      if (startNode !== null) {
        visualizeAlgorithm()
      } else {
        toast({
          title: "Select a start node",
          description: "Please select a node to start the traversal.",
          variant: "destructive",
        })
      }
    } else if (!isPlaying && isVisualizing) {
      stopVisualization()
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [isPlaying, isVisualizing, isComplete, startNode])

  // Draw the graph
  useEffect(() => {
    drawGraph()
  }, [nodes])

  const generateRandomGraph = () => {
    const newNodes: Node[] = []
    const numNodes = 15
    const canvasWidth = 800
    const canvasHeight = 400

    // Create nodes with random positions
    for (let i = 0; i < numNodes; i++) {
      newNodes.push({
        id: i,
        x: Math.random() * (canvasWidth - 100) + 50,
        y: Math.random() * (canvasHeight - 100) + 50,
        connections: [],
        state: "default",
      })
    }

    // Create random connections
    for (let i = 0; i < numNodes; i++) {
      const numConnections = Math.floor(Math.random() * 3) + 1 // 1-3 connections per node

      for (let j = 0; j < numConnections; j++) {
        let targetNode = Math.floor(Math.random() * numNodes)

        // Avoid self-connections and duplicates
        while (targetNode === i || newNodes[i].connections.includes(targetNode)) {
          targetNode = Math.floor(Math.random() * numNodes)
        }

        newNodes[i].connections.push(targetNode)

        // Make connections bidirectional
        if (!newNodes[targetNode].connections.includes(i)) {
          newNodes[targetNode].connections.push(i)
        }
      }
    }

    setNodes(newNodes)
    setStartNode(null)
  }

  const resetGraph = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }

    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        state: "default",
      })),
    )

    setIsVisualizing(false)
    setIsComplete(false)
  }

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw connections
    ctx.lineWidth = 2
    ctx.strokeStyle = "#888"

    for (const node of nodes) {
      for (const connectionId of node.connections) {
        const connectedNode = nodes.find((n) => n.id === connectionId)
        if (connectedNode) {
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(connectedNode.x, connectedNode.y)
          ctx.stroke()
        }
      }
    }

    // Draw nodes
    for (const node of nodes) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, 20, 0, Math.PI * 2)

      // Set color based on state
      switch (node.state) {
        case "current":
          ctx.fillStyle = "#f59e0b" // Amber
          break
        case "visited":
          ctx.fillStyle = "#10b981" // Green
          break
        case "queued":
          ctx.fillStyle = "#3b82f6" // Blue
          break
        default:
          ctx.fillStyle = node.id === startNode ? "#8b5cf6" : "#f3f4f6" // Purple for start, light gray for default
      }

      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = "#374151"
      ctx.stroke()

      // Draw node ID
      ctx.fillStyle = "#000"
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.id.toString(), node.x, node.y)
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || isVisualizing) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if a node was clicked
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2)

      if (distance <= 20) {
        setSelectedNode(node.id)
        setIsDragging(true)

        // Set as start node on click if not already visualizing
        if (!isVisualizing && !isComplete) {
          setStartNode(node.id)
          setNodes((prevNodes) =>
            prevNodes.map((n) => ({
              ...n,
              state: "default",
            })),
          )
        }

        break
      }
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || selectedNode === null || isVisualizing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setNodes((prevNodes) => prevNodes.map((node) => (node.id === selectedNode ? { ...node, x, y } : node)))
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    setSelectedNode(null)
  }

  const visualizeAlgorithm = () => {
    if (startNode === null) return

    setIsVisualizing(true)
    setIsComplete(false)

    // Reset node states
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        state: node.id === startNode ? "current" : "default",
      })),
    )

    // Run the selected algorithm
    if (algorithm === "bfs") {
      runBFS()
    } else if (algorithm === "dfs") {
      runDFS()
    }
  }

  const stopVisualization = () => {
    setIsVisualizing(false)
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
  }

  // Breadth-First Search
  const runBFS = () => {
    if (startNode === null) return

    const visited: boolean[] = Array(nodes.length).fill(false)
    const queue: number[] = [startNode]
    const visitOrder: number[] = []
    visited[startNode] = true

    while (queue.length > 0) {
      const nodeId = queue.shift()!
      visitOrder.push(nodeId)

      const node = nodes.find((n) => n.id === nodeId)
      if (!node) continue

      for (const neighborId of node.connections) {
        if (!visited[neighborId]) {
          visited[neighborId] = true
          queue.push(neighborId)
        }
      }
    }

    animateTraversal(visitOrder)
  }

  // Depth-First Search
  const runDFS = () => {
    if (startNode === null) return

    const visited: boolean[] = Array(nodes.length).fill(false)
    const visitOrder: number[] = []

    const dfs = (nodeId: number) => {
      visited[nodeId] = true
      visitOrder.push(nodeId)

      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      for (const neighborId of node.connections) {
        if (!visited[neighborId]) {
          dfs(neighborId)
        }
      }
    }

    dfs(startNode)
    animateTraversal(visitOrder)
  }

  const animateTraversal = (visitOrder: number[]) => {
    const animationSpeed = 101 - speed // Invert speed so higher value = faster

    for (let i = 0; i < visitOrder.length; i++) {
      animationTimeoutRef.current = setTimeout(
        () => {
          const nodeId = visitOrder[i]

          setNodes((prevNodes) => {
            const newNodes = [...prevNodes]

            // Mark previous node as visited
            if (i > 0) {
              const prevNodeId = visitOrder[i - 1]
              const prevNodeIndex = newNodes.findIndex((n) => n.id === prevNodeId)
              if (prevNodeIndex !== -1) {
                newNodes[prevNodeIndex] = {
                  ...newNodes[prevNodeIndex],
                  state: "visited",
                }
              }
            }

            // Mark current node
            const currentNodeIndex = newNodes.findIndex((n) => n.id === nodeId)
            if (currentNodeIndex !== -1) {
              newNodes[currentNodeIndex] = {
                ...newNodes[currentNodeIndex],
                state: "current",
              }
            }

            // Mark neighbors as queued
            if (algorithm === "bfs") {
              const currentNode = newNodes[currentNodeIndex]
              for (const neighborId of currentNode.connections) {
                const neighborIndex = newNodes.findIndex((n) => n.id === neighborId)
                if (neighborIndex !== -1 && newNodes[neighborIndex].state === "default") {
                  newNodes[neighborIndex] = {
                    ...newNodes[neighborIndex],
                    state: "queued",
                  }
                }
              }
            }

            return newNodes
          })

          // Check if traversal is complete
          if (i === visitOrder.length - 1) {
            setTimeout(() => {
              setNodes((prevNodes) =>
                prevNodes.map((node) => ({
                  ...node,
                  state: node.state === "current" ? "visited" : node.state,
                })),
              )

              setIsVisualizing(false)
              setIsComplete(true)

              toast({
                title: "Traversal Complete",
                description: `${algorithm === "bfs" ? "Breadth-First Search" : "Depth-First Search"} traversal completed.`,
              })
            }, animationSpeed)
          }
        },
        animationSpeed * i * 2,
      )
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-background">
      <div className="mb-4 flex gap-4 items-center text-sm">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-[#8b5cf6]"></div>
          <span>Start Node</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-[#f59e0b]"></div>
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-[#10b981]"></div>
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-[#3b82f6]"></div>
          <span>Queued</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-[400px] border rounded-lg bg-white"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      ></canvas>

      <div className="mt-4 flex gap-4 justify-center">
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          onClick={generateRandomGraph}
          disabled={isVisualizing}
        >
          Generate New Graph
        </button>
      </div>

      <div className="mt-2 text-sm text-center">
        <p>Click on a node to set it as the start node. Drag nodes to reposition them.</p>
      </div>
    </div>
  )
}

