import { describe, expect, it } from 'vitest'
import { storedShortcut } from '../../../shared/types'
import { cycleSwitcherId, panelSwitcherHoldKey } from './panelSwitcher'

describe('cycleSwitcherId', () => {
  const ids = ['a', 'b', 'c']

  it('wraps forward and backward', () => {
    expect(cycleSwitcherId(ids, 'a', 'next')).toBe('b')
    expect(cycleSwitcherId(ids, 'c', 'next')).toBe('a')
    expect(cycleSwitcherId(ids, 'a', 'previous')).toBe('c')
    expect(cycleSwitcherId(ids, 'b', 'previous')).toBe('a')
  })

  it('starts at the ends when nothing is current', () => {
    expect(cycleSwitcherId(ids, null, 'next')).toBe('a')
    expect(cycleSwitcherId(ids, null, 'previous')).toBe('c')
  })

  it('falls back to the ends when the current id is stale', () => {
    expect(cycleSwitcherId(ids, 'gone', 'next')).toBe('a')
    expect(cycleSwitcherId(ids, 'gone', 'previous')).toBe('c')
  })

  it('returns null for an empty list', () => {
    expect(cycleSwitcherId([], 'a', 'next')).toBeNull()
  })
})

describe('panelSwitcherHoldKey', () => {
  it('prefers Control, then Command, then Option', () => {
    expect(panelSwitcherHoldKey(storedShortcut('\t', { control: true }))).toBe('Control')
    expect(panelSwitcherHoldKey(storedShortcut('\t', { command: true }))).toBe('Meta')
    expect(panelSwitcherHoldKey(storedShortcut('\t', { option: true }))).toBe('Alt')
    expect(panelSwitcherHoldKey(storedShortcut('\t'))).toBeNull()
  })
})
