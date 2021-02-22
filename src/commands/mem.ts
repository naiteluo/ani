import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import { MeminfoMonitor } from '../utils/meminfo'
import { MemServer } from '../server'
import { execSync } from 'child_process'
import { Subscription } from 'rxjs'

export default class Mem extends Command {
  static description = 'describe the command here'

  static flags = {
    force: flags.boolean({ char: 'f' }),
    time: flags.integer({ char: 't', description: 'time span of every snapshot, default: 3000(ms)' }),
    query: flags.string({ char: 'q', description: 'fuzzy query processes by name' }),
  }

  static args = [{ name: 'processes' }]

  private server!: MemServer;

  private unsubsriber?: Subscription;

  private processes: string[] = [];

  private timePerSnapshot = 3000;

  private processesStr = '';

  private detectorTimer?: NodeJS.Timeout;

  async run() {
    // args parsing
    const { args, flags } = this.parse(Mem)
    this.timePerSnapshot = flags.time ?? 3000

    const processes = this.parseProcesses(args.processes, flags.query, true)
    this.processesStr = args.processes
    this.processes = processes

    try {
      await this.setupServer()
      // init Meminfo Observers

      // this.startChannel()
      this.startLiveProcessDetector(flags.query)

      // wait user input to stop
      await cli.anykey('Press any key to **Stop** recording')

      // disposing
      this.dispose()
    } catch (error) {
      this.error(error)
    }
    this.exit()
  }

  startChannel() {
    const meminfoMonitor = new MeminfoMonitor(this.processes, this.timePerSnapshot)
    const meminfoIntervalObserver = meminfoMonitor.interval()
    this.unsubsriber = meminfoIntervalObserver.subscribe(res => {
      // push data to client
      this.server.ioEmit('data', res)
    })
  }

  stopChannel() {
    if (this.unsubsriber) {
      this.unsubsriber.unsubscribe()
      this.unsubsriber = undefined
    }
  }

  startLiveProcessDetector(query = '') {
    if (query.length > 0) {
      this.detectorTimer = setInterval(() => {
        const processes = this.parseProcesses(this.processesStr, query)
        if (!this.isProcessesEqual(processes, this.processes)) {
          this.processes = processes
          this.log('Processes changes detected, restart channel.')
          this.stopChannel()
          this.startChannel()
        }
      }, this.timePerSnapshot)
    }
  }

  stopLiveProcessDetector() {
    if (this.detectorTimer) {
      clearInterval(this.detectorTimer)
      this.detectorTimer = undefined
    }
  }

  fuzzyQueryProcess(query: string) {
    const regex = new RegExp(query, 'ig')
    const stdout = execSync('adb -s 3422ed52 shell ps -o NAME -w')
    const list = stdout.toString().split('\n')
    const results = list.filter(str => {
      return str.match(regex)
    })
    return results
  }

  parseProcesses(processesArg = '', query = '', log = false) {
    let processes: string[] = []

    if (processesArg.length !== 0) {
      processes = processesArg.split(',')
    }
    if (processes.length === 0) {
      // get processes name by query
      if (query.length > 0) {
        processes = this.fuzzyQueryProcess(query)
      }
    }
    if (processes.length === 0) {
      this.error('Can\'t find valid processes.')
    }
    log && this.log()
    // list processes
    log && this.log('Target processes:')
    log && processes.forEach(p => {
      this.log(`  - ${p}`)
    })
    return processes
  }

  /**
   * start live server
   */
  async setupServer() {
    cli.action.start('Live server')
    this.server = new MemServer()

    await this.server.start()
    this.server.io.on('connection', socket => {
      socket.on('start', () => {
        this.startChannel()
      })
      socket.on('stop', () => {
        this.stopChannel()
      })
    })
    cli.action.stop('Live server')
  }

  dispose() {
    if (this.unsubsriber) {
      this.unsubsriber.unsubscribe()
      this.unsubsriber = undefined
    }
    this.server.io.close()
    this.server.server.close()
    this.stopLiveProcessDetector()
  }

  isProcessesEqual(a: string[], b: string[]) {
    return JSON.stringify(a) === JSON.stringify(b)
  }
}
