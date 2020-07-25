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
      await exec('sudo', ['apt-get', 'install', '-y', 'liblua5.3-dev'])
      OPTIONS.push('USE_LUA=1')
    }
    if (stringToBool(core.getInput('use_openssl'))) {
      await exec('sudo', ['apt-get', 'install', '-y', 'libssl-dev'])
      OPTIONS.push('USE_OPENSSL=1')
    }

    const haproxy_tar_gz = await tc.downloadTool(
      `http://www.haproxy.org/download/${branch}/src/snapshot/haproxy-ss-LATEST.tar.gz`
    )
    const extracted = await tc.extractTar(haproxy_tar_gz, undefined, [
      'xv',
      '--strip-components=1'
    ])
    await exec('make', ['-C', extracted, 'TARGET=linux-glibc'].concat(OPTIONS))
    core.addPath(extracted)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
