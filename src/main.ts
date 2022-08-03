/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import * as core from '@actions/core'
import * as fs from 'fs'
import constants from './constants'
import * as path from 'path'
import * as yaml from 'js-yaml'
import { GitHubActionsYaml } from './types'

interface Props {
  milliseconds: string
}

const runMain = async (): Promise<void> => {
  try {
    debug('Run reusable-workflow-documentator ...')

    const props: Props = getProps()
    debug(`Given properties: ${JSON.stringify(props)} ...`)

    // read yml file
    const yamlObjs = readYAMLs().filter(filterOnWorkflowCall)
    yamlObjs.forEach(yamlObj => debug(yamlObj))    

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

// TODO: Fix this
const debug = (msg: string | any): void => {
  core.debug(msg)
  // console.log(msg)
}

const getProps = (): Props => ({
  milliseconds: core.getInput('milliseconds')
})

const readYAMLs = (): GitHubActionsYaml[] => {
  return fs.readdirSync(constants.workflowsDir).map(fName => {
    if (!fName.endsWith('.yml')) return undefined
    debug('Found file: ' + fName)
    try {
      const fPath = path.join(constants.workflowsDir, fName)
      const doc = yaml.load(fs.readFileSync(fPath, 'utf-8'))
      return doc as GitHubActionsYaml
    } catch {
      debug('File is not a valid yml file: ' + fName)
      return undefined
    }
  }).filter(fName => fName !== undefined) as GitHubActionsYaml[]
}

const filterOnWorkflowCall = (obj: GitHubActionsYaml): boolean => Object.keys(obj?.on || {}).some(key => key === 'workflow_call')

runMain()
