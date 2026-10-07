# touched-only

**Claude commits what Claude touched. Nothing else.**

[![Claude Code mod](https://img.shields.io/badge/Claude%20Code-mod-D97757?logo=claude&logoColor=white)](https://github.com/karanb192/awesome-claude-code-mods) [![Claude Code 2.1.287+](https://img.shields.io/badge/Claude%20Code-2.1.287%2B-D97757)](https://code.claude.com) [![GitHub stars](https://img.shields.io/github/stars/KrisnaSantosa15/touched-only?style=flat&color=yellow)](https://github.com/KrisnaSantosa15/touched-only/stargazers) [![Last commit](https://img.shields.io/github/last-commit/KrisnaSantosa15/touched-only?color=green)](https://github.com/KrisnaSantosa15/touched-only/commits) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## The Problem

You had a half-finished experiment in your working tree, a debug script, a local config tweak. Claude ran `git add -A`, and now all of it is in the commit. Maybe it's in the pushed PR too.

Telling Claude "only stage your own files" works until it doesn't. Broad staging is one keystroke away, and Claude has no record of which files it actually changed.

### How touched-only Solves It

1. **Remembers**: every file Claude changes through its Edit, Write and NotebookEdit tools is recorded for the session.
2. **Stops**: `git add -A`, `git add .`, `git add -u`, `git commit -a` and friends are refused before they run.
3. **Hands over the fix**: Claude gets the exact command to stage only its own files.

```
touched-only: broad staging can sweep in unrelated changes. Stage only the files Claude edited this session:
  git add -- src/app.ts 'docs/read me.md'
If the user really wants everything staged, ask them to run it.
```

## Install

**Prerequisites:** Claude Code 2.1.287 or later (`claude --version`).

```bash
/plugin marketplace add KrisnaSantosa15/touched-only
/plugin install touched-only@touched-only
```

No config needed.

**Verify:** after Claude edits a file, type `/touched`. You'll see the files Claude has edited so far.

## What It Stops

| Command | Why |
| --- | --- |
| `git add -A`, `git add --all` | Stages the whole tree |
| `git add .`, `git add ./`, `git add :/`, `git add *` | Stages everything under a folder |
| `git add -u`, `git add --update` | Stages every tracked change |
| `git commit -a`, `git commit -am "..."`, `git commit --all` | Commits every tracked change |

It catches them inside chains too, like `cd app && git add -A`. Explicit paths, `git add -p` and plain `git commit -m` go through.

Files Claude changes from the shell (`sed -i`, `mv`, a code generator) aren't tracked, so Claude has to name those paths itself.

Need everything staged? Run `git add -A` yourself in your own terminal. The guard only checks the commands Claude runs.

## Contributing

Issues and pull requests are welcome. Add a test for any behavior you change.

```bash
git clone https://github.com/KrisnaSantosa15/touched-only.git
cd touched-only && claude plugin validate . && claude plugin test .
```

Try your changes live with `claude --plugin-dir .`.

## License

[MIT](LICENSE). Use it, fork it, ship it.
