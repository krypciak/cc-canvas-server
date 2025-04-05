import { assert } from './assert'
import { DataServer } from './connection-interface'
import { poststart } from './plugin'
import { SocketIoServer } from './socketio'

declare global {
    var canvasServer: CanvasServer
    namespace NodeJS {
        interface Global {
            canvasServer: CanvasServer
        }
    }
}
export class CanvasServer {
    server!: DataServer

    constructor() {}

    async requestInstanceId() {
        const id = 2
        assert(instanceinator.instances[id])
        return id
    }
}

poststart(() => {
    canvasServer.server = new SocketIoServer()
    canvasServer.server.start()
    process.on('exit', () => {
        canvasServer.server.stop()
    })
    window.addEventListener('beforeunload', () => {
        canvasServer.server.stop()
    })
})
