type FunctionButton = {
    name: string
    onClick: () => void
}

type FunctionButtonRender = FunctionButton & {
    lines?: number[][]
}

class AppUI extends UIPanel {
    buttons: FunctionButtonRender[]
    avatarColor: string = this.getRandomAvatarColor()
    avatarD = 70
    avatarY = this.getOffsetFrame()[1] + this.avatarD / 2 + 30
    visibilitySketchyLines: number[][] = []
    id: number = this.getRandomID()
    verified = false
    serialPrompt: SerialPrompt

    constructor(frame: [number, number, number, number]) {
        super(frame)

        this.description = 'App UI'
        this.buttons = [
            {
                name: 'LIKE',
                onClick: () => {
                    console.log('Button 1 clicked')
                },
            },
            {
                name: 'FWD',
                onClick: () => {
                    console.log('Button 2 clicked')
                },
            },
            {
                name: 'COM',
                onClick: () => {
                    console.log('Button 3 clicked')
                },
            },
            {
                name: 'SCAM',
                onClick: () => {
                    console.log('Button 4 clicked')
                },
            },
        ]
    }

    private getRandomAvatarColor(): string {
        const hue = Math.floor(random(0, 360))
        const saturation = Math.floor(random(30, 66))
        const lightness = Math.floor(random(50, 76))
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }

    private getRandomID(): number {
        return Math.floor(random(60, 120))
    }

    enableUpdate() {
        setInterval(() => {
            this.avatarColor = this.getRandomAvatarColor()
            this.id = this.getRandomID()
            this.verified = random() < 0.1
        }, 3000)
    }

    drawAvatar() {
        fill(this.avatarColor)
        ellipse(
            this.getOffsetFrame()[0] + this.avatarD / 2 + 40,
            this.getOffsetFrame()[1] + this.avatarD / 2 + 40,
            this.avatarD,
        )
    }

    static verifiedBadge(x: number, y: number, size = 20) {
        stroke('rgba(0,0,0,0)')
        fill('rgb(23,176,198)')
        ellipse(x, y, size)
        fill(255)
        ellipse(x, y, (size * 7) / 20)
    }

    drawID() {
        const idX = this.getOffsetFrame()[0] + 60 + this.avatarD
        const idY = this.getOffsetFrame()[1] + 50

        fill(180)
        textSize(18)
        textAlign(LEFT, CENTER)
        text('@', idX, idY + 35)
        rect(idX + 19, idY + 22, this.id * 0.7, 24, 7)

        fill(121)
        rect(idX, idY - 15, this.id, 30, 7)

        if (this.verified) {
            AppUI.verifiedBadge(idX + this.id + 17, idY)
        }
    }

    private drawButtonSketchyOutlines(
        lines: number[][],
        buttonX: number,
        buttonY: number,
        buttonWidth: number,
        buttonHeight: number,
        sketchyLines = 2,
        overshoot = 3,
        dithering = 2,
    ) {
        if (lines.length === 0) {
            for (let j = 0; j < sketchyLines; j++) {
                const startX = buttonX + random(-dithering, dithering)
                const startY =
                    buttonY + random(-dithering, dithering) - overshoot
                const endX = buttonX + random(-dithering, dithering)
                const endY =
                    buttonY +
                    buttonHeight +
                    random(-dithering, dithering) +
                    overshoot
                lines.push([startX, startY, endX, endY, random(89, 130)])
            }
            for (let j = 0; j < sketchyLines; j++) {
                const startX =
                    buttonX + buttonWidth + random(-dithering, dithering)
                const startY =
                    buttonY + random(-dithering, dithering) - overshoot
                const endX =
                    buttonX + buttonWidth + random(-dithering, dithering)
                const endY =
                    buttonY +
                    buttonHeight +
                    random(-dithering, dithering) +
                    overshoot
                lines.push([startX, startY, endX, endY, random(89, 130)])
            }
            for (let j = 0; j < sketchyLines; j++) {
                const startX =
                    buttonX + random(-dithering, dithering) - overshoot
                const startY =
                    buttonY + buttonHeight + random(-dithering, dithering)
                const endX =
                    buttonX +
                    buttonWidth +
                    random(-dithering, dithering) +
                    overshoot
                const endY =
                    buttonY + buttonHeight + random(-dithering, dithering)
                lines.push([startX, startY, endX, endY, random(89, 130)])
            }
            for (let j = 0; j < sketchyLines; j++) {
                const startX =
                    buttonX + random(-dithering, dithering) - overshoot
                const startY = buttonY + random(-dithering, dithering)
                const endX =
                    buttonX +
                    buttonWidth +
                    random(-dithering, dithering) +
                    overshoot
                const endY = buttonY + random(-dithering, dithering)
                lines.push([startX, startY, endX, endY, random(89, 130)])
            }
        }

        push()
        for (let j = 0; j < lines.length; j++) {
            const l = lines[j]
            stroke(l[4])
            line(...(l.slice(undefined, 4) as [number, number, number, number]))
        }
        pop()
    }

