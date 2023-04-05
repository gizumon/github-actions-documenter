import {
  GitHubActionsYaml,
  ReuseableWorkflowsYamlFileMap,
  CustomActionsYamlFileMap,
  CustomActionsYaml,
} from './types'
import * as fs from 'fs'
import constants from './constants'
import * as path from 'path'
import * as yaml from 'js-yaml'
import { log } from './helpers'
import { newLine } from './markdown'
import { InputProps } from './actions-core'

const commentRegExp = /^\s*#/
const annotationRegExp = /^\s*#\s*@/
const actionsYamlRegExp = /^action\.ya?ml$/

export interface GithubActionsAnnotationMap {
  [key: string]: Annotations
}

export type AnnotationType = 'example' | 'note'
export interface Annotation {
  arg?: string
  block: string[]
}
export interface Annotations {
  example: Annotation[]
  note: Annotation[]
}

export interface ReadYamlResult {
  customActionsYaml: CustomActionsYamlFileMap
  workflowCallYamlMap: ReuseableWorkflowsYamlFileMap
  annotationMap: GithubActionsAnnotationMap
}

export interface ReadReusableWorkflowsYamlResult {
  workflowCallYamlMap: ReuseableWorkflowsYamlFileMap
  annotationMap: GithubActionsAnnotationMap
}

export interface ReadCustomActionsYamlResult {
  customActionsYaml: CustomActionsYamlFileMap
  annotationMap: GithubActionsAnnotationMap
}

export const readYamls = (props: InputProps): ReadYamlResult => {
  let customActionsYaml: CustomActionsYamlFileMap = {}
  let workflowCallYamlMap: ReuseableWorkflowsYamlFileMap = {}
  let annotationMap: GithubActionsAnnotationMap = {}

  if (props.shouldSkipGenerateReusableWorkflows) {
    log('Skip generating Reusable Workflow documents')
  } else {
    const hasTargetFilepaths = props.targetFilepaths.length > 0
    const rwYmals = hasTargetFilepaths ? readReuseableWorkflowsYamlFromTargetPaths(props) : readReuseableWorkflowsYamlFromDir()
    workflowCallYamlMap = rwYmals.workflowCallYamlMap
    annotationMap = rwYmals.annotationMap
  }

  if (props.shouldSkipGenerateCustomActions) {
    log('Skip generating Custom Actions documents')
  } else {
    const cYmals = readCustomActionsYaml(props)
    customActionsYaml = cYmals.customActionsYaml
    annotationMap = {
      ...annotationMap,
      ...cYmals.annotationMap,
    }
  }
  return {
    customActionsYaml,
    workflowCallYamlMap,
    annotationMap,
  }
}

const readReuseableWorkflowsYamlFromTargetPaths = ({
  targetFilepaths,
}: InputProps): ReadReusableWorkflowsYamlResult => {
  const workflowCallYamlMap: ReuseableWorkflowsYamlFileMap = {}
  const annotationMap: GithubActionsAnnotationMap = {}
  targetFilepaths.forEach((fPath: string) => {
    if (!fPath.endsWith('.yml') && !fPath.endsWith('.yaml')) return
    log(`Check target file: ${fPath}`)
    try {
      const file = fs.readFileSync(fPath, 'utf-8')
      const lines = file.split(newLine)
      const actualLines = lines.filter((l) => !commentRegExp.test(l))

      // parse yaml file and filter workflow calls
      const doc = yaml.load(actualLines.join(newLine)) as GitHubActionsYaml

      if (!isWorkflowCall(doc)) return

      log(`File is a valid workflow_call yml file: ${fPath}`)
      workflowCallYamlMap[fPath] = doc
      annotationMap[fPath] = parseAnnotationComments(lines)
      return
    } catch (e) {
      log(`File is a valid workflow_call yml file: ${fPath}`)
      log(e instanceof Error ? e.message : e)
      return
    }
  })
  return {
    workflowCallYamlMap,
    annotationMap,
  }
}

const readReuseableWorkflowsYamlFromDir =
  (): ReadReusableWorkflowsYamlResult => {
    const workflowCallYamlMap: ReuseableWorkflowsYamlFileMap = {}
    const annotationMap: GithubActionsAnnotationMap = {}
    fs.readdirSync(constants.workflowsDir).forEach((fName) => {
      if (!fName.endsWith('.yml')) return
      log('Found file: ' + fName)
      try {
        const fPath = path.join(constants.workflowsDir, fName)
        const file = fs.readFileSync(fPath, 'utf-8')
        const lines = file.split(newLine)
        const actualLines = lines.filter((l) => !commentRegExp.test(l))

        // parse yaml file and filter workflow calls
        const doc = yaml.load(actualLines.join(newLine)) as GitHubActionsYaml

        if (!isWorkflowCall(doc)) return

        log('File is a valid workflow_call yml file: ' + fName)
        workflowCallYamlMap[fPath] = doc
        annotationMap[fPath] = parseAnnotationComments(lines)
        return
      } catch (e) {
        log('File is not a valid yml file: ' + fName)
        log(e instanceof Error ? e.message : e)
        return
      }
    })
    return {
      workflowCallYamlMap,
      annotationMap,
    }
  }

