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
let hoveringIndividual = null;
class Individual {
    constructor(vector, verified, personality, clusterId) {
        this.inbox = [];
        this.connections = [];
        this.id = random(10000, 99999);
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
            this.post(message);
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
    wannaPost() {
        return random() < this.personality.extraversion;
    }
    wannaReply(message) {
        return random() < this.personality.extraversion * 2;
    }
    post(originalMessage) {
        var _a;
        const property = {
            aggressive: this.calculateAggressiveness(originalMessage),
            integrity: this.calculateIntegrity(originalMessage),
            attractive: this.calculateAttractiveness(originalMessage),
        };
        if (!originalMessage) {
            this.inbox = this.inbox.filter((message) => !message.read);
            if (this.inbox.length > 0) {
                for (let message of this.inbox) {
                    if (this.wannaReply(message))
                        this.post(message);
                }
            }
        }
        const randomConnection = this.connections[Math.floor(Math.random() * this.connections.length)];
        if (this.wannaPost() && randomConnection) {
            const message = new Message(this, property, (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.topic) !== null && _a !== void 0 ? _a : '');
            message.propagate(randomConnection);
        }
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
    describeFeeling() {
        const { openness, conscientiousness, extraversion, agreeableness, neuroticism, } = this.personality;
        let feeling = '';
        if (openness > 0.7)
            feeling += '🌟';
        if (conscientiousness > 0.7)
            feeling += '📊';
        if (extraversion > 0.7)
            feeling += '🎉';
        if (agreeableness > 0.7)
            feeling += '🤝';
        if (neuroticism > 0.7)
            feeling += '😰';
        const unreadCount = this.inbox.filter((msg) => !msg.read).length;
        if (unreadCount > 5)
            feeling += '📨';
        if (unreadCount > 10)
            feeling += '🔔';
        if (extraversion > 0.5 && unreadCount > 0)
            feeling += '😊';
        else if (neuroticism > 0.5 && unreadCount > 5)
            feeling += '😓';
        else if (openness > 0.5 && unreadCount === 0)
            feeling += '🤔';
        else if (conscientiousness > 0.5 && unreadCount > 0)
            feeling += '🧐';
        else if (agreeableness > 0.5)
            feeling += '😌';
        else
            feeling += '😐';
        return feeling;
    }
}
const OpenAIKey = '';
const animatingMessages = [];
class Message {
    constructor(sender, property, topic) {
        this.animationProgress = 0;
        this.animationDelay = random(0, 200);
        this.receiver = null;
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
        this.receiver = receiver;
        this.animationProgress = 0;
        animatingMessages.push(this);
    }
    update() {
        if (this.animationDelay > 0) {
            this.animationDelay -= 1;
            return;
        }
        if (this.animationProgress < 1) {
            this.animationProgress += 0.02;
            if (this.animationProgress >= 1) {
                this.animationProgress = 1;
                const index = animatingMessages.indexOf(this);
                if (index > -1) {
                    animatingMessages.splice(index, 1);
                }
            }
        }
    }
    draw() {
        if (this.animationDelay > 0) {
            return;
        }
        if (this.animationProgress < 1) {
            const senderX = this.sender.vector.x * width;
            const senderY = this.sender.vector.y * height;
            const receiverX = this.receiver.vector.x * width;
            const receiverY = this.receiver.vector.y * height;
            const totalDistance = dist(senderX, senderY, receiverX, receiverY);
            const currentDistance = totalDistance * this.animationProgress;
            const roundedDistance = round(currentDistance);
            const actualProgress = roundedDistance / totalDistance;
            const currentX = lerp(senderX, receiverX, actualProgress);
            const currentY = lerp(senderY, receiverY, actualProgress);
            push();
            const color = Message.getMessageColor(this.property);
            blendMode(HARD_LIGHT);
            fill(color);
            noStroke();
            const angle = atan2(receiverY - senderY, receiverX - senderX);
            translate(currentX, currentY);
            rotate(angle);
            ellipse(0, 0, 20, abs(this.animationProgress - 0.5) * 20);
            pop();
        }
    }
    static getMessageColor(property) {
        const { aggressive, integrity, attractive } = property;
        const r = 1 - aggressive;
        const g = 1 - integrity;
        const b = 1 - attractive;
        return color(r * 255, g * 255, b * 255, 200);
    }
}
function updateAndDrawAnimatingMessages() {
    for (const message of animatingMessages) {
        message.update();
        message.draw();
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
        this.points.forEach((point) => {
            point.connections = point.connections.filter((conn) => conn.clusterId === point.clusterId);
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
        const connectionThreshold = 0.1;
        for (let i = 0; i < clusterPoints.length; i++) {
            const point = clusterPoints[i];
            const distances = clusterPoints
                .map((p, index) => ({
                index,
                distance: p5.Vector.dist(point.vector, p.vector),
            }))
                .filter((d) => d.index !== i)
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
        const points1 = this.points.filter((p) => p.clusterId === cluster1Id);
        const points2 = this.points.filter((p) => p.clusterId === cluster2Id);
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
    updateClusterForces() {
        const clusterAttractionStrength = 0.0001;
        const clusterRepulsionStrength = 0.000001;
        const individualRepulsionStrength = 0.0002;
        const individualDistanceThreshold = 0.05;
        const connectionAttractionStrength = 0.00005;
        const clusterBoundaryForce = 0.00001;
        const clusterRadius = 0.5;
        for (const point of this.points) {
            const cluster = this.clusters[point.clusterId];
            if (cluster.enabled) {
                const toPoint = createVector(point.vector.x - cluster.center.x, point.vector.y - cluster.center.y);
                const distanceFromCenter = toPoint.mag();
                let attractionForce = toPoint.copy().mult(-1);
                if (distanceFromCenter > 0.2) {
                    attractionForce.setMag(clusterBoundaryForce *
                        (distanceFromCenter - clusterRadius));
                }
                else {
                    attractionForce.setMag(clusterAttractionStrength);
                }
                point.vector.add(attractionForce);
                for (const otherId in this.clusters) {
                    const otherCluster = this.clusters[parseInt(otherId)];
                    if (parseInt(otherId) !== point.clusterId &&
                        otherCluster.enabled) {
                        const repulsionForce = createVector(point.vector.x - otherCluster.center.x, point.vector.y - otherCluster.center.y);
                        const distance = repulsionForce.mag();
                        repulsionForce.setMag((1 / (distance * distance)) *
                            clusterRepulsionStrength);
                        point.vector.add(repulsionForce);
                    }
                }
                for (const connectedPoint of point.connections) {
                    const connectionForce = createVector(connectedPoint.vector.x - point.vector.x, connectedPoint.vector.y - point.vector.y);
                    connectionForce.setMag(connectionAttractionStrength);
                    point.vector.add(connectionForce);
                }
                for (const otherPoint of this.points) {
                    if (otherPoint !== point &&
                        p5.Vector.dist(point.vector, otherPoint.vector) <
                            individualDistanceThreshold) {
                        const strongRepulsionForce = createVector(point.vector.x - otherPoint.vector.x, point.vector.y - otherPoint.vector.y);
                        strongRepulsionForce.setMag(individualRepulsionStrength);
                        point.vector.add(strongRepulsionForce);
                    }
                }
                point.vector.x += random(-0.5, 0.5) * 0.0001;
                point.vector.y += random(-0.5, 0.5) * 0.0001;
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
        push();
        for (let i = 0; i < point.connections.length; i++) {
            const otherPoint = point.connections[i];
            const alpha = 0.5 - i * 0.1;
            strokeWeight(0.5);
            stroke(`rgba(100,100,100,${alpha > 0 ? alpha : 0.1})`);
            const mid1X = point.vector.x + (otherPoint.vector.x - point.vector.x) / 3;
            const mid1Y = point.vector.y + (otherPoint.vector.y - point.vector.y) / 3;
            const mid2X = point.vector.x +
                ((otherPoint.vector.x - point.vector.x) / 3) * 2;
            const mid2Y = point.vector.y +
                ((otherPoint.vector.y - point.vector.y) / 3) * 2;
            const offset1X = (2 - parseInt(otherPoint.vector.y.toString(5).charAt(4))) / 20;
            const offset1Y = (2 - parseInt(otherPoint.vector.x.toString(5).charAt(3))) / 20;
            const offset2X = (2 - parseInt(otherPoint.vector.y.toString(5).charAt(3))) / 20;
            const offset2Y = (2 - parseInt(otherPoint.vector.x.toString(5).charAt(4))) / 20;
            noFill();
            curve((mid1X + offset1X) * width, (mid1Y + offset1Y) * height, point.vector.x * width, point.vector.y * height, otherPoint.vector.x * width, otherPoint.vector.y * height, (mid2X + offset2X) * width, (mid2Y + offset2Y) * height);
        }
        pop();
    }
    renderPool() {
        this.updateClusterForces();
        let temporaryHoverObject = null;
        push();
        for (const clusterId in this.clusters) {
            const cluster = this.clusters[clusterId];
            if (cluster.enabled) {
                noFill();
                strokeWeight(0.5);
                stroke('rgba(100,100,100,0.2)');
                const screenX = cluster.center.x * width;
                const screenY = cluster.center.y * height;
                ellipse(screenX, screenY, 5 * cluster.size, 5 * cluster.size);
                textSize(72);
                textFont('monospace');
                textStyle(BOLD);
                textAlign(CENTER, CENTER);
                fill(0, 0, 0, 30);
                text(clusterId, screenX, screenY + 2.5 * cluster.size);
            }
        }
        pop();
        push();
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            if (this.clusters[point.clusterId].enabled) {
                stroke('rgba(0,0,0,0)');
                fill(`rgba(${(point.clusterId * 50) % 255},${(point.clusterId * 100) % 255},${(point.clusterId * 150) % 255},0.8)`);
                const screenX = point.vector.x * width;
                const screenY = point.vector.y * height;
                const distanceToCenter = p5.Vector.dist(point.vector, this.clusters[point.clusterId].center);
                const individualSize = 200 * max(0.05, 0.1 - distanceToCenter);
                ellipse(screenX, screenY, individualSize);
                if (dist(mouseX, mouseY, screenX, screenY) <
                    individualSize / 2) {
                    temporaryHoverObject = point;
                }
                if (point.verified) {
                    AppUI.verifiedBadge(screenX + 12, screenY, 10);
                }
                this.drawConnections(point);
            }
        }
        pop();
        if (!temporaryHoverObject) {
            hoveringIndividual = null;
        }
        else {
            hoveringIndividual = temporaryHoverObject;
        }
    }
}
let numberOfShapesControl;
let ui;
let pool;
let clusterSizeTable;
let tick = 0;
let growthTicks = 24;
function setup() {
    console.log('🚀 - Setup initialized - P5 is running');
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
    };
    pool = new Pool(clusterSizeTable);
    createCanvas(windowWidth, windowHeight);
    noFill().frameRate(60);
    ui = new UI();
    textFont('monospace');
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function draw() {
    background(234);
    updateAndDrawAnimatingMessages();
    if (tick === growthTicks) {
        pool.updateConnections();
        console.log('update');
        pool.points.forEach((point) => {
            point.grow();
            point.post();
        });
        tick = 0;
    }
    tick += 1;
    pool.renderPool();
    ui.render();
}
class UI {
    constructor() {
        this.frame = [30, 30, 40, 60];
        this.clickDebounce = 0;
        this.appUIBuffer = null;
        this.panelStack = [];
        this.serialPrompt = new SerialPrompt([50, 50, 300, 200]);
        this.legend = new Legend([50, 50, 300, 260]);
        this.panelStack.push(this.serialPrompt, this.legend);
    }
    drawToggleButton(target, index) {
        var _a;
        const buttonSize = 30;
        const buttonX = this.frame[0] + this.frame[2] - buttonSize - 30;
        const buttonY = this.frame[1] + 30 + index * (buttonSize + 10);
        if (this.panelStack.includes(target)) {
            fill(200);
        }
        else {
            fill(255);
        }
        stroke(0);
        rect(buttonX, buttonY, buttonSize, buttonSize, 10);
        fill(0);
        textAlign(CENTER, CENTER);
        text((_a = target.description[0].toUpperCase()) !== null && _a !== void 0 ? _a : index.toString(), buttonX + buttonSize / 2, buttonY + buttonSize / 2);
        if (mouseIsPressed &&
            mouseX > buttonX &&
            mouseX < buttonX + buttonSize &&
            mouseY > buttonY &&
            mouseY < buttonY + buttonSize) {
            if (this.clickDebounce === 0) {
                this.clickDebounce = 1;
                if (this.panelStack.includes(target)) {
                    const index = this.panelStack.indexOf(target);
                    this.panelStack.splice(index, 1);
                }
                else {
                    this.panelStack.push(target);
                }
                setTimeout(() => {
                    this.clickDebounce = 0;
                }, 500);
            }
        }
    }
    drawFrame() {
        fill(255);
        rect(...this.frame, 10);
    }
    render() {
        this.drawToggleButton(this.serialPrompt, 0);
        this.drawToggleButton(this.legend, 1);
        let stackOffset = createVector(0, 0);
        for (const panel of this.panelStack) {
            panel.render(stackOffset);
            stackOffset.y += panel.frame[3] + 10;
        }
        if (hoveringIndividual) {
            if (this.appUIBuffer === null || hoveringIndividual.id !== this.appUIBuffer.individual.id) {
                this.appUIBuffer = new AppUI([50, 50, 400, 300], hoveringIndividual);
            }
            this.appUIBuffer.render(stackOffset);
        }
        else {
            this.appUIBuffer = null;
        }
    }
}
class UIPanel {
    constructor(frame) {
        this.description = '';
        this.frame = frame;
        this.panelOffset = createVector(0, 0);
        this.clickDebounce = 0;
    }
    drawFrame() {
        push();
        strokeWeight(0);
        fill(255);
        const newFrame = [
            this.frame[0] + this.panelOffset.x,
            this.frame[1] + this.panelOffset.y,
            this.frame[2],
            this.frame[3],
        ];
        rect(...newFrame, 10);
        pop();
    }
    getOffsetFrame() {
        return [
            this.frame[0] + this.panelOffset.x,
            this.frame[1] + this.panelOffset.y,
            this.frame[2],
            this.frame[3],
        ];
    }
    render(panelOffset) {
        this.panelOffset = panelOffset;
        this.drawFrame();
    }
}
class AppUI extends UIPanel {
    constructor(frame, individual) {
        super(frame);
        this.avatarColor = this.getRandomAvatarColor();
        this.avatarD = 70;
        this.avatarY = this.getOffsetFrame()[1] + this.avatarD / 2 + 30;
        this.visibilitySketchyLines = [];
        this.id = this.getRandomID();
        this.verified = false;
        this.animatingMessages = [];
        this.individual = individual;
        this.description = 'App UI';
        this.buttons = [
            {
                name: 'LIKE',
                onClick: () => {
                    console.log('Button 1 clicked');
                },
            },
            {
                name: 'FWD',
                onClick: () => {
                    console.log('Button 2 clicked');
                },
            },
            {
                name: 'COM',
                onClick: () => {
                    console.log('Button 3 clicked');
                },
            },
            {
                name: 'SCAM',
                onClick: () => {
                    console.log('Button 4 clicked');
                },
            },
        ];
    }
    getRandomAvatarColor() {
        const hue = Math.floor(random(0, 360));
        const saturation = Math.floor(random(30, 66));
        const lightness = Math.floor(random(50, 76));
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    getRandomID() {
        return Math.floor(random(60, 120));
    }
    enableUpdate() {
        setInterval(() => {
            this.avatarColor = this.getRandomAvatarColor();
            this.id = this.getRandomID();
            this.verified = random() < 0.1;
        }, 3000);
    }
    drawAvatar() {
        fill(this.avatarColor);
        ellipse(this.getOffsetFrame()[0] + this.avatarD / 2 + 40, this.getOffsetFrame()[1] + this.avatarD / 2 + 40, this.avatarD);
    }
    static verifiedBadge(x, y, size = 20) {
        stroke('rgba(0,0,0,0)');
        fill('rgb(23,176,198)');
        ellipse(x, y, size);
        fill(255);
        ellipse(x, y, (size * 7) / 20);
    }
    drawID() {
        const idX = this.getOffsetFrame()[0] + 60 + this.avatarD;
        const idY = this.getOffsetFrame()[1] + 50;
        fill(180);
        textSize(18);
        textAlign(LEFT, CENTER);
        text('@', idX, idY + 35);
        rect(idX + 19, idY + 22, this.id * 0.7, 24, 7);
        fill(121);
        rect(idX, idY - 15, this.id, 30, 7);
        if (this.verified) {
            AppUI.verifiedBadge(idX + this.id + 17, idY);
        }
    }
    drawButtonSketchyOutlines(lines, buttonX, buttonY, buttonWidth, buttonHeight, sketchyLines = 2, overshoot = 3, dithering = 2) {
        if (lines.length === 0) {
            for (let j = 0; j < sketchyLines; j++) {
                const startX = buttonX + random(-dithering, dithering);
                const startY = buttonY + random(-dithering, dithering) - overshoot;
                const endX = buttonX + random(-dithering, dithering);
                const endY = buttonY +
                    buttonHeight +
                    random(-dithering, dithering) +
                    overshoot;
                lines.push([startX, startY, endX, endY, random(89, 130)]);
            }
            for (let j = 0; j < sketchyLines; j++) {
                const startX = buttonX + buttonWidth + random(-dithering, dithering);
                const startY = buttonY + random(-dithering, dithering) - overshoot;
                const endX = buttonX + buttonWidth + random(-dithering, dithering);
                const endY = buttonY +
                    buttonHeight +
                    random(-dithering, dithering) +
                    overshoot;
                lines.push([startX, startY, endX, endY, random(89, 130)]);
            }
            for (let j = 0; j < sketchyLines; j++) {
                const startX = buttonX + random(-dithering, dithering) - overshoot;
                const startY = buttonY + buttonHeight + random(-dithering, dithering);
                const endX = buttonX +
                    buttonWidth +
                    random(-dithering, dithering) +
                    overshoot;
                const endY = buttonY + buttonHeight + random(-dithering, dithering);
                lines.push([startX, startY, endX, endY, random(89, 130)]);
            }
            for (let j = 0; j < sketchyLines; j++) {
                const startX = buttonX + random(-dithering, dithering) - overshoot;
                const startY = buttonY + random(-dithering, dithering);
                const endX = buttonX +
                    buttonWidth +
                    random(-dithering, dithering) +
                    overshoot;
                const endY = buttonY + random(-dithering, dithering);
                lines.push([startX, startY, endX, endY, random(89, 130)]);
            }
        }
        push();
        for (let j = 0; j < lines.length; j++) {
            const l = lines[j];
            stroke(l[4]);
            line(...l.slice(undefined, 4));
        }
        pop();
    }
    drawButtons() {
        const buttonWidth = 60;
        const buttonHeight = 40;
        const buttonPadding = 20;
        for (let i = 0; i < this.buttons.length; i++) {
            const buttonX = this.getOffsetFrame()[0] +
                i * buttonWidth +
                50 +
                i * buttonPadding;
            const buttonY = this.getOffsetFrame()[1] +
                this.getOffsetFrame()[3] -
                buttonHeight -
                30;
            fill('rgba(0,0,0,0)');
            rect(buttonX, buttonY, buttonWidth, buttonHeight);
            stroke(0);
            strokeWeight(1);
            this.buttons[i].lines = [];
            this.drawButtonSketchyOutlines(this.buttons[i].lines, buttonX, buttonY, buttonWidth, buttonHeight);
            fill(0);
            textAlign(CENTER, CENTER);
            text(this.buttons[i].name, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
            if (mouseIsPressed &&
                mouseX > buttonX &&
                mouseX < buttonX + buttonWidth &&
                mouseY > buttonY &&
                mouseY < buttonY + buttonHeight) {
                if (this.clickDebounce === 0) {
                    this.clickDebounce = 1;
                    this.buttons[i].onClick();
                    setTimeout(() => {
                        this.clickDebounce = 0;
                    }, 500);
                }
            }
        }
    }
    drawVisibilityButton() {
        const buttonSize = 40;
        const buttonX = this.getOffsetFrame()[0] +
            this.getOffsetFrame()[2] -
            buttonSize -
            30;
        const buttonY = this.getOffsetFrame()[1] + 30;
        fill(255);
        stroke(0);
        this.visibilitySketchyLines = [];
        this.drawButtonSketchyOutlines(this.visibilitySketchyLines, buttonX, buttonY, buttonSize, buttonSize);
        fill(0);
        textAlign(CENTER, CENTER);
        text('👁️', buttonX + buttonSize / 2, buttonY + buttonSize / 2);
    }
    animatePropagation(senderX, senderY, receiverX, receiverY) {
        let t = 0;
        const interval = setInterval(() => {
            t += 0.02;
            if (t > 1) {
                clearInterval(interval);
                return;
            }
            const x = lerp(senderX, receiverX, t);
            const y = lerp(senderY, receiverY, t);
            fill(255, 0, 0);
            ellipse(x, y, 10);
        }, 30);
    }
    updateAnimations() {
        for (let i = this.animatingMessages.length - 1; i >= 0; i--) {
            const anim = this.animatingMessages[i];
            anim.message.animationProgress += 0.02;
            if (anim.message.animationProgress >= 1) {
                this.animatingMessages.splice(i, 1);
            }
        }
    }
    drawAnimations() {
        for (const anim of this.animatingMessages) {
            const { message, receiver } = anim;
            const progress = message.animationProgress;
            const senderX = message.sender.vector.x;
            const senderY = message.sender.vector.y;
            const receiverX = receiver.vector.x;
            const receiverY = receiver.vector.y;
            const currentX = lerp(senderX, receiverX, progress);
            const currentY = lerp(senderY, receiverY, progress);
            fill(255, 0, 0);
            noStroke();
            ellipse(currentX, currentY, 10);
        }
    }
    drawFeelings() {
        const feelings = this.individual.describeFeeling();
        const feelingsX = this.getOffsetFrame()[0] + 60;
        const feelingsY = this.getOffsetFrame()[1] + 160;
        fill(0);
        textSize(24);
        textAlign(LEFT, CENTER);
        text(feelings, feelingsX, feelingsY);
    }
    render(panelOffset) {
        this.panelOffset = panelOffset;
        this.drawFrame();
        push();
        strokeWeight(0);
        this.drawAvatar();
        this.drawID();
        this.drawFeelings();
        this.drawButtons();
        this.drawVisibilityButton();
        this.updateAnimations();
        this.drawAnimations();
        pop();
    }
}
class Legend extends UIPanel {
    constructor(frame) {
        super(frame);
        this.description = 'Legends';
    }
    drawLegend() {
        push();
        fill(255);
        strokeWeight(0);
        rect(...this.getOffsetFrame(), 10);
        fill(0);
        textAlign(LEFT, TOP);
        textSize(20);
        text(this.description, this.getOffsetFrame()[0] + 30, this.getOffsetFrame()[1] + 30);
        this.drawGradient(Message.getMessageColor({
            aggressive: 0,
            integrity: 0,
            attractive: 0,
        }), Message.getMessageColor({
            aggressive: 1,
            integrity: 0,
            attractive: 0,
        }), this.getOffsetFrame()[1] + 70);
        this.drawAverageLine('aggressive', this.getOffsetFrame()[1] + 70);
        this.drawLegendText('Aggressive', this.getOffsetFrame()[1] + 100);
        this.drawGradient(Message.getMessageColor({
            aggressive: 0,
            integrity: 0,
            attractive: 0,
        }), Message.getMessageColor({
            aggressive: 0,
            integrity: 1,
            attractive: 0,
        }), this.getOffsetFrame()[1] + 130);
        this.drawAverageLine('integrity', this.getOffsetFrame()[1] + 130);
        this.drawLegendText('Integrity', this.getOffsetFrame()[1] + 160);
        this.drawGradient(Message.getMessageColor({
            aggressive: 0,
            integrity: 0,
            attractive: 0,
        }), Message.getMessageColor({
            aggressive: 0,
            integrity: 0,
            attractive: 1,
        }), this.getOffsetFrame()[1] + 190);
        this.drawAverageLine('attractive', this.getOffsetFrame()[1] + 190);
        this.drawLegendText('Attractive', this.getOffsetFrame()[1] + 220);
        pop();
    }
    drawGradient(startColour, endColour, y) {
        for (let x = this.getOffsetFrame()[0]; x < this.getOffsetFrame()[0] + this.getOffsetFrame()[2]; x += 1) {
            const colour = color(lerpColor(startColour, endColour, x / (this.getOffsetFrame()[0] + this.getOffsetFrame()[2])));
            fill(colour);
            rect(x, y, 1, 20);
        }
    }
    drawLegendText(type, y) {
        fill(0);
        textAlign(RIGHT, TOP);
        textSize(14);
        text(type, this.getOffsetFrame()[0] + this.getOffsetFrame()[2] - 10, y);
    }
    drawAverageLine(type, y) {
        push();
        const average = animatingMessages.reduce((acc, curr) => {
            return acc + curr.property[type];
        }, 0) / animatingMessages.length;
        const x = this.getOffsetFrame()[0] + this.getOffsetFrame()[2] * average;
        strokeWeight(2);
        stroke(0);
        fill(255);
        rect(x, y, 10, 20, 5, 5, 5, 5);
        pop();
    }
    render(panelOffset) {
        this.panelOffset = panelOffset;
        this.drawFrame();
        this.drawLegend();
    }
}
class SerialPrompt extends UIPanel {
    constructor(frame) {
        super(frame);
        this.description = 'Serial Prompt';
    }
    drawSerialPrompt() {
        const device = TSNDevice.getInstance();
        push();
        fill(255);
        strokeWeight(0);
        rect(...this.getOffsetFrame(), 10);
        fill(0);
        textAlign(LEFT, TOP);
        textSize(20);
        text('TSN Device', this.getOffsetFrame()[0] + 30, this.getOffsetFrame()[1] + 30);
        fill(80);
        rect(this.getOffsetFrame()[0] + this.getOffsetFrame()[2] - 130, this.getOffsetFrame()[1] + this.getOffsetFrame()[3] - 70, 100, 40, 20);
        fill(255);
        textAlign(CENTER, CENTER);
        text('Connect', this.getOffsetFrame()[0] + this.getOffsetFrame()[2] - 80, this.getOffsetFrame()[1] + this.getOffsetFrame()[3] - 50);
        if (mouseIsPressed &&
            mouseX >
                this.getOffsetFrame()[0] + this.getOffsetFrame()[2] - 130 &&
            mouseX < this.getOffsetFrame()[0] + this.getOffsetFrame()[2] - 30 &&
            mouseY > this.getOffsetFrame()[1] + this.getOffsetFrame()[3] - 70 &&
            mouseY < this.getOffsetFrame()[1] + this.getOffsetFrame()[3] - 30) {
            if (this.clickDebounce === 0) {
                this.clickDebounce = 1;
                device.connect().then(() => {
                    this.clickDebounce = 0;
                    device.read();
                });
                console.log('Connecting to serial device');
            }
        }
        device.connections().map((connection, index) => {
            fill(210);
            rect(this.getOffsetFrame()[0] + 40, this.getOffsetFrame()[1] + 37 + 30 * (index + 1), 100, 26, 13);
            fill(0);
            textAlign(LEFT, CENTER);
            text(connection[0], this.getOffsetFrame()[0] + 50, this.getOffsetFrame()[1] + 50 + 30 * (index + 1));
            text(connection[1], this.getOffsetFrame()[0] + 100, this.getOffsetFrame()[1] + 50 + 30 * (index + 1));
        });
        pop();
    }
    render(panelOffset) {
        this.panelOffset = panelOffset;
        this.drawFrame();
        this.drawSerialPrompt();
    }
}
//# sourceMappingURL=build.js.map