    drawButtons() {
        const buttonWidth = 60
        const buttonHeight = 40
        const buttonPadding = 20

        for (let i = 0; i < this.buttons.length; i++) {
            const buttonX =
                this.getOffsetFrame()[0] +
                i * buttonWidth +
                50 +
                i * buttonPadding
            const buttonY =
                this.getOffsetFrame()[1] +
                this.getOffsetFrame()[3] -
                buttonHeight -
                30

            fill('rgba(0,0,0,0)')
            rect(buttonX, buttonY, buttonWidth, buttonHeight)
            stroke(0)
            strokeWeight(1)

            // if (this.buttons[i].lines === undefined) {
            this.buttons[i].lines = []
            // }

            this.drawButtonSketchyOutlines(
                this.buttons[i].lines,
                buttonX,
                buttonY,
                buttonWidth,
                buttonHeight,
            )

            fill(0)
            textAlign(CENTER, CENTER)
            text(
                this.buttons[i].name,
                buttonX + buttonWidth / 2,
                buttonY + buttonHeight / 2,
            )

            if (
                mouseIsPressed &&
                mouseX > buttonX &&
                mouseX < buttonX + buttonWidth &&
                mouseY > buttonY &&
                mouseY < buttonY + buttonHeight
            ) {
                if (this.clickDebounce === 0) {
                    this.clickDebounce = 1
                    this.buttons[i].onClick()
                    setTimeout(() => {
                        this.clickDebounce = 0
                    }, 500)
                }
            }
        }
    }

    drawVisibilityButton() {
        const buttonSize = 40
        const buttonX =
            this.getOffsetFrame()[0] +
            this.getOffsetFrame()[2] -
            buttonSize -
            30
        const buttonY = this.getOffsetFrame()[1] + 30

        fill(255)
        stroke(0)

        this.visibilitySketchyLines = []

        this.drawButtonSketchyOutlines(
            this.visibilitySketchyLines,
            buttonX,
            buttonY,
            buttonSize,
            buttonSize,
        )

        fill(0)
        textAlign(CENTER, CENTER)
        text('👁️', buttonX + buttonSize / 2, buttonY + buttonSize / 2)

        // if (
        //     mouseIsPressed &&
        //     mouseX > buttonX &&
        //     mouseX < buttonX + buttonSize &&
        //     mouseY > buttonY &&
        //     mouseY < buttonY + buttonSize
        // ) {
        //     this.toggleVisibility()
        // }
    }

    animatePropagation(
        senderX: number,
        senderY: number,
        receiverX: number,
        receiverY: number,
    ) {
        let t = 0
        const interval = setInterval(() => {
            t += 0.02
            if (t > 1) {
                clearInterval(interval)
                return
            }
            const x = lerp(senderX, receiverX, t)
            const y = lerp(senderY, receiverY, t)
            fill(255, 0, 0)
            ellipse(x, y, 10)
        }, 30)
    }

    render(panelOffset: p5.Vector) {
        this.panelOffset = panelOffset
        this.drawFrame()
        push()
        strokeWeight(0)
        this.drawAvatar()
        this.drawID()
        this.drawButtons()
        this.drawVisibilityButton()
        pop()
    }
}
