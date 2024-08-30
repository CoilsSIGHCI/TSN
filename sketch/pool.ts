import { Individual } from './individual'
import { TSNDevice, Connection } from './hardware'
import { UI } from './ui'

export class Pool {
    points: Individual[] = []
    device: TSNDevice

    constructor(points: Individual[] = []) {
        this.points = points
        this.device = TSNDevice.getInstance()
    }

    async updateConnections() {
            const hardwareConnections = this.device.connections();

            // Update connections based on hardware data
            hardwareConnections.forEach((conn, index) => {
                if (this.points[conn[0]] && this.points[conn[1]]) {
                    this.updateIndividualConnections(this.points[conn[0]], this.points[conn[1]], index);
                    this.updateIndividualConnections(this.points[conn[1]], this.points[conn[0]], index);
                }
            });

            // Remove excess connections if hardware connections decreased
            this.points.forEach(point => {
                if (point.connections.length > hardwareConnections.length) {
                    point.connections.length = hardwareConnections.length;
                }
            });
        }

        private updateIndividualConnections(individual: Individual, connection: Individual, index: number) {
            if (index < individual.connections.length) {
                // Update existing connection
                individual.connections[index] = connection;
            } else {
                // Add new connection
                individual.connections.push(connection);
            }
        }

    renderPool(ui: UI) {
        // MOVE THE POINTS IF IT IS INSIDE THE FRAME
        for (let i = 0; i < this.points.length; i++) {
            if (
                !ui.isPointInside(
                    this.points[i].vector.x,
                    this.points[i].vector.y,
                )
            ) {
                break
            }
            // x axis
            if (this.points[i].vector.x < ui.frame[0]) {
                this.points[i].vector.x += 2
            } else if (this.points[i].vector.x > ui.frame[0] + ui.frame[2]) {
                this.points[i].vector.x -= 2
            }
            // y axis
            if (this.points[i].vector.y < ui.frame[1]) {
                this.points[i].vector.y += 2
            } else if (this.points[i].vector.y > ui.frame[1] + ui.frame[3]) {
                this.points[i].vector.y -= 2
            }
        }

        // OR OUTSIDE OF THE CANVAS
        for (let i = 0; i < this.points.length; i++) {
            if (this.points[i].vector.x < 0) {
                this.points[i].vector.x += 2
            } else if (this.points[i].vector.x > width) {
                this.points[i].vector.x -= 2
            }
            if (this.points[i].vector.y < 0) {
                this.points[i].vector.y += 2
            } else if (this.points[i].vector.y > height) {
                this.points[i].vector.y -= 2
            }
        }

        // SHIFT THE POSITION OF THE POINTS SLIGHTLY
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].vector.x += random(-0.5, 0.5)
            this.points[i].vector.y += random(-0.5, 0.5)
        }

        // DRAW FLOATING POINTS
        for (let i = 0; i < this.points.length; i++) {
            stroke('rgba(0,0,0,0)')
            fill('rgba(0,0,0,0.8)')
            ellipse(this.points[i].vector.x, this.points[i].vector.y, 10, 10)
            if (this.points[i].verified) {
                UI.verifiedBadge(
                    this.points[i].vector.x + 12,
                    this.points[i].vector.y,
                    10,
                )
            }
        }

        // Function to calculate distance between two points
        function distance(point1: Individual, point2: Individual) {
            return Math.sqrt(
                Math.pow(point1.vector.x - point2.vector.x, 2) +
                    Math.pow(point1.vector.y - point2.vector.y, 2),
            )
        }
        let lines: Array<string> = []

        // DRAW LINES BETWEEN FLOATING POINTS
        for (let i = 0; i < this.points.length; i++) {
            // Calculate distances to all other points
            let distances = []
            for (let j = 0; j < this.points.length; j++) {
                if (this.points[j].verified && this.points[i].verified) {
                    continue
                }
                if (i != j) {
                    distances.push({
                        index: j,
                        distance: distance(this.points[i], this.points[j]),
                    })
                }
            }

            // Sort by distance
            distances.sort((a, b) => a.distance - b.distance)

            // Connect to nearest x points
            let x = this.points[i].personality.extraversion * 20 // Change this to connect to more or fewer points
            if (this.points[i].verified) {
                x *= 3
            }
            for (let j = 0; j < x && j < distances.length; j++) {
                let point = this.points[distances[j].index]
                // check if mouse is hovering over the point
                if (
                    dist(
                        mouseX,
                        mouseY,
                        this.points[i].vector.x,
                        this.points[i].vector.y,
                    ) < 15 ||
                    dist(mouseX, mouseY, point.vector.x, point.vector.y) < 15
                ) {
                    fill('red')
                    ellipse(
                        this.points[i].vector.x,
                        this.points[i].vector.y,
                        10,
                        10,
                    )
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
                    !this.points[i].verified &&
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
                    this.points[i].vector.x,
                    this.points[i].vector.y,
                    point.vector.x,
                    point.vector.y,
                )
                pop()
            }

            if (
                dist(
                    mouseX,
                    mouseY,
                    this.points[i].vector.x,
                    this.points[i].vector.y,
                ) < 15
            ) {
                fill('red')
                ellipse(
                    this.points[i].vector.x,
                    this.points[i].vector.y,
                    15,
                    15,
                )
            }
        }
    }
}
