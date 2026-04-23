/**
 * Pure flag-calculation logic.
 * Inputs: velocity in fps (from USGS), water temp in °F (from USGS).
 * Returns one of: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'BLACK'
 *
 * Thresholds (WRC policy):
 *   velocity ≥ 3.5 fps  → BLACK
 *   velocity ≥ 3.0 fps  → RED
 *   velocity ≥ 2.5 fps  → ORANGE (also if temp < 40 °F)
 *   velocity ≥ 1.5 fps  → YELLOW (also if temp < 50 °F)
 *   otherwise           → GREEN
 *
 * Wind is informational only — see getWindStatus().
 */

export function calculateFlag(velocityFps, tempF) {
  // Safety — treat nulls/NaN as unavailable (return null so UI can show "Data unavailable")
  if (velocityFps == null || isNaN(velocityFps)) return null

  if (velocityFps >= 3.5) return 'BLACK'
  if (velocityFps >= 3.0) return 'RED'
  if (velocityFps >= 2.5) return 'ORANGE'

  // Cold-water escalation (temp may be null if sensor is offline)
  if (tempF != null && !isNaN(tempF)) {
    if (tempF < 40) return 'ORANGE'
    if (tempF < 50) return 'YELLOW'
  }

  if (velocityFps >= 1.5) return 'YELLOW'

  return 'GREEN'
}

/**
 * Returns a wind status object given sustained wind speed in mph.
 * Wind is advisory only — it does not change the flag color.
 */
export function getWindStatus(speedMph) {
  if (speedMph == null || isNaN(speedMph)) {
    return { level: 'unknown', label: 'Wind data unavailable', advisory: false }
  }
  if (speedMph < 10) {
    return { level: 'calm', label: `${speedMph} mph — Calm`, advisory: false }
  }
  if (speedMph < 15) {
    return { level: 'breezy', label: `${speedMph} mph — Breezy`, advisory: true }
  }
  if (speedMph < 20) {
    return { level: 'windy', label: `${speedMph} mph — Windy`, advisory: true }
  }
  return { level: 'high', label: `${speedMph} mph — High winds`, advisory: true }
}
