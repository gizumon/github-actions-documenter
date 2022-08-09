/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import * as core from '@actions/core'
// import * as github from '@actions/github'
// import * as exec from '@actions/exec'

import {
  mdCommonHeader,
  mdCustomActions,
  mdReusableWorkflows,
  newLine,
  mdFooter,
  mdAgenda,
  mdH1,
} from './markdown'
import { readYamls } from './fs'
import { log } from './helpers'

interface Props {
  overwrite: boolean
  output: string
  generateOnly?: boolean
  githubBaseUrl?: string
  shouldMakePullRequest?: boolean
}
const getProps = (): Props => ({
  overwrite: core.getInput('overwrite') === 'true',
  output: core.getInput('output-filepath'),
  generateOnly: core.getInput('generate-only') === 'true',
  githubBaseUrl: core.getInput('github-base-url'),
  shouldMakePullRequest: core.getInput('make-pull-request') === 'true',
})

const runMain = async (): Promise<void> => {
  try {
    log('Run github-actions-documenter ...')

    const props: Props = getProps()
    log(`props: ${JSON.stringify(props)} ...`)

    // read yml file
    const readYamlResult = readYamls()
    if (Object.keys(readYamlResult.workflowCallYamlMap).length === 0) {
      log('No workflow call yaml file found')
      core.setOutput('result', '')
      return
    }
    const headerDoc = mdCommonHeader()
    const footerDoc = mdFooter()
    const caTitle = mdH1('🔰 Custom Actions Usage 🔰')
    const caDoc = mdCustomActions(readYamlResult)
    const caAgendaDoc = mdAgenda(readYamlResult.customActionsYaml)
    const rwTitle = mdH1('🔰 Reusable Workflows 🔰')
    const rwDoc = mdReusableWorkflows(readYamlResult)
    const rwAgendaDoc = mdAgenda(readYamlResult.workflowCallYamlMap)
    const ca = `${caTitle}${newLine}${caAgendaDoc}${newLine}${caDoc}`
    const rw = `${rwTitle}${newLine}${rwAgendaDoc}${newLine}${rwDoc}`
    const result = `${newLine}${headerDoc}${ca}${newLine}${rw}${footerDoc}`
    core.setOutput('output', result)
    core.setOutput('output-ca', caDoc)
    core.setOutput('agenda-ca', caAgendaDoc)
    core.setOutput('output-rw', rwDoc)
    core.setOutput('agenda-rw', rwAgendaDoc)
    log('Done generate markdown processes ...')
    log(result)

    // const token = process.env.GITHUB_TOKEN || ''
    // log('token: ' + token)
    // TODO: Fix this, not working for now due to the generated file cannot find.
    // if (token && !props.generateOnly) {
    //   log('Run result commit and push...')
    //   exec.exec('echo', [
    //     `'${result}'`,
    //     props.overwrite ? '>' : '>>',
    //     props.documentPath,
    //   ])
    //   exec.exec('echo', [
    //     'test',
    //     props.overwrite ? '>' : '>>',
    //     '$(eval echo "test.txt")',
    //   ])
    //   exec.exec('ls', ['-l'])
    //   exec.exec('git', ['config', 'user.name', 'GitHub Action Documentator'])
    //   exec.exec('git', ['config', 'user.email', 'github-action.com'])
    //   log(await exec.getExecOutput('git', ['status']))
    //   exec.exec('git', ['add', props.filePath])
    //   exec.exec('git', ['commit', '-m', 'Update reusable workflows document'])
    //   const octokit = github.getOctokit(token, {
    //     baseUrl: props.githubBaseUrl
    //       ? props.githubBaseUrl
    //       : 'https://api.github.com',
    //   })
    //   const context = github.context

    //   // const defaultBranch = context.payload.repository?.default_branch || 'main'
    //   const owner = context.repo.owner
    //   const repo = context.repo.repo
    //   const headBranch = context.ref.replace('refs/heads/', '')
    //   // const baseBranch = context.payload.pull_request
    //   //   ? context.payload.pull_request.base.ref
    //   //   : defaultBranch

    //   if (props.shouldMakePullRequest) {
    //     // if make-pull-request is true, create a pull request
    //     try {
    //       const prBranch = `feature/github-actions-documenter-${Date.now()}`
    //       exec.exec('git', ['push', 'origin', prBranch])
    //       const pullRequest = await octokit.rest.pulls.create({
    //         owner,
    //         repo,
    //         title: '📝 Reusable Workflows Document',
    //         body: result,
    //         head: prBranch,
    //         base: headBranch, // pr from prBranch to baseBranch
    //       })
    //       if (pullRequest.status < 300) {
    //         log('Success create pull request')
    //       } else {
    //         log('Fail create pull request: ' + JSON.stringify(pullRequest))
    //         core.setFailed(new Error('Failed to create pull request'))
    //       }
    //     } catch (err) {
    //       log('Fail create pull request: ' + JSON.stringify(err))
    //       core.setFailed(
    //         err instanceof Error ? err : new Error(JSON.stringify(err))
    //       )
    //     }
    //   } else {
    //     // If make-pull-request is false, then push the changes to the head branch.
    //     exec.exec('git', ['push', 'origin', headBranch])
    //     log('Success push commit to ' + headBranch)
    //   }
    // }
  } catch (err) {
    core.setFailed(
      err instanceof Error ? err.message : `Unknown error: ${String(err)}`
    )
  }
}

runMain()
