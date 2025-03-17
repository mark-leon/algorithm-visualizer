"use client"

import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface SortingVisualizerProps {
  algorithm: string
  speed: number
  isPlaying: boolean
  isReset: boolean
}

interface ArrayBar {
  value: number
  state: "default" | "comparing" | "sorted" | "pivot"
}

export default function SortingVisualizer({ algorithm, speed, isPlaying, isReset }: SortingVisualizerProps) {
  const [array, setArray] = useState<ArrayBar[]>([])
  const [isSorting, setIsSorting] = useState(false)
  const [isSorted, setIsSorted] = useState(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameIdRef = useRef<number | null>(null)
  const { toast } = useToast()

  // Generate a new random array
  const generateArray = () => {
    const newArray: ArrayBar[] = []
    const size = Math.floor(window.innerWidth / 20) // Responsive array size
    const maxSize = Math.min(Math.floor(window.innerHeight / 2), 500)

    for (let i = 0; i < size; i++) {
      newArray.push({
        value: Math.floor(Math.random() * maxSize) + 10,
        state: "default",
      })
    }

    setArray(newArray)
    setIsSorted(false)
  }

  // Reset the visualization
  useEffect(() => {
    if (isReset) {
      // Clear any ongoing animations
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
        animationTimeoutRef.current = null
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
        animationFrameIdRef.current = null
      }

      generateArray()
      setIsSorting(false)
    }
  }, [isReset, algorithm])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isSorting) {
        generateArray()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isSorting])

  // Start/stop sorting based on isPlaying state
  useEffect(() => {
    if (isPlaying && !isSorting && !isSorted) {
      startSorting()
    } else if (!isPlaying && isSorting) {
      pauseSorting()
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [isPlaying, isSorting, isSorted])

  const startSorting = () => {
    setIsSorting(true)

    switch (algorithm) {
      case "bubbleSort":
        bubbleSort()
        break
      case "mergeSort":
        mergeSort()
        break
      case "quickSort":
        quickSort()
        break
      case "insertionSort":
        insertionSort()
        break
      default:
        bubbleSort()
    }
  }

  const pauseSorting = () => {
    setIsSorting(false)
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }
  }

  // Bubble Sort Implementation
  const bubbleSort = async () => {
    const animations = []
    const arrayCopy = [...array]
    const n = arrayCopy.length

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Compare elements
        animations.push({ type: "compare", indices: [j, j + 1] })

        if (arrayCopy[j].value > arrayCopy[j + 1].value) {
          // Swap elements
          animations.push({ type: "swap", indices: [j, j + 1] })
          const temp = arrayCopy[j]
          arrayCopy[j] = arrayCopy[j + 1]
          arrayCopy[j + 1] = temp
        }

        // Reset comparison
        animations.push({ type: "reset", indices: [j, j + 1] })
      }

      // Mark as sorted
      animations.push({ type: "sorted", indices: [n - i - 1] })
    }

    await animateSort(animations)
  }

  // Merge Sort Implementation
  const mergeSort = async () => {
    const animations: any[] = []
    const arrayCopy = [...array]

    const mergeSortHelper = (arr: ArrayBar[], start: number, end: number) => {
      if (start >= end) return

      const mid = Math.floor((start + end) / 2)
      mergeSortHelper(arr, start, mid)
      mergeSortHelper(arr, mid + 1, end)
      merge(arr, start, mid, end, animations)
    }

    const merge = (arr: ArrayBar[], start: number, mid: number, end: number, animations: any[]) => {
      const left = arr.slice(start, mid + 1)
      const right = arr.slice(mid + 1, end + 1)

      let i = 0,
        j = 0,
        k = start

      while (i < left.length && j < right.length) {
        animations.push({ type: "compare", indices: [start + i, mid + 1 + j] })

        if (left[i].value <= right[j].value) {
          animations.push({ type: "overwrite", index: k, value: left[i].value })
          arr[k++] = left[i++]
        } else {
          animations.push({ type: "overwrite", index: k, value: right[j].value })
          arr[k++] = right[j++]
        }

        animations.push({ type: "reset", indices: [start + i - 1, mid + 1 + j - 1] })
      }

      while (i < left.length) {
        animations.push({ type: "overwrite", index: k, value: left[i].value })
        arr[k++] = left[i++]
      }

      while (j < right.length) {
        animations.push({ type: "overwrite", index: k, value: right[j].value })
        arr[k++] = right[j++]
      }
    }

    mergeSortHelper(arrayCopy, 0, arrayCopy.length - 1)

    // Mark all as sorted at the end
    for (let i = 0; i < arrayCopy.length; i++) {
      animations.push({ type: "sorted", indices: [i] })
    }

    await animateSort(animations)
  }

  // Quick Sort Implementation
  const quickSort = async () => {
    const animations: any[] = []
    const arrayCopy = [...array]

    const quickSortHelper = (arr: ArrayBar[], low: number, high: number) => {
      if (low < high) {
        const pivotIndex = partition(arr, low, high, animations)
        quickSortHelper(arr, low, pivotIndex - 1)
        quickSortHelper(arr, pivotIndex + 1, high)
      } else if (low === high) {
        animations.push({ type: "sorted", indices: [low] })
      }
    }

    const partition = (arr: ArrayBar[], low: number, high: number, animations: any[]) => {
      // Select pivot (last element)
      const pivotValue = arr[high].value
      animations.push({ type: "pivot", index: high })

      let i = low - 1

      for (let j = low; j < high; j++) {
        animations.push({ type: "compare", indices: [j, high] })

        if (arr[j].value < pivotValue) {
          i++

          // Swap arr[i] and arr[j]
          animations.push({ type: "swap", indices: [i, j] })
          const temp = arr[i]
          arr[i] = arr[j]
          arr[j] = temp
        }

        animations.push({ type: "reset", indices: [j, high] })
      }

      // Swap arr[i+1] and arr[high] (pivot)
      animations.push({ type: "swap", indices: [i + 1, high] })
      const temp = arr[i + 1]
      arr[i + 1] = arr[high]
      arr[high] = temp

      animations.push({ type: "sorted", indices: [i + 1] })
      animations.push({ type: "reset-pivot", index: high })

      return i + 1
    }

    quickSortHelper(arrayCopy, 0, arrayCopy.length - 1)

    // Mark any remaining elements as sorted
    for (let i = 0; i < arrayCopy.length; i++) {
      animations.push({ type: "sorted", indices: [i] })
    }

    await animateSort(animations)
  }

  // Insertion Sort Implementation
  const insertionSort = async () => {
    const animations = []
    const arrayCopy = [...array]
    const n = arrayCopy.length

    // Mark first element as sorted
    animations.push({ type: "sorted", indices: [0] })

    for (let i = 1; i < n; i++) {
      const key = arrayCopy[i].value
      let j = i - 1

      animations.push({ type: "compare", indices: [i, j] })

      while (j >= 0 && arrayCopy[j].value > key) {
        // Move elements greater than key one position ahead
        animations.push({ type: "swap", indices: [j, j + 1] })
        arrayCopy[j + 1] = arrayCopy[j]
        j--

        if (j >= 0) {
          animations.push({ type: "compare", indices: [i, j] })
        }
      }

      arrayCopy[j + 1] = { value: key, state: "default" }
      animations.push({ type: "reset", indices: [i, Math.max(0, j)] })
      animations.push({ type: "sorted", indices: [j + 1] })
    }

    await animateSort(animations)
  }

  // Animation function
  const animateSort = async (animations: any[]) => {
    if (!animations.length) return

    let i = 0
    const animationSpeed = 101 - speed // Invert speed so higher value = faster

    const animate = () => {
      if (!isSorting) return

      if (i === animations.length) {
        setIsSorting(false)
        setIsSorted(true)
        toast({
          title: "Sorting Complete",
          description: `${algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} completed successfully.`,
        })
        return
      }

      const animation = animations[i]

      setArray((prevArray) => {
        const newArray = [...prevArray]

        switch (animation.type) {
          case "compare":
            newArray[animation.indices[0]] = { ...newArray[animation.indices[0]], state: "comparing" }
            newArray[animation.indices[1]] = { ...newArray[animation.indices[1]], state: "comparing" }
            break

          case "swap":
            const temp = newArray[animation.indices[0]]
            newArray[animation.indices[0]] = newArray[animation.indices[1]]
            newArray[animation.indices[1]] = temp
            break

          case "reset":
            for (const index of animation.indices) {
              if (newArray[index].state === "comparing") {
                newArray[index] = { ...newArray[index], state: "default" }
              }
            }
            break

          case "sorted":
            for (const index of animation.indices) {
              newArray[index] = { ...newArray[index], state: "sorted" }
            }
            break

          case "pivot":
            newArray[animation.index] = { ...newArray[animation.index], state: "pivot" }
            break

          case "reset-pivot":
            if (newArray[animation.index].state === "pivot") {
              newArray[animation.index] = { ...newArray[animation.index], state: "default" }
            }
            break

          case "overwrite":
            newArray[animation.index] = { value: animation.value, state: "comparing" }
            break
        }

        return newArray
      })

      i++
      animationTimeoutRef.current = setTimeout(() => {
        animationFrameIdRef.current = requestAnimationFrame(animate)
      }, animationSpeed)
    }

    animate()
  }

  return (
    <div className="w-full h-full flex items-end justify-center p-4 bg-background">
      <div className="w-full h-full flex items-end justify-center gap-1">
        {array.map((bar, index) => (
          <div
            key={index}
            className={`w-full max-w-[20px] transition-all duration-100 ${
              bar.state === "comparing"
                ? "bg-yellow-500"
                : bar.state === "sorted"
                  ? "bg-green-500"
                  : bar.state === "pivot"
                    ? "bg-purple-500"
                    : "bg-primary"
            }`}
            style={{
              height: `${bar.value}px`,
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}

