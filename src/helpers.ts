/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'

// const isDebug = core.getInput('debug') === 'true'

// TODO: Fix this
export const log = (msg: string | any): void => {
  // core.debug(msg)
  console.log(msg)
  core.info(msg)
}

export const spaceToDash = (str: string): string => {
  return str.replace(/ /g, '-')
}

export const ToStringSafe = (str: unknown): string => {
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
