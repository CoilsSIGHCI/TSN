// GLOBAL VARS & TYPES
let numberOfShapesControl: p5.Element

let ui: UI

let pool: Pool
let clusterSizeTable: ClusterSizeTable

let tick = 0
let growthTicks = 180

// P5 WILL AUTOMATICALLY USE GLOBAL MODE IF A DRAW() FUNCTION IS DEFINED
function setup() {
    console.log('🚀 - Setup initialized - P5 is running')
    clusterSizeTable = {
        0: {
            size: 10,
            center: createVector(0.1, 0.8),
            enabled: true
        },
        1: {
            size: 20,
            center: createVector(0.8, 0.3),
            enabled: true
        },
        2: {
            size: 40,
            center: createVector(0.3, 0.8),
            enabled: true
        },
        3: {
            size: 20,
            center: createVector(0.4, 0.2),
            enabled: true
        },
        4: {
            size: 100,
            center: createVector(0.5, 0.5),
            enabled: true
        }
    }
    pool = new Pool(clusterSizeTable)
    createCanvas(windowWidth, windowHeight)
    noFill().frameRate(60)

    ui = new UI()
}

// p5 WILL AUTO RUN THIS FUNCTION IF THE BROWSER WINDOW SIZE CHANGES
function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

// p5 WILL HANDLE REQUESTING ANIMATION FRAMES FROM THE BROWSER AND WIL RUN DRAW() EACH ANIMATION FROME
function draw() {
    // CLEAR BACKGROUND
    background(234)

    // Grow
    if (tick === growthTicks) {
        pool.updateConnections()
        console.log("update")
        pool.points.forEach((point) => {
            point.grow()
        })
        tick = 0
    }

    tick += 1

    pool.renderPool(ui)

    ui.render()
}
