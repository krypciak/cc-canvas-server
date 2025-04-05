import { PluginClass } from 'ultimate-crosscode-typedefs/modloader/mod'
import { Mod1 } from './types'

let prestartFunctions: [() => void | Promise<void>, number][]
export function prestart(func: () => void | Promise<void>, priority: number = 100) {
    prestartFunctions ??= []
    prestartFunctions.push([func, priority])
}

let poststartFunctions: [() => void | Promise<void>, number][]
export function poststart(func: () => void | Promise<void>, priority: number = 100) {
    poststartFunctions ??= []
    poststartFunctions.push([func, priority])
}

import './connection-interface'
import { CanvasServer } from './canvas-server'

export default class CCCanvasServer implements PluginClass {
    static dir: string
    static mod: Mod1

    constructor(mod: Mod1) {
        CCCanvasServer.dir = mod.baseDirectory
        CCCanvasServer.mod = mod
        CCCanvasServer.mod.isCCL3 = mod.findAllAssets ? true : false
        CCCanvasServer.mod.isCCModPacked = mod.baseDirectory.endsWith('.ccmod/')

        global.canvasServer = window.canvasServer = new CanvasServer()
    }

    async prestart() {
        await Promise.all((prestartFunctions ?? []).sort((a, b) => a[1] - b[1]).map(([f]) => f()))
    }

    async poststart() {
        await Promise.all((poststartFunctions ?? []).sort((a, b) => a[1] - b[1]).map(([f]) => f()))
    }
}
