type MessageProperty = {
    aggressive: number
    integrity: number
    attractive: number
}

class Message {
    sender: Individual
    property: MessageProperty
    topic: string

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
        
        // Visualize the propagation
        const senderX = this.sender.vector.x
        const senderY = this.sender.vector.y
        const receiverX = receiver.vector.x
        const receiverY = receiver.vector.y

        // Create a canvas element
        const canvas = document.createElement('canvas')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        document.body.appendChild(canvas)
        const ctx = canvas.getContext('2d')

        if (ctx) {
            let progress = 0
            const animationDuration = 1000 // 1 second
            const startTime = performance.now()

            const animate = (currentTime: number) => {
                progress = (currentTime - startTime) / animationDuration
                if (progress > 1) progress = 1

                const currentX = senderX + (receiverX - senderX) * progress
                const currentY = senderY + (receiverY - senderY) * progress

                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.beginPath()
                ctx.arc(currentX, currentY, 10, 0, Math.PI * 2)
                ctx.fillStyle = 'blue'
                ctx.fill()

                if (progress < 1) {
                    requestAnimationFrame(animate)
                } else {
                    document.body.removeChild(canvas)
                }
            }

            requestAnimationFrame(animate)
        }
    }
}
