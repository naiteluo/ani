import { Server } from 'socket.io'
import * as http from 'http'
import { cli } from 'cli-ux'

const Koa = require('koa')
const koaStatic = require('koa-static')
const path = require('path')

export class MemServer {
  app: any

  server: http.Server

  io: Server

  constructor(private port: number = 3000, private debugMode = false) {
    // create live server
    this.app = new Koa()
    this.app.use(koaStatic(path.join(__dirname, '../../ani-web/dist/ani-web')))
    this.server = http.createServer()
    this.io = new Server(this.server, {
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin: '*',
      },
    })
  }

  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.app.listen(this.port, () => {
          cli.log(`Dashboard running in http://localhost:${this.port}`)
          this.server.listen(this.port + 1, () => {
            cli.log(`Socket.io running in port: ${this.port + 1}`)
            resolve(null)
          })
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  ioEmit(ev: string | symbol, ...args: any[]) {
    this.io.sockets.emit(ev, ...args)
  }

  launchDashboard() {
    const port = this.debugMode ? 4200 : this.port
    cli.open(`http://localhost:${port}`)
  }
}
