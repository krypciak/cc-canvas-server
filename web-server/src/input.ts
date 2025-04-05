import type {} from 'ultimate-crosscode-typedefs'
import { ig } from './ig-sc'

const bindings: PartialRecord<ig.KEY, ig.Input.KnownAction> & PartialRecord<ig.KEY, string> = {
    '8': 'back',
    '9': 'menu',
    '13': 'confirm',
    '16': 'quick',
    '18': 'dash2',
    '27': 'pause',
    '32': 'special',
    '37': 'left',
    '38': 'up',
    '39': 'right',
    '40': 'down',
    '49': 'cold',
    '50': 'shock',
    '51': 'heat',
    '52': 'wave',
    '53': 'neutral',
    '65': 'left',
    '66': 'help2',
    '67': 'guard',
    '68': 'right',
    '69': 'circle-right',
    '71': 'skip-cutscene',
    '72': 'help',
    '78': 'help3',
    '81': 'circle-left',
    '83': 'down',
    '86': 'melee',
    '87': 'up',
    '118': 'langedit',
    '119': 'snapshot',
    '121': 'savedialog',
    '122': 'fullscreen',
    '192': 'neutral',
    '-1': 'aim',
    '-3': 'dash',
    '-4': 'scrollUp',
    '-5': 'scrollDown',
}
export const KEY = {
    MOUSE1: -1,
    MOUSE2: -3,
    MWHEEL_UP: -4,
    MWHEEL_DOWN: -5,
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    PAUSE: 19,
    CAPS: 20,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    RIGHT_ARROW: 39,
    DOWN_ARROW: 40,
    INSERT: 45,
    DELETE: 46,
    _0: 48,
    _1: 49,
    _2: 50,
    _3: 51,
    _4: 52,
    _5: 53,
    _6: 54,
    _7: 55,
    _8: 56,
    _9: 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    NUMPAD_0: 96,
    NUMPAD_1: 97,
    NUMPAD_2: 98,
    NUMPAD_3: 99,
    NUMPAD_4: 100,
    NUMPAD_5: 101,
    NUMPAD_6: 102,
    NUMPAD_7: 103,
    NUMPAD_8: 104,
    NUMPAD_9: 105,
    MULTIPLY: 106,
    ADD: 107,
    SUBSTRACT: 109,
    DECIMAL: 110,
    DIVIDE: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    EQUAL: 187,
    PLUS: 187,
    COMMA: 188,
    MINUS: 189,
    PERIOD: 190,
    SEMICOLON: 186,
    UE: 186,
    GRAVE_ACCENT: 192,
    OE: 192,
    SLASH: 191,
    HASH: 191,
    BRACKET_OPEN: 219,
    SZ: 219,
    BACKSLASH: 220,
    BRACKET_CLOSE: 221,
    SINGLE_QUOTE: 222,
    AE: 222,
} as const
export const INPUT_DEVICES = { KEYBOARD_AND_MOUSE: 1, GAMEPAD: 2 } as const

export class Input {
    bindings = bindings
    actions: PartialRecord<ig.Input.KnownAction, boolean> = {}
    presses: PartialRecord<ig.Input.KnownAction, boolean> = {}
    keyups: PartialRecord<ig.Input.KnownAction, boolean> = {}
    locks: PartialRecord<ig.Input.KnownAction, boolean> = {}
    delayedKeyup: ig.Input.KnownAction[] = []
    currentDevice: ig.INPUT_DEVICES = null as any
    isUsingMouse: boolean = false
    isUsingKeyboard: boolean = false
    isUsingAccelerometer: boolean = false
    mouse: Vec2 = { x: 0, y: 0 }
    accel: Vec3 = { x: 0, y: 0, z: 0 }
    mouseGuiActive: boolean = true
    lastMousePos: Vec2 = { x: 0, y: 0 }
    ignoreKeyboard: boolean = false
    mouseIsOut: boolean = false

