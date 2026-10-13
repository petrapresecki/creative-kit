import processJson from '@content/process.json'
import guideJson from '@content/field-guide.json'

export interface Tool {
  kind: 'skill' | 'cmd' | 'page' | 'link'
  label: string
  value?: string
  note?: string
}

export interface Step {
  id: string
  phase: string
  title: string
  question: string
  why: string
  do: string[]
  tools: Tool[]
  output: string
  done: string[]
  principles: string[]
  checklist?: string[]
}

export interface Principle {
  id: string
  group: string
  name: string
  short: string
  explain: string
  check: string
  mistakes: string[]
  practice: string
  pins: { id: string; look: string }[]
}

export const process = processJson as { intro: string; steps: Step[] }
export const guide = guideJson as { intro: string; groups: { id: string; name: string }[]; principles: Principle[] }

export const getPrinciple = (id: string) => guide.principles.find(p => p.id === id)
/** Process steps that lean on a principle */
export const stepsFor = (principleId: string) => process.steps.filter(s => s.principles.includes(principleId))
