type Personality = {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
}

class Individual {
    personality: Personality
    vector: p5.Vector

    constructor(vector: p5.Vector, personality?: Personality) {
        this.personality = personality || {
            openness: random(0, 1),
            conscientiousness: random(0, 1),
            extraversion: random(0, 1),
            agreeableness: random(0, 1),
            neuroticism: random(0, 1),
        }
        this.vector = vector
    }
}
