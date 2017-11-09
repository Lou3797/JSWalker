var mapWidth = 800;
var mapHeight = 600;
var lastUpdate = Date.now();

var apartment = new Map(100);
var block1 = new Block(200, 180, 366, 359);
var block2 = new Block(399, 60, 120, 400, "#EE22AA");


var lyle = {
    canMove : true,
    x : 53,
    y : 53,
    w : 48,
    h : 48,
    xSpeed : 0.15,
    ySpeed : 0.11,
    update : function () {
        var gc = gameWindow.context;
        gc.fillStyle = "#EE9977";
        gc.fillRect(this.x, this.y, this.w, this.h);
    }
};

function Block(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.solid = true;
    this.dialog = true;
    this.color = color || "#7799EE";
    this.update = function () {
        var gc = gameWindow.context;
        gc.fillStyle = this.color;
        gc.fillRect(this.x, this.y, this.w, this.h);
    };
    this.interact = function () {
        console.log("Interacted");
    }
}

function Map(cellSize) {
    this.cellSize = cellSize;
    this.width = mapWidth;
    this.height = mapHeight;
    this.cells = [];
    //Call this before using a map. Creates the needed number of cells based on cell size
    this.initializeCells = function() {
        var c, r;
        for(c = 0; c < this.width/cellSize; c++) {
            this.cells[c] = [];
            for(r = 0; r < this.height/cellSize; r++) {
                this.cells[c][r] = []; //For each x,y cell coordinate there exists a list of references to all objects there
            }
        }
    };
    //Adds an object to its appropriate cell location
    this.addObject = function(obj) {
        var c, r;
        for (c = Math.floor(obj.x / this.cellSize); c < (obj.x + obj.w) / this.cellSize; c++) {
            for (r = Math.floor(obj.y / this.cellSize); r < (obj.y + obj.h) / this.cellSize; r++) {
                this.cells[c][r].push(obj);
            }
        }
    };
    //Returns the actual x and y coordinates after an object's proposed movement
    this.move = function(obj, goalX, goalY) {
        var movement = this.check(obj, goalX, goalY);
        var actualX = movement[0],
            actualY = movement[1];
        this.update(obj, actualX, actualY);
        return [actualX, actualY];
    };
    //Prevents the object from being out of bounds
    this.check = function(obj, goalX, goalY) {
        var actualX = goalX,
        actualY = goalY;
        if(goalX < 0) {
            actualX = 0;
        }
        if(goalX + obj.w > mapWidth) {
            actualX = mapWidth - obj.w;
        }
        if(goalY < 0) {
            actualY = 0;
        }
        if(goalY + obj.h > mapHeight) {
            actualY = mapHeight - obj.h;
        }
        return this.project(obj, actualX, actualY);
    };
    //Project the movement against other objects in the cells
    this.project = function(obj, goalX, goalY) {
        var c, r, i, block; //obj.x, obj.y = current; goalX, goalY = desired; actualX, actualY = actual
        var actualX = goalX,
            actualY = goalY;
        for (c = Math.floor(goalX / this.cellSize); c < (goalX + obj.w) / this.cellSize; c++) {
            for (r = Math.floor(goalY / this.cellSize); r < (goalY + obj.h) / this.cellSize; r++) {
                for(i = 0; i < this.cells[c][r].length; i++) {
                    block = this.cells[c][r][i];
                    if(block !== obj && block.solid) {
                        if(this.overlaps(goalX, obj.y, obj.w, obj.h, block.x, block.y, block.w, block.h)) {
                            actualX = obj.x;
                        }
                        if(this.overlaps(obj.x, goalY, obj.w, obj.h, block.x, block.y, block.w, block.h)) {
                            actualY = obj.y;
                        }

                    }
                }
            }
        }
        return [actualX, actualY];
    };
    //Returns true if the two rectangles overlap
    this.overlaps = function(x1, y1, w1, h1, x2, y2, w2, h2) {
        return (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2);
    };
    //Interacts with an object
    this.interact = function (obj, bufferX, bufferY) {
        var c, r, i, item; //obj.x, obj.y = current; goalX, goalY = desired; actualX, actualY = actual
        var col = Math.floor((obj.x - bufferX) / this.cellSize),
            row = Math.floor((obj.y - bufferY) / this.cellSize),
            colEnd = (obj.x + obj.w + bufferX) / this.cellSize,
            rowEnd = (obj.y + obj.h + bufferY) / this.cellSize;
        col = col < 0 ? 0 : col;
        row = row < 0 ? 0 : row;
        colEnd = colEnd > (this.width / this.cellSize) ? (this.width / this.cellSize) - 1 : colEnd;
        rowEnd = rowEnd > (this.height / this.cellSize) ? (this.height / this.cellSize) - 1 : rowEnd;
        for (c = col; c < colEnd; c++) {
            for (r = row; r < rowEnd; r++) {
                for(i = 0; i < this.cells[c][r].length; i++) {
                    item = this.cells[c][r][i];
                    if(item !== obj && item.dialog) {
                        if(this.overlaps(obj.x - bufferX, obj.y - bufferY, obj.w, obj.h, item.x, item.y, item.w, item.h) ||
                            this.overlaps(obj.x + bufferX, obj.y + bufferY, obj.w, obj.h, item.x, item.y, item.w, item.h)) {
                            item.interact();
                            return;
                        }
                    }
                }
            }
        }

    };
    //Update the map cells to reflect the change after movement
    this.update = function(obj, actualX, actualY) {
        var c, r, index;
        if(obj.x !== actualX || obj.y !== actualY) {
            //Remove object from cell(s). Can be turned into removeObject(obj) with some refactoring.
            for (c = Math.floor(obj.x / this.cellSize); c < (obj.x + obj.w) / this.cellSize; c++) {
                for (r = Math.floor(obj.y / this.cellSize); r < (obj.y + obj.h) / this.cellSize; r++) {
                    index = this.cells[c][r].indexOf(obj);
                    this.cells[c][r].splice(index, 1);
                }
            }
            //Add object to cell(s). Can be replaced with addObject() with some refactoring
            for (c = Math.floor(actualX / this.cellSize); c < (actualX + obj.w) / this.cellSize; c++) {
                for (r = Math.floor(actualY / this.cellSize); r < (actualY + obj.h) / this.cellSize; r++) {
                    index = this.cells[c][r].indexOf(lyle);
                    this.cells[c][r].push(obj);
                }
            }
        }
    };
    //Draws debug information to the screen
    this.debug = function() {
        var x, y;
        var color = "#FFFF00";
        var gc = gameWindow.context;
        gc.strokeStyle = color;
        gc.globalAlpha = 0.7;
        for(x = 0; x <= this.width/this.cellSize; x++) {
            gc.beginPath();
            gc.moveTo(x*this.cellSize,0);
            gc.lineTo(x*this.cellSize,this.height);
            gc.stroke();
        }
        for(y = 0; y <= this.height/this.cellSize; y++ ) {
            gc.beginPath();
            gc.moveTo(0, y*this.cellSize);
            gc.lineTo(this.width, y*this.cellSize);
            gc.stroke();
        }
        for(x = 0; x < this.cells.length; x++) {
            for(y = 0; y < this.cells[x].length; y++) {
                gc.globalAlpha = 0.7;
                gc.fillStyle = color;
                gc.fillText((this.cells[x][y]).length, (x*this.cellSize)+(this.cellSize/2), (y*this.cellSize)+(this.cellSize/2));
                gc.fillStyle = "#DDDDFF";
                gc.globalAlpha = (this.cells[x][y]).length * 0.1;
                gc.fillRect(x * this.cellSize, y * this.cellSize, cellSize, cellSize);
            }
        }
        gc.globalAlpha = 1;
    }
}

