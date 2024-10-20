// GLOBAL VARS & TYPES
let numberOfShapesControl: p5.Element

let ui: UI

let pool: Pool
let clusterSizeTable: ClusterSizeTable

let tick = 0
let growthTicks = 24

// P5 WILL AUTOMATICALLY USE GLOBAL MODE IF A DRAW() FUNCTION IS DEFINED
function setup() {
    console.log('🚀 - Setup initialized - P5 is running')
    clusterSizeTable = {
        0: {
            size: 90,
            center: createVector(0.55, 0.45),
            enabled: true,
        },
        1: {
            size: 60,
            center: createVector(0.3, 0.2),
            enabled: true,
        },
        2: {
            size: 10,
            center: createVector(0.65, 0.1),
            enabled: true,
        },
        3: {
            size: 15,
            center: createVector(0.9, 0.3),
            enabled: true,
        },
        4: {
            size: 40,
            center: createVector(0.85, 0.65),
            enabled: true,
        },
        5: {
            size: 10,
            center: createVector(0.55, 0.85),
            enabled: true,
        },
        6: {
            size: 5,
            center: createVector(0.2, 0.8),
            enabled: true,
        },
        7: {
            size: 40,
            center: createVector(0.25, 0.6),
            enabled: true,
        },
    }
    pool = new Pool(clusterSizeTable)
    createCanvas(windowWidth, windowHeight)
    noFill().frameRate(60)

    ui = new UI()

    // Font
    textFont('monospace')
}

// p5 WILL AUTO RUN THIS FUNCTION IF THE BROWSER WINDOW SIZE CHANGES
function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

// p5 WILL HANDLE REQUESTING ANIMATION FRAMES FROM THE BROWSER AND WIL RUN DRAW() EACH ANIMATION FROME
function draw() {
    // CLEAR BACKGROUND
    background(234)

    updateAndDrawAnimatingMessages()

    // Grow
    if (tick === growthTicks) {
        pool.updateConnections()
        console.log('update')
        pool.points.forEach((point) => {
            point.grow()
            point.post()
        })
        tick = 0
    }

    tick += 1

    pool.renderPool()

    ui.render()
}
