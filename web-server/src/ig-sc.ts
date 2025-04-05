declare const canvas: HTMLCanvasElement
declare const game: HTMLDivElement

const sc = {
    DISPLAY_TYPE: {
        ORIGINAL: 0,
        SCALE_X2: 1,
        FIT: 2,
        STRETCH: 3,
    },
}

const ig = {
    system: {
        fps: 60,
        canvas,
        inputDom: game,
        width: 568,
        height: 320,
        scale: 1,
        context: canvas.getContext('2d', {
            alpha: false,
            desynchronized: true,
        })!,
        realWidth: 0 /* canvas width after upscaling */,
        realHeight: 0 /* canvas height after upscaling */,
        screenWidth: 0 /* canvas style width */,
        screenHeight: 0 /* canvas style height */,
        resize() {
            // this.contextWidth = this.width * this.scale
            // this.contextHeight = this.height * this.scale
            this.realWidth = this.width * this.scale
            this.realHeight = this.height * this.scale
            this.canvas.width = this.width * this.scale
            this.canvas.height = this.height * this.scale
            // this.zoomFocus.x =
            //     window.wm && wm.mapConfig && wm.mapConfig.settingsWidth
            //         ? (width - wm.mapConfig.settingsWidth) / 2
            //         : width / 2
            // this.zoomFocus.y = height / 2
            this.screenWidth = +this.canvas.style.width.replace('px', '') || this.canvas.width
            this.screenHeight = +this.canvas.style.height.replace('px', '') || this.canvas.height
            // this.imageSmoothingDisabled && (this.context[this.imageSmoothingKey] = false)
            // this.contextScale != 1 && this.context.scale(this.contextScale, this.contextScale)
            this.updateCursorClass()
        },
        setCanvasSize(width: number, height: number, hideBorder: boolean) {
            this.canvas.style.width = `${width}px`
            this.canvas.style.height = `${height}px`
            this.canvas.className = hideBorder ? 'borderHidden' : ''
            this.screenWidth = width
            this.screenHeight = height
            this.updateCursorClass()
        },
        updateCursorClass() {},

        // from sc.OptionModel
        _setDisplaySize() {
            let width
            let height

            let drawBorders = false
            let tryDownscale = false
            const type = sc.DISPLAY_TYPE.FIT
            if (type == sc.DISPLAY_TYPE.ORIGINAL) {
                width = ig.system.width
                height = ig.system.height
            } else if (type == sc.DISPLAY_TYPE.SCALE_X2) {
                width = ig.system.width * 2
                height = ig.system.height * 2
            } else if (type == sc.DISPLAY_TYPE.FIT) {
                tryDownscale = true
                if (window.innerWidth / window.innerHeight > ig.system.width / ig.system.height) {
                    height = window.innerHeight
                    width = (ig.system.width * window.innerHeight) / ig.system.height
                } else {
                    width = window.innerWidth
                    height = (ig.system.height * window.innerWidth) / ig.system.width
                }
                drawBorders = true
            } else if (type == sc.DISPLAY_TYPE.STRETCH) {
                tryDownscale = true
                width = window.innerWidth
                height = window.innerHeight
                drawBorders = true
            } else {
                width = ig.system.width
                height = ig.system.height
            }
            if (tryDownscale) {
                for (let i = 1; i < 4; i++) {
                    if (Math.abs(width - ig.system.width * i) < 20) {
                        width = ig.system.width * i
                        height = ig.system.height * i
                    }
                }
            }
            ig.system.setCanvasSize(width, height, drawBorders)
        },
    },
}

function systemInit() {
    ig.system.resize()
    ig.system._setDisplaySize()
}
systemInit()

ig.system.context!.fillRect(0, 0, ig.system.width, ig.system.height)

window.addEventListener('resize', () => {
    ig.system._setDisplaySize()
})
