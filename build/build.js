var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var UI = (function () {
    function UI() {
        this.frame = [30, 30, 400, 300];
        this.avatarColor = this.getRandomAvatarColor();
        this.avatarD = 70;
        this.avatarX = this.frame[0] + this.avatarD / 2 + 40;
        this.avatarY = this.frame[1] + this.avatarD / 2 + 30;
        this.visibilitySketchyLines = [];
        this.id = this.getRandomID();
        this.verified = false;
        this.buttons = [
            {
                name: 'LIKE',
                onClick: function () {
                    console.log('Button 1 clicked');
                },
            },
            {
                name: 'FWD',
                onClick: function () {
                    console.log('Button 2 clicked');
                },
            },
            {
                name: 'COM',
                onClick: function () {
                    console.log('Button 3 clicked');
                },
            },
        ];
    }
    UI.prototype.isPointInside = function (x, y) {
        return (x > this.frame[0] &&
            x < this.frame[0] + this.frame[2] &&
            y > this.frame[1] &&
            y < this.frame[1] + this.frame[3]);
    };
    UI.prototype.getRandomAvatarColor = function () {
        var hue = Math.floor(random(0, 360));
        var saturation = Math.floor(random(30, 66));
        var lightness = Math.floor(random(50, 76));
        return "hsl(".concat(hue, ", ").concat(saturation, "%, ").concat(lightness, "%)");
    };
    UI.prototype.getRandomID = function () {
        return Math.floor(random(60, 120));
    };
    UI.prototype.enableUpdate = function () {
        var _this = this;
        setInterval(function () {
            _this.avatarColor = _this.getRandomAvatarColor();
            _this.id = _this.getRandomID();
            _this.verified = random() < 0.1;
        }, 3000);
    };
    UI.prototype.drawFrame = function () {
        fill(255);
        rect.apply(void 0, __spreadArray(__spreadArray([], this.frame, false), [10], false));
    };
    UI.prototype.drawAvatar = function () {
        fill(this.avatarColor);
        ellipse(this.avatarX, this.avatarY, this.avatarD);
    };
    UI.verifiedBadge = function (x, y, size) {
        if (size === void 0) { size = 20; }
        stroke('rgba(0,0,0,0)');
        fill('rgb(23,176,198)');
        ellipse(x, y, size);
        fill(255);
        ellipse(x, y, (size * 7) / 20);
    };
    UI.prototype.drawID = function () {
        var idX = this.frame[0] + 60 + this.avatarD;
        var idY = this.frame[1] + 50;
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
    };
    UI.prototype.drawButtonSketchyOutlines = function (lines, buttonX, buttonY, buttonWidth, buttonHeight, sketchyLines, overshoot, dithering) {
        if (sketchyLines === void 0) { sketchyLines = 2; }
        if (overshoot === void 0) { overshoot = 3; }
        if (dithering === void 0) { dithering = 2; }
        if (lines.length === 0) {
            for (var j = 0; j < sketchyLines; j++) {
                var startX = buttonX + random(-dithering, dithering);
                var startY = buttonY + random(-dithering, dithering) - overshoot;
                var endX = buttonX + random(-dithering, dithering);
                var endY = buttonY +
                    buttonHeight +
                    random(-dithering, dithering) +
                    overshoot;
                lines.push([startX, startY, endX, endY, random(89, 130)]);
            }
            for (var j = 0; j < sketchyLines; j++) {
                var startX = buttonX + buttonWidth + random(-dithering, dithering);
                var startY = buttonY + random(-dithering, dithering) - overshoot;
                var endX = buttonX + buttonWidth + random(-dithering, dithering);
                var endY = buttonY +
                    buttonHeight +
                    random(-dithering, dithering) +
                    overshoot;
                lines.push([startX, startY, endX, endY, random(89, 130)]);
            }
            for (var j = 0; j < sketchyLines; j++) {
                var startX = buttonX + random(-dithering, dithering) - overshoot;
                var startY = buttonY + buttonHeight + random(-dithering, dithering);
                var endX = buttonX +
                    buttonWidth +
                    random(-dithering, dithering) +
                    overshoot;
                var endY = buttonY + buttonHeight + random(-dithering, dithering);
                lines.push([startX, startY, endX, endY, random(89, 130)]);
            }
            for (var j = 0; j < sketchyLines; j++) {
                var startX = buttonX + random(-dithering, dithering) - overshoot;
                var startY = buttonY + random(-dithering, dithering);
                var endX = buttonX +
                    buttonWidth +
                    random(-dithering, dithering) +
                    overshoot;
                var endY = buttonY + random(-dithering, dithering);
                lines.push([startX, startY, endX, endY, random(89, 130)]);
            }
        }
        push();
        for (var j = 0; j < lines.length; j++) {
            var l = lines[j];
            stroke(l[4]);
            line.apply(void 0, l.slice(undefined, 4));
        }
        pop();
    };
    UI.prototype.drawButtons = function () {
        var buttonWidth = 60;
        var buttonHeight = 40;
        var buttonPadding = 20;
        for (var i = 0; i < this.buttons.length; i++) {
            var buttonX = this.frame[0] + i * buttonWidth + 50 + i * buttonPadding;
            var buttonY = this.frame[1] + this.frame[3] - buttonHeight - 30;
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
                this.buttons[i].onClick();
            }
        }
    };
    UI.prototype.drawVisibilityButton = function () {
        var buttonSize = 40;
        var buttonX = this.frame[0] + this.frame[2] - buttonSize - 30;
        var buttonY = this.frame[1] + 30;
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
    };
    UI.prototype.toggleVisibility = function () {
        return;
    };
    UI.prototype.render = function () {
        this.drawFrame();
        this.drawAvatar();
        this.drawID();
        this.drawButtons();
        this.drawVisibilityButton();
    };
    return UI;
}());
var Campaign = (function () {
    function Campaign() {
    }
    return Campaign;
}());
var Individual = (function () {
    function Individual(vector, verified, personality) {
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
    return Individual;
}());
function renderPool(points) {
    for (var i = 0; i < points.length; i++) {
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
    for (var i = 0; i < points.length; i++) {
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
    for (var i = 0; i < points.length; i++) {
        points[i].vector.x += random(-0.5, 0.5);
        points[i].vector.y += random(-0.5, 0.5);
    }
    for (var i = 0; i < points.length; i++) {
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
    var lines = [];
    for (var i = 0; i < points.length; i++) {
        var distances = [];
        for (var j = 0; j < points.length; j++) {
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
        distances.sort(function (a, b) { return a.distance - b.distance; });
        var x = points[i].personality.extraversion * 20;
        if (points[i].verified) {
            x *= 3;
        }
        for (var j = 0; j < x && j < distances.length; j++) {
            var point_1 = points[distances[j].index];
            if (dist(mouseX, mouseY, points[i].vector.x, points[i].vector.y) <
                15 ||
                dist(mouseX, mouseY, point_1.vector.x, point_1.vector.y) < 15) {
                fill('azure');
                ellipse(points[i].vector.x, points[i].vector.y, 10, 10);
            }
            else {
                strokeWeight(1);
                stroke('rgba(50,50,50,0.1)');
            }
            push();
            var lineKey = "".concat(i, "-").concat(distances[j].index);
            var reverseLineKey = "".concat(distances[j].index, "-").concat(i);
            if (!points[i].verified &&
                (lines.indexOf(lineKey) !== -1 ||
                    lines.indexOf(reverseLineKey) !== -1)) {
                strokeWeight(2);
                stroke('rgba(0, 0, 0, .2)');
            }
            else {
                lines.push(lineKey);
            }
            line(points[i].vector.x, points[i].vector.y, point_1.vector.x, point_1.vector.y);
            pop();
        }
        if (dist(mouseX, mouseY, points[i].vector.x, points[i].vector.y) < 15) {
            fill('azure');
            ellipse(points[i].vector.x, points[i].vector.y, 15, 15);
        }
    }
}
var numberOfShapesControl;
var points = [];
var ui;
function setup() {
    console.log('🚀 - Setup initialized - P5 is running');
    createCanvas(windowWidth, windowHeight);
    var numberOfShapes = 99;
    noFill().frameRate(60);
    ui = new UI();
    for (var i = 0; i < numberOfShapes; i++) {
        var x = void 0, y = void 0, status_1;
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
    var functions = ui.buttons;
    renderPool(points);
    ui.render();
}
//# sourceMappingURL=build.js.map