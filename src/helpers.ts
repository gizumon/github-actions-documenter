/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'

// const isDebug = core.getInput('debug') === 'true'

// TODO: Fix this
export const log = (msg: string | any): void => {
  // core.debug(msg)
  // console.log(msg)
  core.info(msg)
}

export const toStringSafe = (str: unknown): string => {
  switch (typeof str) {
    case 'undefined':
      return ''
    case 'string':
      return str
    case 'number':
      return str.toString()
    case 'boolean':
      return str.toString()
    case 'object':
      return JSON.stringify(str)
    default:
      return String(str)
  }
}

export const toAnchorLink = (str: string): string =>
  '#' +
  encodeURIComponent(
    str
      .trim()
      .toLocaleLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^0-9a-zA-Z-]/, '')
  )

export const toBRFromNewLine = (str: string): string =>
  str
    .trim()
    .replace(/(\r\n|\n|\r)/gm, '<br>')
    .replace(/^<br>/, '')
    .replace(/<br>$/, '')
