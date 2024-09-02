class UIPanel {
    description: string = ''
    frame: [number, number, number, number]
    panelOffset: p5.Vector
    clickDebounce: number

    constructor(frame: [number, number, number, number]) {
        this.frame = frame
        this.panelOffset = createVector(0, 0)
        this.clickDebounce = 0
    }

    drawFrame() {
        push()

        drawingContext.shadowOffsetY = 2
        drawingContext.shadowBlur = 4
        drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)'
        strokeWeight(0)
        fill(255)

        const newFrame: [number, number, number, number] = [
            this.frame[0] + this.panelOffset.x,
            this.frame[1] + this.panelOffset.y,
            this.frame[2],
            this.frame[3],
        ]
        rect(...newFrame, 10)

        pop()
    }

    getOffsetFrame(): [number, number, number, number] {
        return [
            this.frame[0] + this.panelOffset.x,
            this.frame[1] + this.panelOffset.y,
            this.frame[2],
            this.frame[3],
        ]
    }

    render(panelOffset: p5.Vector) {
        this.panelOffset = panelOffset
        this.drawFrame()
    }
}
