class Legend extends UIPanel {
    constructor(frame: [number, number, number, number]) {
        super(frame)
        this.description = 'Legends'
    }

    drawLegend() {
        push()
        fill(255)
        strokeWeight(0)
        rect(...this.getOffsetFrame(), 10)

        fill(0)
        textAlign(LEFT, TOP)
        textSize(20)
        text(
            this.description,
            this.getOffsetFrame()[0] + 30,
            this.getOffsetFrame()[1] + 30
        )

        // Draw three gradients reprenseting the different message properties
        this.drawGradient(
            Message.getMessageColor({
                aggressive: 0,
                integrity: 0,
                attractive: 0,
            }),
            Message.getMessageColor({
                aggressive: 1,
                integrity: 0,
                attractive: 0,
            }),
            this.getOffsetFrame()[1] + 70
        )
        this.drawAverageLine('aggressive', this.getOffsetFrame()[1] + 70)
        this.drawLegendText(
            'Aggressive',
            this.getOffsetFrame()[1] + 100
        )

        this.drawGradient(
            Message.getMessageColor({
                aggressive: 0,
                integrity: 0,
                attractive: 0,
            }),
            Message.getMessageColor({
                aggressive: 0,
                integrity: 1,
                attractive: 0,
            }),
            this.getOffsetFrame()[1] + 130
        )
        this.drawAverageLine('integrity', this.getOffsetFrame()[1] + 130)
        this.drawLegendText(
            'Integrity',
            this.getOffsetFrame()[1] + 160
        )

        this.drawGradient(
            Message.getMessageColor({
                aggressive: 0,
                integrity: 0,
                attractive: 0,
            }),
            Message.getMessageColor({
                aggressive: 0,
                integrity: 0,
                attractive: 1,
            }),
            this.getOffsetFrame()[1] + 190
        )
        this.drawAverageLine('attractive', this.getOffsetFrame()[1] + 190)
        this.drawLegendText(
            'Attractive',
            this.getOffsetFrame()[1] + 220
        )
        pop()
    }

    private drawGradient(
        startColour: p5.Color,
        endColour: p5.Color,
        y: number
    ) {
        for (
            let x = this.getOffsetFrame()[0];
            x < this.getOffsetFrame()[0] + this.getOffsetFrame()[2];
            x += 1
        ) {
            const colour = color(
                lerpColor(
                    startColour,
                    endColour,
                    x / (this.getOffsetFrame()[0] + this.getOffsetFrame()[2])
                )
            )
            fill(colour)
            rect(x, y, 1, 20)
        }
    }

    private drawLegendText(type: string, y: number) {
        fill(0)
        textAlign(LEFT, TOP)
        textSize(14)
        text(type, this.getOffsetFrame()[0] + 30, y)
    }

    private drawAverageLine(type: keyof MessageProperty, y: number) {
        push()
        const average = animatingMessages.reduce((acc, curr) => {
            return acc + curr.property[type]
        }, 0) / animatingMessages.length

        const x = this.getOffsetFrame()[0] + (this.getOffsetFrame()[2] * average)
        strokeWeight(2)
        stroke(0)
        fill(255)
        rect(x, y, 10, 20, 5, 5, 5, 5)
        pop()
    }

    render(panelOffset: p5.Vector) {
        this.panelOffset = panelOffset
        this.drawFrame()
        this.drawLegend()
    }
}
