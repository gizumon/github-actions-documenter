/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import * as core from '@actions/core'
import { mdCommonHeader, mdReusableWorkflows, newLine } from './markdown'
import { readYamls } from './fs'
import { debug } from './helpers'

// interface Props {

// }

const runMain = async (): Promise<void> => {
  try {
    debug('Run reusable-workflow-documentator ...')

    // const props: Props = getProps()
    // debug(`Given properties: ${JSON.stringify(props)} ...`)

    // read yml file
    const readYamlResult = readYamls()
    if (Object.keys(readYamlResult.workflowCallYamlMap).length === 0) {
      core.debug('No workflow call yaml file found')
      core.setOutput('result', '')
      return
    }
    const headerMd = mdCommonHeader()
    const contentMd = mdReusableWorkflows(readYamlResult)

    // TODO: Add agenda (Need name and filename map)
    const result = `${headerMd}${newLine}${contentMd}`
    debug(result)
    core.setOutput('result', result)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

// const getProps = (): Props => ({})

runMain()
