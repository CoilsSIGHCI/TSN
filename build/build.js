class TSNDevice {
    constructor() {
        this.recentLine = '';
        this.port = null;
        this.outputStream = null;
        this.inputStream = null;
        this.reader = null;
        this.inputDone = null;
        this.outputDone = null;
    }
    static getInstance() {
        if (!TSNDevice.instance) {
            TSNDevice.instance = new TSNDevice();
        }
        return TSNDevice.instance;
    }
    async connect() {
        this.port = await navigator.serial.requestPort();
        await this.port.open({ baudRate: 115200 });
        const textEncoder = new TextEncoderStream();
        this.outputDone = textEncoder.readable.pipeTo(this.port.writable);
        this.outputStream = textEncoder.writable;
        const textDecoder = new TextDecoderStream();
        this.inputDone = this.port.readable.pipeTo(textDecoder.writable);
        this.inputStream = textDecoder.readable;
        this.reader = this.inputStream.getReader();
    }
    async read() {
        if (!this.reader) {
            return;
        }
        let lineBuffer = '';
        while (true) {
            const { value, done } = await this.reader.read();
            if (done) {
                break;
            }
            lineBuffer += value;
            let lines = lineBuffer.split('\n');
            if (lines.length > 1) {
                this.recentLine = lines[0];
                lineBuffer = lines[1];
            }
        }
    }
    connections() {
        if (this.recentLine.length == 0) {
            return [];
        }
        return JSON.parse(this.recentLine);
    }
}
class Individual {
    constructor(vector, verified, personality, clusterId) {
        this.inbox = [];
        this.connections = [];
        this.personality = personality || {
            openness: random(0, 1),
            conscientiousness: random(0, 1),
            extraversion: random(0, 1),
            agreeableness: random(0, 1),
            neuroticism: random(0, 1),
        };
        this.verified = verified !== null && verified !== void 0 ? verified : random() < 0.1;
        this.vector = vector;
        this.clusterId = clusterId !== null && clusterId !== void 0 ? clusterId : 0;
    }
    grow() {
        const unreadMessages = this.inbox.filter((message) => !message.read);
        for (let message of unreadMessages) {
            const response = this.post(message);
            this.connections.forEach((connection) => response.propagate(connection));
            const aggressiveImpact = (message.property.aggressive - this.personality.agreeableness) *
                0.1;
            const integrityImpact = (message.property.integrity -
                this.personality.conscientiousness) *
                0.1;
            const attractiveImpact = (message.property.attractive - this.personality.extraversion) *
                0.1;
            this.personality.neuroticism = Math.max(0, Math.min(1, this.personality.neuroticism + aggressiveImpact));
            this.personality.conscientiousness = Math.max(0, Math.min(1, this.personality.conscientiousness + integrityImpact));
            this.personality.extraversion = Math.max(0, Math.min(1, this.personality.extraversion + attractiveImpact));
            this.personality.openness += (Math.random() - 0.5) * 0.05;
            this.personality.agreeableness += (Math.random() - 0.5) * 0.05;
            for (let trait in this.personality) {
                this.personality[trait] =
                    Math.max(0, Math.min(1, this.personality[trait]));
            }
            message.read = true;
        }
    }
    post(originalMessage) {
        const property = {
            aggressive: this.calculateAggressiveness(originalMessage),
            integrity: this.calculateIntegrity(originalMessage),
            attractive: this.calculateAttractiveness(originalMessage),
        };
        const topic = originalMessage
            ? originalMessage.topic
            : '';
        return new Message(this, property, topic);
    }
    calculateAggressiveness(message) {
        let base = 1 - this.personality.agreeableness;
        if (message) {
            base = (base + message.property.aggressive) / 2;
        }
        return Math.min(1, Math.max(0, base + (Math.random() - 0.5) * 0.2));
    }
    calculateIntegrity(message) {
        let base = this.personality.conscientiousness;
        if (message) {
            base = (base + message.property.integrity) / 2;
        }
        return Math.min(1, Math.max(0, base + (Math.random() - 0.5) * 0.2));
    }
    calculateAttractiveness(message) {
        let base = this.personality.extraversion;
        if (message) {
            base = (base + message.property.attractive) / 2;
        }
        return Math.min(1, Math.max(0, base + (Math.random() - 0.5) * 0.2));
    }
}
const OpenAIKey = '';
class Message {
    constructor(sender, property, topic) {
        this.sender = sender;
        this.property = property;
        this.topic = topic;
    }
    propagate(receiver) {
        const flaggedMessage = {
            ...this,
            read: false,
        };
        receiver.inbox.push(flaggedMessage);
    }
}
class Pool {
    constructor(clusters) {
        this.points = [];
        this.clusters = {};
        this.clusters = clusters;
        this.initializeClusters();
    }
    initializeClusters() {
        for (const [clusterId, property] of Object.entries(this.clusters)) {
            const id = parseInt(clusterId);
            const clusterPoints = [];
            for (let i = 0; i < property.size; i++) {
                const theta = random(0, TWO_PI);
                const radius = random(0, 0.002 * property.size);
                const offset = createVector(radius * cos(theta), radius * sin(theta));
                const position = p5.Vector.add(property.center, offset);
                const newIndividual = new Individual(position, undefined, undefined, id);
                this.points.push(newIndividual);
                clusterPoints.push(newIndividual);
            }
            this.createInternalConnectionsByDistance(clusterPoints);
        }
    }
    async updateConnections() {
        const hardwareConnections = TSNDevice.getInstance().connections();
        console.log(hardwareConnections);
        this.points.forEach(point => {
            point.connections = point.connections.filter(conn => conn.clusterId === point.clusterId);
        });
        hardwareConnections.forEach((conn) => {
            const cluster1Id = conn[0];
            const cluster2Id = conn[1];
            if (this.clusters[cluster1Id] && this.clusters[cluster2Id]) {
                this.createRandomConnectionsBetweenClusters(cluster1Id, cluster2Id);
            }
        });
    }
    createInternalConnectionsByDistance(clusterPoints) {
        const maxConnections = 3;
        const connectionThreshold = 0.03 * min(screenX, screenY);
        for (let i = 0; i < clusterPoints.length; i++) {
            const point = clusterPoints[i];
            const distances = clusterPoints
                .map((p, index) => ({ index, distance: p5.Vector.dist(point.vector, p.vector) }))
                .filter(d => d.index !== i)
                .sort((a, b) => a.distance - b.distance);
            let connectionCount = 0;
            for (const { index, distance } of distances) {
                if (connectionCount >= maxConnections)
                    break;
                if (distance <= connectionThreshold) {
                    const otherPoint = clusterPoints[index];
                    if (!point.connections.includes(otherPoint)) {
                        this.updateIndividualConnections(point, otherPoint);
                        this.updateIndividualConnections(otherPoint, point);
                        connectionCount++;
                    }
                }
                else {
                    break;
                }
            }
        }
    }
    createRandomConnectionsBetweenClusters(cluster1Id, cluster2Id) {
        const points1 = this.points.filter(p => p.clusterId === cluster1Id);
        const points2 = this.points.filter(p => p.clusterId === cluster2Id);
        if (points1.length === 0 || points2.length === 0)
            return;
        const connectionCount = Math.floor(random(min(this.clusters[cluster1Id].size, this.clusters[cluster2Id].size), max(this.clusters[cluster1Id].size, this.clusters[cluster2Id].size)) * 0.6);
        for (let i = 0; i < connectionCount; i++) {
            const point1 = random(points1);
            const point2 = random(points2);
            this.updateIndividualConnections(point1, point2);
            this.updateIndividualConnections(point2, point1);
        }
    }
    updateIndividualConnections(individual, connection) {
        if (!individual.connections.includes(connection)) {
            individual.connections.push(connection);
        }
    }
    renderPool(ui) {
        this.updateClusterForces();
        for (const clusterId in this.clusters) {
            const cluster = this.clusters[clusterId];
            if (cluster.enabled) {
                noFill();
                stroke('rgba(100,100,100,0.2)');
                const screenX = cluster.center.x * width;
                const screenY = cluster.center.y * height;
                ellipse(screenX, screenY, 5 * cluster.size, 5 * cluster.size);
            }
        }
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            if (this.clusters[point.clusterId].enabled) {
                stroke('rgba(0,0,0,0)');
                fill(`rgba(${(point.clusterId * 50) % 255},${(point.clusterId * 100) % 255},${(point.clusterId * 150) % 255},0.8)`);
                const screenX = point.vector.x * width;
                const screenY = point.vector.y * height;
                ellipse(screenX, screenY, 10, 10);
                if (point.verified) {
                    UI.verifiedBadge(screenX + 12, screenY, 10);
                }
                this.drawConnections(point);
            }
        }
    }
    updateClusterForces() {
        const clusterAttractionStrength = 0.0000;
        const clusterRepulsionStrength = 0.0000;
        const connectionAttractionStrength = 0.00001;
        const clusterBoundaryForce = 0.00001;
        const clusterRadius = 0.5;
        for (const point of this.points) {
            const cluster = this.clusters[point.clusterId];
            if (cluster.enabled) {
                const toPoint = createVector(point.vector.x - cluster.center.x, point.vector.y - cluster.center.y);
                const distanceFromCenter = toPoint.mag();
                let attractionForce = toPoint.copy().mult(-1);
                if (distanceFromCenter > clusterRadius) {
                    attractionForce.setMag(clusterBoundaryForce * (distanceFromCenter - clusterRadius));
                }
                else {
                    attractionForce.setMag(clusterAttractionStrength);
                }
                point.vector.add(attractionForce);
                for (const otherId in this.clusters) {
                    const otherCluster = this.clusters[parseInt(otherId)];
                    if (parseInt(otherId) !== point.clusterId && otherCluster.enabled) {
                        const repulsionForce = createVector(point.vector.x - otherCluster.center.x, point.vector.y - otherCluster.center.y);
                        const distance = repulsionForce.mag();
                        repulsionForce.setMag((1 / (distance * distance)) * clusterRepulsionStrength);
                        point.vector.add(repulsionForce);
                    }
                }
                for (const connectedPoint of point.connections) {
                    const connectionForce = createVector(connectedPoint.vector.x - point.vector.x, connectedPoint.vector.y - point.vector.y);
                    connectionForce.setMag(connectionAttractionStrength);
                    point.vector.add(connectionForce);
                }
                point.vector.x += (random(-0.5, 0.5) * 0.0001);
                point.vector.y += (random(-0.5, 0.5) * 0.0001);
                const finalToPoint = createVector(point.vector.x - cluster.center.x, point.vector.y - cluster.center.y);
                if (finalToPoint.mag() > clusterRadius) {
                    finalToPoint.setMag(clusterRadius);
                    point.vector.x = cluster.center.x + finalToPoint.x;
                    point.vector.y = cluster.center.y + finalToPoint.y;
                }
                point.vector.x = constrain(point.vector.x, 0, 1);
                point.vector.y = constrain(point.vector.y, 0, 1);
            }
        }
    }
    drawConnections(point) {
        for (let i = 0; i < point.connections.length; i++) {
            const otherPoint = point.connections[i];
            const alpha = 0.5 - i * 0.1;
            stroke(`rgba(100,100,100,${alpha > 0 ? alpha : 0.1})`);
            line(point.vector.x * width, point.vector.y * height, otherPoint.vector.x * width, otherPoint.vector.y * height);
        }
    }
}
let numberOfShapesControl;
let ui;
let pool;
let clusterSizeTable;
let tick = 0;
let growthTicks = 180;
function setup() {
    console.log('🚀 - Setup initialized - P5 is running');
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
    };
    pool = new Pool(clusterSizeTable);
    createCanvas(windowWidth, windowHeight);
    noFill().frameRate(60);
    ui = new UI();
    ui.enableUpdate();
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function draw() {
    background(234);
    const functions = ui.buttons;
    if (tick === growthTicks) {
        pool.updateConnections();
        console.log("update");
        pool.points.forEach((point) => {
            point.grow();
        });
        tick = 0;
    }
    tick += 1;
    pool.renderPool(ui);
    ui.render();
}
//# sourceMappingURL=build.js.map