import constants from './constants'
import { ReadYamlResult, Annotations, Annotation } from './fs'
import { toAnchorLink, toStringSafe, toBRFromNewLine } from './helpers'
import {
  ReuseableWorkflowsYaml,
  ReuseableWorkflowsYamlFileMap,
  CustomActionsYaml,
  CustomActionsYamlFileMap,
} from './types'

export const newLine = '\n'
export const divider = `${newLine}---${newLine}`
export const tbSeparator = ' | '
export const positionMap = {
  left: ':---',
  center: ':---:',
  right: '---:',
}

export const mdRaw = (text: string): string => `${text}${newLine}`
export const mdH1 = (text: string): string => `# ${text}${newLine}`
export const mdH2 = (text: string): string => `## ${text}${newLine}`
export const mdH3 = (text: string): string => `### ${text}${newLine}`
export const mdNote = (text: string): string => `> ${text}${newLine}`
export const mdComment = (text: string): string => `<!-- ${text} -->${newLine}`
export const mdList = (texts: string[]): string => texts.map((text: string) => `* ${text}`).join(newLine) + newLine
export const mdCodeBlock = (text: string, type = ''): string =>
  `\`\`\`${type}${newLine}${text}${newLine}\`\`\`${newLine}`

export const mdBold = (text: string): string => `__${text}__`
export const mdEmphasis = (text: string): string => `\`${text}\``
export const mdCell = (text: string): string => `| ${toBRFromNewLine(text)} |`
export const mdLink = (text: string, url: string): string => `[${text}](${url})`

type Position = 'left' | 'center' | 'right'
interface MdTable {
  headers: string[]
  rows: string[][]
  positions?: Position[]
}

export const mdTable = ({ headers, rows, positions = ['center'] }: MdTable): string => {
  const header = mdTableColumns(headers)
  const position = mdTablePosition(positions)
  const bodyRows = mdTableRows(rows)
  return `${header}${newLine}${position}${newLine}${bodyRows}`
}
export const mdTablePosition = (positions: Position[]): string => {
  const tbPositions = positions.map((p) => positionMap[p] || positionMap.center)
  return mdCell(tbPositions.join(tbSeparator))
}
export const mdTableRows = (rows: string[][]): string => rows.map((row: string[]) => mdTableColumns(row)).join(newLine)
export const mdTableColumns = (row: string[]): string => mdCell(row.join(tbSeparator))

// =====================================
// Reusable workflows markdown generator
// =====================================

export const mdAnchorStart = (): string => mdComment(`${constants.anchorAnnotation}=start`)
export const mdAnchorEnd = (): string => mdComment(`${constants.anchorAnnotation}=end`)

export const mdCommonHeader = (): string => {
  const anchor = mdAnchorStart()
  const link = 'https://github.com/gizumon/github-actions-documenter'
  const note =
    mdComment(`🚀 Generated automatically by ${link} 🚀`) +
    mdComment(`Please do not edit the below manually since they are are generated automatically by this job.`)
  return `${anchor}${newLine}${note}${newLine}`
}

export const mdFooter = (): string => {
  const anchor = mdAnchorEnd()
  return `${anchor}`
}

export const mdAnnotationExample = (annot: Annotation): string => {
  const title = annot.arg ? mdRaw(annot.arg) : mdBold(`Example:${newLine}`)
  const example = mdCodeBlock(annot.block.join(newLine), 'yaml')
  return `${title}${newLine}${example}`
}

export const mdAnnotationNote = (annot: Annotation): string => {
  const title = annot.arg ? mdRaw(annot.arg) : mdBold(`Note:${newLine}`)
  const note = annot.block.join(newLine)
  return `${title}${newLine}${note}${newLine}`
}

export const mdAgenda = (yamlMap: ReuseableWorkflowsYamlFileMap | CustomActionsYamlFileMap): string => {
  const agendaItem = Object.keys(yamlMap).map((key, i) => {
    const num = i + 1
    return `${mdLink(`${num}: ${yamlMap[key].name}`, toAnchorLink(`${num}: ${yamlMap[key].name}`))} ( ${mdLink(
      '📄',
      key
    )} )`
  })
  return mdList(agendaItem)
}

export const mdCustomActions = ({ customActionsYaml: yamlMap, annotationMap }: ReadYamlResult): string =>
  Object.keys(yamlMap)
    .map((key, i) => mdCustomAction(i + 1, yamlMap[key], annotationMap[key]))
    .join(newLine)

export const mdCustomAction = (
  num = 1,
  obj: CustomActionsYaml,
  annotationObj: Annotations = { example: [], note: [] }
): string => {
  const examplesDoc = annotationObj.example.map(mdAnnotationExample).join(newLine)
  const notesDoc = annotationObj.note.map(mdAnnotationNote).join(newLine)
  const contentDoc = ['name', 'runs', 'description', 'inputs', 'outputs']
    .map((key) => {
      if (obj[key as keyof CustomActionsYaml] === undefined) {
        return mdUnknownKey(key) // no data
      }
      switch (key) {
        case 'name':
          return mdH2(`${num}: ${obj[key]}`)
        case 'runs':
          return mdCustomActionsRuns(obj[key])
        case 'description':
          return mdRaw(obj[key]) + newLine + examplesDoc
        case 'inputs':
          return mdCustomActionsInputs(obj[key])
        case 'outputs':
          return mdCustomActionsOutputs(obj[key])
        default:
          return mdUnknownKey(key)
      }
    })
    .join(newLine)

  return `${contentDoc}${notesDoc}`
}

