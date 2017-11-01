var images = []; //All Images
function startGame() {
    preload(
        "https://i.imgur.com/1x7VOxs.png", //0: Lyle normal 1
        "https://i.imgur.com/ZGThKjp.png", //1: Lyle normal 2
        "https://i.imgur.com/j9xsRqU.png", //2: Kiana normal 1
        "https://i.imgur.com/5toPRKK.png", //3: Kiana normal 2
        "https://i.imgur.com/azuIOiL.png", //4: Jackie normal 1
        "https://i.imgur.com/v9ReXAm.png", //5: Jackie normal 2
        "https://i.imgur.com/h0J04Gl.png", //6: Lyle sprite temp
        "https://i.imgur.com/f46wJor.png", //7: Kiana sprite temp
        "https://i.imgur.com/0U3fmxe.png", //8: Jackie sprite temp
        "https://i.imgur.com/ezVjs9g.png" //9: textbox sprite
    );
    textbox.img = images[9];
    lyle.sprites = [images[6]];
    kiana.sprites = [images[7]];
    jackie.sprites = [images[8]];
    portrait.portList = [null, images[0], images[1], images[2], images[3], images[4], images[5]];
    gameWindow.start();
}

var interactables; //Array holding all possible interactable objects
var collidables; //You can't run through this shit
var drawOrder; //Oh god
var lastUpdate = Date.now();

//This stores the SRCs for all portraits. IT'S FUCKING STUPID
var portrait = {
    //Lyle, normal = [1]
    //Kiana, normal = [3]
    //Jackie, normal = [5]
    //portList : [null, "https://i.imgur.com/1x7VOxs.png", "https://i.imgur.com/ZGThKjp.png", "https://i.imgur.com/j9xsRqU.png", "https://i.imgur.com/5toPRKK.png", "https://i.imgur.com/azuIOiL.png", "https://i.imgur.com/v9ReXAm.png"], //Lyle, Kiana, Jackie
    portList : null,
    img : null,
    pos : 0,
    index : 0,
    tempIndex : 0,
    x : 31,
    y : 38,
    width : 320,
    height : 416,
    animateTimer : 700,
    timerDefault : 700,
    timerFast : 250,
    update : function (dt) {
        if(this.portList[this.index] !== null) {
            var gc = gameWindow.context;
            this.animateTimer -= dt; //Decrease timer
            if (this.animateTimer <= 0) {
                if(this.img === this.portList[this.index]) {
                    this.tempIndex += 1;
                    this.animateTimer = this.timerFast;
                } else {
                    this.tempIndex = this.index;
                    this.animateTimer = this.timerDefault;
                }
            }

            if(this.pos === 0) {
                this.img = this.portList[this.tempIndex];
                gc.drawImage(this.img, this.x, this.y);
            } else if (this.pos === 1) {
                this.img = this.portList[this.tempIndex];
                gc.scale(-1,1);
                gc.drawImage(this.img, this.x - 800, this.y, this.width, this.height);
                gc.setTransform(1,0,0,1,0,0);
            }
        }
    }
};

/*
 * All actor information is here. It's messy, just like my life
 */
var lyle = {
    moveable : true, //Dictates whether the player can move
    sprites : null,
    curSprIndex : 0,
    img : null,
    width : 48,
    height : 96,
    x : 40,
    y : 100,
    xo : 24,
    yo : 96,
    xSpd : 0.15,
    ySpd : 0.11,
    update : function () {
        this.img = this.sprites[this.curSprIndex];
        var gc = gameWindow.context;
        gc.drawImage(this.img, (this.x - this.xo), (this.y - this.yo), this.width, this.height);
    }
};

var kiana = {
    0 : 0, //0 index is used for current dialogue index pointer. Easy access! (hopefully)
    dialogues : [10, 15, 20], //All the indexes at which they have dialogue for
    sprites : null,
    curSprIndex : 0,
    img : null,
    width : 48,
    height: 96,
    x : 300,
    y : 400,
    xo : 24,
    yo : 96,
    update : function () {
        this.img = this.sprites[this.curSprIndex];
        var gc = gameWindow.context;
        gc.drawImage(this.img, (this.x - this.xo), (this.y - this.yo), this.width, this.height);
    }
};

