type ClusterProperty = {
    size: number
    center: p5.Vector
    enabled: boolean
}
type ClusterSizeTable = {
    [key: number]: ClusterProperty
}

class Pool {
    points: Individual[] = []
    clusters: ClusterSizeTable = {}

    constructor(clusters: ClusterSizeTable) {
        this.clusters = clusters
        this.initializeClusters()
    }

    initializeClusters() {
        for (const [clusterId, property] of Object.entries(this.clusters)) {
            const id = parseInt(clusterId)
            const clusterPoints: Individual[] = []

            for (let i = 0; i < property.size; i++) {
                const theta = random(0, TWO_PI)
                const radius = random(0, 0.002 * property.size)
                const offset = createVector(
                    radius * cos(theta),
                    radius * sin(theta)
                )
                const position = p5.Vector.add(property.center, offset)
                const newIndividual = new Individual(
                    position,
                    undefined,
                    undefined,
                    id
                )
                this.points.push(newIndividual)
                clusterPoints.push(newIndividual)
            }

            // Create internal connections based on distance
            this.createInternalConnectionsByDistance(clusterPoints)
        }
    }

    async updateConnections() {
        const hardwareConnections = TSNDevice.getInstance().connections()

        console.log(hardwareConnections)

        // Clear all existing inter-cluster connections
        this.points.forEach((point) => {
            point.connections = point.connections.filter(
                (conn) => conn.clusterId === point.clusterId
            )
        })

        // Update connections based on hardware data
        hardwareConnections.forEach((conn) => {
            const cluster1Id = conn[0]
            const cluster2Id = conn[1]

            if (this.clusters[cluster1Id] && this.clusters[cluster2Id]) {
                this.createRandomConnectionsBetweenClusters(
                    cluster1Id,
                    cluster2Id
                )
            }
        })
    }

    private createInternalConnectionsByDistance(clusterPoints: Individual[]) {
        const maxConnections = 3 // Maximum number of connections per individual
        const connectionThreshold = 0.03 * min(screenX, screenY) // Adjust this value to control the connection distance

        for (let i = 0; i < clusterPoints.length; i++) {
            const point = clusterPoints[i]
            const distances = clusterPoints
                .map((p, index) => ({
                    index,
                    distance: p5.Vector.dist(point.vector, p.vector),
                }))
                .filter((d) => d.index !== i) // Exclude self
                .sort((a, b) => a.distance - b.distance) // Sort by distance

            let connectionCount = 0
            for (const { index, distance } of distances) {
                if (connectionCount >= maxConnections) break
                if (distance <= connectionThreshold) {
                    const otherPoint = clusterPoints[index]
                    if (!point.connections.includes(otherPoint)) {
                        this.updateIndividualConnections(point, otherPoint)
                        this.updateIndividualConnections(otherPoint, point)
                        connectionCount++
                    }
                } else {
                    break // Stop if distance exceeds threshold
                }
            }
        }
    }

    private createRandomConnectionsBetweenClusters(
        cluster1Id: number,
        cluster2Id: number
    ) {
        const points1 = this.points.filter((p) => p.clusterId === cluster1Id)
        const points2 = this.points.filter((p) => p.clusterId === cluster2Id)

        if (points1.length === 0 || points2.length === 0) return

        const connectionCount = Math.floor(
            random(
                min(
                    this.clusters[cluster1Id].size,
                    this.clusters[cluster2Id].size
                ),
                max(
                    this.clusters[cluster1Id].size,
                    this.clusters[cluster2Id].size
                )
            ) * 0.6
        )

        for (let i = 0; i < connectionCount; i++) {
            const point1 = random(points1)
            const point2 = random(points2)

            this.updateIndividualConnections(point1, point2)
            this.updateIndividualConnections(point2, point1)
        }
    }

    private updateIndividualConnections(
        individual: Individual,
        connection: Individual
    ) {
        if (!individual.connections.includes(connection)) {
            individual.connections.push(connection)
        }
    }

