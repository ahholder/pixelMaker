//------------------------------------------------------------------------------------------------------------------------------------------------------
//Global Variables
//------------------------------------------------------------------------------------------------------------------------------------------------------

let overlay;
let board;
let context;
let boardWidth = 700;
let boardHeight = 700;
let fps = 60;
let winds = [];

let pixes = 3;
let globalAnimationCycle = 0;
let animatedZones = [];
let animationsList = [];
let moverList = [];

let eventQueue = [];
let repeatQueue = [];
let blockedAreas = [];

let gameActive = true;

let gridSize = [20, 20, 0, 0];
let totalTiles;
let grid = [];
let selected = -1;

let settings = [true, "#ffffff", true, true]; //Include Variable Names | Current Color | Show Grid | Use Placeholders
let mvn = "images"; //Main Variable Name
let svn = "shows"; //Secondary Variable Name

//------------------------------------------------------------------------------------------------------------------------------------------------------
//Startup Functions
//------------------------------------------------------------------------------------------------------------------------------------------------------

//Initial Load
window.onload = function () {

    overlay = document.getElementById("contents");
    overlay.width = boardWidth;
    overlay.height = boardHeight;
    //overlay.background-size = "auto";
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    addAnimationZone(context);
    makeGrid();

    newGame();
}

//Starts a New Program
function newGame() {

    document.addEventListener("keydown", presser);
    //Final
    requestAnimationFrame(update);
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
//Grid Functions
//------------------------------------------------------------------------------------------------------------------------------------------------------

//Creates the Initial Objects and Elements for the Game's Grid
function makeGrid() {
    makeGridSize();
    for (let i = 0; i < sizeGrid("r"); i++) {
        for (let i2 = 0; i2 < sizeGrid("c"); i2++) {
            let x = sizeGrid("w") * i;
            let y = sizeGrid("h") * i2;
            let id = (i * sizeGrid("r")) + i2;

            let borders = [true, false, false, true]; //left, right, top, bottom
            if (i == 0) borders[0] = false;
            if (i == sizeGrid("r") - 1) borders[1] = false;
            if (i2 == 0) borders[2] = false;
            if (i2 == sizeGrid("c") - 1) borders[3] = false;

            let newSpace = makeGridSpace(x, y, id, borders);
            grid[id] = newSpace;
        }
    }
}

//Returns Values for Grid Sizes and Spacing
function sizeGrid(value) {
    if (value == "r" || value == "rows") {
        return gridSize[2];
    } else if (value == "c" || value == "columns") {
        return gridSize[3];
    } else if (value == "w" || value == "width") {
        return gridSize[0];
    } else if (value == "h" || value == "height") {
        return gridSize[1];
    } else {
        return 0;
    }

}

//Determines the Dimensions of a Grid Space
function makeGridSize() {
    gridSize[2] = boardHeight / sizeGrid("h");
    gridSize[3] = boardWidth / sizeGrid("w");
    totalTiles = gridSize[2] * gridSize[3];
}

//Makes a Space within the Grid
function makeGridSpace(x, y, id, borders) {
    x -= 0.5; //For Parsing Problems, return to "x -= 1"
    y -= 0.5; //For Parsing Problems, return to "y -= 1"
    let finalSpace;
    let winPendingId;
    let winTerms;
    let winValues;
    let winStyling;
    let winLogs = [];
    let defC = "none";
    let actC = changeGridColors("default");
    let op = gridOpacity();
    //let bd = "1px solid rgba(145,165,145,0.45)";
    let bd = cpVal("bd");
    let bb = ["brl", "brdr", "brt", "brb"];
    let bs = [bd, bd, bd, bd];
    if (borders[0] == false) bs[0] = "none"; //Left
    if (borders[1] == false) bs[1] = "none"; //Right
    if (borders[2] == false) bs[2] = "none"; //Top
    if (borders[3] == false) bs[3] = "none"; //Bottom
    let brr = ["brr", 0];
    let spbr = 5;
    if (id == 0) brr = ["brtl", spbr]; //Top-Left
    if (id == sizeGrid("r") - 1) brr = ["brbl", spbr]; //Bottom-Left
    if (id == (sizeGrid("r") - 1) * sizeGrid("c")) brr = ["brtr", spbr]; //Top-Right
    if (id == ((sizeGrid("r") - 1) * sizeGrid("c")) + (sizeGrid("c") - 1)) brr = ["brbr", spbr]; //Bottom-Right

    //Testing
    /*defC = 99 - id;
    if (defC <= 0) defC += 99;
    if (defC >= 100) defC -= 99;
    if (defC <= 9) defC = "0" + defC;
    defC = "#" + defC + "99" + defC;*/

    winPendingId = "GridSpace-D" + id;
    winTerms = ["pos", "br", "brr", "z", "w", "h", "user", "fs", "bg", "txt", "marl", "mart", bb[0], bb[1], bb[2], bb[3]];
    winValues = ["absolute", bd, 0, 5, sizeGrid("w"), sizeGrid("h"), "none", 18, "none", "center", x, y, bs[0], bs[1], bs[2], bs[3]];
    winStyling = cssMake(winValues, winTerms);
    winLogs[0] = logWin(overlay, winPendingId, "div", winStyling, [defC, defC], false, true, false, false);

    winPendingId = "GridSpace-CA" + id;
    winTerms = ["pos", "br", "bg", "w", "h", "marl", "mart", "z", "op", brr[0]];
    winValues = ["absolute", "none", "none", getParentInfo(winLogs[0].win, "w"), getParentInfo(winLogs[0].win, "h"),
        getParentInfo(winLogs[0].win, "marl"), getParentInfo(winLogs[0].win, "mart"), 2, op, brr[1]];
    winStyling = cssMake(winValues, winTerms);
    winLogs[1] = logWin(overlay, winPendingId, "canvas", winStyling, actC, false, false, false, false);

    winPendingId = "GridSpace-CB" + id;
    winTerms = ["pos", "br", "bg", "w", "h", "marl", "mart", "z", brr[0]];
    winValues = ["absolute", "none", "none", getParentInfo(winLogs[0].win, "w"), getParentInfo(winLogs[0].win, "h"),
        getParentInfo(winLogs[0].win, "marl"), getParentInfo(winLogs[0].win, "mart"), 1, brr[1]];
    winStyling = cssMake(winValues, winTerms);
    winLogs[2] = logWin(overlay, winPendingId, "canvas", winStyling, actC, false, false, false, false);

    finalSpace = {"id": id, "win": winLogs[0], "back": winLogs[1], "front": winLogs[2], "role": "none", "focused": false, "colored": "none"};

    return finalSpace;
}

//Determines if a Grid is Occupied
function checkGridOccupied(id) {
    if (typeof id == "string") id = getGridSpace(id, false);
    if (id.role == "none") return false;
    return true;
}

//Gets the ID for the GridSpace
function getGridSpaceId(id, numOnly) {
    if (typeof id == "object") id = (id.id).toString();
    if (id.toString().includes("GridSpace-")) id = id.toString().replace("GridSpace-", "");
    if (id.toString().includes("D")) id = id.toString().replace("D", "");
    if (id.toString().includes("CA")) id = id.toString().replace("CA", "");
    if (id.toString().includes("CB")) id = id.toString().replace("CB", "");

    for (let i = 0; i < grid.length; i++) {
        if (id == grid[i].id || id == grid[i].win.win.id || id == grid[i].back.win.id || id == grid[i].front.win.id) {
            if (numOnly) {
                return i;
            } else {
                return grid[i];
            }
        }
    }

    return "none";
}

//Returns the Default Selection Opacity for a Grid Space
function gridOpacity() {
    return 0.25;
}

//Returns the Selection Animation Cycle Details for the Selected Grid Space
function focusGridTile(id) {
    if (id != -1) {
        let box = grid[id].back.win;
        let incr = 0.003;
        let duration = fps * 3;
        let pivot = (duration / 2) + 0.5;
        let aStage = globalAnimationCycle % duration;
        let result = gridOpacity();

        if (aStage > pivot) {
            result = result + (incr * pivot) - (incr * (aStage - pivot));
        } else {
            result += (incr) * (aStage);

        }
        styleWin(box, result, "opacity");
    }
}

//Changes the Grid Selection
function changeGridSelection(id) {
    let space = getGridSpaceId(id, true);
    let tile = getGridSpaceId(id, false);
    let colors;
    let box;

    if (selected != -1) {
        box = grid[selected].back.win;
        grid[selected].back.colors = changeGridColors("default");
        colors = checkWinLog(box.id, false).colors;
        styleWin(box, colors[1], "background");
        //styleWin(box, gridOpacity(), "opacity");
        grid[selected].focused = false;
    }

    if (selected != space) {
        box = getGridSpaceId(id, false).back.win;
        getGridSpaceId(id, false).back.colors = changeGridColors("pixelMaker");
        colors = checkWinLog(box.id, false).colors;
        styleWin(box, colors[0], "background");
        selected = space;
        tile.focused = true;
        makeColorPopup(id);
        modGridColor(id);
        updateCDW();
    } else {
        selected = -1;
        clearPal();
    }
        
}

//Returns a Set of Colors for a Grid's Status
function changeGridColors(status) {
    let result = ["lightyellow", "none"]; //Default

    if (status == "pixelMaker") result = [cpVal("fc"), "none"];
    if (status == "ccb") result = ["slategray", "darkslategray"];
    if (status == "cdw") result = ["lightyellow", "lightyellow"];
    if (status == "scb") result = ["lightgray", "darkgray"];

    return result;
}

//Resets the Colors of All Grid Spaces
function resetGridColors() {
    for (let i = 0; i < totalTiles; i++) {
        let tile = grid[i];
        tile.colors = changeGridColors("default");
    }
}

//Modifies the Color of the Grid Space
function modGridColor(id) {
    let space = getGridSpaceId(id, false);
    let tile = getGridSpaceId(id, true);
    let colors;
    let box;

    if (space.colored == "none") {
        space.colored = settings[1];
        styleWin(space.front.win, settings[1], "background-color");
    } else {
        settings[1] = space.colored;
    }
}

//Adjusts a Value for a Color in Grid Interaction
function cycleColor(filled, value, mod) {
    let range = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "a", "b", "c", "d", "e", "f"];
    let current = "none";
    let result;
    for (let i = 0; i < range.length; i++) {
        if (filled.substr(value, 1) == range[i].toString()) current = i;
    }

    if (current == "none") return;

    result = current + mod;
    if (result >= range.length) result -= range.length;
    if (result < 0) result += range.length;

    return range[result];
}

