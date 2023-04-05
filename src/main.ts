import {
  mdCommonHeader,
  mdCustomActions,
  mdReusableWorkflows,
  newLine,
  mdFooter,
  mdAgenda,
  mdH1,
} from './markdown'
import { readYamls, ReadYamlResult } from './fs'
import { log } from './helpers'
import { getProps, InputProps, setFailed, setOutputs } from './actions-core'

const runMain = async (): Promise<void> => {
  log('Run github-actions-documenter ...')
  try {
    const props: InputProps = getProps()
    log(`Show input parameters: ${JSON.stringify(props)}`)

    if (props.shouldSkipGenerateCustomActions && props.shouldSkipGenerateReusableWorkflows) {
      log('Skip generating Custom Actions and Reusable Workflows')
      return
    }

    // read yml file
    const readYamlResult = readYamls(props)
    const results = makeResult(readYamlResult, props)

    setOutputs(results)
    log('Done generate markdown processes ...🎉')
    log(results.output)

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
    setFailed(
      err instanceof Error ? err.message : `Unknown error: ${String(err)}`
    )
  }
}

interface MdDocs {
  header: string
  footer: string
  output: string
  ca: string
  caTitle: string
  caContent: string
  caAgenda: string
  rw: string
  rwTitle: string
  rwContent: string
  rwAgenda: string
}

const makeResult = (yamlObj: ReadYamlResult, props: InputProps): MdDocs => {
  const commonDocs = {
    header: '',
    footer: '',
    output: '',
  }
  const caDocs = {
    ca: '',
    caTitle: '',
    caContent: '',
    caAgenda: '',
  }
  const rwDocs = {
    rw: '',
    rwTitle: '',
    rwContent: '',
    rwAgenda: '',
  }
  const hasCaDoc = Object.keys(yamlObj.customActionsYaml).length > 0
  const hasRwDoc = Object.keys(yamlObj.workflowCallYamlMap).length > 0
  if (!hasCaDoc && !hasRwDoc) {
    // return empty result
    log('No workflow call yaml file found')
    return {
      ...commonDocs,
      ...caDocs,
      ...rwDocs,
    }
  }
  commonDocs.header = mdCommonHeader()
  commonDocs.footer = mdFooter()
  if (hasCaDoc) {
    // set Custom Actions result
    log('Custom Actions yaml file found')
    caDocs.caTitle = mdH1('🔰 Custom Actions 🔰')
    caDocs.caContent = mdCustomActions(yamlObj)
    caDocs.caAgenda = props.shouldSkipGenerateAgenda ? '' : mdAgenda(yamlObj.customActionsYaml)
    caDocs.ca = `${caDocs.caTitle}${newLine}${caDocs.caAgenda}${newLine}${caDocs.caContent}${newLine}`
  }
  if (hasRwDoc) {
    // set Reusable Workflows result
    log('Reusable Workflows yaml file found')
    rwDocs.rwTitle = mdH1('🔰 Reusable Workflows 🔰')
    rwDocs.rwContent = mdReusableWorkflows(yamlObj)
    rwDocs.rwAgenda = props.shouldSkipGenerateAgenda ? '' : mdAgenda(yamlObj.workflowCallYamlMap)
    rwDocs.rw = `${rwDocs.rwTitle}${newLine}${rwDocs.rwAgenda}${newLine}${rwDocs.rwContent}${newLine}`
  }
  // set output result
  commonDocs.output = `${commonDocs.header}${caDocs.ca}${rwDocs.rw}${commonDocs.footer}`
  return {
    ...commonDocs,
    ...caDocs,
    ...rwDocs,
  }
}

runMain()
