import { assert } from './assert'
import { DataConnection, DataServer, Packet } from './connection-interface'
import { Server as _Server, Socket as _Socket } from 'socket.io'

type ClientToServerEvents = {}
type ServerToClientEvents = {
    update(data: Packet): void
}
type InterServerEvents = {}
type SocketData = never

type Socket = _Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
type Server = _Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

export const DEFAULT_SOCKETIO_PORT = 33405

export class SocketIoServer implements DataServer {
    connections: SocketIoDataConnection[] = []
    port: number = DEFAULT_SOCKETIO_PORT
    io!: Server

    constructor() {
        this.setIntervalWorkaround()
    }

    private setIntervalWorkaround() {
        const setInterval = window.setInterval
        // @ts-expect-error
        window.setInterval = (...args) => {
            const id = setInterval(...args)
            return { unref: () => {}, ref: () => {}, id }
        }

        const clearInterval = window.clearInterval
        window.clearInterval = id => {
            if (id === undefined || id === null) return
            if (typeof id === 'number') {
                clearInterval(id)
            } else {
                // @ts-expect-error
                clearInterval(id.id)
            }
        }
    }

    async start() {
        this.io = new _Server(this.port, {
            connectionStateRecovery: {},
            cors: {
                origin: `http://localhost:5173`,
            },
        })
        this.io.on('connection', async socket => {
            const id = await canvasServer.requestInstanceId()

            const closeCallback = () => {
                this.connections.erase(connection)
            }
            const connection = new SocketIoDataConnection(id, socket, closeCallback)
            this.connections.push(connection)
            socket.on('disconnect', () => connection.close())
        })
        console.log('socketio: listening for connections')
    }

    async stop() {
        this.io.close()
    }
}

class SocketIoDataConnection implements DataConnection {
    constructor(
        public instanceId: number,
        public socket: Socket,
        public closeCallback: () => void
    ) {
        const inst = instanceinator.instances[instanceId]
        assert(inst)
        inst.ig.canvasDataConnection = this
        console.log(inst.ig.canvasDataConnection)
    }

    isConnected() {
        return this.socket.connected
    }
    send(data: Packet): void {
        this.socket.emit('update', data)
    }
    close(): void {
        if (!this.socket.disconnected) this.socket.disconnect()

        const inst = instanceinator.instances[this.instanceId]
        assert(inst)
        inst.ig.canvasDataConnection = undefined

        this.closeCallback()
    }
}
