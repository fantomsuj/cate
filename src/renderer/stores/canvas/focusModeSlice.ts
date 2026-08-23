// =============================================================================
// Focus-mode slice — overlay fullscreen and the Ctrl+Tab panel switcher.
// These are view-only: they do not move or resize node geometry.
// =============================================================================

import type { CanvasNodeId } from '../../../shared/types'
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
        get().focusNode(ids[0])
        return
      }
      const from = get().panelSwitcher?.highlightId ?? focusedNodeId(get())
      const next = cycleSwitcherId(ids, from, direction)
      if (next) set({ panelSwitcher: { highlightId: next } })
    },

    cyclePanelSwitcher(direction: SwitcherDirection) {
      if (!get().panelSwitcher) {
        get().openPanelSwitcher(direction)
        return
      }
      const next = cycleSwitcherId(nodeIdsInOrder(get), get().panelSwitcher!.highlightId, direction)
      if (next) set({ panelSwitcher: { highlightId: next } })
    },

    commitPanelSwitcher() {
      const highlight = get().panelSwitcher?.highlightId
      if (!highlight || !get().nodes[highlight]) {
        set({ panelSwitcher: null })
        return
      }
      const stayFullscreen = get().fullscreenNodeId != null
      set({ panelSwitcher: null })
      get().focusNode(highlight)
      if (stayFullscreen) set({ fullscreenNodeId: highlight })
    },

    cancelPanelSwitcher() {
      if (get().panelSwitcher) set({ panelSwitcher: null })
    },
  }
}
