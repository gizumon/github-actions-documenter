import { ReuseableWorkflowsYaml } from './types'

export const newLine = '\n'
export const divider = '---'
export const tbSeparator = ' | '
export const positionMap = {
  left: ':---',
  center: ':---:',
  right: '---:',
}

export const mdH1 = (text: string): string => {
  return `# ${text}${newLine}`
}
export const mdH2 = (text: string): string => {
  return `## ${text}${newLine}`
}
export const mdH3 = (text: string): string => {
  return `### ${text}${newLine}`
}

export const mdList = (texts: string[]): string => {
  return texts.map((text: string) => `* ${text}`).join(newLine)
}

export const mdNote = (text: string): string => {
  return `> ${text}${newLine}`
}

export const mdCodeBlock = (text: string): string => {
  return `\`\`\`${text}\`\`\``
}

export const mdCell = (text: string): string => {
  return `| ${text} |`
}

type Position = 'left' | 'center' | 'right'
interface MdTable {
  headers: string[]
  rows: string[][]
  positions?: Position[]
}

export const mdTable = ({
  headers,
  rows,
  positions = ['center'],
}: MdTable): string => {
  const header = mdTableColumn(headers)
  const position = mdTablePosition(positions)
  const bodyRows = mdTableRows(rows)
  return `${header}${newLine}${position}${newLine}${bodyRows}${newLine}`
}

export const mdTablePosition = (positions: Position[]): string => {
  const tbPositions = positions.map((p) => positionMap[p] || positionMap.center)
  return mdCell(tbPositions.join(tbSeparator))
}

export const mdTableRows = (rows: string[][]): string => {
  return rows.map((row: string[]) => mdTableColumn(row)).join(newLine)
}

export const mdTableColumn = (row: string[]): string => {
  return mdCell(row.join(tbSeparator))
}

// =====================================
// Reusable workflows markdown generator
// =====================================

export const mdCommonHeader = (): string => {
  const link = 'https://github.com/gizumon/reusable-workflow-documentator'
  const note = mdNote(
    `🚀 Generated automatically by [reusable-workflow-documentator](${link}) 🚀${newLine}`
  )
  const title = mdH1('🔰 Reusable Workflows Usage 🔰')
  return `${divider}${newLine}${note}${newLine}${title}${newLine}`
}

export const mdReusableWorkflow = (
  obj: ReuseableWorkflowsYaml,
  index: number
): string => {
  return Object.keys(obj)
    .map((key) => {
      switch (key) {
        case 'name':
          return mdH2(`${index + 1}: ${obj[key]}`)
        case 'on':
          return onWorkflowCall(obj[key])
        default:
          return mdUnknownKey(key)
      }
    })
    .join(newLine)
}

export const onWorkflowCall = ({
  workflow_call: obj,
}: ReuseableWorkflowsYaml['on']): string => {
  return Object.keys(obj)
    .map((key) => {
      switch (key) {
        case 'inputs':
          return onWorkflowCallInputs(obj[key])
        case 'outputs':
          return onWorkflowCallOutputs(obj[key])
        case 'secrets':
          return onWorkflowCallSecrets(obj[key])
        default:
          return mdUnknownKey(key)
      }
    })
    .join(newLine)
}

export const onWorkflowCallInputs = (
  obj: ReuseableWorkflowsYaml['on']['workflow_call']['inputs']
): string => {
  if (!obj) return ''
  const headers = ['#', 'Required', 'Type', 'Name', 'Default', 'Description']
  const positions = [
    'left',
    'center',
    'center',
    'left',
    'left',
    'left',
  ] as Position[]
  const rows = Object.keys(obj).map((key, i) => {
    return [
      String(i + 1), // #
      obj[key].required ? '○' : '×', // required
      obj[key].type, // type
      key, // name
      obj[key].default || '', // default
      obj[key].description || '', // description
    ]
  })

  const tableTitle = mdH3('Inputs')
  const table = mdTable({
    headers,
    rows,
    positions,
  })

  return `${tableTitle}${newLine}${table}${newLine}`
}

export const onWorkflowCallOutputs = (
  obj: ReuseableWorkflowsYaml['on']['workflow_call']['outputs']
): string => {
  if (!obj) return ''
  const headers = ['#', 'Name', 'Description']
  const positions = ['left', 'left', 'left'] as Position[]
  const rows = Object.keys(obj).map((key, i) => {
    return [
      String(i + 1), // #
      key, // name
      obj[key].description || '', // description
    ]
  })

  const tableTitle = mdH3('Outputs')
  const table = mdTable({
    headers,
    rows,
    positions,
  })

  return `${tableTitle}${newLine}${table}${newLine}`
}

export const onWorkflowCallSecrets = (
  obj: ReuseableWorkflowsYaml['on']['workflow_call']['secrets']
): string => {
  if (!obj) return ''
  const headers = ['#', 'Required', 'Name', 'Description']
  const positions = ['left', 'center', 'left', 'left'] as Position[]
  const rows = Object.keys(obj).map((key, i) => {
    return [
      String(i + 1), // #
      obj[key].required ? '○' : '×', // required
      key, // name
      obj[key].description || '', // description
    ]
  })

  const tableTitle = mdH3('Secrets')
  const table = mdTable({
    headers,
    rows,
    positions,
  })

  return `${tableTitle}${newLine}${table}${newLine}`
}

export const mdUnknownKey = (obj: unknown): string => {
  console.log(obj)
  return ''
}
