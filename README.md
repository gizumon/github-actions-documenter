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

1. Make your awesome Custom Actions or Reusable Workflows on your repository.
2. Use [this reusable workflow](./.github/workflows/github-actions-documenter.yml) in your repository.
   * Please find a example of usage [here](./.github/workflows/caller-test.yml).

For adding further documentation, comment annotation features are supported on the workflow file.

|#|Annotation|value|description|
|:---:|:---|:---|:---|
|1|@example|Title with markdown value (e.g. ### Title)|`@example` can make examples with a code block and insert those comments under the each workflow title.|
|1|@note|Title with markdown value (e.g. ### Title)|`@note` can make notes with a raw markdown and insert those comments at the bottom of the generated document.|

* You can find examples for the usage of annotations below.
  * [Annotation comments](.github/workflows/github-actions-documenter.yml)
  * [Generated document](#-custom-actions-)

## Change log

* 2022/08/10: First creation v0.0.1
* 2022/08/10: Readme update v0.0.2

[](@overwrite-anchor=start)

---

> 🚀 Generated automatically by [github-actions-documenter](https://github.com/gizumon/github-actions-documenter) 🚀
> ⚠️ This was generated automatically. Please do not edit the below manually.

# 🔰 Custom Actions 🔰

* [1: GitHub Actions documenter](#1-github-actions-documenter) ( [📄](action.yml) )

## 1: GitHub Actions documenter

`using: node16`

Auto documentation for Github Actions workflows

### Basic example

```
 steps:
   - id: documenter
     name: "Generate document"
     uses: gizumon/github-actions-documenter@main
```


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
       - '.github/workflows/*.yml'
 jobs:
   test:
     uses: gizumon/github-actions-documenter/.github/workflows/github-actions-documenter.yml@main
     with:
       filepath: README.md
```

### Example2: Advanced example

```
 name: "Advanced example"
 on:
   pull_request:
     paths:
       - '.github/workflows/*.yml'
 jobs:
   test:
     uses: gizumon/github-actions-documenter/.github/workflows/github-actions-documenter.yml@main
     with:
       filepath: .github/docs/github-actions-doc.md
       overwrite: true
       make-pull-request: true
```

### Inputs

| # | Required | Type | Name | Default | Description |
| :--- | :---: | :---: | :--- | :--- | :--- |
| 1 | ✅ | string | filepath | README.md | Filepath to write the generated reusable workflow document. (default: README.md) |
| 2 |  | boolean | overwrite | false | If true, overwrite the filepath file. (default: false) |
| 3 |  | boolean | make-pull-request | false | If true, make a pull request to ref branch.
If false, directly push to ref branch. (default: false)
 |

### Outputs

| # | Name | Description |
| :--- | :--- | :--- |
| 1 | output | GitHub Actions markdown document (Reusable Workflow and Custom Actions) |

### Support events

 - push
 - pull_request


---
[](@overwrite-anchor=end)

