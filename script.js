var mapWidth = 800;
var mapHeight = 600;
var images = [];
var animations = [];
var lastUpdate = Date.now();

var testDialogues = {
    pointer : 0,
    curLine : 0,
    pointerReset : null,
    0 : [
        [0, 0, "This is a test of the new dialogue system. \n This should be on a new line. \n"],
        [0, 0, "Isn't this neat? \n"],
        [1, 1, "Yeah, I guess it is. \n"]
    ],
    1 : [
        [1, 1, "Back for more? \n"],
        [0, 0, "I just really want to make sure that this all works, y'know? \n"],
        [1, 1, "Yeah, I get that. \n"],
        [1, 1, "So when will it be finished do you think? \n Next month? \n 2018? \n"],
        [0, 0, "I don't want to think about that... \n"]
    ],
    10 : [
        [1, 1, "I saw you examine that object! Don't think I didn't! \n"],
        [0, 0, "Yikes, sorry. \n"],
        [1, 1, "lol its k \n"]
    ]
};
var testTrigger = new Trigger(testDialogues, 10);

var apartment = new Map(100);
var block1 = new Item(200, 180, 366, 359, undefined, true);
var block2 = new Item(399, 60, 120, 400, "#EE22AA", false, true, null, testTrigger);
var block3 = new Item(80, 350, 32, 32, "#996666", true, true, testDialogues);

var maps = [apartment];
var curMap = 0;

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

