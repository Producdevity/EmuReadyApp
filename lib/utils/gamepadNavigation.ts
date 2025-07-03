import { Dimensions, Platform } from 'react-native'

export interface NavigationNode {
  id: string
  ref: any
  onFocus?: () => void
  onBlur?: () => void
  onSelect?: () => void
  nextFocusUp?: string
  nextFocusDown?: string
  nextFocusLeft?: string
  nextFocusRight?: string
  trapFocus?: boolean
  disabled?: boolean
}

export interface GamepadEvent {
  nativeEvent: {
    keyCode: number
    action: number
  }
}

class GamepadNavigationManager {
  private nodes: Map<string, NavigationNode> = new Map()
  private currentFocus: string | null = null
  private listeners: Set<any> = new Set()
  private isLandscape: boolean = false

  constructor() {
    this.updateOrientation()
    Dimensions.addEventListener('change', this.updateOrientation.bind(this))
  }

  private updateOrientation() {
    const { width, height } = Dimensions.get('window')
    this.isLandscape = width > height
  }

  // Key codes for Android gaming handhelds
  private readonly KEYCODE_DPAD_UP = 19
  private readonly KEYCODE_DPAD_DOWN = 20
  private readonly KEYCODE_DPAD_LEFT = 21
  private readonly KEYCODE_DPAD_RIGHT = 22
  private readonly KEYCODE_DPAD_CENTER = 23
  private readonly KEYCODE_BUTTON_A = 96
  private readonly KEYCODE_BUTTON_B = 97
  private readonly KEYCODE_BUTTON_X = 99
  private readonly KEYCODE_BUTTON_Y = 100
  private readonly KEYCODE_BUTTON_L1 = 102
  private readonly KEYCODE_BUTTON_R1 = 103
  private readonly KEYCODE_BUTTON_L2 = 104
  private readonly KEYCODE_BUTTON_R2 = 105
  private readonly KEYCODE_BUTTON_SELECT = 109
  private readonly KEYCODE_BUTTON_START = 108
  private readonly KEYCODE_BACK = 4

  registerNode(node: NavigationNode): () => void {
    this.nodes.set(node.id, node)

    // Auto-focus first node if none is focused
    if (!this.currentFocus && !node.disabled) {
      this.setFocus(node.id)
    }

    return () => {
      this.nodes.delete(node.id)
      if (this.currentFocus === node.id) {
        this.currentFocus = null
      }
    }
  }

  updateNode(id: string, updates: Partial<NavigationNode>) {
    const node = this.nodes.get(id)
    if (node) {
      this.nodes.set(id, { ...node, ...updates })
    }
  }

  setFocus(nodeId: string) {
    const prevNode = this.currentFocus
      ? this.nodes.get(this.currentFocus)
      : null
    const nextNode = this.nodes.get(nodeId)

    if (!nextNode || nextNode.disabled) return

    // Blur previous node
    if (prevNode) {
      prevNode.onBlur?.()
    }

    // Focus new node
    this.currentFocus = nodeId
    nextNode.onFocus?.()
  }

  private findNextFocus(
    direction: 'up' | 'down' | 'left' | 'right',
  ): string | null {
    if (!this.currentFocus) return null

    const currentNode = this.nodes.get(this.currentFocus)
    if (!currentNode) return null

    // Check explicit next focus override
    const explicitNext = currentNode[
      `nextFocus${direction.charAt(0).toUpperCase() + direction.slice(1)}` as keyof NavigationNode
    ] as string
    if (explicitNext && this.nodes.has(explicitNext)) {
      return explicitNext
    }

    // Check trap focus
    if (currentNode.trapFocus) {
      return null
    }

    // Find closest node in direction
    return this.findClosestNode(direction)
  }

  private findClosestNode(
    direction: 'up' | 'down' | 'left' | 'right',
  ): string | null {
    // Simplified spatial navigation algorithm
    // In a real implementation, this would calculate actual positions
    const availableNodes = Array.from(this.nodes.entries())
      .filter(([id, node]) => id !== this.currentFocus && !node.disabled)
      .map(([id]) => id)

    if (availableNodes.length === 0) return null

    // For now, return the first available node
    // TODO: Implement proper spatial calculation based on component positions
    return availableNodes[0]
  }

  handleGamepadEvent(event: GamepadEvent): boolean {
    if (Platform.OS !== 'android') return false

    const { keyCode } = event.nativeEvent

    switch (keyCode) {
      case this.KEYCODE_DPAD_UP: {
        const next = this.findNextFocus('up')
        if (next) {
          this.setFocus(next)
          return true
        }
        break
      }
      case this.KEYCODE_DPAD_DOWN: {
        const next = this.findNextFocus('down')
        if (next) {
          this.setFocus(next)
          return true
        }
        break
      }
      case this.KEYCODE_DPAD_LEFT: {
        const next = this.findNextFocus('left')
        if (next) {
          this.setFocus(next)
          return true
        }
        break
      }
      case this.KEYCODE_DPAD_RIGHT: {
        const next = this.findNextFocus('right')
        if (next) {
          this.setFocus(next)
          return true
        }
        break
      }
      case this.KEYCODE_DPAD_CENTER:
      case this.KEYCODE_BUTTON_A: {
        const currentNode = this.currentFocus
          ? this.nodes.get(this.currentFocus)
          : null
        if (currentNode?.onSelect) {
          currentNode.onSelect()
          return true
        }
        break
      }
      case this.KEYCODE_BUTTON_B:
      case this.KEYCODE_BACK: {
        // Handle back/cancel action
        // Could be used for navigation back or closing modals
        return false
      }
    }

    return false
  }

  getCurrentFocus(): string | null {
    return this.currentFocus
  }

  isFocused(nodeId: string): boolean {
    return this.currentFocus === nodeId
  }

  clearFocus() {
    if (this.currentFocus) {
      const node = this.nodes.get(this.currentFocus)
      node?.onBlur?.()
      this.currentFocus = null
    }
  }

  getIsLandscape(): boolean {
    return this.isLandscape
  }
}

export const gamepadNavigation = new GamepadNavigationManager()
