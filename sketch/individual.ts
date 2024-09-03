type IndividualPersonality = {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
}

type FlaggedMessage = Message & {
    read: boolean
}

class Individual {
    personality: IndividualPersonality
    verified: boolean
    vector: p5.Vector
    inbox: Array<FlaggedMessage> = []
    connections: Array<Individual> = []
    clusterId: number

    constructor(
        vector: p5.Vector,
        verified?: boolean,
        personality?: IndividualPersonality,
        clusterId?: number
    ) {
        this.personality = personality || {
            openness: random(0, 1),
            conscientiousness: random(0, 1),
            extraversion: random(0, 1),
            agreeableness: random(0, 1),
            neuroticism: random(0, 1),
        }
        this.verified = verified ?? random() < 0.1
        this.vector = vector
        this.clusterId = clusterId ?? 0
    }

    grow() {
        const unreadMessages = this.inbox.filter((message) => !message.read)

        for (let message of unreadMessages) {
            // Respond to the message
            this.post(message)

            // Update personality based on the message
            const aggressiveImpact =
                (message.property.aggressive - this.personality.agreeableness) *
                0.1
            const integrityImpact =
                (message.property.integrity -
                    this.personality.conscientiousness) *
                0.1
            const attractiveImpact =
                (message.property.attractive - this.personality.extraversion) *
                0.1

            this.personality.neuroticism = Math.max(
                0,
                Math.min(1, this.personality.neuroticism + aggressiveImpact)
            )
            this.personality.conscientiousness = Math.max(
                0,
                Math.min(
                    1,
                    this.personality.conscientiousness + integrityImpact
                )
            )
            this.personality.extraversion = Math.max(
                0,
                Math.min(1, this.personality.extraversion + attractiveImpact)
            )

            // Small changes to other traits
            this.personality.openness += (Math.random() - 0.5) * 0.05
            this.personality.agreeableness += (Math.random() - 0.5) * 0.05

            // Ensure all traits stay within [0, 1] range
            for (let trait in this.personality) {
                this.personality[trait as keyof IndividualPersonality] =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            this.personality[
                                trait as keyof IndividualPersonality
                            ]
                        )
                    )
            }

            message.read = true
        }
    }

    wannaPost(): boolean {
        return random() < this.personality.extraversion
    }

    wannaReply(message: Message): boolean {
        return random() < this.personality.extraversion * 2
    }

    post(originalMessage?: Message) {
        const property: MessageProperty = {
            aggressive: this.calculateAggressiveness(originalMessage),
            integrity: this.calculateIntegrity(originalMessage),
            attractive: this.calculateAttractiveness(originalMessage),
        }

        // Respond to the unread messages in the inbox
        if (!originalMessage) {
            // slice inbox to only include unread messages
            this.inbox = this.inbox.filter((message) => !message.read)
            if (this.inbox.length > 0) {
                for (let message of this.inbox) {
                    if (this.wannaReply(message)) this.post(message)
                }
            }
        }

        if (this.wannaPost()) {
            const randomConnection =
                this.connections[
                    Math.floor(Math.random() * this.connections.length)
                ]
            const message = new Message(this, property, originalMessage?.topic ?? '')
            message.propagate(randomConnection)
        }
    }

    private calculateAggressiveness(message?: Message): number {
        let base = 1 - this.personality.agreeableness
        if (message) {
            base = (base + message.property.aggressive) / 2
        }
        return Math.min(1, Math.max(0, base + (Math.random() - 0.5) * 0.2))
    }

    private calculateIntegrity(message?: Message): number {
        let base = this.personality.conscientiousness
        if (message) {
            base = (base + message.property.integrity) / 2
        }
        return Math.min(1, Math.max(0, base + (Math.random() - 0.5) * 0.2))
    }

    private calculateAttractiveness(message?: Message): number {
        let base = this.personality.extraversion
        if (message) {
            base = (base + message.property.attractive) / 2
        }
        return Math.min(1, Math.max(0, base + (Math.random() - 0.5) * 0.2))
    }
}
