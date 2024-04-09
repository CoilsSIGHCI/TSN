// GLOBAL VARS & TYPES
let numberOfShapesControl: p5.Element
const points: Individual[] = []

let ui: UI
// P5 WILL AUTOMATICALLY USE GLOBAL MODE IF A DRAW() FUNCTION IS DEFINED
function setup() {
    console.log('🚀 - Setup initialized - P5 is running')

    createCanvas(windowWidth, windowHeight)
    const numberOfShapes = 99
    noFill().frameRate(60)

    ui = new UI()

    for (let i = 0; i < numberOfShapes; i++) {
        let x, y, status
        do {
            x = random(0, width)
            y = random(0, height)
        } while (ui.isPointInside(x, y))

        points.push(new Individual(createVector(x, y)))
    }

    ui.enableUpdate()
}

// p5 WILL AUTO RUN THIS FUNCTION IF THE BROWSER WINDOW SIZE CHANGES
function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

// p5 WILL HANDLE REQUESTING ANIMATION FRAMES FROM THE BROWSER AND WIL RUN DRAW() EACH ANIMATION FROME
function draw() {
    // CLEAR BACKGROUND
    background(234)

    const functions = ui.buttons

    renderPool(points)

    ui.render()
}