var textbox = {
    open : false, //Is the textbox open?
    typing: false, //Is text being output?
    //sprSrc : "https://i.imgur.com/ezVjs9g.png",
    //img : new Image(),
    img : null,
    width : 770,
    height : 130,
    x : 15,
    y : 454,
    lineWidth : 52, //Max chars for a single line
    lineHeight : 30, //How many pixels to jump down after a line
    timerFast : 16, //Quick timer value
    timerNormal : 35, //Normal timer value
    textToPrint : "This text should never appear.", // Full text we want to print
    printedText : "", // Section of the text printed so far
    typeTimer : 35, // Timer to know when to print a new letter
    typePosition : 0, //Type cursor position
    drawText : function (dt, text) {

    },
    update : function (dt) {
        var gc = gameWindow.context;
        gc.font="24px Consolas";
        gc.textAlign = "left";
        gc.fillStyle = "#DDDDDD";
        //this.img.src = this.sprSrc;
        //This horrible mess handles gradually typing text
        if(this.typing) {
            this.typeTimer -= dt; //Decrease timer
            if (this.printedText.length !== this.textToPrint.length) {
                this.typing = true;
            }
            if(this.typeTimer <= 0) { //Timer done, we need to print a new letter
                this.typeTimer = this.timerNormal;
                this.typePosition++; //Adjust position, use string.sub to get sub-string
                this.printedText = this.textToPrint.substring(0,this.typePosition);
            }
            else if(this.printedText.length === this.textToPrint.length) {
                this.typing = false;
            }
        }
        var sub1;
        var sub2;
        var sub3;
        var sub4;
        gc.drawImage(this.img, this.x, this.y, this.width, this.height);
        if(this.printedText.length <= this.lineWidth) {
            gc.fillText(this.printedText, this.x + 15, this.y + 30);
        }else if(this.printedText.length > this.lineWidth && this.printedText.length <= (this.lineWidth*2)) {
            sub1 = this.printedText.substring(0, this.lineWidth);
            sub2 = this.printedText.substring(this.lineWidth);
            gc.fillText(sub1, this.x + 15, this.y + 30);
            gc.fillText(sub2, this.x + 15, this.y + 30 + this.lineHeight);
        }else if(this.printedText.length > (this.lineWidth*2) && this.printedText.length <= (this.lineWidth*3)) {
            sub1 = this.printedText.substring(0, this.lineWidth);
            sub2 = this.printedText.substring(this.lineWidth, this.lineWidth*2);
            sub3 = this.printedText.substring(this.lineWidth*2);
            gc.fillText(sub1, this.x + 15, this.y + 30);
            gc.fillText(sub2, this.x + 15, this.y + 30 + this.lineHeight);
            gc.fillText(sub3, this.x + 15, this.y + 30 + (this.lineHeight*2));
        }else if(this.printedText.length > (this.lineWidth*3) && this.printedText.length <= (this.lineWidth*4)) {
            sub1 = this.printedText.substring(0, this.lineWidth);
            sub2 = this.printedText.substring(this.lineWidth, this.lineWidth*2);
            sub3 = this.printedText.substring(this.lineWidth*2, this.lineWidth*3);
            sub4 = this.printedText.substring(this.lineWidth*3);
            gc.fillText(sub1, this.x + 15, this.y + 30);
            gc.fillText(sub2, this.x + 15, this.y + 30 + this.lineHeight);
            gc.fillText(sub3, this.x + 15, this.y + 30 + (this.lineHeight*2));
            gc.fillText(sub4, this.x + 15, this.y + 30 + (this.lineHeight*3));
            //fuck me this bullshit is the worst code ive ever written
        }else {
            alert("Asshole, the string's too damn long")
        }

    }
};

