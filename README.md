<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# GitHub Actions Documenter

Auto generate github actions document from yml file.

## Support actions

* [Reusable Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
* [Custom Actions](https://docs.github.com/en/actions/creating-actions/about-custom-actions)
  * Composite Actions
  * Docker Container Actions
  * Javascript Actions

## How to use

1. Make an awesome reusable workflow on your repository
2. Set reusable workflow in your repository
   * You can use [this workflow](#-reusable-workflows-usage-) and just call it to complete the setup.

For the additional documentation, this feature supports comment annotation features in your workflow file.

|#|Annotation|value|description|
|:---:|:---|:---|:---|
|1|@example|title with markdown value (e.g. ### Title)|`@example` can make examples with a code block and insert those comments under the each workflow title.|
|1|@note|title with markdown value (e.g. ### Title)|`@note` can make notes with a raw markdown and insert those comments at the bottom of the generated document.|

* You can find an example from the followings.
  * [Annotation Comment](.github/workflows/github-actions-documenter.yml)
  * [Generated document](#-reusable-workflows-usage-)

@overwrite-anchor

---

> 🚀 Generated automatically by [github-actions-documenter](https://github.com/gizumon/github-actions-documenter) 🚀
⚠️ This is a generated markdown file. Do not edit this file manually.

# 🔰 Custom Actions Usage 🔰

* [1: GitHub Actions documenter](#1-github-actions-documenter) ( [📄](action.yml) )

## 1: GitHub Actions documenter

`using: node16`

### Basic example

```
 steps:
   - id: documentator
     name: "Generate document"
     uses: gizumon/github-actions-documenter/.github/workflows/github-actions-documenter.yml@main
```

Auto documentation for Github Actions workflows


### Outputs

| # | Name | Description |
| :--- | :--- | :--- |
| 1 | output | GitHub Actions markdown documents including Custom Actions and Reusable Workflows |
| 2 | agenda-ca | Agenda for Custom Actions markdown documents |
| 3 | output-ca | Custom Actions markdown documents |
| 4 | agenda-rw | Agenda for Reusable Workflows markdown documents |
| 5 | output-rw | Reusable Workflows markdown documents |
# 🔰 Reusable Workflows 🔰

* [1: Document Generate Reusable Workflow](#1-document-generate-reusable-workflow) ( [📄](.github/workflows/github-actions-documenter.yml) )

## 1: Document Generate Reusable Workflow
### Example1: Basic example

```
 name: "Basic example"
 on:
   pull_request:
     paths:
       - .github/workflows/*.yml
 jobs:
   test:
     uses: gizumon/github-actions-documenter/.github/workflows/github-actions-documenter.yml@main
     with:
       filepath: README.md
```

### Example2: Advanced example (with GHES support)

```
 name: "Advanced example"
 on:
   pull_request:
     paths:
       - .github/workflows/*.yml
 jobs:
   test:
     uses: gizumon/github-actions-documenter/.github/workflows/github-actions-documenter.yml@main
     with:
       filepath: .github/docs/reusable-workflow-doc.md
       overwrite: true
       make-pull-request: true
```

### Inputs

| # | Required | Type | Name | Default | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| 1 | ✅ | string | filepath | README.md | Filepath to write the generated reusable workflow document. (default: README.md) |
| 2 |  | boolean | overwrite | false | If true, overwrite the filepath file. (default: false) |
| 3 |  | boolean | make-pull-request | false | If true, make a pull request to ref branch. If false, directly push to ref branch. (default: false) |

### Outputs

| # | Name | Description |
| :--- | :--- | :--- |
| 1 | output | GitHub Actions markdown document (Reusable Workflow and Custom Actions) |

### Support events

 - push
 - pull_request

