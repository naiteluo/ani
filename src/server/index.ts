import { Server } from 'socket.io'
import * as http from 'http'
import { cli } from 'cli-ux'

const Koa = require('koa')
const koaStatic = require('koa-static')
const path = require('path')

export class MemServer {
  server: http.Server

  io: Server

  constructor(private port: number = 3000) {
    // create live server
    this.server = http.createServer()
    this.io = new Server(this.server, {
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin: '*',
      },
    })
    const app = new Koa()
    app.use(koaStatic(path.join(__dirname, '../../ani-web/dist/ani-web')))
    app.listen(3000)
    cli.log('Dashboard running in http://localhost:4000')
    cli.open('http://localhost:4000')
  }

  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(this.port, resolve)
      } catch (error) {
        reject(error)
      }
    })
  }

  startStatic() {
    // TODO start a static server for website
  }

  ioEmit(ev: string | symbol, ...args: any[]) {
    this.io.sockets.emit(ev, ...args)
  }
}
