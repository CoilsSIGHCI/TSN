function renderPool(points: Individual[]) {
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
    for (let i = 0; i < points.length; i++) {
        stroke('rgba(0,0,0,0)')
        fill('rgba(0,0,0,0.8)')
        ellipse(points[i].vector.x, points[i].vector.y, 10, 10)
        if (points[i].verified) {
            UI.verifiedBadge(points[i].vector.x + 12, points[i].vector.y, 10)
        }
    }

    // Function to calculate distance between two points
    function distance(point1: Individual, point2: Individual) {
        return Math.sqrt(
            Math.pow(point1.vector.x - point2.vector.x, 2) +
                Math.pow(point1.vector.y - point2.vector.y, 2)
        )
    }
    let lines: Array<string> = []

    // DRAW LINES BETWEEN FLOATING POINTS
    for (let i = 0; i < points.length; i++) {
        // Calculate distances to all other points
        let distances = []
        for (let j = 0; j < points.length; j++) {
            if (points[j].verified && points[i].verified) {
                continue
            }
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
        if (points[i].verified) {
            x *= 3
        }
        for (let j = 0; j < x && j < distances.length; j++) {
            let point = points[distances[j].index]
            // check if mouse is hovering over the point
            if (
                dist(mouseX, mouseY, points[i].vector.x, points[i].vector.y) <
                    15 ||
                dist(mouseX, mouseY, point.vector.x, point.vector.y) < 15
            ) {
                fill('red')
                ellipse(points[i].vector.x, points[i].vector.y, 10, 10)
                stroke('red')
            } else {
                strokeWeight(1)
                stroke('rgba(50,50,50,0.1)') // normal color
            }

            // draw single-directional line or bi-directional line
            push()
            let lineKey = `${i}-${distances[j].index}`
            let reverseLineKey = `${distances[j].index}-${i}`
            if (
                !points[i].verified &&
                (lines.indexOf(lineKey) !== -1 ||
                    lines.indexOf(reverseLineKey) !== -1)
            ) {
                // draw bi-directional line
                strokeWeight(2)
                stroke('rgba(0, 0, 0, .2)') // color for bi-directional line
            } else {
                // draw single-directional line
                lines.push(lineKey)
            }
            line(
                points[i].vector.x,
                points[i].vector.y,
                point.vector.x,
                point.vector.y
            )
            pop()
        }

        if (dist(mouseX, mouseY, points[i].vector.x, points[i].vector.y) < 15) {
            fill('red')
            ellipse(points[i].vector.x, points[i].vector.y, 15, 15)
        }
    }
}