/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'

// TODO: Fix this
export const debug = (msg: string | any): void => {
  core.debug(msg)
  // console.log(msg)
}
