import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import { combineLatest, interval } from 'rxjs'
import { map } from 'rxjs/operators'

export default class Hello extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ ani hello
hello world from ./src/hello.ts!
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const o1 = interval(2000)
    const o2 = interval(3000)
    const o3 = interval(1000)
    combineLatest([o1, o2, o3]).pipe(map(([o1r, o2r, o3r]) => {
      console.log(o1r, o2r, o3r)
      return [o1r, o2r, o3r].join(', ')
    })).subscribe(res => {
      console.log(res)
    })
    cli.wait(30000)
  }
}