export const mdCustomActionsRuns = (runs: CustomActionsYaml['runs']): string =>
  `${mdEmphasis(`using: ${runs.using}`)}${newLine}`

export const mdCustomActionsInputs = (obj: CustomActionsYaml['inputs']): string => {
  if (!obj) return ''
  const headers = ['#', 'Required', 'Name', 'Default', 'Description']
  const positions = ['left', 'center', 'left', 'left', 'left'] as Position[]
  const rows = Object.keys(obj).map((key, i) => {
    return [
      String(i + 1), // #
      obj[key].required ? '✅' : '', // required
      toStringSafe(key), // name
      toStringSafe(obj[key].default), // default
      toStringSafe(obj[key].description), // description
    ]
  })

  const tableTitleDoc = mdH3('Inputs')
  const tableDoc = mdTable({
    headers,
    rows,
    positions,
  })

  return `${tableTitleDoc}${newLine}${tableDoc}${newLine}`
}

export const mdCustomActionsOutputs = (obj: CustomActionsYaml['outputs']): string => {
  if (!obj) return ''
  const headers = ['#', 'Name', 'Description']
  const positions = ['left', 'left', 'left'] as Position[]
  const rows = Object.keys(obj).map((key, i) => {
    return [
      String(i + 1), // #
      toStringSafe(key), // name
      toStringSafe(obj[key].description), // description
    ]
  })

  const tableTitleDoc = mdH3('Outputs')
  const tableDoc = mdTable({
    headers,
    rows,
    positions,
  })

  return `${tableTitleDoc}${newLine}${tableDoc}${newLine}`
}

export const mdReusableWorkflows = ({ workflowCallYamlMap: yamlMap, annotationMap }: ReadYamlResult): string =>
  Object.keys(yamlMap)
    .map((key, i) => mdReusableWorkflow(i + 1, yamlMap[key], annotationMap[key]))
    .join(newLine)

export const mdReusableWorkflow = (
  num = 1,
  obj: ReuseableWorkflowsYaml,
  annotationObj: Annotations = { example: [], note: [] }
): string => {
  const examplesDoc = annotationObj.example.map(mdAnnotationExample).join(newLine)
  const notesDoc = annotationObj.note.map(mdAnnotationNote).join(newLine)
  const contentDoc = ['name', 'on']
    .map((key) => {
      switch (key) {
        case 'name':
          return mdH2(`${num}: ${obj[key]}`) + examplesDoc
        case 'on':
          return onWorkflowCall(obj[key])
        default:
          return mdUnknownKey(key)
      }
    })
    .join(newLine)
  return `${contentDoc}${notesDoc}`
}

export const onWorkflowCall = ({ workflow_call: obj }: ReuseableWorkflowsYaml['on']): string => {
  return ['inputs', 'outputs', 'secrets']
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

export const onWorkflowCallInputs = (obj: ReuseableWorkflowsYaml['on']['workflow_call']['inputs']): string => {
  if (!obj) return ''
  const headers = ['#', 'Required', 'Type', 'Name', 'Default', 'Description']
  const positions = ['left', 'center', 'center', 'left', 'left', 'left'] as Position[]
  const rows = Object.keys(obj).map((key, i) => {
    return [
      String(i + 1), // #
      obj[key].required ? '✅' : '', // required
      toStringSafe(obj[key].type), // type
      toStringSafe(key), // name
      toStringSafe(obj[key].default), // default
      toStringSafe(obj[key].description), // description
    ]
  })

  const tableTitleDoc = mdH3('Inputs')
  const tableDoc = mdTable({
    headers,
    rows,
    positions,
  })

  return `${tableTitleDoc}${newLine}${tableDoc}${newLine}`
}

export const onWorkflowCallOutputs = (obj: ReuseableWorkflowsYaml['on']['workflow_call']['outputs']): string => {
  if (!obj) return ''
  const headers = ['#', 'Name', 'Description']
  const positions = ['left', 'left', 'left'] as Position[]
  const rows = Object.keys(obj).map((key, i) => {
    return [
      String(i + 1), // #
      toStringSafe(key), // name
      toStringSafe(obj[key].description), // description
    ]
  })

  const tableTitleDoc = mdH3('Outputs')
  const tableDoc = mdTable({
    headers,
    rows,
    positions,
  })

  return `${tableTitleDoc}${newLine}${tableDoc}${newLine}`
}

export const onWorkflowCallSecrets = (obj: ReuseableWorkflowsYaml['on']['workflow_call']['secrets']): string => {
  if (!obj) return ''
  const headers = ['#', 'Required', 'Name', 'Description']
  const positions = ['left', 'center', 'left', 'left'] as Position[]
  const rows = Object.keys(obj).map((key, i) => {
    return [
      String(i + 1), // #
      obj[key].required ? '✅' : '', // required
      toStringSafe(key), // name
      toStringSafe(obj[key].description), // description
    ]
  })

  const tableTitleDoc = mdH3('Secrets')
  const tableDoc = mdTable({
    headers,
    rows,
    positions,
  })

  return `${tableTitleDoc}${newLine}${tableDoc}${newLine}`
}

export const mdUnknownKey = (obj: unknown): string => {
  console.log(obj)
  return ''
}
