class UIPanel {
    frame: [number, number, number, number]
    visible: boolean = true
    clickDebounce: number

    constructor(frame: [number, number, number, number]) {
        this.frame = frame
        this.visible = true
        this.clickDebounce = 0
    }

    toggleVisibility() {
        this.visible = !this.visible
    }

    drawFrame() {
        push()
        drawingContext.shadowOffsetY = 8
        drawingContext.shadowBlur = 10
        drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)'
        strokeWeight(0)
        fill(255)
        rect(...this.frame, 10)
        pop()
    }

    render() {
        if (!this.visible) return
        this.drawFrame()
    }
}
