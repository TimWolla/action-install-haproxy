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
        OPTIONS.push('USE_LUA=1')
      })
    }
    if (stringToBool(core.getInput('use_openssl'))) {
      await core.group(
        `Install 'use_openssl' build dependencies.`,
        async () => {
          await exec('sudo', ['apt-get', 'install', '-y', 'libssl-dev'])
          OPTIONS.push('USE_OPENSSL=1')
          core.endGroup()
        }
      )
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
