import { assert } from './assert'
import { ClientPacket, DataConnection, DataServer, ServerPacket } from './connection-interface'
import { Server as _Server, Socket as _Socket } from 'socket.io'

type ClientToServerEvents = {
    input(data: ClientPacket): void
}
type ServerToClientEvents = {
    update(data: ServerPacket): void
}
type InterServerEvents = {}
type SocketData = never

type Socket = _Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
type Server = _Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

export const DEFAULT_SOCKETIO_PORT = 33405

export class SocketIoServer implements DataServer {
    connections: SocketIoDataConnection[] = []
    openListeners: ((conn: DataConnection) => void)[] = []
    closeListeners: ((conn: DataConnection) => void)[] = []
    port: number = DEFAULT_SOCKETIO_PORT
    io!: Server

    constructor() {
        this.setIntervalWorkaround()
        this.closeListeners.push(conn => {
            this.connections.erase(conn as SocketIoDataConnection)
        })
        this.openListeners.push(conn => {
            this.connections.push(conn as SocketIoDataConnection)
        })
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
            assert(canvasServer.requestInstanceId, 'connection before called canvasServer.requestInstanceId set!')
            const username = `remote_${(Math.random() * 900 + 100).floor()}`
            const id = await canvasServer.requestInstanceId(username)

            const connection = new SocketIoDataConnection(id, socket)
            for (const func of this.openListeners) func(connection)
        })
        console.log('socketio: listening for connections')
    }

    async stop() {
        this.io.close()
    }
}

class SocketIoDataConnection implements DataConnection {
    closed: boolean = false

    constructor(
        public instanceId: number,
        public socket: Socket
    ) {
        const inst = instanceinator.instances[instanceId]
        assert(inst)
        inst.ig.canvasDataConnection = this

        this.socket.on('input', packet => {
            assert(canvasServer.inputCallback, 'input received before called canvasServer.inputCallback set!')
            canvasServer.inputCallback(instanceId, packet)
        })
        socket.on('disconnect', () => this.close())
    }

    isConnected() {
        return this.socket.connected
    }
    send(data: ServerPacket): void {
        this.socket.emit('update', data)
    }
    close(): void {
        if (this.closed) return
        this.closed = true
        if (!this.socket.disconnected) this.socket.disconnect()

        const inst = instanceinator.instances[this.instanceId]
        assert(inst)
        inst.ig.canvasDataConnection = undefined

        for (const func of canvasServer.server.closeListeners) func(this)
    }
}
