import { Server } from 'socket.io'
import * as http from 'http'

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
