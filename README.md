# touched-only

**Claude commits what Claude touched. Nothing else.**

You had a half-finished experiment in your working tree. Claude ran `git add -A`, and now it's in the commit.

touched-only remembers every file Claude edits in a session. When Claude reaches for broad staging, the command is stopped and Claude gets the exact command to stage only its own files:

```
touched-only: broad staging can sweep in unrelated changes. Stage only the files Claude edited this session:
  git add -- src/app.ts 'docs/read me.md'
If the user really wants everything staged, ask them to run it.
```

## Install

```
/plugin install touched-only --marketplace KrisnaSantosa15/touched-only
```

Needs Claude Code 2.1.287 or later. No config.

## What it stops

| Command | Why |
| --- | --- |
| `git add -A`, `git add --all` | Stages the whole tree |
| `git add .`, `git add ./`, `git add :/`, `git add *` | Stages everything under a folder |
| `git add -u`, `git add --update` | Stages every tracked change |
| `git commit -a`, `git commit -am "..."`, `git commit --all` | Commits every tracked change |

It catches them inside chains too, like `cd app && git add -A`. Explicit paths, `git add -p` and plain `git commit -m` go through.

## What it remembers

Files changed through Claude's **Edit**, **Write** and **NotebookEdit** tools, as long as the change succeeded. Type `/touched` to see the list.

Files Claude changes from the shell (`sed -i`, `mv`, a code generator) aren't tracked. Claude has to name those paths itself.

## Need everything staged?

Run `git add -A` yourself in your own terminal. The guard only checks the commands Claude runs.

## Develop

```sh
claude plugin validate .
claude plugin test .
claude --plugin-dir .
```

MIT licensed.
