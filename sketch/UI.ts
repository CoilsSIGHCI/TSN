type FunctionButton = {
    name: string
    onClick: () => void
}

class UI {
    buttons: FunctionButton[]
    frame: [number, number, number, number] = [30, 30, 400, 300]

    // random color for the avatar (HSB color mode)
    avatarColor: string = this.getRandomAvatarColor()
    avatarD = 70
    avatarX = this.frame[0] + this.avatarD / 2 + 40
    avatarY = this.frame[1] + this.avatarD / 2 + 30

    id: number = this.getRandomID()
    verified = false

    constructor() {
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
        ]
    }

    // check if point is inside the frame
    isPointInside(x: number, y: number) {
        return (
            x > this.frame[0] &&
            x < this.frame[0] + this.frame[2] &&
            y > this.frame[1] &&
            y < this.frame[1] + this.frame[3]
        )
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

    // change content periodically
    enableUpdate() {
        setInterval(() => {
            this.avatarColor = this.getRandomAvatarColor()
            this.id = this.getRandomID()
            // verified by chance (50%)
            this.verified = random() < 0.1
        }, 3000)
    }

    drawFrame() {
        fill(255)
        rect(...this.frame, 10)
    }

    drawAvatar() {
        fill(this.avatarColor)
        ellipse(this.avatarX, this.avatarY, this.avatarD)
    }

    static verifiedBadge(x: number, y: number, size = 20) {
        stroke('rgba(0,0,0,0)')
        fill('rgb(23,176,198)')
        ellipse(x, y, size)
        fill(255)
        ellipse(x, y, size * 7 / 20)
    }

    drawID() {
        const idX = this.frame[0] + 60 + this.avatarD
        const idY = this.frame[1] + 50

        fill(180)
        textSize(18)
        textAlign(LEFT, CENTER) // set text alignment to left
        text('@', idX, idY + 35)
        rect(idX + 19, idY + 22, this.id * 0.7, 24, 7)

        fill(121)
        rect(idX, idY - 15, this.id, 30, 7)

        // verified badge
        if (this.verified) {
            UI.verifiedBadge(idX + this.id + 17, idY)
        }
    }

    drawButtons() {
        // calculate button dimensions
        const buttonWidth = 60
        const buttonHeight = 60
        const buttonPadding = 10

        // show buttons
        for (let i = 0; i < this.buttons.length; i++) {
            const buttonX =
                this.frame[0] + i * buttonWidth + 50 + i * buttonPadding
            const buttonY = this.frame[1] + this.frame[3] - buttonHeight - 30

            fill('rgba(0,0,0,0)')
            rect(buttonX, buttonY, buttonWidth, buttonHeight)
            fill(0)
            textAlign(CENTER, CENTER) // set text alignment to center
            text(
                this.buttons[i].name,
                buttonX + buttonWidth / 2,
                buttonY + buttonHeight / 2
            ) // center the text

            // click event
            if (
                mouseIsPressed &&
                mouseX > buttonX &&
                mouseX < buttonX + buttonWidth &&
                mouseY > buttonY &&
                mouseY < buttonY + buttonHeight
            ) {
                this.buttons[i].onClick()
            }
        }
    }

    // create p5.js rect
    render() {
        // draw frame
        this.drawFrame()

        // draw avatar
        this.drawAvatar()

        // draw ID
        this.drawID()

        // draw buttons
        this.drawButtons()
    }
}
