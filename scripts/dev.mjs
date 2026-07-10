import { spawn } from 'node:child_process'

const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const processes = [
  spawn(npmExecutable, ['exec', '--', 'vite', 'build', '--watch'], { stdio: 'inherit' }),
  spawn(npmExecutable, ['exec', '--', 'tsc', '-p', 'tsconfig.build.json', '--watch', '--preserveWatchOutput'], { stdio: 'inherit' }),
]

let stopping = false

function stop(signal = 'SIGTERM') {
  if (stopping) return
  stopping = true
  for (const process of processes) process.kill(signal)
}

for (const process of processes) {
  process.on('error', (error) => {
    console.error(error)
    stop()
    process.exitCode = 1
  })

  process.on('exit', (code, signal) => {
    if (stopping) return
    stop()
    if (signal) process.exitCode = 1
    else process.exitCode = code ?? 1
  })
}

process.on('SIGINT', () => stop('SIGINT'))
process.on('SIGTERM', () => stop('SIGTERM'))