//Cycles Color Changes for Selected Tile
function cycleTile(id, value, mod) {
    let space = getGridSpaceId(id, false);
    let filled = space.colored.replace("#","");
    let result = "#";

    for (let i = 0; i < filled.length; i++) {
        if (value != i) {
            result += filled[i];
        } else {
            result += cycleColor(filled, value, mod);
        }
    }

    space.colored = result;
    styleWin(space.front.win, result, "background-color");
}

//Determines if Space is a Cycle Button
function checkCycleButton(id) {
    if (id.includes("CCB")) return true;
    return false;
}

//Gets the Cycle Button Value
function getCycleButtonNum(id) {
    let num = id.substr(id.length - 1, 1);
    let pos = id.substr(id.length - 2, 1);
    if (pos == "U") {
        pos = 1;
    } else {
        pos = -1;
    }

    return [num, pos];
}

//Determines if Space is a Secondary Button
function checkSecButton(id) {
    if (id.includes("SCB")) return true;
    return false;
}

//Gets the Secondary Button Value
function getSecButtonNum(id) {
    let num = id.substr(id.length - 1, 1);

    return num;
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
//Colorized Functions
//------------------------------------------------------------------------------------------------------------------------------------------------------

//Actions for Pressing Keys
function presser(e) {
    if (e.code == "Space") {
        revertAll();
    }
}

//Applied Results for Clicking a Designated Window
function clickResults(id, box, wind) {

    //General Grid Selection
    if (getGridSpaceId(id, true) != "none") {
        changeGridSelection(id);
    }

    //Color Cycler
    if (checkCycleButton(id)) {
        cycleTile(grid[selected].win.id, getCycleButtonNum(id)[0], getCycleButtonNum(id)[1]);
        updateCDW();
        settings[1] = getGridSpaceId(grid[selected].win.id, false).colored;
    }

    //Secondary Buttons
    if (checkSecButton(id)) {
        let num = getSecButtonNum(id);
        if (num == 0) {
            revertTile(selected);
        } else if (num == 1) {
            printGrid();
        } else if (num == 2) {
            gridShow();
        }
    }
}

//Gets the Location for the ColorPopup Window
function getCpSpot(id) {
    let num = getGridSpaceId(id, true);
    let space = getGridSpaceId(id, false).win.win;
    let styling = space.style;
    let x = propMin(styling[cssAbb("marl")]) + propMin(styling[cssAbb("w")]);
    let y = propMin(styling[cssAbb("mart")]) - (cpVal("h") + cpVal("weight"));

    if ((x + cpVal("w")) > boardWidth) {
        x = propMin(styling[cssAbb("marl")]) - (cpVal("w") + cpVal("weight"));
    }
    if (y < 0) {
        y = (propMin(styling[cssAbb("mart")]) + propMin(styling[cssAbb("h")]));
    }

    return [x, y];
}

//Creates a Window for Color Selection
function makeColorPopup(space) {
    clearPal();
    let winPendingId;
    let winTerms;
    let winValues;
    let winStyling;
    let fc = cpVal("fc");
    let bd = cpVal("weight") + "px solid " + fc;
    let loc = getCpSpot(space);
    let w = cpVal("w");
    let h = cpVal("h");
    let c = settings[1];

    winPendingId = "colorPal";
    winTerms = ["pos", "br", "brr", "z", "w", "h", "user", "fs", "bg", "txt", "marl", "mart", "c"];
    winValues = ["absolute", bd, 2, 6, w, h, "none", 10, c, "center", loc[0], loc[1], fc];
    winStyling = cssMake(winValues, winTerms);
    logWin(overlay, winPendingId, "div", winStyling, [c, c], false, false, false, false);

    for (let i = 0; i < cpVal("b"); i++) {
        makeCCB(i, true);
        makeCCB(i, false);
        makeCDW(i);
    }
}

//Returns Dimensions for ColorPopup Element
function cpVal(value) {
    if (value == "w" || value == "width") return 141;
    if (value == "h" || value == "height") return 82;
    if (value == "weight") return 3;
    if (value == "b" || value == "buttons") return 6;
    if (value == "s" || value == "settings") return 3;
    if (value == "bd" || value == "border") return "1px solid rgba(145,165,145,0.45)";
    if (value == "fc" || value == "color") {
        let val = settings[1].replace("#", "");
        let vals = [0, 0, 0];
        vals[0] = val.substr(0, 2);
        vals[1] = val.substr(2, 2);
        vals[2] = val.substr(4, 2);

        for (let i = 0; i < vals.length; i++) {

            if (isNaN(parseInt(vals[i]))) {
                vals[i] == "00";
            } else {
                vals[i] = Math.abs(99 - parseInt(vals[i]));
            }

            if (vals[i] == 0) {
                vals[i] = "00";
            } else if (vals[i] < 10) {
                vals[i] = "0" + vals[i].toString();
            }
        }
        return "#" + vals[0] + vals[1] + vals[2];
    }
    return "none";
}

//Makes a Color Change Button
function makeCCB(id, up) {
    let winPendingId;
    let winTerms;
    let winValues;
    let winStyling;

    let parent = checkWinLog("colorPal", false).win;
    let c = "white";
    let cc = changeGridColors("ccb");
    let total = cpVal("b");
    let w = 20;
    let h = 15;
    let spacer = (cpVal("w") - (total * w)) / (total + 1);
    let message = "↑";
    let x = (id * w) + ((id + 1) * spacer);
    let y = spacer;

    winPendingId = "CCB-";
    if (up != true) {
        y += (spacer * 3) + (h * 2);
        message = "↓";
        winPendingId += "D";
    } else {
        winPendingId += "U";
    }
    winPendingId = winPendingId + id;
    winTerms = ["pos", "br", "brr", "z", "w", "h", "user", "fs", "bg", "txt", "l", "t", "c"];
    winValues = ["absolute", "none", 2, 6, w, h, "none", 10, cc[0], "center", x, y, c];

    winStyling = cssMake(winValues, winTerms);
    logWin(parent, winPendingId, "div", winStyling, [cc[0], cc[1]], true, true, false, false);
    winds[winds.length - 1].win.innerText = message;

    //Secondary Color Buttons
    let level = y + spacer + h + 1;
    if (id == cpVal("b") - 1 && up == false) makeAllSCBs(level);
}

//Makes a Color Display Window
function makeCDW(id) {

    let winPendingId;
    let winTerms;
    let winValues;
    let winStyling;

    let parent = checkWinLog("colorPal", false).win;
    let c = "black";
    let cc = changeGridColors("cdw");
    let total = cpVal("b");
    let w = 20;
    let h = 15;
    let spacer = (cpVal("w") - (total * w)) / (total + 1);
    let message = getGridSpaceId(selected, false).colored.replace("#", "").substr(id, 1);
    let x = (id * w) + ((id + 1) * spacer);
    let y = (spacer * 2) + h;

    winPendingId = "CDW-" + id;
    winTerms = ["pos", "br", "brr", "z", "w", "h", "user", "fs", "bg", "txt", "l", "t", "c", "padt"];
    winValues = ["absolute", "none", 2, 6, w, h, "none", 12, cc[0], "center", x, y, c, 2];
    winStyling = cssMake(winValues, winTerms);
    logWin(parent, winPendingId, "div", winStyling, [cc[0], cc[1]], false, false, false, false);
    winds[winds.length - 1].win.innerText = message;
}

//Updates Color Display Windows
function updateCDW() {
    for (let i = 0; i < cpVal("b"); i++) {
        let cdw = checkWinLog("CDW-" + i, false);
        if (checkWinLog != "none") {
            let win = cdw.win;
            let message = getGridSpaceId(selected, false).colored.replace("#", "").substr(i, 1);
            win.innerText = message;
        }
    }
}

//Creates Secondary Color Change Buttons
function makeAllSCBs(level) {
    makeSCB(0, "Clear", level);
    makeSCB(1, "Print", level);
    makeSCB(2, "Grid", level);
}

//Creates an Individual, Secondary Color Change Button
function makeSCB(pos, name, y) {

    let winPendingId;
    let winTerms;
    let winValues;
    let winStyling;

    let parent = checkWinLog("colorPal", false).win;
    let c = "black";
    let cc = changeGridColors("scb");
    let total = cpVal("s");
    let w = 40;
    let h = 15;
    let spacer = (cpVal("w") - (total * w)) / (total + 1);
    let x = (pos * w) + ((pos + 1) * spacer);

    winPendingId = "SCB-" + pos;
    winTerms = ["pos", "br", "brr", "z", "w", "h", "user", "fs", "bg", "txt", "l", "t", "c", "padt"];
    winValues = ["absolute", "none", 2, 6, w, h, "none", 12, cc[0], "center", x, y, c, 2];
    winStyling = cssMake(winValues, winTerms);
    logWin(parent, winPendingId, "div", winStyling, [cc[0], cc[1]], true, true, false, false);
    winds[winds.length - 1].win.innerText = name;
}

//Changes Grid Display to Show / Hide
function gridShow() {
    let bd = cpVal("bd");
    if (settings[2] == false) {
        settings[2] = true;
    } else {
        settings[2] = false;
        bd = "none";
    }

    for (let i = 0; i < sizeGrid("r"); i++) {
        for (let i2 = 0; i2 < sizeGrid("c"); i2++) {
            let i3 = (i * sizeGrid("r")) + i2;
            if (i != 0 || bd == "none") styleWin(grid[i3].win.win, bd, "border-left");
            if (i2 != sizeGrid("r") - 1 || bd == "none") styleWin(grid[i3].win.win, bd, "border-bottom");
        }
    }
}

//Prints the Grid to the Console
function printGrid() {
    let result = [];
    let message = "";
    for (let i = 0; i < sizeGrid("r"); i++) {
        result[i] = [];
        for (let i2 = 0; i2 < sizeGrid("c"); i2++) {
            let i3 = drawSpot(i2, i, sizeGrid("r"));
            result[i][i2] = grid[i3].colored;
        }
    }

    result = removeArtBlanks(makeDrawing(result, true)).original;
    if (settings[3] == true) result = makePlaceHolders(result);

    if (settings[0] == true) message = svn + " += 1;\n" + mvn + "[" + svn + "] = [];\n";
    for (let i = 0; i < result.length; i++) {
        if (i != 0) message += "\n";
        if (settings[0] == true) message += mvn + "[" + svn + "][" + mvn + "[" + svn + "].length] = [";
        for (let i2 = 0; i2 < result[0].length; i2++) {
            let i3 = (i2, i, result[0].length);
            if (i2 != 0) message += ", ";
            if (settings[3] == true) {
                message += result[i][i2];
            } else {
                message += "\"" + result[i][i2] + "\"";
            }
        }
        message += "];";
    }

    console.log(message);
}

//Clears the Background of a Tile
function revertTile(id) {
    if (selected != -1) changeGridSelection(selected);
    grid[id].front.win.style["background-color"] = "";
    grid[id].colored = "none";
}

//Removes the Palette and Associated Windows
function clearPal() {
    for (let i = 0; i < cpVal("b"); i++) {
        clearWin("CDW-" + i, false);
    }

    for (let i = 0; i < cpVal("s"); i++) {
        clearWin("SCB-" + i, false);
    }

    clearWin("colorPal", false);
}

//Clears the Backgrounds of All Tiles
function revertAll() {
    for (let i = 0; i < grid.length; i++) {
        revertTile(i);
    }
    settings[1] = "#ffffff";
}

//Replaces Constant Colors with Placeholders
function makePlaceHolders(drawn) {
    let terms = [];
    let slots = [];
    let counter = 0;
    let result = [];

    slots[counter] = counter;
    terms[counter] = "none";
    counter += 1;

    for (let i = 0; i < drawn.length; i++) {
        result[i] = [];
        for (let i2 = 0; i2 < drawn[i].length; i2++) {
            let untermed = true;
            for (let i3 = 0; i3 < counter; i3++) {
                if (terms[i3] == drawn[i][i2]) {
                    untermed = false;
                    result[i][i2] = slots[i3];
                }
            }
            if (untermed == true) {
                slots[counter] = counter;
                terms[counter] = drawn[i][i2];
                result[i][i2] = slots[counter];
                counter += 1;
            }
        }
    }

    console.log(result);
    return result;

}

//------------------------------------------------------------------------------------------------------------------------------------------------------
//Simple Functions
//------------------------------------------------------------------------------------------------------------------------------------------------------

//(De)activate User Input
function activate(state) {
    gameActive = state;
}

//Returns a Random Value Between Specified Values
function rng(min, max) {
    max += 1 - min;
    let result = Math.floor(Math.random() * max);
    result += min;
    return result;
}

//Randomly Returns a Positive or Negative for the Value
function plusMinus(value) {
    let change = rng(0, 1);
    if (change == 0) {
        return value;
    } else {
        return value * -1;
    }
}

//Randomly Returns True or False
function trueFalse() {
    let result = plusMinus(1);
    if (result > 0) {
        return true;
    } else {
        return false;
    }
}

//Determines if Objects' Spaces Overlap
function checkCollision(ax, ay, aw, ah, bx, by, bw, bh) {
    let hits = false;
    if (ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by) {
        hits = true;
    }
    return hits;
}

//Returns the Numeric Value for a Letter or Letter Value for a Number -- New
function alNum(value) {
    let result = value;
    let letters = "abcdefghijklmnopqrstuvwxyz";
    let nums = [];
    for (let i = 0; i < letters.length; i++) {
        nums[i] = i;
    }

    for (let i = 0; i < letters.length; i++) {
        if (isNaN(parseInt(value) == NaN)) {
            if (value == letters.substr(i, 1).toLowerCase()) result = nums[i];
        } else {
            if (parseInt(value) == nums[i]) result = letters[i].toUpperCase();
        }
    }

    return result;
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
//Update Functions
//------------------------------------------------------------------------------------------------------------------------------------------------------

function update() {
    makeEvents();
    makeRepeats();
    animationUpdate();
    gridFocusUpdate();

    /*if (globalAnimationCycle == 2) {
        makeAnimation(testAnimation3(-1), -1, 200, 200, context, 20, "test3", 10);
    }*/

    /*if (globalAnimationCycle == 4) {
        let colorz = ["none", "red", "blue", "green", "yellow"];
        makeAnimation(testAnimation(colorz, -1), -1, 100, 100, context, 10, "test1", 10);
        colorz = ["none", "green", "yellow", "red", "blue"];
        addAnimation(removeAnimBlanks(makeStaticAnimation(testAnimation(colorz, -1), -1, 300, 300, context, 10, "test2", 10)));
    }*/

    //Final
    requestAnimationFrame(update);
}

//Clears and Animates
function animationUpdate() {
    globalAnimationCycle += 1;

    if (animatedZones.length > 0) {
        for (let i = 0; i < animatedZones.length; i++) {
            if (animatedZones[i] != undefined) {
                animatedZones[i].clearRect(0, 0, boardWidth, boardHeight);
            } else {
                animatedZones[i] = animatedZones[animatedZones.length - 1];
                animatedZones.pop();
                i -= 1;
            }
        }
    }

    if (animationsList.length > 0) {
        for (let i = 0; i < animationsList.length; i++) {
            drawAnimation(animationsList[i]);
        }
    }

    if (moverList.length > 0) {
        for (let i = 0; i < moverList.length; i++) {
            moveMover(moverList[i]);
        }
    }

    updateCleanup();
}

//Cleans Up Spent Animations
function updateCleanup() {
    if (animationsList.length > 0) {
        for (let i = 0; i < animationsList.length; i++) {
            if (animationsList[i].looping == 0) {
                removeAnimation(animationsList[i]);
                /*if (animationsList.length <= 1) {
                    animationsList = [];
                } else {
                }*/
            }
        }
    }

    if (moverList.length > 0) {
        for (let i = 0; i < moverList.length; i++) {
            if (moverList[i].current >= moverList[i].frames) {
                removeMover(moverList[i]);
                /*if (moverList.length <= 1) {
                    moverList = [];
                } else {
                }*/
            }
        }
    }

    //if (moverList.length < 1) moverList = [];
    //if (animationsList.length < 1) animationsList = [];
}

//Shows Focused Tiles
function gridFocusUpdate() {
    for (let i = 0; i < totalTiles; i++) {
        let tile = grid[i];
        if (tile.focused == true) {
            focusGridTile(i);
        } else {
            tile.back.win.style[cssAbb("op")] = gridOpacity();
        }
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
//Primary Window Functions
//------------------------------------------------------------------------------------------------------------------------------------------------------

//Deletes a Specified Document Element
function clearWin(win, killHelper) {
    let box;
    let log;
    let logNum;
    let support;

    if (typeof win == "string") {
        box = document.getElementById(win);
        log = checkWinLog(win, false);
        logNum = checkWinLog(win, true);
    } else if (typeof win == "object") {
        box = document.getElementById(win.id);
        log = checkWinLog(document.getElementById(win.id), false);
        logNum = checkWinLog(box, true);
    }

    if (box == null) return;

    if (log.title != undefined && log.title != false) {
        support = document.getElementById(log.title);
        support.parentNode.removeChild(support);
    }
    if (log.helper != undefined && log.helper != false && killHelper == true) {
        support = document.getElementById(log.helper);
        support.parentNode.removeChild(support);
    }

    if (box.nodeName.toLowerCase() == "canvas" || log.canvas != false) {
        let checked;
        if (box.nodeName.toLowerCase() != "div") {
            checked = box.getContext("2d");
        } else {
            checked = log.canvas.getContext("2d");
        }

        for (let i = 0; i < animatedZones.length; i++) {
            if (animatedZones[i] == checked) {
                animatedZones[i] = animatedZones[animatedZones.length - 1];
                animatedZones.pop();
                i -= 1;
            }
        }
    }

    box.parentNode.removeChild(box);
    winds[logNum] = winds[winds.length - 1];
    winds.pop();
}

//Modifies an Existing Window's CSS Style
function styleWin(win, styling, part) {
    win.style[part] = styling;
}

//Creates and Returns a New Window
function createWin(parent, id, type, styling) {
    let newWindow = parent.appendChild(document.createElement(type));
    newWindow.id = id;
    styleWin(newWindow, styling, "cssText");
    return newWindow;
}

//Determines if px Should be Added After a Number
function addPX(checked, topic) {
    let result = "; ";
    let attempt = isNaN(parseInt(checked));
    if (attempt != true && isException(checked, topic) == false) {
        result = "px" + result;
    }
    return result;
}

//Determines if an Exception Should be Made to Adding px After a Number
function isException(checked, topic) {
    if (checked.toString().includes("px")) return true;
    if (cssAbb(topic) == "z-index") return true;
    if (cssAbb(topic).includes("opacity")) return true;
    return false;
}

//Deduces Abbreviations for Common CSS Terms
function cssAbb(term) {
    if (term == "br") return "border";
    if (term == "brr") return "border-radius";
    if (term == "brt") return "border-top";
    if (term == "brb") return "border-bottom";
    if (term == "brl") return "border-left";
    if (term == "brdr") return "border-right";
    if (term == "brtl") return "border-top-left-radius";
    if (term == "brtr") return "border-top-right-radius";
    if (term == "brbl") return "border-bottom-left-radius";
    if (term == "brbr") return "border-bottom-right-radius";
    if (term == "z") return "z-index";
    if (term == "t") return "top";
    if (term == "l") return "left";
    if (term == "w") return "width";
    if (term == "h") return "height";
    if (term == "c") return "color";
    if (term == "txt") return "text-align";
    if (term == "user") return "user-select";
    if (term == "fs") return "font-size";
    if (term == "pos") return "position";
    if (term == "mar") return "margin";
    if (term == "mart") return "margin-top";
    if (term == "marl") return "margin-left";
    if (term == "pad") return "padding";
    if (term == "padl") return "padding-left";
    if (term == "padt") return "padding-top";
    if (term == "bg") return "background";
    if (term == "op") return "opacity";
    return term;
}

//Creates a Component of CSS Text
function cssCombine(value, term) {
    let result = cssAbb(term) + ": " + value + addPX(value, term);
    return result;
}

//Uses Arrays to Form CSS Text
function cssMake(values, terms) {
    let result = "";
    let cycles = terms.length;
    if (values.length > terms.length) cycles = values.length;

    for (let i = 0; i < cycles; i++) {
        result += cssCombine(values[i], terms[i]);
    }
    return result.toString();
}

//Adds a New Window with Specified Properties to the Global List
function logWin(parent, id, type, styling, colors, hoverable, clickable, centered, canvased) {
    let winNum = winds.length;
    let newWin = createWin(parent, id, type, styling);
    if (colors != "none") styleWin(newWin, colors[1], "background-color");
    let newCanvas = false;

    //Specialized Properties
    if (hoverable) {
        newWin.addEventListener("mouseover", highlight);
        newWin.addEventListener("mouseout", unhighlight);
    }

    if (clickable) {
        newWin.addEventListener("click", clicked);
    }

    if (centered) {
        let area = [getParentInfo(parent,"w"), getParentInfo(parent,"h")];
        styleWin(newWin, centerWin(newWin.style.width, newWin.style.height, area[0], area[1])[0], "margin-left");
        styleWin(newWin, centerWin(newWin.style.width, newWin.style.height, area[0], area[1])[1], "margin-top");
    }

    if (canvased) {
        let cstyle = [];
        cstyle[0] = ["pos", "br", "bg", "w", "h", "l", "t"];
        cstyle[1] = ["absolute", "none", "none", getParentInfo(newWin, "w"), getParentInfo(newWin, "h"), 0, 0];
        let cstyling = cssMake(cstyle[1], cstyle[0]);
        newCanvas = createWin(newWin, id + "-canvas", "canvas", cstyling);
    }

    //Final
    winds[winNum] = {
        "win": newWin, "id": id, "colors": colors, "hover": hoverable, "title": false, "helper": false, "buttons": false,
        "canvas": newCanvas, "info": ""
    };
    return winds[winNum];
}

//Determines Which Window's Log is Present
function checkWinLog(id, numOnly) {
    for (let i = 0; i < winds.length; i++) {
        if (typeof id == "object") {
            if (winds[i].win == id) {
                if (numOnly == false) {
                    return winds[i]; //Returns the entire object
                } else {
                    return i; //Returns only the object's ID#
                }
            }
        } else {
            if (winds[i].id == id) {
                if (numOnly == false) {
                    return winds[i]; //Returns the entire object
                } else {
                    return i; //Returns only the object's ID#
                }
            }
        }
    }

    return false;
}

//Creates Companion Windows for a Primary Window
function makeSupportWin(id, type, text) {
    let winNum = checkWinLog(id, true);
    let parent = winds[winNum].win;
    let parentLog = winds[winNum];
    let winPendingId;
    let winTerms;
    let winValues;
    let winStyling;
    let base = parent;
    let newColors = ["lightgray", "darkgray"];
    let details = [false, false, false, false];
    let newW;
    let newH;

    //Detail Support Window
    if (type == "helper") {
        base = overlay;
        winPendingId = parent.id + "-helper";
        newColors = parentLog.colors;
        newW = getParentInfo(parent, "w");
        newH = getParentInfo(parent, "h");
        winTerms = ["pos", "br", "brr", "z", "w", "h", "user", "fs", "bg", "txt", "marl", "mart"];
        winValues = ["absolute", "1px solid black", 3, 5, newW, newH, "none", 18, newColors[1],
            "center", getParentInfo(parent, "marl"), getParentInfo(parent, "mart")];
    } else if (type == "title") {
        base = overlay;
        winPendingId = parent.id + "-title";
        //newColors = parentLog.colors;
        newColors = ["#171717", "#171717"];
        newW = getParentInfo(parent, "w");
        newH = 38;
        winTerms = ["pos", "br", "brr", "z", "w", "h", "user", "fs", "bg", "txt", "marl", "mart", "opacity", "color", "padt"];
        winValues = ["absolute", "1px solid black", getParentInfo(parent, "brr"), 5, newW, newH, "none", 28, "black",
            "center", getParentInfo(parent, "marl"), getParentInfo(parent, "mart"), 0.95, "white", 2];
    } else {
        details = [true, true, true, false];
        if (winds[winNum].buttons == false) {
            winPendingId = parent.id + "-button" + 0;
        } else {
            winPendingId = parent.id + "-button" + winds[winNum].buttons.length;
        }
        newW = 100;
        newH = 28;
        winTerms = ["pos", "br", "brr", "z", "w", "h", "user", "fs", "bg", "txt", "l", "t", "opacity"];
        winValues = ["absolute", "1px solid #505050", 1, 6, newW, newH, "none", 24, newColors[1],
            "center", 0, 0, 0.9];
    }

    //Create Support Window
    winStyling = cssMake(winValues, winTerms);
    let supportLog = logWin(base, winPendingId, "div", winStyling, newColors, details[0], details[1], details[2], details[3]);
    let supportWin = supportLog.win;
    let modStyle = supportWin.style;
    let supportId = supportWin.id;

    //Update Support Window Logs
    if (type == "helper") {
        winds[winNum].helper = supportId;

        let modMarl = (propMin(modStyle[cssAbb("marl")]) - propMin(modStyle[cssAbb("w")]) * 1.1) + "px";
        styleWin(supportWin, modMarl, cssAbb("marl"));
    } else if (type == "title") {
        winds[winNum].title = supportId;
        supportWin.innerText = text;

        let modMart = (propMin(modStyle[cssAbb("mart")]) - (propMin(modStyle[cssAbb("h")]) + propMin(modStyle[cssAbb("padt")]))) + "px";
        styleWin(supportWin, modMart, cssAbb("mart"));
        styleWin(parent, "0px", cssAbb("brtl"));
        styleWin(parent, "0px", cssAbb("brtr"));
        styleWin(supportWin, "0px", cssAbb("brbl"));
        styleWin(supportWin, "0px", cssAbb("brbr"));
        styleWin(supportWin, parent.style["border"], "border");
        styleWin(parent, "none", cssAbb("border-top"));
        styleWin(supportWin, "none", cssAbb("border-bottom"));
    } else {
        supportWin.innerText = text;
        let lower = propMin(getParentInfo(parent, "h")) - (10 + newH);

        if (winds[winNum].buttons == false) {
            winds[winNum].buttons = [];
            winds[winNum].buttons[0] = supportId;
            styleWin(document.getElementById(winds[winNum].buttons[0]), lower + "px", cssAbb("mart"));
        } else {
            winds[winNum].buttons[winds[winNum].buttons.length] = supportId;

            let spaces = getSpacing(propMin(getParentInfo(parent, "w")), false, newW, winds[winNum].buttons.length);
            for (let i = 0; i < winds[winNum].buttons.length; i++) {
                let buttonWin = document.getElementById(winds[winNum].buttons[i]);
                styleWin(buttonWin, spaces[i] + "px", cssAbb("marl"));
                styleWin(buttonWin, lower + "px", cssAbb("mart"));
                checkWinLog(buttonWin.id, false).info = buttonWin.innerText + "!"; //Placeholder Default Info
                checkWinLog(buttonWin.id, false).helper = parentLog.helper;
            }
        }

    }
}

//Removes Stray Info from Window Properties
function propMin(value) {
    let result = value.replace("px", "");
    result = parseFloat(result);
    return result;
}

//Returns Coordinates for Centering a Window within a Space
function centerWin(winW, winH, areaW, areaH) {
    winW = parseInt(winW);
    winH = parseInt(winH);
    areaW = parseInt(areaW);
    areaH = parseInt(areaH);
    let result = [(areaW / 2 - winW / 2).toString() + "px", (areaH / 2 - winH / 2).toString() + "px"];
    return result;
}

//Gets Valid Information from Parent Window
function getParentInfo(parent, term) {
    term = cssAbb(term);
    let result = parent[term];
    if (result == undefined) {
        result = parent.style[term];
    }
    return result;
}

//Generates an Array of Spacing Based on Given Data
function getSpacing(area, buffer, object, count) {
    let result = [];
    let space;

    if (buffer == false) {
        space = area / (object * count);
        buffer = (area % (object * count)) / (count + 1);
    } else {
        space = (area - (buffer * (count + 1))) / (object * count);
    }

    for (let i = 0; i < count; i++) {
        result[i] = ((space + object) * i) + (buffer * (i+1));
    }
    return result;
}

//Window Interactions for Hovering and Clicking
function highlight() {
    if (gameActive == false) return;
    let box = document.getElementById(this.id);
    let wind = checkWinLog(this.id, false);

    //Change Color
    let colors = checkWinLog(this.id, false).colors;
    styleWin(box, colors[0], "background-color");

    //Update Help Text
    if (wind.helper != false) {
        document.getElementById(wind.helper).innerText = wind.info;
    }
}

function unhighlight() {
    if (gameActive == false) return;
    let box = document.getElementById(this.id);
    let wind = checkWinLog(this.id, false);

    //Change Color
    let colors = checkWinLog(this.id, false).colors;
    styleWin(box, colors[1], "background-color");

    //Update Help Text
    if (wind.helper != false) {
        document.getElementById(wind.helper).innerText = "";
    }
}

function clicked() {
    if (gameActive == false) return;
    let box = document.getElementById(this.id);
    let wind = checkWinLog(this.id, true);

    clickResults(this.id, box, wind);
}

//Returns a Window Scaling Ratio for Uniform Boxes
function getRatio(value, isX) {
    let ratio = boardWidth / boardHeight;
    let result = value * ratio;
    if (isX) {
        return result;
    } else {
        return value;
    }
}

//Returns Centered Animation Coordinates
function centerAnim(target, anim, parent, x, y, alt) {
    let ar = getAnimRatio(anim, false);
    let ps = [propMin(parent.style.width), propMin(parent.style.height)];
    let result = centerWin(ar[0], ar[1], ps[0], ps[1]);
    let part = "mar";
    if (alt) part = "";
    let suffix;

    if (x) {
        suffix = part + "l";
        styleWin(target, result[0], cssAbb(suffix));
    }
    if (y) {
        suffix = part + "t";
        styleWin(target, result[1], cssAbb(suffix));
    }

    return result;
}

//Returns Orientation Based on Animation Scale
function getAnimRatio(anim, px) {
    let tilesX = anim.art[0].width - 1;
    let tilesY = anim.art[0].height - 1;

    let stillCheck = true;
    for (let i = 0; i < anim.art[0].width; i++) {
        if (checkBlank(i, anim.art[0], false) && stillCheck) {
            tilesX -= 1;
        } else {
            stillCheck = false;
        }
    }
    stillCheck = true;
    for (let i = anim.art[0].width - 1; i >= 0; i -= 1) {
        if (checkBlank(i, anim.art[0], false) && stillCheck) {
            tilesX -= 1;
        } else {
            stillCheck = false;
        }
    }

    stillCheck = true;
    for (let i = 0; i < anim.art[0].height; i++) {
        if (checkBlank(i, anim.art[0], true) && stillCheck) {
            tilesY -= 1;
        } else {
            stillCheck = false;
        }
    }
    stillCheck = true;
    for (let i = anim.art[0].height - 1; i >= 0; i -= 1) {
        if (checkBlank(i, anim.art[0], true) && stillCheck) {
            tilesX -= 1;
        } else {
            stillCheck = false;
        }
    }

    let x = tilesX * anim.localPixes;
    let y = tilesY * anim.localPixes;
    if (px) {
        x = x.toString() + "px";
        y = y.toString() + "px";
    }
    let results = [x, y];

    return results;
}

//Destroys Buttons Associated with a Window Log
function destroyButtons(log) {
    if (log.buttons != false) {
        if (log.buttons.length > 0) {
            for (let i = 0; i < log.buttons.length; i++) {
                let box = document.getElementById(log.buttons[i]);
                clearWin(box.id, false);
            }
            log.buttons = false;
        }
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
//Animation Functions
//------------------------------------------------------------------------------------------------------------------------------------------------------

//Draws an Image on a Canvas Using Color Blocks
function drawSprite(region, draws, artX, artY, localPixes) {
    if (localPixes == false) localPixes = pixes;
    let width = draws.width;
    let height = draws.height;
    let art = draws.art;

    for (let i = 0; i < height; i++) {
        for (let i2 = 0; i2 < width; i2++) {
            let i3 = (i2 * width) + i;
            if (art[i3] != 0 && art[i3] != "none") {
                region.fillStyle = art[i3];
                let x = artX + (i * localPixes);
                let y = artY + (i2 * localPixes);
                region.fillRect(x, y, localPixes, localPixes);
            }
        }
    }
}

//Returns an Ojbect to be Drawn
function makeDrawing(drawn, equalized) {
    let result = { "art": false, "width": drawn[0].length, "height": drawn.length, "original": drawn };
    result.art = drawnArray(drawn, result.width, result.height);
    if (equalized) result = equalizeDrawing(result);
    return result;
}

//Returns an Animated Series of Objects
function makeAnimation(drawings, looping, x, y, region, localPixes, id, frequency) {
    let result = makeStaticAnimation(drawings, looping, x, y, region, localPixes, id, frequency);
    addAnimation(result);
    return result;
}

//Returns an Animation Without Adding it to the Queue
function makeStaticAnimation(drawings, looping, x, y, region, localPixes, id, frequency) {
    let result = {
        "art": drawings, "cycles": drawings.length, "looping": looping, "x": x, "y": y, "region": region, "localPixes": localPixes, "id": id, "frequency": frequency,
        "current": -1, "special": "none"
    };
    return result;
}

//Draws an Animation
function drawAnimation(animation) {
    if (globalAnimationCycle % animation.frequency == 0) animation.current += 1;
    if (animation.current <= -1) animation.current = 0;

    if (animation.looping > 0 || animation.looping == -1) {
        if (animation.current >= animation.cycles) {
            if (animation.looping != -1) animation.looping -= 1;
            animation.current -= animation.cycles;
        }

        if (animation.looping != 0) {
            drawSprite(animation.region, animation.art[animation.current], animation.x, animation.y, animation.localPixes);
        }
    }
}

//Returns an Array Converting an Image from Drawn Spots
function drawnArray(drawn, width, height) {
    let result = [];
    for (let i = 0; i < height; i++) {
        for (let i2 = 0; i2 < width; i2++) {
            result[drawSpot(i, i2, height)] = drawn[i][i2];
        }
    }
    return result;
}

//Returns Index # for a Drawning Location
function drawSpot(x, y, height) {
    return (x * height) + y;
}

//Returns if a Row or Column is Blank in a Drawing
function checkBlank(id, drawn, isRow) {
    let art = drawn.original;
    let result = true;
    let checks = art.length;
    if (isRow) {
        checks = art[id].length;
    }

    for (let i = 0; i < checks; i++) {
        let checked = art[i][id];
        if (isRow) checked = art[id][i];
        if (checked != "none") result = false;
    }

    return result;
}

//Returns if an Element is Already Moving
function checkMover(elem) {
    let result = false;

    for (let i = 0; i < moverList.length; i++) {
        if (moverList[i].elem.id == elem) {
            result = true;
        }
    }

    return result;
}

//Makes an Element Mobile
function makeMover(elem, frames, distX, distY, frequency, alt) {
    let mx = distX / frames;
    let my = distY / frames;
    let result = { "elem": elem, "frames": frames, "distX": mx, "distY": my, "frequency": frequency, "alt": alt, "current": 0 };
    addMover(result);
    return result;
}

//Moves a Mobile Element
function moveMover(moved) {
    if (globalAnimationCycle % moved.frequency == 0 && moved.current < moved.frames) {
        let mover = moved.elem;
        let propX = cssAbb("marl");
        let propY = cssAbb("mart");
        if (moved.alt == true) {
            propX = cssAbb("l");
            propY = cssAbb("t");
        }
        let newX = propMin(mover.style[propX]) + moved.distX;
        let newY = propMin(mover.style[propY]) + moved.distY;
        newX += addPX(newX, propX);
        newY += addPX(newY, propY);
        newX = newX.replace(";", "");
        newY = newY.replace(";", "");

        moved.current += 1;
        if (moved.current <= -1) moved.current = 0;
        styleWin(mover, newX, propX);
        styleWin(mover, newY, propY);

        //Moves Titles for Windows with Them
        let moveLog = checkWinLog(mover.id, false);
        if (moveLog != false) {
            if (moveLog.title != false) {
                let moveTitle = document.getElementById(moveLog.title);
                propX = cssAbb("marl");
                propY = cssAbb("mart");
                if (moved.alt == true) {
                    propX = cssAbb("l");
                    propY = cssAbb("t");
                }
                newX = propMin(moveTitle.style[propX]) + moved.distX;
                newY = propMin(moveTitle.style[propY]) + moved.distY;
                newX += addPX(newX, propX);
                newY += addPX(newY, propY);
                newX = newX.replace(";", "");
                newY = newY.replace(";", "");
                styleWin(moveTitle, newX, propX);
                styleWin(moveTitle, newY, propY);
            }
        }
    }
}

//Returns an Altered Sprite Based on Input
function alterArt(drawn, type, full) {
    let template = drawn.original;
    let height = drawn.height;
    let width = drawn.width;
    let scope = template.length - 1;
    let result = [];
    let w = width - 1;
    let h = height - 1;

    for (let i = 0; i < height; i++) {
        result[i] = [];
        for (let i2 = 0; i2 < width; i2++) {
            let x = i;
            let y = i2;

            if (type == "rotate") {
                x = scope - i2;
                y = i;
            } else if (type == "flip") {
                let base = (i + 1) * w;
                let counter = (i * w) + i2;

                y = base - counter;
                x = i;
            }
            
            result[i][i2] = template[x][y];
        }
    }

    if (full) {
        result = makeDrawing(result, true);
    }

    return result;
}

//Returns Sprite Art Rotated by 90 Degrees
function rotateArt(drawn) {
    return alterArt(drawn, "rotate", true);
}

//Returns Sprite Art Flipped Across Y-Axis
function flipArt(drawn) {
    return alterArt(drawn, "flip", true);
}

//Returns an Art Sprite with Additional Columns and Rows Mirrored Across the X-Axis or Y-Axis
function mirrorArt(drawn, useX) {
    let template = drawn.original;
    let height = drawn.height;
    let width = drawn.width;
    let result = [];
    let w = width - 1;
    let h = height - 1;

    if (useX) {
        for (let i = 0; i < height; i++) {
            result[i] = [];
            let scope = template[i].length - 1;
            for (let i2 = 0; i2 < width; i2++) {
                result[i][i2] = template[i][i2];
            }
            for (let i2 = 0; i2 < width; i2++) {
                let bonus = width + i2;
                if (template.length % 2 != 0 && i2 != (parseInt(template.length / 2) + (template.length % 2))) {
                } else {
                    result[i][bonus] = template[i][scope - i2];
                }
            }
        }
        let totalParts = result[0].length;
        let addedParts = totalParts - width;
        for (let i = 0; i < addedParts; i++) {
            let truePart = height + i;
            result[truePart] = [];
            for (let i2 = 0; i2 < totalParts; i2++) {
                result[truePart][i2] = "none";
            }
        }
    } else {
        for (let i = 0; i < (height * 2); i++) {
            result[i] = [];
        }
        for (let i2 = 0; i2 < width; i2++) {
            for (let i = 0; i < height; i++) {
                result[i][i2] = template[i][i2];
            }
            for (let i = 0; i < height; i++) {
                let scope = template[i].length - 1;
                let bonus = height + i;
                if (template[0].length % 2 != 0 && i2 != (parseInt(template[0].length / 2) + (template[0].length % 2))) {
                } else {
                    result[bonus][i2] = template[scope - i][i2];
                }
            }
        }
        let totalParts = result.length;
        let addedParts = totalParts - width;
        for (let i2 = 0; i2 < addedParts; i2++) {
            let truePart = width + i2;
            for (let i = 0; i < totalParts; i++) {
                result[i][truePart] = "none";
            }
        }
    }

    result = makeDrawing(result, true);

    return result;
}

//Returns Animation Drawing Array Rotated by 90 Degrees
function rotateAnim(drawn) {
    for (let i = 0; i < drawn.art.length; i++) {
        drawn.art[i] = rotateArt(drawn.art[i]);
    }
    return drawn;
}

//Returns Animation Drawing Array Flipped Across Y-Axis
function flipAnim(drawn) {
    for (let i = 0; i < drawn.art.length; i++) {
        drawn.art[i] = flipArt(drawn.art[i]);
    }
    return drawn;
}

//Returns Animation Drawing Array Rotated Mirrored Across the X-Axis or Y-Axis
function mirrorAnim(drawn, useX) {
    for (let i = 0; i < drawn.art.length; i++) {
        drawn.art[i] = mirrorArt(drawn.art[i], useX);
    }
    return drawn;
}

//Adds an Animated Area to the Global List of Cleared Contexts
function addAnimationZone(region) {
    animatedZones[animatedZones.length] = region;
}

//Adds an Animation to the Global List
function addAnimation(animation) {
    animationsList[animationsList.length] = animation;
}

//Adds a Moved Element to the Global List
function addMover(mover) {
    moverList[moverList.length] = mover;
}

//Removes a Moved Element from the Global List
function removeMover(mover) {
    let id = "none";
    for (let i = 0; i < moverList.length; i++) {
        if (moverList[i] == mover) id = i;
    }

    if (id != "none") {
        if (id != moverList.length - 1) {
            moverList[id] = moverList[moverList.length - 1];
        }
        moverList.pop();
    }
}

//Removes an Animation from the Global List
function removeAnimation(animation) {
    let id = "none";
    for (let i = 0; i < animationsList.length; i++) {
        if (animationsList[i] == animation) id = i;
    }

    if (id != "none") {
        if (id != animationsList.length - 1) {
            animationsList[id] = animationsList[animationsList.length - 1];
        }
        animationsList.pop();
    }
}

//Returns a Drawing with Equal Width and Height
function equalizeDrawing(drawn) {
    let result = drawn;
    let template = result.original;

    if (drawn.width != drawn.height) {
        let diff = Math.abs(drawn.width - drawn.height);
        if (drawn.width > drawn.height) {
            for (let i = 0; i < diff; i++) {
                template[template.length] = [];
                for (let i2 = 0; i2 < template[i].length; i2++) {
                    template[template.length - 1][i2] = "none";
                }
            }
        } else {
            for (let i = 0; i < template.length; i++) {
                for (let i2 = 0; i2 < diff; i2++) {
                    template[i][template[i].length] = "none";
                }
            }
        }
    }
    result.art = drawnArray(template, template[0].length, template.length);
    result.width = template[0].length;
    result.height = template.length;
    result.original = template;

    return result;
}

//Returns the True Width and Height Recognizing Blank Space for a Drawing
function trueDrawDimensions(drawn) {
    let checklist = drawn.original;
    let trueWidth = drawn.width;
    let trueHeight = drawn.height;
    let h = drawn.height - 1;
    let w = drawn.width - 1;

    let checking = true;
    //Height Test
    for (let i = 0; i < drawn.height; i++) {
        let checked = h - i;
        let valid = true;
        for (let i2 = 0; i2 < drawn.width; i2++) {
            if (checking) {
                if (checklist[checked][i2] != "none") {
                    valid = false;
                    checking = false;
                }
            }
        }
        if (valid && checking) trueHeight -= 1;
    }

    //Width Test
    checking = true;
    for (let i2 = 0; i2 < drawn.width; i2++) {
        let checked = w - i2;
        let valid = true;
        for (let i = 0; i < trueHeight; i++) {
            if (checking) {
                if (checklist[i][checked] != "none") {
                    valid = false;
                    checking = false;
                }
            }
        }
        if (valid && checking) trueWidth -= 1;
    }

    //Final
    return [trueWidth, trueHeight];
}

//Returns the True Width and Height Recognizing Blank Space for an Animation
function trueAnimDimensions(drawn) {
    let trueWidth = trueDrawDimensions(drawn.art[0])[0];
    let trueHeight = trueDrawDimensions(drawn.art[0])[1];

    if (drawn.art.length > 1) {
        for (let i = 1; i < drawn.art.length; i++) {
            let sizes = trueDrawDimensions(drawn.art[i]);

            if (sizes[0] > trueWidth) {
                trueWidth = sizes[0];
            }

            if (sizes[1] > trueHeight) {
                trueHeight = sizes[1];
            }
        }
    }

    return [trueWidth, trueHeight];
}

//Removes Unnecessary Blank Space in a Drawing -- New
function removeArtBlanks(drawn) {
    let result = [];

    for (let i = 0; i < drawn.height; i++) {
        let valid = false;
        for (let i2 = 0; i2 < drawn.width; i2++) {
            if (drawn.original[i][i2] != "none") valid = true;
        }
        if (valid == true) result[result.length] = drawn.original[i];
    }

    let cols = [];
    for (let i2 = 0; i2 < drawn.width; i2++) {
        cols[i2] = false;
        for (let i = 0; i < result.length; i++) {
            if (result[i][i2] != "none") {
                cols[i2] = true;
            }
        }
    }

    let originalCols = [];
    for (let i = 0; i < cols.length; i++) {
        originalCols[i] = cols[i];
    }

    for (let i = 0; i < result.length; i++) {
        for (let i2 = 0; i2 < result[i].length; i2++) {
            if (cols[i2] == false) {
                for (let i3 = i2 - 0; i3 < result[i].length - i2; i3++) {
                    if (i3 != result[i].length - i2 - 1) {
                        result[i][i3] = result[i][i3 + 1];
                        if (i3 != cols.length - 1) cols[i3] = cols[i3 + 1];
                    }
                }
                result[i].pop();
                cols.pop();
                i2 -= 1;
            }
        }
        for (let i = 0; i < originalCols.length; i++) {
            cols[i] = originalCols[i];
        }
    }

    return makeDrawing(result, false);
}

//Returns an Animation with Unnecessary Blanks Spaces Removed -- New
function removeAnimBlanks(drawn) {
    if (drawn.art.length > 1) {
        for (let i = 0; i < drawn.art.length; i++) {
            drawn.art[i] = removeArtBlanks(drawn.art[i]);
        }
    }

    return drawn;
}


//------------------------------------------------------------------------------------------------------------------------------------------------------
//Queued Event Functions
//------------------------------------------------------------------------------------------------------------------------------------------------------

//Applies Global Events
function makeEvents() {
    if (eventQueue.length > 0) {
        for (let i = 0; i < eventQueue.length; i++) {
            if (eventQueue[i].when == globalAnimationCycle) {
                eventQueue[i].action.apply(this, eventQueue[i].params);
                eventQueue[i] = eventQueue[eventQueue.length - 1];
                eventQueue.pop();
                i -= 1;
            }
        }
    }
}

//Queues an Event for a Future Frame
function queueEvent(delay, action, params) {
    let when = globalAnimationCycle + delay;
    let result = { "when": when, "action": action, "params": params };
    addEventQueue(result);
}

//Adds an Event to the Global Queue
function addEventQueue(event) {
    eventQueue[eventQueue.length] = event;
}

//Applies Global Repeats
function makeRepeats() {
    if (repeatQueue.length > 0) {
        for (let i = 0; i < repeatQueue.length; i++) {
            if (globalAnimationCycle % repeatQueue[i].when == 0) {
                repeatQueue[i].action.apply(this, repeatQueue[i].params);
            }
        }
    }
}

//Queues a Repeat for a Future Frame
function queueRepeat(id, when, action, params) {
    //let result = { "when": when, "action": action, "params": params };
    let result = { "id": id, "when": when, "action": action, "params": params };
    addRepeatQueue(result);
}

//Adds a Repeat to the Global Queue
function addRepeatQueue(repeat) {
    repeatQueue[repeatQueue.length] = repeat;
}

//Removes a Repeat from the Global Queue
function removeRepeatQueue(repeat) {
    let id = "ignore";
    for (let i = 0; i < repeatQueue.length; i++) {
        if (repeatQueue[i].id == repeat) {
            id = i;
        }
    }

    if (id != "ignore") {
        if (id != repeatQueue.length - 1) {
            repeatQueue[id] = repeatQueue[repeatQueue.length - 1];
        }
        repeatQueue.pop();
        //if (repeatQueue.length < 1) repeatQueue = [];
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
//Blocked Area Functions
//------------------------------------------------------------------------------------------------------------------------------------------------------

//Makes a Blocked Area
function makeBlockedArea(id, x, y, w, h) {
    return { "id": id, "x": x, "y": y, "w": w, "h": h };
}

//Adds a Blocked Area to the List
function addBlockedArea(newBlock) {
    blockedAreas[blockedAreas.length] = newBlock;
}

//Removes a Blocked Area from the List
function removeBlockedArea(id) {
    let result = "none";
    for (let i = 0; i < blockedAreas.length; i++) {
        if (typeof id == "string") {
            if (blockedAreas[i].id == id) result = i;
        } else {
            if (id == blockedAreas[i]) result = i;
        }
    }

    if (result != "none") {
        blockedAreas[result] = blockedAreas[blockedAreas.length - 1];
        blockedAreas.pop();
    }
}

//Checks if a Point is Within Blocked Area
function checkAllBlocks(x, y, w, h, seeWindows) {
    let result = false;

    if (blockedAreas.length > 0) {
        for (let i = 0; i < blockedAreas.length; i++) {
            if (checkBlock(x, y, w, h, blockedAreas[i])) {
                result = true;
            }
        }
    }

    if (seeWindows && winds.length > 0) {
        for (let i = 0; i < winds.length; i++) {
            let tempBlock = windowToBlock(winds[i], false);
            if (checkBlock(x, y, w, h, tempBlock)) {
                result = true;
            }
        }
    }

    return result;
}

//Checks if a Point is Within a Specific Blocked Areas
function checkBlock(x, y, w, h, block) {
    let result = checkCollision(x, y, w, h, block.x, block.y, block.w, block.h);
    return result;
}

//Converts a Window into a Blocked Area
function windowToBlock(log, useAlt) {
    let win = log.win;
    let id = win.id;
    let x = propMin(win.style[cssAbb("marl")]);
    let y = propMin(win.style[cssAbb("mart")]);
    let w = propMin(win.style[cssAbb("w")]);
    let h = propMin(win.style[cssAbb("h")]);

    if (log.title != false) {
        h += propMin(document.getElementById(log.title).style[cssAbb("h")]);
    }

    if (x == undefined || y == undefined) {
        useAlt = true;
    }

    if (useAlt) {
        x = propMin(win.style[cssAbb("l")]);
        y = propMin(win.style[cssAbb("t")]);
    }

    return makeBlockedArea(id, x, y, w, h);
}

//Converts an Animation to a Blocked Area
function animToBlock(drawn) {
    let dimensions = trueAnimDimensions(drawn);
    let w = dimensions[0] * drawn.localPixes;
    let h = dimensions[1] * drawn.localPixes;
    let id = drawn.id;
    return makeBlockedArea(id, drawn.x, drawn.y, w, h);
}

//Checks if a Drawing is Blocked
function checkDrawBlock(drawn, x, y, localPixes, seeWindows) {
    let dimensions = trueDrawDimensions(drawn);
    let w = dimensions[0] * localPixes;
    let h = dimensions[1] * localPixes;
    return checkAllBlocks(x, y, w, h, seeWindows);
}

//Checks if an Animation is Blocked
function checkAnimationBlock(drawn, seeWindows) {
    let result = false;
    for (let i = 0; i < drawn.art.length; i++) {
        if (checkDrawBlock(drawn.art[i], drawn.x, drawn.y, drawn.localPixes, seeWindows)) {
            result = true;
        }
    }
    return result;
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
//Unique Art Functions
//------------------------------------------------------------------------------------------------------------------------------------------------------

//Returns Value Based on Input Art
function retrieveArt(style, colors, frame, options, searches) {
    for (let i = 0; i < options.length; i++) {
        if (style == options[i]) {
            return searches[i].apply(this, [colors, frame]);
        }
    }

}

//Compiles the Normal Animation for an Image's Style
function compileArtStyle(images, colors, frame) {
    let results = [];

    for (let i = 0; i < images.length; i++) {
        for (let i2 = 0; i2 < images[i].length; i2++) {
            for (let i3 = 0; i3 < images[i][i2].length; i3++) {
                images[i][i2][i3] = colors[images[i][i2][i3]];
            }
        }
        results[i] = makeDrawing(images[i], true);
    }

    if (frame < 0) {
        return results;
    } else {
        return results[frame];
    }
}

//Compiles the Static Parts of an Animation
function compileArtStatic(images, frame) {
    let result = [];

    for (let i = 0; i < images.length; i++) {
        result[i] = makeDrawing(images[i], true);
    }

    if (frame < 0) {
        return result;
    } else {
        return result[frame];
    }

}

//Crystals
function crystalArt(style, colors, frame) {
    let options = ["stand", "attack"];
    let searches = [crystalStand, crystalStand];

    return retrieveArt(style, colors, frame, options, searches);
}

function crystalStand(colors, frame) {
    let shows = -1;
    let images = [];
    //none, darkred, red, indianred, #400000
    //blank, edge, primary, secondary, tertiary

    shows += 1;
    images[shows] = [];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 1, 2, 3, 2, 2, 1, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 1, 2, 3, 3, 2, 2, 2, 1, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 1, 2, 3, 3, 3, 2, 2, 2, 2, 1, 0, 0];
    images[shows][images[shows].length] = [0, 1, 2, 3, 3, 3, 4, 4, 2, 2, 2, 2, 1, 0];
    images[shows][images[shows].length] = [1, 2, 3, 3, 3, 4, 2, 3, 4, 2, 2, 2, 2, 1];
    images[shows][images[shows].length] = [1, 2, 2, 2, 2, 4, 3, 2, 4, 3, 3, 3, 3, 1];
    images[shows][images[shows].length] = [0, 1, 2, 2, 2, 2, 4, 4, 3, 3, 3, 3, 1, 0];
    images[shows][images[shows].length] = [0, 0, 1, 2, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 1, 2, 2, 2, 3, 3, 3, 1, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 1, 2, 2, 3, 3, 1, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 1, 2, 3, 1, 0, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0];
    //images[shows][images[shows].length] = [];

    shows += 1;
    images[shows] = rotateArt(makeDrawing(images[shows - 1], true)).original;

    shows += 1;
    images[shows] = rotateArt(makeDrawing(images[shows - 1], true)).original;

    shows += 1;
    images[shows] = rotateArt(makeDrawing(images[shows - 1], true)).original;

    return compileArtStyle(images, colors, frame);
}

//Test
function testAnimation(colors, frame) {
    let shows = -1;
    let images = [];

    shows += 1;
    images[shows] = [];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 1, 0, 0];
    images[shows][images[shows].length] = [0, 0, 1, 2, 1, 0, 0];
    images[shows][images[shows].length] = [0, 0, 1, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 0, 0];

    shows += 1;
    images[shows] = [];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 1, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 1, 1, 2, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 1, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 0, 0];

    shows += 1;
    images[shows] = [];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 1, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 2, 1, 1, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 1, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 0, 0];

    return compileArtStyle(images, colors, frame);
}

function testAnimation2(colors, frame) {
    let shows = -1;
    let images = [];
    //none, darkred, red, indianred, #400000
    //blank, edge, primary, secondary, tertiary

    shows += 1;
    images[shows] = [];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 1, 2, 3, 2, 2, 1, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 1, 2, 3, 3, 2, 2, 2, 1, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 1, 2, 3, 3, 3, 2, 2, 2, 2, 1, 0, 0];
    images[shows][images[shows].length] = [0, 1, 2, 3, 3, 3, 4, 4, 2, 2, 2, 2, 1, 0];
    images[shows][images[shows].length] = [1, 2, 3, 3, 3, 4, 2, 3, 4, 2, 2, 2, 2, 1];
    images[shows][images[shows].length] = [1, 2, 2, 2, 2, 4, 3, 2, 4, 3, 3, 3, 3, 1];
    images[shows][images[shows].length] = [0, 1, 2, 2, 2, 2, 4, 4, 3, 3, 3, 3, 1, 0];
    images[shows][images[shows].length] = [0, 0, 1, 2, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 1, 2, 2, 2, 3, 3, 3, 1, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 1, 2, 2, 3, 3, 1, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 1, 2, 3, 1, 0, 0, 0, 0, 0];
    images[shows][images[shows].length] = [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0];
    //images[shows][images[shows].length] = [];

    shows += 1;
    images[shows] = rotateArt(makeDrawing(images[shows - 1], true)).original;

    shows += 1;
    images[shows] = rotateArt(makeDrawing(images[shows - 1], true)).original;

    shows += 1;
    images[shows] = rotateArt(makeDrawing(images[shows - 1], true)).original;

    return compileArtStyle(images, colors, frame);
}

function testAnimation3(frame) {
    let shows = -1;
    let images = [];

    shows += 1;
    images[shows] = [];
    images[shows][images[shows].length] = ["#859954", "#859954", "#859954", "#859954", "#859954", "#859954"];
    images[shows][images[shows].length] = ["none", "none", "none", "none", "none", "#859954"];
    images[shows][images[shows].length] = ["none", "none", "none", "none", "none", "#859954"];
    images[shows][images[shows].length] = ["none", "none", "none", "none", "none", "#859954"];
    images[shows][images[shows].length] = ["none", "none", "none", "none", "none", "#859954"];
    images[shows][images[shows].length] = ["#859954", "#859954", "#859954", "#859954", "#859954", "#859954"];

    shows += 1;
    images[shows] = [];
    images[shows][images[shows].length] = ["#859954", "#859954", "#859954", "#859954", "#859954", "#859954"];
    images[shows][images[shows].length] = ["#859954", "none", "#859954", "none", "none", "#859954"];
    images[shows][images[shows].length] = ["none", "none", "none", "none", "none", "#859954"];
    images[shows][images[shows].length] = ["none", "none", "none", "none", "none", "#859954"];
    images[shows][images[shows].length] = ["none", "#859954", "none", "#859954", "none", "#859954"];
    images[shows][images[shows].length] = ["#859954", "#859954", "#859954", "#859954", "#859954", "#859954"];

    shows += 1;
    images[shows] = [];
    images[shows][images[shows].length] = ["#859954", "#859954", "#859954", "#859954", "#859954", "#859954"];
    images[shows][images[shows].length] = ["#859954", "#cc3300", "#859954", "#cc3300", "#859954", "#859954"];
    images[shows][images[shows].length] = ["#cc3300", "#cc3300", "#cc3300", "#cc3300", "#cc3300", "#859954"];
    images[shows][images[shows].length] = ["#cc3300", "#cc3300", "#cc3300", "#cc3300", "#cc3300", "#859954"];
    images[shows][images[shows].length] = ["#cc3300", "#859954", "#cc3300", "#859954", "#cc3300", "#859954"];
    images[shows][images[shows].length] = ["#859954", "#859954", "#859954", "#859954", "#859954", "#859954"];

    return compileArtStatic(images, frame);
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
//Miscellaneous Functions
//------------------------------------------------------------------------------------------------------------------------------------------------------





