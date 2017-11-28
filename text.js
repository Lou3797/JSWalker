var mapWidth = 800;
var mapHeight = 600;

var images = [];
images[0] = new Image();
images[0].src = "https://i.imgur.com/ezVjs9g.png";

var lastUpdate = Date.now();

function startGame() {
    gameWindow.start();
}

var gameWindow = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = mapWidth;
        this.canvas.height = mapHeight;
        this.spacePressed = false;

        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(update, 16.6666666); //60 fps

    },
    clear : function() { // Clear canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() { //Stop updating canvas
        clearInterval(this.interval);
    }
};

var chatbox = {
    open : false, //Is the textbox open?
    typing: false, //Is text being output?
    x : 15,
    y : 454,
    lineWidth : 746, //Max line width
    lineHeight : 28, //How many pixels to jump down after a line
    timerNormal : 35, //Normal timer value //Normally 35, 100 for testing
    typeTimer : 35, // Timer to know when to print a new letter
    typeWordPos : 0, //Type cursor position in the current word
    typeArrayPos : 0, //Type cursor position in the array
    wordsArray : [], //The array for entire current dialogue
    printedText : "", // Section of the text printed so far
    updateWordArray : function (str) {
        this.wordsArray = str.split(' ');
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
            if(this.wordsArray[i] === "#") {
                //print the entire word array up to this point with the current offset
                //reset the words to print to and increase the offset
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
        if(wordChunk === "#") {
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

        //check that the current printedText string is not longer than the line width
        //if it is, cut it, print, increase offset, reset printedwords and repeat until it is less than the width
        /*metrics = gc.measureText(this.printedText);
        testWidth = metrics.width;
        if(testWidth > this.lineWidth) {
            this.drawText(gc, yOffset);
            yOffset += this.lineHeight;
            this.printedText = "";
        }*/


        this.drawText(gc, yOffset);
    },
    drawText : function (gc, yOffset) {
        gc.font="22px Consolas";
        gc.textAlign = "left";
        gc.fillStyle = "#DDDDDD";
        gc.fillText(this.printedText, this.x + 16, this.y + 30 + yOffset);
    },
    update : function (dt) {
        //This horrible mess handles gradually typing text
        if(this.typing) {
            this.typeTimer -= dt; //Decrease timer
            if (this.typeArrayPos < this.wordsArray.length - 1) {
                //console.log(this.typeArrayPos + " < " + this.wordsArray.length + " : Continuing");
                this.typing = true;
            }
            if(this.typeTimer <= 0) { //Timer done, we need to print a new letter
                this.typeTimer = this.timerNormal;
                this.typeWordPos++;
                console.log(this.typeWordPos)
            }
            else if(this.typeArrayPos > this.wordsArray.length - 1) {
                //console.log(this.typeArrayPos + " >= " + this.wordsArray.length + " : Stopping");
                this.typing = false;
            }
        }
        //Draw the chatbox and text
        var gc = gameWindow.context;
        gc.drawImage(images[0], this.x, this.y);
        this.formatText(gc);
     }
};

function update() { //Handles both update and draw functions- this is probably a no no
    var now = Date.now();
    var dt = now - lastUpdate;
    lastUpdate = now;
    gameWindow.clear();
    if(chatbox.open) {
        chatbox.update(dt);
    } else {
        chatbox.updateWordArray("Kiana! I think you're great, alright? # I just wanted to make sure that you knew that I think you're super fantastic and that I'm glad I know you because I don't know what I would do if I didn't.");
        chatbox.open = true;
        chatbox.typing = true;
    }

}