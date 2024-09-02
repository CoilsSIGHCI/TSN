class SerialPrompt extends UIPanel {
    constructor(frame: [number, number, number, number]) {
        super(frame)

        this.description = 'Serial Prompt'
    }

    drawSerialPrompt() {
        const device = TSNDevice.getInstance()

        push()
        fill(255)
        strokeWeight(0)
        rect(...this.getOffsetFrame(), 10)

        fill(0)
        textAlign(LEFT, TOP)
        textSize(20)
        text(
            'TSN Device',
            this.getOffsetFrame()[0] + 30,
            this.getOffsetFrame()[1] + 30,
        )

        fill(80)
        rect(
            this.getOffsetFrame()[0] + this.getOffsetFrame()[2] - 130,
            this.getOffsetFrame()[1] + this.getOffsetFrame()[3] - 70,
            100,
            40,
            20,
        )

        fill(255)
        textAlign(CENTER, CENTER)
        text(
            'Connect',
            this.getOffsetFrame()[0] + this.getOffsetFrame()[2] - 80,
            this.getOffsetFrame()[1] + this.getOffsetFrame()[3] - 50,
        )

        if (
            mouseIsPressed &&
            mouseX >
                this.getOffsetFrame()[0] + this.getOffsetFrame()[2] - 130 &&
            mouseX < this.getOffsetFrame()[0] + this.getOffsetFrame()[2] - 30 &&
            mouseY > this.getOffsetFrame()[1] + this.getOffsetFrame()[3] - 70 &&
            mouseY < this.getOffsetFrame()[1] + this.getOffsetFrame()[3] - 30
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
                this.getOffsetFrame()[0] + 40,
                this.getOffsetFrame()[1] + 37 + 30 * (index + 1),
                100,
                26,
                13,
            )
            fill(0)
            textAlign(LEFT, CENTER)
            text(
                connection[0],
                this.getOffsetFrame()[0] + 50,
                this.getOffsetFrame()[1] + 50 + 30 * (index + 1),
            )
            text(
                connection[1],
                this.getOffsetFrame()[0] + 100,
                this.getOffsetFrame()[1] + 50 + 30 * (index + 1),
            )
        })
        pop()
    }

    render(panelOffset: p5.Vector) {
        this.panelOffset = panelOffset
        this.drawFrame()
        this.drawSerialPrompt()
    }
}
