import * as core from '@actions/core'

export interface InputProps {
  targetFilepaths: string[]
  shouldSkipGenerateCustomActions: boolean
  shouldSkipGenerateReusableWorkflows: boolean
  shouldSkipGenerateAgenda: boolean
  // overwrite: boolean
  // output: string
  // generateOnly?: boolean
  // githubBaseUrl?: string
  // shouldMakePullRequest?: boolean
}

export const getProps = (): InputProps => ({
  targetFilepaths: core.getInput('target-filepaths') ? core.getInput('target-filepaths').split('\n') : [],
  shouldSkipGenerateCustomActions: core.getInput('should-skip-generate-custom-actions') === 'true',
  shouldSkipGenerateReusableWorkflows: core.getInput('should-skip-generate-reusable-workflows') === 'true',
  shouldSkipGenerateAgenda: core.getInput('should-skip-generate-agenda') === 'true',
  // overwrite: core.getInput('overwrite') === 'true',
  // output: core.getInput('output-filepath'),
  // generateOnly: core.getInput('generate-only') === 'true',
  // githubBaseUrl: core.getInput('github-base-url'),
  // shouldMakePullRequest: core.getInput('make-pull-request') === 'true',
})

export interface OutputProps {
  output: string
  caContent: string
  caAgenda: string
  rwContent: string
  rwAgenda: string
}

export const setOutputs = (outputs: OutputProps): void => {
  core.setOutput('output', outputs.output)
  core.setOutput('output-ca', outputs.caContent)
  core.setOutput('agenda-ca', outputs.caAgenda)
  core.setOutput('output-rw', outputs.rwContent)
  core.setOutput('agenda-rw', outputs.rwAgenda)
}

export const setFailed = (errMsg: string): void => core.setFailed(errMsg)