const isWorkflowCall = (obj: GitHubActionsYaml): boolean => {
  if (obj.on && obj.on.workflow_call) return true
  return false
}

const parseAnnotationComments = (lines: string[]): Annotations => {
  const result: Annotations = { example: [], note: [] }
  const blocks = recursiveFilterAnnotationComments(lines)
  blocks.forEach((block) => {
    if (block.length === 0) return
    const firstLine = block.shift() || ''
    const annotLine = firstLine?.replace(annotationRegExp, '').trim()
    const annotMap = annotLine.split('=')
    const annotType = annotMap[0] as AnnotationType
    const annotArg = annotMap[1] || ''
    if (!result[annotType]) {
      log('Unknown annotation: ' + annotType)
      return
    }
    result[annotType].push({ arg: annotArg, block: trimComments(block) })
  })

  return result
}

const recursiveFilterAnnotationComments = (
  lines: string[], // lines of a file
  commentsBlocks: string[][] = [], // annotation comments blocks
  found = false // found annotation comment in previous line
): string[][] => {
  // if no new line, return result
  if (lines.length === 0) return commentsBlocks

  // shift first line
  const nextLine = lines.shift() || ''

  // if the new line is not a comment,
  // skip it and continue the next execution
  if (!commentRegExp.test(nextLine)) {
    return recursiveFilterAnnotationComments(lines, commentsBlocks, false)
  }

  // if the new line includes annotation,
  // create a new comment block
  if (annotationRegExp.test(nextLine)) {
    commentsBlocks.push([nextLine])
    return recursiveFilterAnnotationComments(lines, commentsBlocks, true)
  }

  // if the new line is not a annotation and the previous line is a comment,
  // push the new line into the previous comment block
  if (found) {
    const idx = commentsBlocks.length - 1
    commentsBlocks[idx].push(nextLine)
    return recursiveFilterAnnotationComments(lines, commentsBlocks, true)
  }

  return recursiveFilterAnnotationComments(lines, commentsBlocks, false)
}

const trimComments = (comments: string[]): string[] => {
  return comments.map((comment) => comment?.replace(commentRegExp, ''))
}

const readCustomActionsYaml = ({
  targetFilepaths,
}: InputProps): ReadCustomActionsYamlResult => {
  const actionYmlsFilepaths = targetFilepaths.filter((fPath) =>
    actionsYamlRegExp.test(fPath)
  )
  const hasTargetFilepaths = actionYmlsFilepaths.length > 0
  return recursiveReadCustomActions(
    hasTargetFilepaths ? actionYmlsFilepaths : [constants.rootDir]
  )
}

export const recursiveReadCustomActions = (
  dirs: fs.PathLike[],
  yamlMap: ReadCustomActionsYamlResult = {
    customActionsYaml: {},
    annotationMap: {},
  }
): ReadCustomActionsYamlResult => {
  log(`Read custom actions in directory: ${dirs}, ${JSON.stringify(yamlMap)}`)
  const customActionsMap: CustomActionsYamlFileMap = {}
  const annotationMap: GithubActionsAnnotationMap = {}
  const nextDirs: fs.PathLike[] = []
  dirs.forEach((dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
      const fPath = path.join(dir.toString(), dirent.name)
      // if directory, recursively read its files
      if (dirent.isDirectory()) {
        if (dirent.name === 'node_modules') return
        return nextDirs.push(fPath)
      }
      if (!dirent.isFile()) return // skip if not a file
      if (!actionsYamlRegExp.test(dirent.name)) return // skip if not a yaml file
      try {
        log('Read custom action file: ' + fPath)
        const file = fs.readFileSync(fPath, 'utf-8')
        const lines = file.split(newLine)
        const actualLines = lines.filter((l) => !commentRegExp.test(l))

        const doc = yaml.load(actualLines.join(newLine)) as CustomActionsYaml
        if (!isCustomActions(doc)) return

        log('File is a valid Custom Actions file: ' + fPath)
        annotationMap[fPath] = parseAnnotationComments(lines)
        customActionsMap[fPath] = doc
      } catch (e) {
        log('File is not a valid yml file: ' + fPath)
        log(e instanceof Error ? e.message : e)
      }
    })
  })
  const newYamlMap = {
    customActionsYaml: {
      ...yamlMap.customActionsYaml,
      ...customActionsMap,
    },
    annotationMap: {
      ...yamlMap.annotationMap,
      ...annotationMap,
    },
  }
  if (nextDirs.length > 0) {
    log('next dirs: ' + JSON.stringify(nextDirs))
    return recursiveReadCustomActions(nextDirs, newYamlMap)
  }
  log('finished: recursive read Custom Actions')
  return newYamlMap
}

const isCustomActions = (obj: CustomActionsYaml): boolean =>
  ['name', 'description', 'runs'].every(
    (key) => obj[key as keyof CustomActionsYaml] !== undefined
  )
