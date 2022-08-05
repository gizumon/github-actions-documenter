import { GitHubActionsYaml, ReuseableWorkflowsYamlFileMap } from './types'
import * as fs from 'fs'
import constants from './constants'
import * as path from 'path'
import * as yaml from 'js-yaml'
import { debug } from './helpers'
import { newLine } from './markdown'

const commentRegExp = /^\s*#/
const annotationRegExp = /^\s*#\s*@/

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
  workflowCallYamlMap: ReuseableWorkflowsYamlFileMap
  annotationMap: GithubActionsAnnotationMap
}

export const readYamls = (): ReadYamlResult => {
  const workflowCallYamlMap: ReuseableWorkflowsYamlFileMap = {}
  const annotationMap: GithubActionsAnnotationMap = {}
  fs.readdirSync(constants.workflowsDir).forEach((fName) => {
    if (!fName.endsWith('.yml')) return
    debug('Found file: ' + fName)
    try {
      const fPath = path.join(constants.workflowsDir, fName)
      const file = fs.readFileSync(fPath, 'utf-8')
      const lines = file.split(newLine)
      const actualLines = lines.filter((l) => !commentRegExp.test(l))

      // parse yaml file and filter workflow calls
      const doc = yaml.load(actualLines.join(newLine)) as GitHubActionsYaml
      debug(doc)
      if (isWorkflowCall(doc)) {
        debug('File is not a valid yml file: ' + fName)
        workflowCallYamlMap[fName] = doc

        // parse annotation comments
        const annotations = parseAnnotationComments(lines)
        annotationMap[fName] = annotations
      }
      return
    } catch {
      debug('File is not a valid yml file: ' + fName)
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
    const annotLine = firstLine.replace(annotationRegExp, '').trim()
    const annotMap = annotLine.split('=')
    const annotType = annotMap[0] as AnnotationType
    const annotArg = annotMap[1] || ''
    if (!result[annotType]) {
      debug('Unknown annotation: ' + annotType)
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
  return comments.map((comment) => comment.replace(commentRegExp, ''))
}
