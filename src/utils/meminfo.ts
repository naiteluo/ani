import { exec } from 'child_process'
import { Observable, of, OperatorFunction } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { formatMeminfo } from './meminfo-parser'

const command = (proc: string) => () => {
  return new Observable<string>(subscriber => {
    exec(`adb shell dumpsys meminfo ${proc}`, (error, stdout) => {
      if (error) {
        subscriber.error(error)
      } else {
        subscriber.next(stdout)
        subscriber.complete()
      }
    })
  })
}

const parse = (): OperatorFunction<string, any> => switchMap(data => {
  return of(formatMeminfo(data))
})

export class MeminfoMonitor {
  private proc: string;

  private interval = 5000;

  constructor(proc: string, interval: number) {
    this.proc = proc
    this.interval = interval
  }

  one() {
    return command(this.proc)().pipe(parse())
  }
}
