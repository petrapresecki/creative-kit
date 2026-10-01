// Types for the showcase site's live demos (demo.tsx files are not copied into projects)

export type Control =
  | { name: string; label: string; type: 'range'; min: number; max: number; step: number; default: number }
  | { name: string; label: string; type: 'select'; options: string[]; default: string }
  | { name: string; label: string; type: 'toggle'; default: boolean }
  | { name: string; label: string; type: 'text'; default: string }

export type DemoValues = Record<string, string | number | boolean>

export interface DemoProps {
  values: DemoValues
}
