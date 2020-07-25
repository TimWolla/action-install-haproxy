/* The MIT License (MIT)
 *
 * Copyright (c) 2020 Tim Düsterhus
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import {exec} from '@actions/exec'
import stringToBool from './stringToBool'

async function run(): Promise<void> {
  try {
    const branch = core.getInput('branch', {
      required: true
    })

    const OPTIONS: string[] = []

    if (stringToBool(core.getInput('use_lua'))) {
      await core.group(`Install 'use_lua' build dependencies.`, async () => {
        await exec('sudo', ['apt-get', 'install', '-y', 'liblua5.3-dev'])
      })
      OPTIONS.push('USE_LUA=1')
    }
    if (stringToBool(core.getInput('use_openssl'))) {
      await core.group(
        `Install 'use_openssl' build dependencies.`,
        async () => {
          await exec('sudo', ['apt-get', 'install', '-y', 'libssl-dev'])
        }
      )
      OPTIONS.push('USE_OPENSSL=1')
    }

    const haproxy_path = await core.group(
      `Download and compile HAProxy`,
      async () => {
        const haproxy_tar_gz = await tc.downloadTool(
          `http://www.haproxy.org/download/${branch}/src/snapshot/haproxy-ss-LATEST.tar.gz`
        )
        const extracted = await tc.extractTar(haproxy_tar_gz, undefined, [
          'xv',
          '--strip-components=1'
        ])
        await exec(
          'make',
          ['-C', extracted, 'TARGET=linux-glibc'].concat(OPTIONS)
        )
        return extracted
      }
    )
    core.addPath(haproxy_path)

    if (stringToBool(core.getInput('install_vtest'))) {
      const vtest_path = await core.group(`Install VTest`, async () => {
        const vtest_tar_gz = await tc.downloadTool(
          `https://github.com/vtest/VTest/archive/master.tar.gz`
        )
        const extracted = await tc.extractTar(vtest_tar_gz, undefined, [
          'xv',
          '--strip-components=1'
        ])
        await exec('make', ['-C', extracted, 'FLAGS=-O2 -s -Wall'])
        return extracted
      })
      core.addPath(vtest_path)
    }

    let version_data = ''
    const options = {
      listeners: {
        stdout(data: Buffer) {
          version_data += data.toString()
        }
      }
    }
    await exec('haproxy', ['-vv'], options)
    let matches
    if ((matches = version_data.match(/^HA-Proxy version (\S+)/))) {
      core.setOutput('version', matches[1])
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
