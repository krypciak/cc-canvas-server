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

export default class CanvasServer implements PluginClass {
    static dir: string
    static mod: Mod1

    constructor(mod: Mod1) {
        CanvasServer.dir = mod.baseDirectory
        CanvasServer.mod = mod
        CanvasServer.mod.isCCL3 = mod.findAllAssets ? true : false
        CanvasServer.mod.isCCModPacked = mod.baseDirectory.endsWith('.ccmod/')
    }

    async prestart() {
        await Promise.all((prestartFunctions ?? []).sort((a, b) => a[1] - b[1]).map(([f]) => f()))
    }

    async poststart() {
        await Promise.all((poststartFunctions ?? []).sort((a, b) => a[1] - b[1]).map(([f]) => f()))
    }
}
