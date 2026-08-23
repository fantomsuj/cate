// =============================================================================
// PanelSwitcher — macOS-style strip for cycling canvas nodes (Ctrl+Tab).
// =============================================================================

import React, { useMemo } from 'react'
import { activeDockPanelId } from '../../shared/collectPanelIds'
import { PANEL_DEFINITIONS } from '../../shared/panels'
import { useCanvasStoreContext } from '../stores/CanvasStoreContext'
import { useSelectedWorkspace } from '../stores/appStore'
import { getPanelDef } from '../panels/registry'

const PanelSwitcher: React.FC = () => {
  const switcher = useCanvasStoreContext((s) => s.panelSwitcher)
  const nodes = useCanvasStoreContext((s) => s.nodes)
  const workspace = useSelectedWorkspace()

  const items = useMemo(() => {
    return Object.values(nodes)
      .filter((n) => n.animationState !== 'exiting')
      .sort((a, b) => a.creationIndex - b.creationIndex)
      .map((node) => {
        const panelId = activeDockPanelId(node.dockLayout)
        const panel = panelId ? workspace?.panels[panelId] : undefined
        const type = panel?.type ?? 'editor'
        return {
          nodeId: node.id,
          title: panel?.title || PANEL_DEFINITIONS[type]?.label || 'Panel',
          type,
        }
      })
  }, [nodes, workspace])

  if (!switcher || items.length < 2) return null

  return (
    <div
      data-panel-switcher
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 200000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        background: 'color-mix(in srgb, var(--surface-0) 18%, transparent)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 10,
          padding: '14px 16px',
          borderRadius: 16,
          background: 'color-mix(in srgb, var(--surface-0) 86%, transparent)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          border: 'var(--hairline) solid var(--border-subtle)',
          boxShadow: '0 18px 48px -16px rgba(0,0,0,0.55)',
        }}
      >
        {items.map((item) => {
          const selected = item.nodeId === switcher.highlightId
          const Icon = getPanelDef(item.type).icon
          return (
            <div
              key={item.nodeId}
              data-switcher-item={item.nodeId}
              data-selected={selected ? 'true' : 'false'}
              style={{
                width: 92,
                padding: '10px 8px 8px',
                borderRadius: 12,
                background: selected ? 'var(--surface-3)' : 'transparent',
                boxShadow: selected ? '0 0 0 2px var(--focus-blue)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={28} />
              <div
                style={{
                  width: '100%',
                  fontSize: 11,
                  fontWeight: 600,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.title}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PanelSwitcher
