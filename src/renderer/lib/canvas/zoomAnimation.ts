const FRAME_MS_60HZ = 1000 / 60

/** Time-correct equivalent of applying a lerp with the given per-frame ease
 *  once per 60 Hz frame, regardless of the display's actual refresh rate. */
export function easeForElapsed(elapsedMs: number, easePer60HzFrame: number): number {
  return 1 - Math.pow(
    1 - easePer60HzFrame,
    Math.max(0, elapsedMs) / FRAME_MS_60HZ,
  )
}

const ZOOM_EASE_PER_60HZ_FRAME = 0.15

/** Time-correct equivalent of applying a 0.15 lerp once per 60 Hz frame. */
export function zoomEaseForElapsed(elapsedMs: number): number {
  return easeForElapsed(elapsedMs, ZOOM_EASE_PER_60HZ_FRAME)
}