var chatbox = {
    open : false, //Is the chatbox open?
    typing: false, //Is text being output?
    x : 15,
    y : 454,
    lineWidth : 746, //Max line width
    lineHeight : 28, //How many pixels to jump down after a line
    timerNormal : 35, //Normal timer value
    typeTimer : 35, // Timer to know when to print a new letter
    typeWordPos : 0, //Type cursor position in the current word
    typeArrayPos : 0, //Type cursor position in the array
    wordsArray : [], //The array for current dialogue
    printedText : "", // Section of the text printed so far
    dialogueArray : [], //The array for entire dialogue
    portraitAnimation : null, //The portrait to display for the current dialogue
    executeDialogue : function (dialogues) {
        //If the chatbox is not open and lyle can move, open it and stop further movement = ADVANCEMENT
        //If the chatbox is already open and typing, auto-complete the current line.
        //Else if the chatbox is open and not typing, go to the next line. = ADVANCEMENT
        //If the next line does not exist, close the chatbox
        if(dialogues !== null) {
            if((!this.open && lyle.canMove) || (this.open && !this.typing)) {
                if(dialogues[dialogues.pointer][dialogues.curLine] && dialogues[dialogues.pointer][dialogues.curLine] !== null) {
                    //Advancing dialogue
                    this.nextDialogue(dialogues[dialogues.pointer][dialogues.curLine]);
                    dialogues.curLine++;
                } else {
                    //Ending dialogue
                    this.nextDialogue(null);
                    dialogues.curLine = 0;
                    if(dialogues.pointerReset !== null) {
                        dialogues.pointer = dialogues.pointerReset;
                        dialogues.pointerReset = null;
                    } else if(dialogues[dialogues.pointer+1] && dialogues[dialogues.pointer+1] !== null) {
                        dialogues.pointer++;
                    }
                }
            } else if(this.open && this.typing) {
                //Skipping dialogue
                this.typeArrayPos = this.wordsArray.length-1;
                this.typing = false;
                if(this.portraitAnimation !== null) {
                    this.portraitAnimation.pauseAtBeginning();
                }
            }
        }
    },
    nextDialogue : function (dialogue) {
        if(dialogue === null) {
            lyle.canMove = true;
            this.open = false;
        } else {
            lyle.canMove = false;
            this.open = true;
            this.typing = true;
            this.wordsArray = dialogue[2].split(' ');
            //console.log(this.wordsArray);
            this.typeArrayPos = 0;
            this.typeWordPos = 0;
            if(this.portraitAnimation !== null && !this.portraitAnimation.isOriginalOrientation) {
                this.portraitAnimation.flip();
                console.log("Resetting flip")
            }
            this.portraitAnimation = animations[dialogue[0]];
            if(this.portraitAnimation !== null) {
                if(dialogue[1] === 1) {
                    console.log("Flipping character portrait");
                    this.portraitAnimation.flip();
                }
                this.portraitAnimation.resume();
            }
        }

    },
    formatText : function (gc) {
        var yOffset, metrics, testWidth;
        yOffset = 0;
        this.printedText = "";
        if(this.typeWordPos > this.wordsArray[this.typeArrayPos].length) {
            if(this.wordsArray[this.typeArrayPos+1]) {
                this.typeArrayPos++;
                this.typeWordPos = 0;
            }
        }
        //Print all the text leading up to the current word being printed
        for(var i = 0; i < this.typeArrayPos; i++) {
            if(this.wordsArray[i] === "\n") {
                //print the entire word array up to this point with the current offset
                //reset the words to print and increase the offset
                this.drawText(gc, yOffset);
                yOffset += this.lineHeight;
                this.printedText = "";
            } else {
                //compare printedText after this item
                metrics = gc.measureText(this.printedText + this.wordsArray[i]);
                testWidth = metrics.width;
                if(testWidth > this.lineWidth) {
                    this.drawText(gc, yOffset);
                    yOffset += this.lineHeight;
                    this.printedText = "";
                }
                this.printedText += (this.wordsArray[i] + " ")
            }
        }

        var wordChunk = (this.wordsArray[this.typeArrayPos]).substring(0,this.typeWordPos);
        if(wordChunk === "\n") {
            //Auto-advance word position. New line handling is done in for loop
            this.typeWordPos++;
        } else {
            metrics = gc.measureText(this.printedText + wordChunk);
            testWidth = metrics.width;
            if(testWidth > this.lineWidth) {
                this.drawText(gc, yOffset);
                yOffset += this.lineHeight;
                this.printedText = "";
            }
            this.printedText += wordChunk
        }
        this.drawText(gc, yOffset);
    },
    drawText : function (gc, yOffset) {
        gc.font="22px Consolas";
        gc.textAlign = "left";
        gc.fillStyle = "#DDDDDD";
        gc.fillText(this.printedText, this.x + 16, this.y + 30 + yOffset);
    },
    update : function (dt) {
        //console.log("Is typing? " + this.typing);
        //This horrible mess handles gradually typing text
        if(this.typing) {
            this.typeTimer -= dt; //Decrease timer
            //If the current array position has not reached the end of the array, keep typing
            if (this.typeArrayPos < this.wordsArray.length - 1) {
                this.typing = true;
            }
            //If the timer reaches 0, reset it and increment the word position
            if(this.typeTimer <= 0) { //Timer done, we need to print a new letter
                this.typeTimer = this.timerNormal;
                this.typeWordPos++;
            }
            //If the array position is greater than the array length - 1 (0 indexed), we are no longer typing words
            else if(this.typeArrayPos >= this.wordsArray.length - 1) {
                if(this.portraitAnimation !== null) {
                    this.portraitAnimation.pauseAtBeginning();
                }
                this.typing = false;
            }
        }
        //Draw the chatbox and text
        var gc = gameWindow.context;
        if(this.portraitAnimation !== null) {
            this.portraitAnimation.update(dt, 30, 70)
        }
        gc.drawImage(images[0], this.x, this.y);
        this.formatText(gc);
    }
};

function Item(x, y, w, h, color, solid, prop, dialogues, trigger) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color || "#7799EE";
    this.solid = solid || false;
    this.prop = prop || false;
    this.dialogues = dialogues || null;
    this.trigger = trigger || null;
    this.update = function () {
        var gc = gameWindow.context;
        gc.fillStyle = this.color;
        gc.fillRect(this.x, this.y, this.w, this.h);
    };
    this.interact = function () {
        chatbox.executeDialogue(this.dialogues);
        if(this.trigger !== null) {
            trigger.run();
        }
    };

}

