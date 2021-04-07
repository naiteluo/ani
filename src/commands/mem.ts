import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import { MeminfoMonitor } from '../utils/meminfo'
import { MemServer } from '../server'
import { execSync } from 'child_process'
import { Subscription } from 'rxjs'
import select from 'cli-select'
import chalk = require('chalk')

export default class Mem extends Command {
  static description = 'describe the command here'

  static flags = {
    force: flags.boolean({ char: 'f' }),
    time: flags.integer({ char: 't', description: 'time span of every snapshot, default: 3000(ms)' }),
    query: flags.string({ char: 'q', description: 'fuzzy query processes by name' }),
    debug: flags.boolean({ char: 'd', description: 'debug mode' }),
    autoLaunch: flags.boolean({ char: 'a', description: 'auto launch dashboard' }),
  }

  static args = [{ name: 'processes' }]

  private server!: MemServer;

  private unsubsriber?: Subscription;

  private deviceID!: string;

  private processes: string[] = [];

  private timePerSnapshot = 5000;

  private processesStr = '';

  private detectorTimer?: NodeJS.Timeout;

  private debugMode: boolean | undefined;

  private autoLaunch = false;

  private isChannelStarted = false;

  async run() {
    // args parsing
    const { args, flags } = this.parse(Mem)
    this.timePerSnapshot = flags.time ?? 3000
    this.debugMode = flags.debug ?? false
    this.autoLaunch = flags.autoLaunch ?? false

    const devices = this.getDeivesList()

    if (!devices || devices.length === 0) {
      this.error('No connected device found.')
      this.exit()
    }

    const selection = await select({
      values: devices,
    })

    this.deviceID = selection.value

    this.logDevice()

    const processes = this.parseProcesses(args.processes, flags.query, true)
    this.processesStr = args.processes
    this.processes = processes

    this.logProcess()
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
    if (this.unsubsriber) {
      return
    }
    const meminfoMonitor = new MeminfoMonitor(this.deviceID, this.processes, this.timePerSnapshot)
    const meminfoIntervalObserver = meminfoMonitor.interval()
    this.unsubsriber = meminfoIntervalObserver.subscribe(res => {
      // push data to client
      this.server.ioEmit('data', res)
    })
    this.isChannelStarted = true
  }

  takeSnapshot(pids?: string[]) {
    const meminfoMonitor = new MeminfoMonitor(this.deviceID, pids ? pids : this.processes, this.timePerSnapshot)
    const meminfoObserver = meminfoMonitor.one()
    const unsubsriber = meminfoObserver.subscribe(res => {
      this.server.ioEmit('data', res)
      unsubsriber.unsubscribe()
    })
  }

  stopChannel() {
    if (this.isChannelStarted) {
      this.killChannel()
      this.isChannelStarted = false
    }
  }

  killChannel() {
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
          this.killChannel()
          if (this.isChannelStarted) {
            this.startChannel()
          }
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

  getDeivesList(): string[] {
    const stdout = execSync('adb devices')
    const arr = stdout.toString().split('\n')
    const list = arr.slice(1, arr.length).map(str => {
      const matched = str.match(/([^\s]*)\s+/)
      return matched ? matched[1] : ''
    }).filter(v => v)
    return list
  }

  fuzzyQueryProcess(query: string) {
    const regex = new RegExp(query, 'ig')
    const stdout = execSync(`adb -s ${this.deviceID} shell ps -o NAME,PID`)
    const list = stdout.toString().split('\n')
    let results = list.filter(str => {
      return str.match(regex)
    })
    results = results.map(v => v.replace(/\s+/, ' '))
    return results
  }

  parseProcesses(processesArg = '', query = '', log = false) {
    try {
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
      return processes
    } catch (error: unknown) {
      this.error(JSON.stringify(error))
      this.exit()
    }
  }

  /**
   * start live server
   */
  async setupServer() {
    this.server = new MemServer(3000, this.debugMode)

    await this.server.start()
    this.server.io.on('connection', socket => {
      socket.on('start', () => {
        this.stopChannel()
        this.startChannel()
      })
      socket.on('stop', () => {
        this.stopChannel()
      })
      socket.on('snapshot', (data: string[]) => {
        this.stopChannel()
        this.takeSnapshot(data)
      })
      socket.on('config', (data: { pids?: string[], freq: number }) => {
        if (data.pids) {
          this.processes = data.pids
        }
        this.timePerSnapshot = data.freq
        this.log('config updated.')
      })
    })
    if (this.autoLaunch) {
      this.server.launchDashboard()
    }
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

  logProcess() {
    this.log('Target process: ')
    cli.styledJSON(this.processes)
    this.log()
  }

  logDevice() {
    this.log('Target device ID: ')
    this.log(chalk.green(this.deviceID))
    this.log()
  }
}
