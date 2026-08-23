import { describe, expect, it } from 'vitest'
import { createCanvasStore } from '../canvasStore'
import { focusedNodeId } from './selectionModel'

function addThree() {
  const store = createCanvasStore()
  const a = store.getState().addNode('p-a', 'editor', { x: 0, y: 0 }, { width: 100, height: 80 })
  const b = store.getState().addNode('p-b', 'terminal', { x: 200, y: 0 }, { width: 100, height: 80 })
  const c = store.getState().addNode('p-c', 'browser', { x: 400, y: 0 }, { width: 100, height: 80 })
  return { store, a, b, c }
}

describe('overlay fullscreen', () => {
  it('fills via fullscreenNodeId without moving stored geometry', () => {
    const { store, a } = addThree()
    const before = store.getState().nodes[a]

    store.getState().toggleFullscreen(a)

    const after = store.getState()
    expect(after.fullscreenNodeId).toBe(a)
    expect(after.nodes[a].origin).toEqual(before.origin)
    expect(after.nodes[a].size).toEqual(before.size)
    expect(after.nodes[a].preMaximizeOrigin).toBeUndefined()
    expect(focusedNodeId(after)).toBe(a)
  })

  it('toggles off the same node and focuses the selected node when none is given', () => {
    const { store, b } = addThree()
    store.getState().selectNodes([b])
    store.getState().toggleFullscreen()
    expect(store.getState().fullscreenNodeId).toBe(b)

    store.getState().toggleFullscreen()
    expect(store.getState().fullscreenNodeId).toBeNull()
  })

  it('swaps the fullscreen node without restoring geometry maximize', () => {
    const { store, a, c } = addThree()
    store.getState().enterFullscreen(a)
    store.getState().enterFullscreen(c)
    expect(store.getState().fullscreenNodeId).toBe(c)
    expect(store.getState().nodes[a].origin).toEqual({ x: 0, y: 0 })
  })

  it('clears fullscreen when the node is removed', () => {
    const { store, a } = addThree()
    store.getState().enterFullscreen(a)
    store.getState().removeNode(a)
    expect(store.getState().fullscreenNodeId).toBeNull()
  })
})

describe('panel switcher', () => {
  it('opens on the next node and commits focus', () => {
    const { store, a, b } = addThree()
    store.getState().focusNode(a)

    store.getState().openPanelSwitcher('next')
    expect(store.getState().panelSwitcher).toEqual({ highlightId: b })
    expect(focusedNodeId(store.getState())).toBe(a)

    store.getState().commitPanelSwitcher()
    expect(store.getState().panelSwitcher).toBeNull()
    expect(focusedNodeId(store.getState())).toBe(b)
  })

  it('keeps overlay fullscreen when committing a different panel', () => {
    const { store, a, c } = addThree()
    store.getState().enterFullscreen(a)
    store.getState().openPanelSwitcher('previous')
    expect(store.getState().panelSwitcher?.highlightId).toBe(c)

    store.getState().commitPanelSwitcher()
    expect(store.getState().fullscreenNodeId).toBe(c)
    expect(focusedNodeId(store.getState())).toBe(c)
  })

  it('cancel leaves focus and fullscreen alone', () => {
    const { store, a } = addThree()
    store.getState().enterFullscreen(a)
    store.getState().openPanelSwitcher('next')
    store.getState().cancelPanelSwitcher()
    expect(store.getState().panelSwitcher).toBeNull()
    expect(store.getState().fullscreenNodeId).toBe(a)
    expect(focusedNodeId(store.getState())).toBe(a)
  })

  it('focuses the only node instead of opening a one-item switcher', () => {
    const store = createCanvasStore()
    const a = store.getState().addNode('p-a', 'editor', { x: 0, y: 0 }, { width: 100, height: 80 })
    store.getState().openPanelSwitcher('next')
    expect(store.getState().panelSwitcher).toBeNull()
    expect(focusedNodeId(store.getState())).toBe(a)
  })
})
