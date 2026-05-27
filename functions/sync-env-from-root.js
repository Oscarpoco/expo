#!/usr/bin/env node
/**
 * Copies mail-related keys from repo-root `.env` into `functions/.env` before `firebase deploy`.
 * Root `.env` is gitignored and must NOT prefix these with `VITE_` (that would expose them to the browser).
 */
const fs = require('fs')
const path = require('path')

const rootEnv = path.join(__dirname, '..', '.env')
const fnEnv = path.join(__dirname, '.env')
const REQUIRED = ['RESEND_API_KEY', 'TRANSACTION_MAIL_FROM']

function parseEnvFile(text) {
  /** @type {Record<string, string>} */
  const vars = {}
  for (let line of text.split(/\r?\n/)) {
    line = line.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  }
  return vars
}

function main() {
  if (!fs.existsSync(rootEnv)) {
    console.error(
      '[sync-env-from-root] Missing ../.env. Add RESEND_API_KEY and TRANSACTION_MAIL_FROM next to package.json.',
    )
    process.exit(1)
  }

  const raw = fs.readFileSync(rootEnv, 'utf8')
  const vars = parseEnvFile(raw)
  const lines = []

  for (const key of REQUIRED) {
    const value = vars[key]
    if (value == null || String(value).trim() === '') {
      console.error(
        `[sync-env-from-root] ${key} is missing from ../.env (do not use the VITE_ prefix for this key).`,
      )
      process.exit(1)
    }
    lines.push(`${key}=${JSON.stringify(String(value).trim())}`)
  }

  fs.writeFileSync(fnEnv, `${lines.join('\n')}\n`, 'utf8')
  console.log('[sync-env-from-root] wrote', fnEnv)
}

main()
