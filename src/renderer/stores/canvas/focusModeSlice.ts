// =============================================================================
// Focus-mode slice — overlay fullscreen and the Ctrl+Tab panel switcher.
// These are view-only: they do not move or resize node geometry.
// =============================================================================

import type { CanvasNodeId, Point } from '../../../shared/types'
import { cycleSwitcherId, type SwitcherDirection } from '../../lib/canvas/panelSwitcher'
import type { CanvasGet, CanvasSet, CanvasStoreActions } from './storeTypes'
import { focusedNodeId } from './selectionModel'

export type FocusModeActions = Pick<
  CanvasStoreActions,
  | 'toggleFullscreen'
  | 'enterFullscreen'
  | 'exitFullscreen'
  | 'openPanelSwitcher'
  | 'cyclePanelSwitcher'
  | 'commitPanelSwitcher'
  | 'cancelPanelSwitcher'
>

function nodeIdsInOrder(get: CanvasGet): CanvasNodeId[] {
  return get().sortedNodesByCreationOrder().map((n) => n.id)
}

function resolveFullscreenTarget(get: CanvasGet, id?: CanvasNodeId): CanvasNodeId | null {
  const state = get()
  const target = id ?? focusedNodeId(state) ?? (state.selection.length === 1 ? state.selection[0] : null)
  if (!target || !state.nodes[target]) return null
  return target
}

/** Viewport offset that places `nodeId`'s center in the middle of the canvas. */
function offsetToCenterNode(get: CanvasGet, nodeId: CanvasNodeId): Point | null {
  const state = get()
  const node = state.nodes[nodeId]
  const cs = state.containerSize
  if (!node || cs.width <= 0 || cs.height <= 0) return null
  const zoom = state.zoomLevel
  return {
    x: cs.width / 2 - (node.origin.x + node.size.width / 2) * zoom,
    y: cs.height / 2 - (node.origin.y + node.size.height / 2) * zoom,
  }
}

/** Pan the camera onto a switcher target. Overlay fullscreen already fills the
 *  canvas, so it does not move the stored viewport. */
function revealSwitcherNode(set: CanvasSet, get: CanvasGet, nodeId: CanvasNodeId): void {
  if (get().fullscreenNodeId) return
  const target = offsetToCenterNode(get, nodeId)
  if (!target) return
  if (!get().suppressAutoFocus) set({ suppressAutoFocus: true })
  get().animateViewportTo(target)
}

export function createFocusModeSlice(set: CanvasSet, get: CanvasGet): FocusModeActions {
  return {
    toggleFullscreen(id) {
      const target = resolveFullscreenTarget(get, id)
      if (!target) return
      if (get().fullscreenNodeId === target) {
        set({ fullscreenNodeId: null })
        return
      }
      get().focusNode(target)
      set({ fullscreenNodeId: target })
    },

    enterFullscreen(id) {
      if (!get().nodes[id]) return
      get().focusNode(id)
      set({ fullscreenNodeId: id })
    },

    exitFullscreen() {
      if (get().fullscreenNodeId) set({ fullscreenNodeId: null })
    },

    openPanelSwitcher(direction: SwitcherDirection) {
      const ids = nodeIdsInOrder(get)
      if (ids.length === 0) return
      if (ids.length === 1) {
        if (get().fullscreenNodeId) get().focusNode(ids[0])
        else get().focusAndCenter(ids[0])
        return
      }
      const from = get().panelSwitcher?.highlightId ?? focusedNodeId(get())
      const next = cycleSwitcherId(ids, from, direction)
      if (!next) return
      const existing = get().panelSwitcher
      set({
        panelSwitcher: {
          highlightId: next,
          prevOffset: existing?.prevOffset ?? { ...get().viewportOffset },
        },
      })
      revealSwitcherNode(set, get, next)
    },

    cyclePanelSwitcher(direction: SwitcherDirection) {
      if (!get().panelSwitcher) {
        get().openPanelSwitcher(direction)
        return
      }
      const next = cycleSwitcherId(nodeIdsInOrder(get), get().panelSwitcher!.highlightId, direction)
      if (!next) return
      set({ panelSwitcher: { ...get().panelSwitcher!, highlightId: next } })
      revealSwitcherNode(set, get, next)
    },

    commitPanelSwitcher() {
      const highlight = get().panelSwitcher?.highlightId
      if (!highlight || !get().nodes[highlight]) {
        set({ panelSwitcher: null })
        return
      }
      const stayFullscreen = get().fullscreenNodeId != null
      set({ panelSwitcher: null })
      if (stayFullscreen) {
        get().focusNode(highlight)
        set({ fullscreenNodeId: highlight })
      } else {
        get().focusAndCenter(highlight, { animate: true })
      }
    },

    cancelPanelSwitcher() {
      const prev = get().panelSwitcher?.prevOffset
      if (!get().panelSwitcher) return
      set({ panelSwitcher: null })
      if (prev && !get().fullscreenNodeId) {
        set({ suppressAutoFocus: false })
        get().animateViewportTo(prev)
      }
    },
  }
}