var gameWindow = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = mapWidth;
        this.canvas.height = mapHeight;
        this.spacePressed = false;

        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(update, 16.6666666); //60 fps

        window.addEventListener('keydown', function (e) { //Listener for key press
            gameWindow.keys = (gameWindow.keys || []);
            gameWindow.keys[e.keyCode] = true;
            if (e.keyCode === 32 && !gameWindow.spacePressed) { //Space bar code
                gameWindow.spacePressed = true;
                apartment.interact(lyle, 6, 6);
            }
        });

        window.addEventListener('keyup', function (e) { //Listener for key release
            if(gameWindow.keys) {
                gameWindow.keys[e.keyCode] = false;
                if(!gameWindow.keys[32]) {
                    gameWindow.spacePressed = false;
                }
            }
        });

    },
    clear : function() { // Clear canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() { //Stop updating canvas
        clearInterval(this.interval);
    }
};

function update() { //Handles both update and draw functions- this is probably a no no
    var now = Date.now();
    var dt = now - lastUpdate;
    lastUpdate = now;
    gameWindow.clear();

    if(lyle.canMove && gameWindow.keys) {
        var dx = 0, dy = 0;
        if (gameWindow.keys[37]) { //L
            dx = Math.floor(-lyle.xSpeed * dt);
        }
        if (gameWindow.keys[39]) { //R
            dx = Math.ceil(lyle.xSpeed * dt);
        }
        if (gameWindow.keys[38]) { //U
            dy = Math.floor(-lyle.xSpeed * dt);
        }
        if (gameWindow.keys[40]) { //D
            dy = Math.ceil(lyle.xSpeed * dt);
        }
        if(dx !== 0 || dy !== 0) {
            var movement = apartment.move(lyle, lyle.x + dx, lyle.y + dy);
            lyle.x = movement[0];
            lyle.y = movement[1];
        }
    }

    block1.update();
    block2.update();
    lyle.update();

    apartment.debug(); //Comment out when not debugging
}

function startGame() {
    apartment.initializeCells();
    apartment.addObject(lyle);
    apartment.addObject(block1);
    apartment.addObject(block2);
    gameWindow.start();
}


/*
var i;
var test = [];
var item1 = {
    x : 69
};
var item2 = {
    x : 420
};
var item3 = {
    x : 666
};

test.push(item1, item2, item3);
alert(test.indexOf(item2));
var index = test.indexOf(item2);
test.splice(index, 1);

for(i = 0; i < test.length; i++) {
    alert(test[i].x);
}*/