    private updateClusterForces() {
        const clusterAttractionStrength = 0.0001 // Strength of attraction to cluster center
        const clusterRepulsionStrength = 0.000001 // Strength of repulsion from other cluster centers
        const individualRepulsionStrength = 0.0002 // Strength of repulsion from other individuals
        const individualDistanceThreshold = 0.05 // Distance threshold for individual repulsion
        const connectionAttractionStrength = 0.00005 // Strength of attraction between connected individuals
        const clusterBoundaryForce = 0.00001 // Strength of force keeping elements within cluster
        const clusterRadius = 0.5 // Radius of the cluster (adjust as needed)

        for (const point of this.points) {
            const cluster = this.clusters[point.clusterId]
            if (cluster.enabled) {
                // Vector from cluster center to point
                const toPoint = createVector(
                    point.vector.x - cluster.center.x,
                    point.vector.y - cluster.center.y
                )
                const distanceFromCenter = toPoint.mag()

                // Attraction to cluster center
                let attractionForce = toPoint.copy().mult(-1)
                if (distanceFromCenter > 0.2) {
                    // Apply stronger force if point is outside cluster radius
                    attractionForce.setMag(
                        clusterBoundaryForce *
                            (distanceFromCenter - clusterRadius)
                    )
                } else {
                    attractionForce.setMag(clusterAttractionStrength)
                }
                point.vector.add(attractionForce)

                // Repulsion from other clusters
                for (const otherId in this.clusters) {
                    const otherCluster = this.clusters[parseInt(otherId)]
                    if (
                        parseInt(otherId) !== point.clusterId &&
                        otherCluster.enabled
                    ) {
                        const repulsionForce = createVector(
                            point.vector.x - otherCluster.center.x,
                            point.vector.y - otherCluster.center.y
                        )
                        const distance = repulsionForce.mag()
                        repulsionForce.setMag(
                            (1 / (distance * distance)) *
                                clusterRepulsionStrength
                        )
                        point.vector.add(repulsionForce)
                    }
                }

                // Attraction to connected individuals (including inter-cluster connections)
                for (const connectedPoint of point.connections) {
                    const connectionForce = createVector(
                        connectedPoint.vector.x - point.vector.x,
                        connectedPoint.vector.y - point.vector.y
                    )
                    connectionForce.setMag(connectionAttractionStrength)
                    point.vector.add(connectionForce)
                }

                // Strong repulsion from other individuals when they are too close
                for (const otherPoint of this.points) {
                    if (
                        otherPoint !== point &&
                        p5.Vector.dist(point.vector, otherPoint.vector) <
                            individualDistanceThreshold
                    ) {
                        const strongRepulsionForce = createVector(
                            point.vector.x - otherPoint.vector.x,
                            point.vector.y - otherPoint.vector.y
                        )
                        strongRepulsionForce.setMag(individualRepulsionStrength)
                        point.vector.add(strongRepulsionForce)
                    }
                }

                // Add some random movement (in proportion)
                point.vector.x += random(-0.5, 0.5) * 0.0001
                point.vector.y += random(-0.5, 0.5) * 0.0001

                // Ensure the point stays within the cluster bounds
                const finalToPoint = createVector(
                    point.vector.x - cluster.center.x,
                    point.vector.y - cluster.center.y
                )
                if (finalToPoint.mag() > clusterRadius) {
                    finalToPoint.setMag(clusterRadius)
                    point.vector.x = cluster.center.x + finalToPoint.x
                    point.vector.y = cluster.center.y + finalToPoint.y
                }

                // Ensure the point stays within the screen bounds
                point.vector.x = constrain(point.vector.x, 0, 1)
                point.vector.y = constrain(point.vector.y, 0, 1)
            }
        }
    }

    private drawConnections(point: Individual) {
        push()
        for (let i = 0; i < point.connections.length; i++) {
            const otherPoint = point.connections[i]
            const alpha = 0.5 - i * 0.1 // Decrease opacity for each subsequent connection
            strokeWeight(0.5)
            stroke(`rgba(100,100,100,${alpha > 0 ? alpha : 0.1})`)

            // Calculate control point for the curve
            const mid1X =
                point.vector.x + (otherPoint.vector.x - point.vector.x) / 3
            const mid1Y =
                point.vector.y + (otherPoint.vector.y - point.vector.y) / 3
            const mid2X =
                point.vector.x +
                ((otherPoint.vector.x - point.vector.x) / 3) * 2
            const mid2Y =
                point.vector.y +
                ((otherPoint.vector.y - point.vector.y) / 3) * 2

            const offset1X =
                (2 - parseInt(otherPoint.vector.y.toString(5).charAt(4))) / 20
            const offset1Y =
                (2 - parseInt(otherPoint.vector.x.toString(5).charAt(3))) / 20
            const offset2X =
                (2 - parseInt(otherPoint.vector.y.toString(5).charAt(3))) / 20
            const offset2Y =
                (2 - parseInt(otherPoint.vector.x.toString(5).charAt(4))) / 20

            // Draw a curved line
            noFill()
            curve(
                (mid1X + offset1X) * width,
                (mid1Y + offset1Y) * height,
                point.vector.x * width,
                point.vector.y * height,
                otherPoint.vector.x * width,
                otherPoint.vector.y * height,
                (mid2X + offset2X) * width,
                (mid2Y + offset2Y) * height
            )
        }
        pop()
    }

    renderPool() {
        this.updateClusterForces()

        // Draw clusters
        push()
        for (const clusterId in this.clusters) {
            const cluster = this.clusters[clusterId]
            if (cluster.enabled) {
                noFill()
                strokeWeight(0.5)
                stroke('rgba(100,100,100,0.2)')
                const screenX = cluster.center.x * width
                const screenY = cluster.center.y * height
                ellipse(screenX, screenY, 5 * cluster.size, 5 * cluster.size)
                textSize(72)
                textFont('monospace')
                textStyle(BOLD)
                textAlign(CENTER, CENTER)
                fill(0, 0, 0, 30)
                text(clusterId, screenX, screenY + 2.5 * cluster.size)
            }
        }
        pop()

        // Draw individuals and connections
        push()
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i]
            if (this.clusters[point.clusterId].enabled) {
                // Draw individual
                stroke('rgba(0,0,0,0)')
                fill(
                    `rgba(${(point.clusterId * 50) % 255},${
                        (point.clusterId * 100) % 255
                    },${(point.clusterId * 150) % 255},0.8)`
                )
                const screenX = point.vector.x * width
                const screenY = point.vector.y * height

                const distanceToCenter = p5.Vector.dist(
                    point.vector,
                    this.clusters[point.clusterId].center
                )
                ellipse(
                    screenX,
                    screenY,
                    200 * max(0.05, 0.1 - distanceToCenter)
                )

                if (point.verified) {
                    AppUI.verifiedBadge(screenX + 12, screenY, 10)
                }

                // Draw connections
                this.drawConnections(point)
            }
        }
        pop()
    }
}
