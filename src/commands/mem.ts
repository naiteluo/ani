import { Command, flags } from '@oclif/command'
import { formatIntoAlignCol, MemColNames } from '../utils/meminfo-parser'
import cli from 'cli-ux'
import { MeminfoMonitor } from '../utils/meminfo'
import { map, take } from 'rxjs/operators'
import chalk = require('chalk')
const createSocketServer = require('socket.io')
const http = require('http')

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
    const server = http.createServer()
    const io = createSocketServer(server, {
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin: '*',
      },
    })
    server.listen(3000)

    this.log('Mem of Processes:')

    // this.log(JSON.stringify(processes))
    processes.forEach(p => {
      this.log(`  - ${p}`)
    })

    let lastRowData: number[] = []
    const meminfoMonitor = new MeminfoMonitor(processes[0], timePerSnapshot)
    const meminfoObserver = meminfoMonitor.one()
    let counter = 0

    const step = async () => {
      meminfoObserver.pipe(take(1), map(res => {
        const total: number[] = res.meminfoSection.TOTAL

        const str = total.map((v, i) => {
          const last = lastRowData[i]
          const diff = v - last
          let originStr = ''
          let diffStr = ''
          if (last && diff !== 0) {
            diffStr = `(${diff > 0 ? '+' : ''}${(diff / last * 100).toFixed(2)}%)`
            originStr = diffStr
            if (diff > 0) {
              diffStr = chalk.black.bgGreen(diffStr)
            } else {
              diffStr = chalk.black.bgRed(diffStr)
            }
          }

          return formatIntoAlignCol(`${v} ${diffStr}`, 19 + diffStr.length - originStr.length) + '|'
        }).join('')
        // this.log(`${str}`)
        io.sockets.emit('data', res)
        lastRowData = total
        counter++
        if (counter > 50) {
          counter = 0
          // this.printTableHeader()
        }
      })).subscribe(() => { })
    }

    let timer = null
    try {
      cli.action.start('[Logging processes meminfo]', 'Running')
      setTimeout(() => {
        // this.printTableHeader()
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

  printTableHeader() {
    const str = MemColNames.map(v => {
      return formatIntoAlignCol(`${v}`, 19) + '|'
    }).join('')
    this.log()
    this.log(new Array(str.length + 1).join('-'))
    this.log(`${str}`)
    this.log(new Array(str.length + 1).join('-'))
  }
}