    init() {
        this.initKeyboard()
        this.initMouse()
        this.initAccelerometer()
    }
    initMouse(): void {
        if (!this.isUsingMouse) {
            this.isUsingMouse = true
            window.addEventListener('DOMMouseScroll', event => this.mousewheel(event as WheelEvent), false)
            window.addEventListener('mousewheel', event => this.mousewheel(event as WheelEvent), false)
            ig.system.inputDom.addEventListener('contextmenu', event => this.contextmenu(event as PointerEvent), false)
            ig.system.inputDom.addEventListener('mousedown', event => this.keydown(event), false)
            window.addEventListener('mouseup', event => this.keyup(event), false)
            document.addEventListener('mousemove', event => this.mousemove(event), false)
            document.addEventListener('mouseout', () => this.mouseout(), false)
            window.addEventListener('blur', event => this.blur(event as any), false)
            window.addEventListener('focus', () => this.focus(), false)
            // prettier-ignore
            document.addEventListener('drop', a => { a.preventDefault(); return false }, false)
            // prettier-ignore
            document.addEventListener('dragover', a => { a.preventDefault(); return false }, false)
            ig.system.inputDom.addEventListener('touchstart', event => this.keydown(event as any), false)
            ig.system.inputDom.addEventListener('touchend', event => this.keyup(event as any), false)
            ig.system.inputDom.addEventListener('touchmove', event => this.mousemove(event as any), false)
            // ig.vars.set('mouse.active', true)
        }
    }
    initKeyboard(): void {
        if (!this.isUsingKeyboard) {
            this.isUsingKeyboard = true
            window.addEventListener('keydown', this.keydown.bind(this), false)
            window.addEventListener('keyup', this.keyup.bind(this), false)
        }
    }
    initAccelerometer(): void {
        this.isUsingAccelerometer || window.addEventListener('devicemotion', this.devicemotion.bind(this), false)
    }
    mousewheel(event: WheelEvent): void {
        if (!ig.system.focusLost) {
            const b =
                this.bindings[
                    ('wheelDelta' in event ? (event.wheelDelta as number) / 60 : -event.detail / 2) > 0
                        ? ig.KEY.MWHEEL_UP
                        : ig.KEY.MWHEEL_DOWN
                ]
            if (b) {
                this.actions[b] = true
                this.presses[b] = true
                this.keyups[b] = true
                if (this.isInIframe()) {
                    event.stopPropagation()
                    event.preventDefault()
                }
                this.delayedKeyup.push(b)
            }
            this.currentDevice = ig.INPUT_DEVICES.KEYBOARD_AND_MOUSE
        }
    }
    mousemove(event: MouseEvent): void {
        this.mouseIsOut = false
        ig.Input.getMouseCoords(this.mouse, event, ig.system.canvas)
        this.mouse.x = this.mouse.x * (ig.system.width / ig.system.screenWidth)
        this.mouse.y = this.mouse.y * (ig.system.height / ig.system.screenHeight)

        if (!this.mouseGuiActive && !(this.lastMousePos.x != this.mouse.x && this.lastMousePos.y != this.mouse.y)) {
            this.mouseGuiActive = true
            this.lastMousePos.x = this.mouse.x
            this.lastMousePos.y = this.mouse.y
        }
    }
    mouseout(): void {
        this.mouseIsOut = true
    }
    mouseOutOfScreen(): boolean {
        return this.mouseIsOut
    }
    contextmenu(event: PointerEvent): void {
        if (this.bindings[ig.KEY.MOUSE2]) {
            event.stopPropagation()
            event.preventDefault()
        }
    }
    isInIframe(): boolean {
        return window.parent != window
    }
    isInIframeAndUnfocused(): boolean {
        return this.isInIframe() && !document.hasFocus()
    }
    keydown(event: KeyboardEvent | MouseEvent): void {
        if (!this.isInIframeAndUnfocused() && !(this.ignoreKeyboard && event.type != 'mousedown')) {
            if (ig.system.hasFocusLost()) {
                // event.type == 'mousedown' && ig.system.regainFocus()
            } else {
                if (event.type == 'mousedown') this.mouseGuiActive = true
                this.currentDevice = ig.INPUT_DEVICES.KEYBOARD_AND_MOUSE
                // @ts-expect-error
                if (event.target?.type != 'text') {
                    // prettier-ignore
                    // @ts-expect-error
                    const key: ig.KEY = event.type == 'keydown' ? event.keyCode : event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1
                    if (event.type == 'touchstart' || event.type == 'mousedown') this.mousemove(event as MouseEvent)
                    const action = this.bindings[key]
                    if (action) {
                        this.actions[action] = true
                        if (!this.locks[action]) {
                            this.presses[action] = true
                            this.locks[action] = true
                        }
                        event.stopPropagation()
                        event.preventDefault()
                    }
                }
            }
        }
    }
    keyup(event: MouseEvent | KeyboardEvent): void {
        if (
            !this.isInIframeAndUnfocused() &&
            !(this.ignoreKeyboard && event.type != 'mouseup') &&
            // @ts-expect-error
            event.target!.type != 'text' &&
            !(ig.system.hasFocusLost() && event.type == 'mouseup')
        ) {
            this.currentDevice = ig.INPUT_DEVICES.KEYBOARD_AND_MOUSE
            // prettier-ignore
            // @ts-expect-error
            const action = this.bindings[event.type == 'keyup' ? event.keyCode : event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1]
            if (action) {
                // @ts-expect-error
                this.keyups[action] = true
                this.delayedKeyup.push(action)
                event.stopPropagation()
                event.preventDefault()
            }
        }
    }
    blur(event: MouseEvent | KeyboardEvent): void {
        window.IG_KEEP_WINDOW_FOCUS || ig.system.setWindowFocus(true)
        for (const _action in this.actions) {
            const action = _action as ig.Input.KnownAction
            if (this.actions[action] == true) {
                this.keyups[action] = true
                this.delayedKeyup.push(action)
                event.stopPropagation()
                event.preventDefault()
            }
        }
    }
    focus(): void {
        window.IG_KEEP_WINDOW_FOCUS || ig.system.setWindowFocus(false)
    }
    devicemotion(event: DeviceMotionEvent): void {
        this.accel = event.accelerationIncludingGravity as Vec3
    }
    // bind(key: ig.KEY, action: ig.Input.KnownAction): void {
    //     key < 0 ? this.initMouse() : key > 0 && this.initKeyboard()
    //     this.bindings[key] = action
    // }
    // bindTouch(key: ig.KEY, action: ig.Input.KnownAction): void {
    //     const c = ig.$(key)
    //     const d = this
    //     c.addEventListener( 'touchstart', key => { d.touchStart(key, action) }, false)
    //     c.addEventListener( 'touchend', key => { d.touchEnd(key, action) }, false)
    // }
    // unbind(key: ig.KEY): void { this.bindings[key] = null }
    // unbindAll(): void { this.bindings = [] }
    // state(action: ig.Input.KnownAction): boolean { return this.actions[action] }
    // pressed(action: ig.Input.KnownAction): boolean { return ig.game.firstUpdateLoop ? this.presses[action] : false }
    // keyupd(action: ig.Input.KnownAction): boolean { return this.keyups[action] }
    clearPressed(): void {
        for (const key of this.delayedKeyup) {
            this.actions[key] = false
            this.locks[key] = false
        }

        this.delayedKeyup = []
        this.presses = {}
        this.keyups = {}
    }
    // touchStart(event: TouchEvent, action: ig.Input.KnownAction): boolean {
    //     this.actions[action] = true
    //     this.presses[action] = true
    //     event.stopPropagation()
    //     event.preventDefault()
    //     return false
    // }
    // touchEnd(event: TouchEvent, action: ig.Input.KnownAction): boolean {
    //     this.delayedKeyup.push(action)
    //     event.stopPropagation()
    //     event.preventDefault()
    //     return false
    // }
    //

    static getMouseCoords = (dest: Vec2, event: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
        let x = 0
        let y = 0
        for (let element: HTMLElement | null = canvas; element; element = element.offsetParent as HTMLElement) {
            x = x + element.offsetLeft
            y = y + element.offsetTop
        }
        let pageX: number
        let pageY: number
        if ('touches' in event) {
            pageX = event.touches[0].clientX
            pageY = event.touches[0].clientY
        } else {
            pageX = event.pageX
            pageY = event.pageY
        }
        dest.x = pageX - x
        dest.y = pageY - y
    }
}
