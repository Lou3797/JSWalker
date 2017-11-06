var mapWidth = 800;
var mapHeight = 600;
var lastUpdate = Date.now();
var apartment = new Map(100);

function Map(cellSize) {
    this.cellSize = cellSize;
    this.width = mapWidth;
    this.height = mapHeight;
    this.cells = [];
    //
    this.initializeCells = function() {
        var c, r;
        for(c = 0; c < this.width/cellSize; c++) {
            this.cells[c] = [];
            for(r = 0; r < this.height/cellSize; r++) {
                this.cells[c][r] = []; //For each x,y cell coordinate there exists a list of references to all objects there
            }
        }
    };
    //
    this.addObject = function(obj, x, y, w, h) {
        var c, r;
        for (c = Math.floor(x / this.cellSize); c <= Math.floor(x + w / this.cellSize); c++) {
            for (r = Math.floor(y / this.cellSize); r <= Math.floor(y + h / this.cellSize); r++) {
                this.cells[c][r].push(obj);
            }
        }
    };
    //Returns the actual x and y coordinates after an object's proposed movement
    this.move = function(obj, goalX, goalY) {
        /*var movement = this.check(obj, goalX, goalY);
        var actualX = movement[0],
            actualY = movement[1];

        return [actualX, actualY];*/
        return [goalX, goalY];
    };
    //
    this.check = function(obj, goalX, goalY) {

    };
    //Update the map to reflect the change after movement
    this.update = function(obj, actualX, actualY) {

    };
    //Project the movement
    this.project = function(obj, x, y, w, h, goalX, goalY) {

    };
    //
    this.debug = function() {
        var x, y;
        var color = "#FFFF00";
        var gc = gameWindow.context;
        gc.strokeStyle = color;
        gc.globalAlpha = 0.5;
        for(x = 0; x < this.width/this.cellSize; x++) {
            gc.beginPath();
            gc.moveTo(x*this.cellSize,0);
            gc.lineTo(x*this.cellSize,this.height);
            gc.stroke();
        }
        for(y = 0; y < this.height/this.cellSize; y++ ) {
            gc.beginPath();
            gc.moveTo(0, y*this.cellSize);
            gc.lineTo(this.width, y*this.cellSize);
            gc.stroke();
        }
        for(x = 0; x < this.cells.length; x++) {
            for(y = 0; y < this.cells[x].length; y++) {
                gc.fillStyle = color;
                gc.fillText((this.cells[x][y]).length, (x*this.cellSize)+25, (y*this.cellSize)+25);
            }
        }
        gc.globalAlpha = 1;
    }
}

var lyle = {
    canMove : true,
    x : 40,
    y : 100,
    w : 48,
    h : 48,
    xSpeed : 0.15,
    ySpeed : 0.11,
    update : function () {
        var gc = gameWindow.context;
        gc.fillStyle = "red";
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
            }
        });

        window.addEventListener('keyup', function (e) { //Listener for key release
            gameWindow.keys[e.keyCode] = false;
            if(gameWindow.keys && !gameWindow.keys[32]) {
                gameWindow.spacePressed = false;
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

    lyle.update();

    apartment.debug(); //Comment out when not debugging
}

function startGame() {
    apartment.initializeCells();

    gameWindow.start();
}

/*
var test = [];
var item = {
    x : 69,
    y : 420
};
test[item] = item;
alert(test[item].x);
*/
