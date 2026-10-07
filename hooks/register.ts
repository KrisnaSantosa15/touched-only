import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

const NAME = 'touched-only'
const files = atom({ plugin: 'touched-only', key: 'files' } as const, [])

const BROAD_STAGING =
  /\bgit\s+(add\s+([^;&|]*\s)?(-A|--all|-u|--update|\.|\.\/|:\/|\*)(?=\s|$|[;&|])|commit\s+([^;&|]*\s)?(-[b-zB-Z]*a[a-zA-Z]*|--all)(?=\s|$|[;&|]))/

const relative = (cwd: string, path: string) =>
  path.startsWith(`${cwd}/`) ? path.slice(cwd.length + 1) : path

const quote = (path: string) => (/^[\w./@+-]+$/.test(path) ? path : `'${path.replaceAll("'", "'\\''")}'`)

const touched = async ($: EngineInterface) => {
  const cwd = await $.session.cwd()
  return (await read($, files)).map(path => relative(cwd, path))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'touched', description: 'List the files Claude edited in this session' })
    return next(e)
  })

  on('command.run', { command: 'touched' }, async $ => {
    const list = await touched($)
    return { text: list.length === 0 ? 'Claude has not edited any files yet.' : list.join('\n') }
  })

  on('tool.call', async ($, e, next) => {
    const path = e.tool === 'Edit' || e.tool === 'Write' ? e.file_path : e.tool === 'NotebookEdit' ? e.notebook_path : undefined
    const ran = await next(e)

    if (path !== undefined && ran.deny === undefined && ran.isError !== true) {
      await update($, files, list => (list.includes(path) ? list : [...list, path]))
    }

    return ran
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (!BROAD_STAGING.test(e.command)) return next(e)

    const list = await touched($)
    const hint =
      list.length === 0
        ? 'Claude has not edited any files this session, so name the paths to stage explicitly.'
        : `Stage only the files Claude edited this session:\n  git add -- ${list.map(quote).join(' ')}`

    return { deny: `${NAME}: broad staging can sweep in unrelated changes. ${hint}\nIf the user really wants everything staged, ask them to run it.` }
  }).catch(($, e, next) => (next.called ? next(e) : { deny: `${NAME}: the guard itself failed, so the command was held.` }))
}
