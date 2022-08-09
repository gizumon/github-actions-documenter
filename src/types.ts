/* eslint-disable @typescript-eslint/no-explicit-any */
// ================================
// Naming
//   - Gha: GitHub Actions
//   - Rw : Reusable Workflows
// References
//   - doc: https://help.github.com/en/github/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions
//   - schema: https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/github-workflow.json
// ================================

// any interface
interface AnyObjValue {
  [key: string]: any
}
type AnyValue = string | string[] | AnyObjValue | AnyObjValue[]

// ================================
// GitHub Actions yaml interface
// [root]
// ================================
export interface GitHubActionsYamlFileMap {
  [key: string]: GitHubActionsYaml
}

export interface GitHubActionsYaml {
  name: string
  on: ActionsOn
  jobs: {
    name: string
    runs: string
    runsOn: string
    steps: {
      name: string
      runs: string
      runsOn: string
      uses: string
    }[]
  }
}
// --------------------------------

// ================================
// [root].on interface
// ================================
interface ActionsOn {
  push: OnPush
  pull_request: OnPullRequest
  delete: OnDelete
  workflow_call: OnWorkflowCall
  [key: string]: AnyValue
}
// --------------------------------

// ================================
// [root].on.push
// ================================
interface OnPush {
  branches: string[]
  [key: string]: AnyValue
}
// --------------------------------

// ================================
// [root].on.pull_request
// ================================
interface OnPullRequest {
  branches: string[]
  [key: string]: AnyValue
}
// --------------------------------

// ================================
// [root].on.delete
// ================================
interface OnDelete {
  branches: string[]
  [key: string]: AnyValue
}

// ================================
// on.workflow_call interfaces
// ================================
interface OnWorkflowCall {
  inputs?: WorkflowCallInputs
  outputs?: WorkflowCallOutputs
  secrets?: WorkflowCallSecrets
}
interface WorkflowCallInputs {
  [key: string]: {
    description?: string
    deprecationMessage?: string
    required: boolean
    type: 'string' | 'number' | 'boolean'
    default?: string
  }
}
interface WorkflowCallOutputs {
  [key: string]: {
    value: string
    description: string
    required: boolean
  }
}
interface WorkflowCallSecrets {
  [key: string]: {
    description?: string
    required: boolean
  }
}
// --------------------------------

export interface ReuseableWorkflowsYamlFileMap {
  [key: string]: ReuseableWorkflowsYaml
}

export interface ReuseableWorkflowsYaml {
  name: string
  on: {
    workflow_call: OnWorkflowCall
  }
  jobs: {
    name: string
    runs: string
    runsOn: string
    steps: {
      name: string
      runs: string
      runsOn: string
      uses: string
    }[]
  }
}

export interface CustomActionsYamlFileMap {
  [key: string]: CustomActionsYaml
}

export interface CustomActionsYaml {
  name: string
  description: string
  branding?: {
    color: string
    icon: string
    logo: string
  }
  runs: CustomJSActions | CustomCompositeActions | CustomDockerActions
  inputs?: CustomActionsInputs
  outputs?: CustomActionsOutputs
}

export interface CustomActionsInputs {
  [key: string]: {
    description: string
    deprecationMessage?: string
    required: boolean
    default?: string
  }
}

interface CustomActionsOutputs {
  [key: string]: {
    description: string
  }
}

export interface CustomJSActions {
  using: string
  pre?: string
  'pre-if'?: string
  main: string
}

export interface CustomCompositeActions {
  using: string
  steps: {
    [key: string]: any
  }
  [key: string]: any
}

export interface CustomDockerActions {
  using: string
  image: string
  [key: string]: any
}