function Map(cellSize) {
    this.cellSize = cellSize;
    this.width = mapWidth;
    this.height = mapHeight;
    this.cells = [];
    this.globalItems = []; //list of Item objects
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
                this.globalItems.push(obj);
                this.updateDrawOrder();
            }
        }
    };
    //Returns the actual x and y coordinates after an object's proposed movement
    this.move = function(obj, goalX, goalY) {
        var movement = this.check(obj, goalX, goalY);
        var actualX = movement[0],
            actualY = movement[1];
        this.updateCells(obj, actualX, actualY);
        this.updateDrawOrder();
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
                    if(item !== obj && item.prop) {
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
    this.updateCells = function(obj, actualX, actualY) {
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
    //Calls .update() on all contained items
    this.update = function () {
        for(var i = 0; i < this.globalItems.length; i++) {
            this.globalItems[i].update();
        }
    };
    //Updates draw order based on y position of all objects
    this.updateDrawOrder = function () {
        this.globalItems.sort(this.compareY);
    };
    //Sort function for comparing items based on y value
    this.compareY = function (a, b) {
        if (a.y < b.y) {
            return -1;
        }
        else if (a.y > b.y) {
            return 1;
        }
        else {
            return 0;
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
                gc.font="16px Consolas";
                gc.textAlign = "center";
                gc.fillText((this.cells[x][y]).length, (x*this.cellSize)+(this.cellSize/2), (y*this.cellSize)+(this.cellSize/2));
                gc.fillStyle = "#DDDDFF";
                gc.globalAlpha = (this.cells[x][y]).length * 0.1;
                gc.fillRect(x * this.cellSize, y * this.cellSize, cellSize, cellSize);
            }
        }
        gc.globalAlpha = 1;
    }
}

function Animation(img, startIndex, endIndex, row, width, height) {
    this.img = img;
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.curIndex = startIndex;
    this.row = row;
    this.width = width;
    this.height = height;
    this.frameCounter = 0;
    this.frameTimer = 200;
    this.animated = true;
    this.isOriginalOrientation = true;

    this.update = function (dt, x, y) {
        var gc = gameWindow.context;
        if(this.isOriginalOrientation) {
            gc.drawImage(this.img, this.curIndex * this.width, this.row, this.width, this.height, x, y, this.width, this.height);
        } else {
            gc.scale(-1,1);
            gc.drawImage(this.img, this.curIndex * this.width, this.row, this.width, this.height, x - mapWidth, y, this.width, this.height);
            gc.setTransform(1,0,0,1,0,0);
        }
        if(this.animated) {
            this.incrementCurIndex(dt);
        }
    };
    this.incrementCurIndex = function (dt) {
        if(this.frameCounter > this.frameTimer) {
            this.frameCounter = 0;
            if(this.curIndex === this.endIndex) {
                this.curIndex = this.startIndex;
            } else {
                this.curIndex++;
            }
        } else {
            this.frameCounter += dt;
        }

    };
    this.resume = function () {
        this.animated = true;
    };
    this.pauseAtBeginning = function () {
        this.animated = false;
        this.frameCounter = 0;
        this.curIndex = startIndex;
    };
    this.flip = function () {
        this.isOriginalOrientation = !this.isOriginalOrientation;
    };
}

function Trigger(parent, id) {
    this.flag = false;
    this.parent = parent; //The dialogues to reference
    this.id = id; //The dialogue id to skip to
    this.run = function () {
        if(!this.flag) {
            this.flag = true;
            this.parent.pointerReset = this.parent.pointer;
            this.parent.pointer = this.id;
        }
    }
}

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

    maps[curMap].update();
    maps[curMap].debug(); //Comment out when not debugging

    if (chatbox.open) {
        chatbox.update(dt);
    }
}

function startGame() {
    preload(
        "https://i.imgur.com/ezVjs9g.png", // 00 : Textbox
        "https://i.imgur.com/seoBUYH.png", // 01 : Lyle portrait placeholders
        "https://i.imgur.com/oQeiIiH.png"  // 02 : Kiana portrait placeholders
    );
    loadAnimations();
    apartment.initializeCells();
    apartment.addObject(lyle);
    apartment.addObject(block1);
    apartment.addObject(block2);
    apartment.addObject(block3);
    gameWindow.start();
    }

function preload() {
    for (var i = 0; i < arguments.length; i++) {
        images[i] = new Image();
        images[i].src = preload.arguments[i];
    }
}

function loadAnimations() {
    animations[0] = new Animation(images[1], 0, 1, 0, 320, 384); // 00 : Lyle placeholder ports
    animations[1] = new Animation(images[2], 0, 1, 0, 320, 384); // 01 : Kiana placeholder ports
}