/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import * as core from '@actions/core'
import * as github from '@actions/github'

import { mdCommonHeader, mdReusableWorkflows, newLine } from './markdown'
import { readYamls } from './fs'
import { log } from './helpers'

interface Props {
  shouldMakePullRequest?: boolean
  githubBaseUrl?: string
}

const runMain = async (): Promise<void> => {
  try {
    log('Run reusable-workflow-documentator ...')

    const { shouldMakePullRequest, githubBaseUrl }: Props = getProps()
    log(`should make pull request: ${shouldMakePullRequest} ...`)
    log(`github base url: ${githubBaseUrl} ...`)

    // read yml file
    const readYamlResult = readYamls()
    if (Object.keys(readYamlResult.workflowCallYamlMap).length === 0) {
      log('No workflow call yaml file found')
      core.setOutput('result', '')
      return
    }
    const headerMd = mdCommonHeader()
    const contentMd = mdReusableWorkflows(readYamlResult)

    // TODO: Add agenda (Need name and filename map)
    const result = `${headerMd}${newLine}${contentMd}`
    core.setOutput('document', result)
    log('Done generate markdown processes ...')
    log(result)

    // TODO: should fix this
    const token = process.env.GITHUB_TOKEN
    if (token && shouldMakePullRequest) {
      const octokit = github.getOctokit(token, {
        baseUrl: githubBaseUrl ? githubBaseUrl : 'https://api.github.com',
      })

      const context = github.context
      const owner = context.repo.owner
      const repo = context.repo.repo
      const headBranch = context.ref.replace('refs/heads/', '')
      const baseBranch = context.payload.pull_request
        ? context.payload.pull_request.base.ref
        : 'main'

      try {
        const pullRequest = await octokit.rest.pulls.create({
          owner,
          repo,
          title: 'Reusable Workflows',
          body: result,
          head: headBranch,
          base: baseBranch,
        })
        if (pullRequest.status < 300) {
          log('Success ...')
        } else {
          log('Fail ...')
          core.setFailed(new Error('Failed to create pull request'))
        }
      } catch (err: any) {
        core.setFailed(new Error(err))
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

const getProps = (): Props => ({
  shouldMakePullRequest: core.getInput('make-pull-request') === 'true',
  githubBaseUrl: core.getInput('github-base-url'),
})

runMain()
