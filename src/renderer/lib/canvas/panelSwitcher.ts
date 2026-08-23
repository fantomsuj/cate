// =============================================================================
// Panel switcher — pure helpers for the Ctrl+Tab canvas-panel picker.
// =============================================================================

import type { StoredShortcut } from '../../../shared/types'

export type SwitcherDirection = 'next' | 'previous'

/** Cycle through node ids the same way nextNode/previousNode wrap. */
export function cycleSwitcherId(
  ids: string[],
  currentId: string | null,
  direction: SwitcherDirection,
): string | null {
  if (ids.length === 0) return null
  if (!currentId) return direction === 'next' ? ids[0] : ids[ids.length - 1]
  const index = ids.indexOf(currentId)
  if (index === -1) return direction === 'next' ? ids[0] : ids[ids.length - 1]
  return direction === 'next'
    ? ids[(index + 1) % ids.length]
    : ids[(index - 1 + ids.length) % ids.length]
}

/** Modifier the user holds while tapping Tab. Releasing it commits the pick. */
export function panelSwitcherHoldKey(shortcut: StoredShortcut): string | null {
  if (shortcut.control) return 'Control'
  if (shortcut.command) return 'Meta'
  if (shortcut.option) return 'Alt'
  return null
}

/** Inset of the focused panel from the canvas edge while in overlay fullscreen. */
export const FULLSCREEN_INSET = 16
