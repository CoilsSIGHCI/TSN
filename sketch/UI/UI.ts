class UI {
    frame: [number, number, number, number] = [30, 30, 40, 60]
    clickDebounce = 0
    appUI: AppUI
    serialPrompt: SerialPrompt
    legend: Legend

    panelStack: UIPanel[] = []

    constructor() {
        this.appUI = new AppUI([50, 50, 400, 300])
        this.serialPrompt = new SerialPrompt([50, 50, 300, 200])
        this.appUI.enableUpdate()
        this.legend = new Legend([50, 50, 300, 260])
        this.panelStack.push(this.serialPrompt, this.legend)
    }

    drawToggleButton(target: UIPanel, index: number) {
        const buttonSize = 30
        const buttonX = this.frame[0] + this.frame[2] - buttonSize - 30
        const buttonY = this.frame[1] + 30 + index * (buttonSize + 10)

        if (this.panelStack.includes(target)) {
            fill(200)
        } else {
            fill(255)
        }
        stroke(0)
        rect(buttonX, buttonY, buttonSize, buttonSize, 10)

        fill(0)
        textAlign(CENTER, CENTER)
        text(
            target.description[0].toUpperCase() ?? index.toString(),
            buttonX + buttonSize / 2,
            buttonY + buttonSize / 2,
        )

        if (
            mouseIsPressed &&
            mouseX > buttonX &&
            mouseX < buttonX + buttonSize &&
            mouseY > buttonY &&
            mouseY < buttonY + buttonSize
        ) {
            if (this.clickDebounce === 0) {
                this.clickDebounce = 1
                if (this.panelStack.includes(target)) {
                    const index = this.panelStack.indexOf(target)
                    this.panelStack.splice(index, 1)
                } else {
                    this.panelStack.push(target)
                }
                setTimeout(() => {
                    this.clickDebounce = 0
                }, 500)
            }
        }
    }

    drawFrame() {
        fill(255)
        rect(...this.frame, 10)
    }

    render() {
        this.drawToggleButton(this.appUI, 0)
        this.drawToggleButton(this.serialPrompt, 1)
        this.drawToggleButton(this.legend, 2)

        let stackOffset = createVector(0, 0)

        for (const panel of this.panelStack) {
            panel.render(stackOffset)
            stackOffset.y += panel.frame[3] + 10
        }
    }
}
