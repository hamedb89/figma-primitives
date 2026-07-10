#!/usr/bin/env node
import { spawn } from 'node:child_process'

const command = process.argv[2]

if (command !== 'build' && command !== 'dev') {
  console.error('Usage: figma-primitives <build|dev>')
  process.exit(1)
}

const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const watchArguments = command === 'dev' ? ['--watch'] : []
const configurations = ['vite.main.config.ts', 'vite.ui.config.ts']
const processes = configurations.map((config) => spawn(
  npmExecutable,
  ['exec', '--', 'vite', 'build', '--config', config, ...watchArguments],
  { stdio: 'inherit' },
))

let stopping = false
let completed = 0

function stop(signal = 'SIGTERM') {
  if (stopping) return
  stopping = true
  for (const child of processes) child.kill(signal)
}

for (const child of processes) {
  child.on('error', (error) => {
    console.error(error)
    process.exitCode = 1
    stop()
  })

  child.on('exit', (code, signal) => {
    completed += 1
    if (stopping) return
    if (code !== 0 || signal) {
      process.exitCode = code ?? 1
      stop()
      return
    }
    if (command === 'build' && completed === processes.length) process.exitCode = 0
  })
}

process.on('SIGINT', () => stop('SIGINT'))
process.on('SIGTERM', () => stop('SIGTERM'))
