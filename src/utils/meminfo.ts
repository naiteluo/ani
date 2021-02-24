import { exec } from 'child_process'
import { combineLatest, interval, Observable, of, OperatorFunction } from 'rxjs'
import { mergeMap, switchMap } from 'rxjs/operators'
import { formatMeminfo } from './meminfo-parser'

const command = (proc: string, device: string) => () => {
  return new Observable<string>(subscriber => {
    exec(`adb -s ${device} shell dumpsys meminfo ${proc}`, (error, stdout) => {
      if (error) {
        subscriber.error(error)
      } else {
        subscriber.next(stdout)
        subscriber.complete()
      }
    })
  })
}

const parser = (): OperatorFunction<string[], any> => switchMap(data => {
  return of(data.map(v => formatMeminfo(v)))
})

const DefaultMeminfoMonitorTime = 5000

export class MeminfoMonitor {
  private processes: string[] = [];

  private commands: Observable<string>[] = [];

  private time = DefaultMeminfoMonitorTime;

  constructor(device: string, processes: string[] = [], time: number = DefaultMeminfoMonitorTime) {
    this.update(device, processes, time)
  }

  update(device: string, processes: string[] = [], time: number = DefaultMeminfoMonitorTime) {
    this.processes = [...processes]
    this.commands = this.processes.map(p => {
      return command(p, device)()
    })
    this.time = time
  }

  one() {
    return combineLatest(this.commands).pipe(parser())
  }

  interval() {
    return interval(this.time).pipe(mergeMap(() => {
      return combineLatest(this.commands)
    }), parser())
  }
}
