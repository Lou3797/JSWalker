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

var textbox = {
    open : false, //Is the textbox open?
    typing: false, //Is text being output?
    //width : 770, //Can remove?
    //height : 130, //Can remove?
    x : 15,
    y : 454,
    lineWidth : 52, //Max chars for a single line
    lineHeight : 30, //How many pixels to jump down after a line
    timerNormal : 35, //Normal timer value
    //textToPrint : "This text should never appear.", // Full text we want to print, should be an array of max length 4
    printedText : "", // Section of the text printed so far
    typeTimer : 35, // Timer to know when to print a new letter
    typePosition : 0, //Type cursor position
    typeWordPos : 0, //Type cursor position in the current word
    typeArrayPos : 0, //Type cursor position in the array
    wordsArray : [], //The array for current dialogue
    updateWordArray : function (str) {
        this.wordsArray = str.split(' ');
    },
    drawText : function (gc) {
        var yOffset = 0;
        if(this.typeWordPos > this.wordsArray[this.typeArrayPos].length) {
            if(this.wordsArray[this.typeArrayPos+1]) {
                this.typeArrayPos++;
                this.typeWordPos = 0;
            }
        }
        this.printedText = "";
        for(var i = 0; i < this.typeArrayPos; i++) {
            if(this.wordsArray[i] === "#") {
                console.log("Skipping Octothorpe")
            } else {
                this.printedText += (this.wordsArray[i] + " ")
            }
        }
        this.printedText += this.wordsArray[this.typeArrayPos].substring(0,this.typeWordPos);







        gc.fillText(this.printedText, this.x + 15, this.y + 30);
    },
    update : function (dt) {
        var gc = gameWindow.context;
        gc.font="24px Consolas";
        gc.textAlign = "left";
        gc.fillStyle = "#DDDDDD";
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
            else if(this.typeArrayPos >= this.wordsArray.length - 1) {
                //console.log(this.typeArrayPos + " >= " + this.wordsArray.length + " : Stopping");
                this.typing = false;
            }
        }
        gc.drawImage(images[0], this.x, this.y);
        this.drawText(gc);

        if(this.printedText.length <= this.lineWidth) {
            //???
        }
            /*
            function wrapText(context, text, x, y, maxWidth, lineHeight) {
            var words = text.split(' ');
            var line = '';

            for(var n = 0; n < words.length; n++) {
              var testLine = line + words[n] + ' ';
              var metrics = context.measureText(testLine);
              var testWidth = metrics.width;
              if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
              }
              else {
                line = testLine;
              }
            }
            context.fillText(line, x, y);
          }
             */


    }
};

function update() { //Handles both update and draw functions- this is probably a no no
    var now = Date.now();
    var dt = now - lastUpdate;
    lastUpdate = now;
    gameWindow.clear();
    if(textbox.open) {
        textbox.update(dt);
    } else {
        textbox.updateWordArray("Kiana! I think you're great, alright? # I just wanted to make sure that you knew that I think you're super fantastic and that I'm glad I know you because I don't know what I would do if I didn't.");
        textbox.open = true;
        textbox.typing = true;
    }

}