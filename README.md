ani
===



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ani.svg)](https://npmjs.org/package/ani)
[![Downloads/week](https://img.shields.io/npm/dw/ani.svg)](https://npmjs.org/package/ani)
[![License](https://img.shields.io/npm/l/ani.svg)](https://github.com/mob/ani/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ani
$ ani COMMAND
running command...
$ ani (-v|--version|version)
ani/0.0.2 darwin-x64 node-v12.16.3
$ ani --help [COMMAND]
USAGE
  $ ani COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ani help [COMMAND]`](#ani-help-command)
* [`ani mem [PROCESSES]`](#ani-mem-processes)

## `ani help [COMMAND]`

display help for ani

```
USAGE
  $ ani help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_

## `ani mem [PROCESSES]`

yet another android process memory profiler

```
USAGE
  $ ani mem [PROCESSES]

OPTIONS
  -a, --autoLaunch  auto launch dashboard
  -d, --debug       debug mode
```

_See code: [src/commands/mem.ts](https://github.com/mob/ani/blob/v0.0.2/src/commands/mem.ts)_
<!-- commandsstop -->
