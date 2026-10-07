import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'

const engine = (on: On) => {
  const ran: string[] = []
  on('session.cwd', () => ({ value: '/repo' }))
  on('tool.call', { tool: 'Edit' }, ($, e) =>
    e.file_path.includes('missing')
      ? { result: 'File does not exist.', isError: true }
      : { result: { filePath: e.file_path, oldString: e.old_string, newString: e.new_string, originalFile: '', structuredPatch: [], userModified: false, replaceAll: false } },
  )
  on('tool.call', { tool: 'Bash' }, ($, e) => {
    ran.push(e.command)
    return { result: { stdout: '', stderr: '', interrupted: false } }
  })
  return ran
}

const edit = (file_path: string) => ({ tool: 'Edit' as const, file_path, old_string: 'a', new_string: 'b' })
const refusal = (r: { deny?: string; text?: string }) => r.deny ?? r.text ?? ''

test('refuses broad staging before Claude has edited anything', async ($, on) => {
  const ran = engine(on)
  for (const command of ['git add -A', 'git add .', 'git add --all && git commit -m x', 'git commit -am "wip"', 'cd app && git add -u']) {
    expect(refusal(await $.tool.call({ tool: 'Bash', command }))).toContain('name the paths to stage explicitly')
  }
  expect(ran).toEqual([])
})

test('suggests exactly the files Claude edited, relative to the repo', async ($, on) => {
  engine(on)
  await $.tool.call(edit('/repo/src/app.ts'))
  await $.tool.call(edit('/repo/docs/read me.md'))
  await $.tool.call(edit('/repo/src/app.ts'))
  await $.tool.call(edit('/repo/missing.ts'))

  expect(refusal(await $.tool.call({ tool: 'Bash', command: 'git add -A' }))).toContain("git add -- src/app.ts 'docs/read me.md'\n")
})

test('lets explicit staging and ordinary commits through', async ($, on) => {
  const ran = engine(on)
  for (const command of ['git add src/app.ts', 'git add -p src', 'git commit -m "add all the things"', 'git commit --amend --no-edit']) {
    await $.tool.call({ tool: 'Bash', command })
  }
  expect(ran).toHaveLength(4)
})

test('/touched lists the edited files', async ($, on) => {
  engine(on)
  await $.tool.call(edit('/repo/src/app.ts'))
  expect(await $.command.run({ command: 'touched', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })).toMatchObject({ text: 'src/app.ts' })
})
