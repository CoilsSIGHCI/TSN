type MessageProperty = {
    aggressive: number
    integrity: number
    attractive: number
}

const animatingMessages: Message[] = []

class Message {
    sender: Individual
    property: MessageProperty
    topic: string
    animationProgress: number = 0
    animationDelay: number = random(0, 200)
    receiver: Individual | null = null

    constructor(sender: Individual, property: MessageProperty, topic: string) {
        this.sender = sender
        this.property = property
        this.topic = topic
    }

    propagate(receiver: Individual) {
        const flaggedMessage: FlaggedMessage = {
            ...this,
            read: false,
        }
        receiver.inbox.push(flaggedMessage)

        // Start the animation
        this.receiver = receiver
        this.animationProgress = 0

        // Add this message to the animatingMessages array
        animatingMessages.push(this)
    }

    update() {
        if (this.animationDelay > 0) {
            this.animationDelay -= 1
            return
        }
        if (this.animationProgress < 1) {
            this.animationProgress += 0.02
            if (this.animationProgress >= 1) {
                this.animationProgress = 1
                // Remove this message from the animatingMessages array
                const index = animatingMessages.indexOf(this)
                if (index > -1) {
                    animatingMessages.splice(index, 1)
                }
            }
        }
    }

    draw() {
        if (this.animationDelay > 0) {
            return
        }
        if (this.animationProgress < 1) {
            const senderX = this.sender.vector.x * width
            const senderY = this.sender.vector.y * height
            const receiverX = this.receiver.vector.x * width
            const receiverY = this.receiver.vector.y * height

            // Calculate the total distance in pixels
            const totalDistance = dist(senderX, senderY, receiverX, receiverY)

            // Calculate the current distance based on animation progress
            const currentDistance = totalDistance * this.animationProgress

            // Round the current distance to the nearest pixel
            const roundedDistance = round(currentDistance)

            // Calculate the actual progress based on rounded distance
            const actualProgress = roundedDistance / totalDistance

            const currentX = lerp(senderX, receiverX, actualProgress)
            const currentY = lerp(senderY, receiverY, actualProgress)

            push()
            const color = Message.getMessageColor(this.property)
            blendMode(HARD_LIGHT)
            fill(color)
            noStroke()

            // Calculate rotation angle
            const angle = atan2(receiverY - senderY, receiverX - senderX)

            // Apply rotation and draw ellipse
            translate(currentX, currentY)
            rotate(angle)
            ellipse(0, 0, 20, abs(this.animationProgress - 0.5) * 20)

            pop()
        }
    }

    static getMessageColor(property: MessageProperty): p5.Color {
        const { aggressive, integrity, attractive } = property
        // Normalize values to 0-1 range
        const r = 1 - aggressive
        const g = 1 - integrity
        const b = 1 - attractive

        // Create and return the color
        return color(r * 255, g * 255, b * 255, 200)
    }
}

// Add a new function to update and draw all animating messages
function updateAndDrawAnimatingMessages() {
    for (const message of animatingMessages) {
        message.update()
        message.draw()
    }
}
