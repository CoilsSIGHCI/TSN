class UI {
    constructor() {
        this.frame = [30, 30, 400, 300];
        this.serialPromptFrame = [30, 400, 400, 200];
        this.avatarColor = this.getRandomAvatarColor();
        this.avatarD = 70;
        this.avatarX = this.frame[0] + this.avatarD / 2 + 40;
        this.avatarY = this.frame[1] + this.avatarD / 2 + 30;
        this.visibilitySketchyLines = [];
        this.id = this.getRandomID();
        this.verified = false;
        this.clickDebounce = 0;
        this.clickDebounceLock = 0;
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
    isPointInside(x, y) {
        return (x > this.frame[0] &&
            x < this.frame[0] + this.frame[2] &&
            y > this.frame[1] &&
            y < this.frame[1] + this.frame[3]);
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
    drawFrame() {
        fill(255);
        rect(...this.frame, 10);
    }
    drawAvatar() {
        fill(this.avatarColor);
        ellipse(this.avatarX, this.avatarY, this.avatarD);
    }
    static verifiedBadge(x, y, size = 20) {
        stroke('rgba(0,0,0,0)');
        fill('rgb(23,176,198)');
        ellipse(x, y, size);
        fill(255);
        ellipse(x, y, (size * 7) / 20);
    }
    drawID() {
        const idX = this.frame[0] + 60 + this.avatarD;
        const idY = this.frame[1] + 50;
        fill(180);
        textSize(18);
        textAlign(LEFT, CENTER);
        text('@', idX, idY + 35);
        rect(idX + 19, idY + 22, this.id * 0.7, 24, 7);
        fill(121);
        rect(idX, idY - 15, this.id, 30, 7);
        if (this.verified) {
            UI.verifiedBadge(idX + this.id + 17, idY);
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
            const buttonX = this.frame[0] + i * buttonWidth + 50 + i * buttonPadding;
            const buttonY = this.frame[1] + this.frame[3] - buttonHeight - 30;
            fill('rgba(0,0,0,0)');
            rect(buttonX, buttonY, buttonWidth, buttonHeight);
            stroke(0);
            strokeWeight(1);
            if (this.buttons[i].lines === undefined) {
                this.buttons[i].lines = [];
            }
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
                }
                setTimeout(() => {
                    this.clickDebounce = 0;
                }, 500);
            }
        }
    }
    drawVisibilityButton() {
        const buttonSize = 40;
        const buttonX = this.frame[0] + this.frame[2] - buttonSize - 30;
        const buttonY = this.frame[1] + 30;
        fill(255);
        stroke(0);
        this.drawButtonSketchyOutlines(this.visibilitySketchyLines, buttonX, buttonY, buttonSize, buttonSize);
        fill(0);
        textAlign(CENTER, CENTER);
        text('👁️', buttonX + buttonSize / 2, buttonY + buttonSize / 2);
        if (mouseIsPressed &&
            mouseX > buttonX &&
            mouseX < buttonX + buttonSize &&
            mouseY > buttonY &&
            mouseY < buttonY + buttonSize) {
            this.toggleVisibility();
        }
    }
    toggleVisibility() {
        return;
    }
    drawSerialPrompt() {
        push();
        fill(255);
        strokeWeight(0);
        rect(...this.serialPromptFrame, 10);
        fill(0);
        textAlign(LEFT, TOP);
        textSize(20);
        text('TSN Device', this.serialPromptFrame[0] + 30, this.serialPromptFrame[1] + 30);
        fill(80);
        rect(this.serialPromptFrame[0] + this.serialPromptFrame[2] - 130, this.serialPromptFrame[1] + this.serialPromptFrame[3] - 70, 100, 40, 20);
        fill(255);
        textAlign(CENTER, CENTER);
        text('Connect', this.serialPromptFrame[0] + this.serialPromptFrame[2] - 80, this.serialPromptFrame[1] + this.serialPromptFrame[3] - 50);
        if (mouseIsPressed &&
            mouseX >
                this.serialPromptFrame[0] + this.serialPromptFrame[2] - 130 &&
            mouseX <
                this.serialPromptFrame[0] + this.serialPromptFrame[2] - 30 &&
            mouseY >
                this.serialPromptFrame[1] + this.serialPromptFrame[3] - 70 &&
            mouseY < this.serialPromptFrame[1] + this.serialPromptFrame[3] - 30) {
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
            rect(this.serialPromptFrame[0] + 40, this.serialPromptFrame[1] + 37 + 30 * (index + 1), 100, 26, 13);
            fill(0);
            textAlign(LEFT, CENTER);
            text(connection[0], this.serialPromptFrame[0] + 50, this.serialPromptFrame[1] + 50 + 30 * (index + 1));
            text(connection[1], this.serialPromptFrame[0] + 100, this.serialPromptFrame[1] + 50 + 30 * (index + 1));
        });
        pop();
    }
    render() {
        this.drawFrame();
        this.drawAvatar();
        this.drawID();
        this.drawButtons();
        this.drawVisibilityButton();
        this.drawSerialPrompt();
    }
}
class Campaign {
    constructor() {
    }
}
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class TSNDevice {
    constructor() {
        this.recentLine = "";
        this.port = null;
        this.outputStream = null;
        this.inputStream = null;
        this.reader = null;
        this.inputDone = null;
        this.outputDone = null;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.port = yield navigator.serial.requestPort();
            yield this.port.open({ baudRate: 115200 });
            const textEncoder = new TextEncoderStream();
            this.outputDone = textEncoder.readable.pipeTo(this.port.writable);
            this.outputStream = textEncoder.writable;
            const textDecoder = new TextDecoderStream();
            this.inputDone = this.port.readable.pipeTo(textDecoder.writable);
            this.inputStream = textDecoder.readable;
            this.reader = this.inputStream.getReader();
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.reader) {
                return;
            }
            let lineBuffer = "";
            while (true) {
                const { value, done } = yield this.reader.read();
                if (done) {
                    break;
                }
                lineBuffer += value;
                let lines = lineBuffer.split("\n");
                if (lines.length > 1) {
                    this.recentLine = lines[0];
                    lineBuffer = lines[1];
                }
            }
        });
    }
    connections() {
        if (this.recentLine.length == 0) {
            return [];
        }
        return JSON.parse(this.recentLine);
    }
}
class Individual {
    constructor(vector, verified, personality) {
        this.personality = personality || {
            openness: random(0, 1),
            conscientiousness: random(0, 1),
            extraversion: random(0, 1),
            agreeableness: random(0, 1),
            neuroticism: random(0, 1),
        };
        this.verified = random() < 0.1;
        this.vector = vector;
    }
}
class Message {
    constructor() {
    }
}
function renderPool(points) {
    for (let i = 0; i < points.length; i++) {
        if (!ui.isPointInside(points[i].vector.x, points[i].vector.y)) {
            break;
        }
        if (points[i].vector.x < ui.frame[0]) {
            points[i].vector.x += 2;
        }
        else if (points[i].vector.x > ui.frame[0] + ui.frame[2]) {
            points[i].vector.x -= 2;
        }
        if (points[i].vector.y < ui.frame[1]) {
            points[i].vector.y += 2;
        }
        else if (points[i].vector.y > ui.frame[1] + ui.frame[3]) {
            points[i].vector.y -= 2;
        }
    }
    for (let i = 0; i < points.length; i++) {
        if (points[i].vector.x < 0) {
            points[i].vector.x += 2;
        }
        else if (points[i].vector.x > width) {
            points[i].vector.x -= 2;
        }
        if (points[i].vector.y < 0) {
            points[i].vector.y += 2;
        }
        else if (points[i].vector.y > height) {
            points[i].vector.y -= 2;
        }
    }
    for (let i = 0; i < points.length; i++) {
        points[i].vector.x += random(-0.5, 0.5);
        points[i].vector.y += random(-0.5, 0.5);
    }
    for (let i = 0; i < points.length; i++) {
        stroke('rgba(0,0,0,0)');
        fill('rgba(0,0,0,0.8)');
        ellipse(points[i].vector.x, points[i].vector.y, 10, 10);
        if (points[i].verified) {
            UI.verifiedBadge(points[i].vector.x + 12, points[i].vector.y, 10);
        }
    }
    function distance(point1, point2) {
        return Math.sqrt(Math.pow(point1.vector.x - point2.vector.x, 2) +
            Math.pow(point1.vector.y - point2.vector.y, 2));
    }
    let lines = [];
    for (let i = 0; i < points.length; i++) {
        let distances = [];
        for (let j = 0; j < points.length; j++) {
            if (points[j].verified && points[i].verified) {
                continue;
            }
            if (i != j) {
                distances.push({
                    index: j,
                    distance: distance(points[i], points[j]),
                });
            }
        }
        distances.sort((a, b) => a.distance - b.distance);
        let x = points[i].personality.extraversion * 20;
        if (points[i].verified) {
            x *= 3;
        }
        for (let j = 0; j < x && j < distances.length; j++) {
            let point = points[distances[j].index];
            if (dist(mouseX, mouseY, points[i].vector.x, points[i].vector.y) <
                15 ||
                dist(mouseX, mouseY, point.vector.x, point.vector.y) < 15) {
                fill('red');
                ellipse(points[i].vector.x, points[i].vector.y, 10, 10);
                stroke('red');
            }
            else {
                strokeWeight(1);
                stroke('rgba(50,50,50,0.1)');
            }
            push();
            let lineKey = `${i}-${distances[j].index}`;
            let reverseLineKey = `${distances[j].index}-${i}`;
            if (!points[i].verified &&
                (lines.indexOf(lineKey) !== -1 ||
                    lines.indexOf(reverseLineKey) !== -1)) {
                strokeWeight(2);
                stroke('rgba(0, 0, 0, .2)');
            }
            else {
                lines.push(lineKey);
            }
            line(points[i].vector.x, points[i].vector.y, point.vector.x, point.vector.y);
            pop();
        }
        if (dist(mouseX, mouseY, points[i].vector.x, points[i].vector.y) < 15) {
            fill('red');
            ellipse(points[i].vector.x, points[i].vector.y, 15, 15);
        }
    }
}
let numberOfShapesControl;
const points = [];
let ui;
let device;
function setup() {
    console.log('🚀 - Setup initialized - P5 is running');
    createCanvas(windowWidth, windowHeight);
    const numberOfShapes = 99;
    noFill().frameRate(60);
    ui = new UI();
    device = new TSNDevice();
    for (let i = 0; i < numberOfShapes; i++) {
        let x, y, status;
        do {
            x = random(0, width);
            y = random(0, height);
        } while (ui.isPointInside(x, y));
        points.push(new Individual(createVector(x, y)));
    }
    ui.enableUpdate();
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function draw() {
    background(234);
    const functions = ui.buttons;
    renderPool(points);
    ui.render();
}
//# sourceMappingURL=build.js.map