var jackie = {
    0 : 0,
    dialogues : [100, 105],
    sprites : null,
    curSprIndex : 0,
    img : null,
    width : 64,
    height: 128,
    x : 700,
    y : 200,
    xo : 32,
    yo : 128,
    update : function () {
        this.img = this.sprites[this.curSprIndex];
        var gc = gameWindow.context;
        gc.drawImage(this.img, (this.x - this.xo), (this.y - this.yo), this.width, this.height);
    }
};

interactables = [kiana, jackie];
collidables = [kiana, jackie];
drawOrder = [jackie, kiana, lyle];

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
    lineHeight : 30, //How many pixels to jump down
    timerDefault : 35, //Default timer value
    timerFast : 16, //Quick timer value
    timerNormal : 35, //Normal timer value
    textToPrint : "This text should never appear.", // Full text we want to print
    printedText : "", // Section of the text printed so far
    typeTimer : 35, // Timer to know when to print a new letter
    typePosition : 0, //Type cursor position
    update : function (dt) {
        //alert("timedefault: " + this.timerDefault);
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
                this.typeTimer = this.timerDefault;
                this.typePosition++; //Adjust position, use string.sub to get sub-string
                this.printedText = this.textToPrint.substring(0,this.typePosition);
            }
            else if(this.printedText.length === this.textToPrint.length) {
                this.typing = false;
            }
        }
        //Oh my fucking god javascript why are you like this
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
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.spacePressed = false;
        drawOrder.sort(compareY);
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(update, 16.6666666); //50 fps
        window.addEventListener('keydown', function (e) { //Listener for key press
            gameWindow.keys = (gameWindow.keys || []);
            if (e.keyCode === 32 && !gameWindow.spacePressed) { //Space bar code
                gameWindow.spacePressed = true;
                if (textbox.open && textbox.typing) {
                    textbox.printedText = textbox.textToPrint;
                    textbox.typing = false;
                } else if (textbox.open && !textbox.typing) {
                    dialogueLine(++scriptIndex)
                } else if (!textbox.open && lyle.moveable) {
                    for (var i = 0; i < interactables.length; i++) {
                        var o = interactables[i];
                        if (lyle.x >= o.x-(o.width+4) && lyle.x <= o.x+(o.width+4) && lyle.y <= o.y+(o.height/2) && lyle.y >= o.y-(o.height/2)) {
                            textbox.open = true;
                            lyle.moveable = false;
                            scriptIndex = o.dialogues[o[0]];
                            if (o.dialogues[o[0]+1]) {
                                o[0] = o[0] + 1;
                            }
                            dialogueLine(scriptIndex);
                        }
                    }
                }
            }
            else { //Do this if it wasn't space or whatever
                gameWindow.keys[e.keyCode] = true;
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

    for(var i = 0; i < drawOrder.length; i++) {
        drawOrder[i].update();
    }

    if(lyle.moveable && gameWindow.keys) {
        if (gameWindow.keys[37]) { //L
            var blockedL = false;
            for (var itrL = 0; itrL < collidables.length; itrL++) {
                var cL = collidables[itrL];
                var projMoveL = (lyle.x - (lyle.width/2)) - (lyle.xSpd * dt);
                if (projMoveL < cL.x + (cL.width/2) && projMoveL > cL.x - (cL.width/2) && lyle.y > cL.y - (cL.height/2) && lyle.y - (lyle.height/2) < cL.y) {
                    blockedL = true;
                    lyle.x = cL.x + (cL.width/2) + (lyle.width/2);
                }
            }
            if(!blockedL) {
                lyle.x = Math.floor(lyle.x - (lyle.xSpd * dt));
            }

        }
        if (gameWindow.keys[39]) { //R
            var blockedR = false;
            for (var itrR = 0; itrR < collidables.length; itrR++) {
                var cR = collidables[itrR];
                var projMoveR = (lyle.x + (lyle.width/2)) + (lyle.xSpd * dt);
                if (projMoveR > cR.x - (cR.width/2) && projMoveR < cR.x + (cR.width/2) && lyle.y > cR.y - (cR.height/2) && lyle.y - (lyle.height/2) < cR.y) {
                    blockedR = true;
                    lyle.x = cR.x - (cR.width/2) - (lyle.width/2);
                }
            }
            if(!blockedR) {
                lyle.x = Math.ceil(lyle.x + (lyle.xSpd * dt));
            }
        }
        if (gameWindow.keys[38]) { //U
            var blockedU = false;
            for (var itrU = 0; itrU < collidables.length; itrU++) {
                var cU = collidables[itrU];
                var projMoveU = (lyle.y - (lyle.height/2)) - (lyle.ySpd * dt);
                if (projMoveU > cU.y - (cU.height/2) && projMoveU < cU.y && lyle.x + (lyle.width/2) > cU.x - (cU.width/2) && lyle.x - (lyle.width/2) < cU.x + (cU.width/2)) {
                    blockedU = true;
                    lyle.y = cU.y + (lyle.height/2);
                }
            }
            if(!blockedU) {
                lyle.y = Math.floor(lyle.y - (lyle.ySpd * dt));
                drawOrder.sort(compareY);
            }
        }
        if (gameWindow.keys[40]) { //D
            var blockedD = false;
            for (var itrD = 0; itrD < collidables.length; itrD++) {
                var cD = collidables[itrD];
                var projMoveD = lyle.y + (lyle.ySpd * dt);
                if (projMoveD > cD.y - (cD.height/2) && projMoveD < cD.y && lyle.x + (lyle.width/2) > cD.x - (cD.width/2) && lyle.x - (lyle.width/2) < cD.x + (cD.width/2)) {
                    blockedD = true;
                    lyle.y = cD.y - (cD.height/2);
                }
            }
            if(!blockedD) {
                lyle.y = Math.ceil(lyle.y + (lyle.ySpd * dt));
                drawOrder.sort(compareY);
            }
        }
    }

    if (textbox.open) {
        portrait.update(dt);
        textbox.update(dt);
    }

}

function dialogueLine(index) {
    if (script[index]) {
        textbox.typing = true;
        textbox.typePosition = 0;
        textbox.printedText = "";
        textbox.textToPrint = script[index][2];
        portrait.index = script[index][0];
        portrait.tempIndex = script[index][0];
        portrait.pos = script[index][1];
    } else {
        textbox.open = false;
        lyle.moveable = true;
    }
}

function compareY(a, b) {
    if (a.y < b.y) {
        return -1;
    }
    else if (a.y > b.y) {
        return 1;
    }
    else {
        return 0;
    }
}

function preload() {
    for (var i = 0; i < arguments.length; i++) {
        images[i] = new Image();
        images[i].src = preload.arguments[i];
    }
}

var scriptIndex = 0;
var script = [];
script[10] = [1, 0, "Hey, Kiana! We officially have names now!"];
script[11] = [3, 1, "Holy shit Lyle! This scripting method is horrible."];
script[12] = [1, 0, "Yeah, it is pretty bad, isn't it?"];
script[13] = [3, 1, "Whoever made this isn't very good at programming. Ohwell, I guess. We're stuck with him."];
script[15] = [3, 1, "This is my second set of dialogue. Neat, huh?"];
script[20] = [3, 1, "And this is my third!"];
script[21] = [3, 1, "Having multiple dialogues sure is a neat feature,   huh?"];
script[100] = [5, 1, "I have no personality. Bummer."];
script[101] = [5, 1, "I'm a single panther, but I'm not looking so you canfuck off."];
script[102] = [5, 1, "You should fix your scripting skills, bucko."];
script[105] = [5, 1, "Yo."];