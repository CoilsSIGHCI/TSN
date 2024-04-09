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

    // MOVE THE POINTS IF IT IS INSIDE THE FRAME
    for (let i = 0; i < points.length; i++) {
        if (!ui.isPointInside(points[i].vector.x, points[i].vector.y)) {
            break
        }
        // x axis
        if (points[i].vector.x < ui.frame[0]) {
            points[i].vector.x += 2
        } else if (points[i].vector.x > ui.frame[0] + ui.frame[2]) {
            points[i].vector.x -= 2
        }
        // y axis
        if (points[i].vector.y < ui.frame[1]) {
            points[i].vector.y += 2
        } else if (points[i].vector.y > ui.frame[1] + ui.frame[3]) {
            points[i].vector.y -= 2
        }
    }

    // OR OUTSIDE OF THE CANVAS
    for (let i = 0; i < points.length; i++) {
        if (points[i].vector.x < 0) {
            points[i].vector.x += 2
        } else if (points[i].vector.x > width) {
            points[i].vector.x -= 2
        }
        if (points[i].vector.y < 0) {
            points[i].vector.y += 2
        } else if (points[i].vector.y > height) {
            points[i].vector.y -= 2
        }
    }

    // SHIFT THE POSITION OF THE POINTS SLIGHTLY
    for (let i = 0; i < points.length; i++) {
        points[i].vector.x += random(-0.5, 0.5)
        points[i].vector.y += random(-0.5, 0.5)
    }

    // DRAW FLOATING POINTS
    stroke('rgba(0,0,0,0.8)')
    for (let i = 0; i < points.length; i++) {
        ellipse(points[i].vector.x, points[i].vector.y, 10, 10)
    }

    // Function to calculate distance between two points
    function distance(point1: Individual, point2: Individual) {
        return Math.sqrt(
            Math.pow(point1.vector.x - point2.vector.x, 2) + Math.pow(point1.vector.y - point2.vector.y, 2)
        )
    }

    // DRAW LINES BETWEEN FLOATING POINTS
    for (let i = 0; i < points.length; i++) {
        // Calculate distances to all other points
        let distances = []
        for (let j = 0; j < points.length; j++) {
            if (i != j) {
                distances.push({
                    index: j,
                    distance: distance(points[i], points[j]),
                })
            }
        }

        // Sort by distance
        distances.sort((a, b) => a.distance - b.distance)

        // Connect to nearest x points
        let x = points[i].personality.extraversion * 20 // Change this to connect to more or fewer points
        for (let j = 0; j < x && j < distances.length; j++) {
            let point = points[distances[j].index]
            // check if mouse is hovering over the point
            if (
                dist(mouseX, mouseY, points[i].vector.x, points[i].vector.y) < 15 ||
                dist(mouseX, mouseY, point.vector.x, point.vector.y) < 15
            ) {
                stroke('azure') // highlight color
                fill('azure')
                ellipse(points[i].vector.x, points[i].vector.y, 10, 10)
            } else {
                stroke('rgba(0,0,0,0.1)') // normal color
            }
            line(points[i].vector.x, points[i].vector.y, point.vector.x, point.vector.y)
        }

        if (dist(mouseX, mouseY, points[i].vector.x, points[i].vector.y) < 15) {
            fill('azure')
            ellipse(points[i].vector.x, points[i].vector.y, 15, 15)
        }
    }

    ui.render()
}
