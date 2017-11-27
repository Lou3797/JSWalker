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
    timerFast : 16, //Quick timer value
    timerNormal : 35, //Normal timer value
    textToPrint : ["This text should never appear."], // Full text we want to print, should be an array of max length 4
    printedText : "", // Section of the text printed so far
    typeTimer : 35, // Timer to know when to print a new letter
    typePosition : 0, //Type cursor position
    formatTextToPrint : function (dt, text) {
        var gc = gameWindow.context;
        gc.font="24px Consolas";
        gc.textAlign = "left";
        gc.fillStyle = "#DDDDDD";

    },
    update : function (dt) {
        var gc = gameWindow.context;
        gc.font="24px Consolas";
        gc.textAlign = "left";
        gc.fillStyle = "#DDDDDD";
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
        gc.drawImage(images[0], this.x, this.y);
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
        textbox.open = true;
    }

}