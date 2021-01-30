import { Command, flags } from '@oclif/command'
import { execSync } from 'child_process'
import { formatMeminfo } from '../utils/meminfo-parser'
import cli from 'cli-ux'

// const keypress = async () => {
//   process.stdin.setRawMode(true)
//   return new Promise(resolve => process.stdin.on('data', (data: Buffer) => {
//     if (data.toString() === 'q') {
//       process.stdin.setRawMode(false)
//       process.stdin.removeAllListeners('data')
//       resolve()
//     }
//   }))
// }

export default class Mem extends Command {
  static description = 'describe the command here'

  static flags = {
    // help: flags.help({ char: 'h' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
    time: flags.integer({ char: 't', description: 'time span of every snapshot, default: 3000(ms)' }),
    // processes: flags.string({ char: 'p', description: 'processes to take, jion with \',\'' }),
  }

  static args = [{ name: 'processes' }]

  async run() {
    const { args, flags } = this.parse(Mem)
    const timePerSnapshot = flags.time ?? 3000
    const processes: string[] = args.processes?.split(',') ?? []
    if (processes.length === 0) {
      this.error('Please provide valid processes.')
    }
    this.log()
    this.log('Mem of Processes:')

    // this.log(JSON.stringify(processes))
    processes.forEach(p => {
      this.log(`  - ${p}`)
    })

    const step = async () => {
      const buffer = await execSync(`adb shell dumpsys meminfo ${processes[0]}`)
      // this.log(buffer.toString())
      const meminfoStr = buffer.toString()
      const meminfo = formatMeminfo(meminfoStr)
      this.log('PSS Total: ', meminfo.meminfoSection.TOTAL[0])
    }

    let timer = null
    try {
      cli.action.start('[Logging processes meminfo]', 'Running')
      setTimeout(() => {
        this.log()
        this.log('Data(KB)')
        this.log('------------------------')
        timer = setInterval(step, timePerSnapshot)
      }, 100)
      await cli.anykey('Press any key to Stop and Record results')
      timer && clearInterval(timer)
      cli.action.stop()
    } catch (error) {
      timer && clearInterval(timer)
      this.error(error)
    }
    this.exit()
  }

}
