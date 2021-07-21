import util from 'util'
import childProcess from 'child_process'

const execFilePromise = util.promisify(childProcess.execFile)

const runExecFilePromise = async (pathToScript: string, scriptArgs: string[]) => {
  const {stdout, stderr} = await execFilePromise(pathToScript, scriptArgs)
  console.log(stdout)
  console.log(stderr)
}

export default runExecFilePromise
