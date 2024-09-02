class SerialPrompt extends UIPanel {
    visible: boolean = false

    constructor(frame: [number, number, number, number]) {
        super(frame)
    }

    drawSerialPrompt() {
        const device = TSNDevice.getInstance()

        push()
        fill(255)
        strokeWeight(0)
        rect(...this.frame, 10)

        fill(0)
        textAlign(LEFT, TOP)
        textSize(20)
        text('TSN Device', this.frame[0] + 30, this.frame[1] + 30)

        fill(80)
        rect(
            this.frame[0] + this.frame[2] - 130,
            this.frame[1] + this.frame[3] - 70,
            100,
            40,
            20,
        )

        fill(255)
        textAlign(CENTER, CENTER)
        text(
            'Connect',
            this.frame[0] + this.frame[2] - 80,
            this.frame[1] + this.frame[3] - 50,
        )

        if (
            mouseIsPressed &&
            mouseX > this.frame[0] + this.frame[2] - 130 &&
            mouseX < this.frame[0] + this.frame[2] - 30 &&
            mouseY > this.frame[1] + this.frame[3] - 70 &&
            mouseY < this.frame[1] + this.frame[3] - 30
        ) {
            if (this.clickDebounce === 0) {
                this.clickDebounce = 1
                device.connect().then(() => {
                    this.clickDebounce = 0
                    device.read()
                })
                console.log('Connecting to serial device')
            }
        }

        device.connections().map((connection, index) => {
            fill(210)
            rect(
                this.frame[0] + 40,
                this.frame[1] + 37 + 30 * (index + 1),
                100,
                26,
                13,
            )
            fill(0)
            textAlign(LEFT, CENTER)
            text(
                connection[0],
                this.frame[0] + 50,
                this.frame[1] + 50 + 30 * (index + 1),
            )
            text(
                connection[1],
                this.frame[0] + 100,
                this.frame[1] + 50 + 30 * (index + 1),
            )
        })
        pop()
    }

    render() {
        if (!this.visible) return

        this.drawFrame()
        this.drawSerialPrompt()
    }
}