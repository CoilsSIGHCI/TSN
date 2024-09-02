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
        const topic = originalMessage ? originalMessage.topic : '';
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
        const senderX = this.sender.vector.x;
        const senderY = this.sender.vector.y;
        const receiverX = receiver.vector.x;
        const receiverY = receiver.vector.y;
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (ctx) {
            let progress = 0;
            const animationDuration = 1000;
            const startTime = performance.now();
            const animate = (currentTime) => {
                progress = (currentTime - startTime) / animationDuration;
                if (progress > 1)
                    progress = 1;
                const currentX = senderX + (receiverX - senderX) * progress;
                const currentY = senderY + (receiverY - senderY) * progress;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.arc(currentX, currentY, 10, 0, Math.PI * 2);
                ctx.fillStyle = 'blue';
                ctx.fill();
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    document.body.removeChild(canvas);
                }
            };
            requestAnimationFrame(animate);
        }
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
        const connectionThreshold = 0.03 * min(screenX, screenY);
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
                    AppUI.verifiedBadge(screenX + 12, screenY, 10);
                }
                this.drawConnections(point);
            }
        }
    }
    updateClusterForces() {
        const clusterAttractionStrength = 0.0001;
        const clusterRepulsionStrength = 0.000001;
        const individualRepulsionStrength = 0.0001;
        const individualDistanceThreshold = 0.05;
        const connectionAttractionStrength = 0.00001;
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
            enabled: true,
        },
        1: {
            size: 20,
            center: createVector(0.8, 0.3),
            enabled: true,
        },
        2: {
            size: 40,
            center: createVector(0.3, 0.8),
            enabled: true,
        },
        3: {
            size: 20,
            center: createVector(0.4, 0.2),
            enabled: true,
        },
        4: {
            size: 100,
            center: createVector(0.5, 0.5),
            enabled: true,
        },
    };
    pool = new Pool(clusterSizeTable);
    createCanvas(windowWidth, windowHeight);
    noFill().frameRate(60);
    ui = new UI();
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function draw() {
    background(234);
    if (tick === growthTicks) {
        pool.updateConnections();
        console.log('update');
        pool.points.forEach((point) => {
            point.grow();
        });
        tick = 0;
    }
    tick += 1;
    pool.renderPool(ui);
    ui.render();
}
class UI {
    constructor() {
        this.frame = [30, 30, 40, 60];
        this.clickDebounce = 0;
        this.panelStack = [];
        this.appUI = new AppUI([50, 50, 400, 300]);
        this.serialPrompt = new SerialPrompt([50, 50, 300, 200]);
        this.appUI.enableUpdate();
        this.panelStack.push(this.appUI, this.serialPrompt);
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
        this.drawToggleButton(this.appUI, 0);
        this.drawToggleButton(this.serialPrompt, 1);
        let stackOffset = createVector(0, 0);
        for (const panel of this.panelStack) {
            panel.render(stackOffset);
            stackOffset.y += panel.frame[3] + 10;
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
        drawingContext.shadowOffsetY = 2;
        drawingContext.shadowBlur = 4;
        drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
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
    constructor(frame) {
        super(frame);
        this.avatarColor = this.getRandomAvatarColor();
        this.avatarD = 70;
        this.avatarY = this.getOffsetFrame()[1] + this.avatarD / 2 + 30;
        this.visibilitySketchyLines = [];
        this.id = this.getRandomID();
        this.verified = false;
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
    render(panelOffset) {
        this.panelOffset = panelOffset;
        this.drawFrame();
        push();
        strokeWeight(0);
        this.drawAvatar();
        this.drawID();
        this.drawButtons();
        this.drawVisibilityButton();
        pop();
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