// Base URL for the Cloudflare Worker proxy.
// During local development, point at the upstream APIs directly via the
// dev-proxy config in vite.config.js (or set VITE_WORKER_URL in .env.local).
// In production, set VITE_WORKER_URL to your deployed Worker URL.
export const WORKER_BASE = import.meta.env.VITE_WORKER_URL || ''

export const FLAG_CONFIG = {
  GREEN:  { label: 'Safe Conditions',       bg: 'bg-green-500',   text: 'text-white', border: 'border-green-600',  requirements: 'PFDs encouraged for club singles and pairs when water temp is below 60°F.' },
  YELLOW: { label: 'Moderate Caution',      bg: 'bg-yellow-400',  text: 'text-gray-900', border: 'border-yellow-500', requirements: '4-oar minimum. Safety launch and/or PFDs required for club singles and pairs.' },
  ORANGE: { label: 'Caution',               bg: 'bg-orange-500',  text: 'text-white', border: 'border-orange-600',  requirements: 'Safety launch required for all club boats.' },
  RED:    { label: 'Extreme Caution',       bg: 'bg-red-600',     text: 'text-white', border: 'border-red-700',    requirements: '8-oar minimum (8+s and quads only). Safety launch must be in sight.' },
  BLACK:  { label: 'Severe — Unrowable',    bg: 'bg-gray-900',    text: 'text-white', border: 'border-gray-800',   requirements: 'Dock is closed. Private boats strongly discouraged.' },
}
