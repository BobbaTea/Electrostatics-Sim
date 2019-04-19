/* Akash Bobba and Andrew Ji 2019 */

// Canvas setup and variables
var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
canvas.width = innerWidth
canvas.height = innerHeight


// Array for charges and other constants
numCharges = 0;
const k = 9 * Math.pow(10, 9);
const sizeConstant = 1500;
var charges = [];


// Event listeners and relevant variables
document.addEventListener('mousemove', mouse);
document.addEventListener('mouseup', addCharge);
document.addEventListener('keypress', keyRec);
document.addEventListener("keyup", function () {
    del = false
    selection = false
});

var mx = undefined
var my = undefined
var char = " ="
var disectionPin = false
var field = false
var del = false
var info = true
var pause = false
var pe = undefined
var selection = false

function keyRec(e) {
    if (` ${e.key}` == " p") {
        disectionPin = !disectionPin;
    } else if (` ${e.key}` == " f") {
        field = !field;
    } else if (` ${e.key}` == " d") {
        del = true
    } else if (` ${e.key}` == " i") {
        info = !info
    } else if (` ${e.key}` == "  ") {
        pause = !pause
    } else if (` ${e.key}` == " s") {
        selection = true
    } else {
        char = ` ${e.key}`;
    }
}

function mouse(e) {
    mx = e.clientX
    my = e.clientY
}

function addCharge() {

    // if (!mDown) {

    if (!del) {
        var amass = 0.0001
        var acharge = 0.00002

        if (char == " =") {
            charges.push(new PCharge(acharge, amass, mx, my, disectionPin))
            numCharges++

        } else if (char == " -") {
            charges.push(new PCharge(-acharge, amass, mx, my, disectionPin))
            numCharges++

        }
    }

    // }
}


// Some math functions for simplicity and legibility
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
}


// Init and frame animate methods
function init() {
    animate()
}

function potentialCalc(a) {
    sum = 0
    for (var i = 0; i < numCharges; i++) {
        if (i != a) {
            sum += (k * charges[a].charge * charges[i].charge) / distance(charges[a].x, charges[a].y, charges[i].x, charges[i].y)
        }
    }
    return sum
}

function voltageCalc(x, y) {
    sum = 0
    for (var i = 0; i < numCharges; i++) {
        dist = distance(x, y, charges[i].x, charges[i].y)
        sum += k * charges[i].charge / dist
    }
    return sum
}

function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height)
    c.fillStyle = "rgba(200, 255, 200, 0.9)";
    sideBar()
    if (!pause) {
        for (var i = 0; i < numCharges; i++) {
            charges[i].calc()
        }
    }
    if (info) {
        c.fillText(rnd(voltageCalc(mx, my)) + "V", mx, my);
    }
    for (var i = 0; i < numCharges; i++) {
        charges[i].update()

        if (charges[i].selected) {
            pe = i
            // console.log(pe)
            kinetic = 0.5 * charges[i].mass * (Math.pow(charges[i].yvel, 2) + Math.pow(charges[i].xvel, 2))
            potential = potentialCalc(i)
            total = kinetic + potential
            console.log(total + " " + potential + " " + kinetic)
            potBar(total, kinetic, potential)
        }
        if (selection && del) {
            for (var i = 0; i < numCharges; i++) {
                charges[i].selected = false
            }
            selection = false
            del = false
        }
        if (selection) {
            if (distance(mx, my, charges[i].x, charges[i].y) <= charges[i].radius) {
                charges[i].selected = true
                pe = i
            }
        }
        if (del) {
            if (distance(mx, my, charges[i].x, charges[i].y) <= charges[i].radius) {
                charges.splice(i, 1)
                numCharges--
            }
        }
        if (charges[i].x < 0 || charges[i].y < 0 || charges[i].x > canvas.width || charges[i].y > canvas.height) {
            charges.splice(i, 1)
            numCharges--
        }




    }
    if (field) {
        fieldLines()
    }
    requestAnimationFrame(animate)
}

function rnd(a) {
    return Math.round(a * 10000) / 10000
}

// Main charge class and relevant functions
function PCharge(charge, mass, x, y, dp) {
    // Attributes
    this.radius = (sizeConstant * Math.sqrt(Math.abs(mass)))
    this.charge = charge;
    this.mass = mass;
    this.x = x
    this.y = y
    this.xvel = 0
    this.yvel = 0
    this.dp = dp
    this.selected = false
    if (charge < 0) {
        this.color = "rgba(0,30,255, 0.3)"
    } else {
        this.color = "rgba(255,30,0, 0.3)"
    }

    // Literally draw on the screen
    this.draw = function () {
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        c.fill();
        c.font = "15px Roboto Mono";
        c.fillStyle = "rgba(0, 0, 0, 0.7)"
        if (info) {
            c.fillText(this.charge + "C", this.x + 20, this.y + 15);
            c.fillText(this.mass + "kg", this.x + 20, this.y);
            c.fillText(rnd(Math.sqrt(Math.pow(this.yvel, 2) + Math.pow(this.xvel, 2))) + "m/s", this.x + 20, this.y - 15);
        }

    }

    // Only calculate the net acceleration and change the x/y velocities
    this.calc = function () {
        // Components of net force 
        fx = 0
        fy = 0
        if (this.dp == false) {
            // Iterate through charges
            for (var i = 0; i < numCharges; i++) {
                // Delta x, y, and distance between two charges
                dx = (this.x - charges[i].x)
                dy = (this.y - charges[i].y)
                dist = (distance(this.x, this.y, charges[i].x, charges[i].y))
                // Calculate angles
                if (dist != 0) {
                    if (dx > 0) {
                        if (dy > 0) {
                            trig = Math.PI - Math.acos(Math.abs(dx) / dist);
                        } else {
                            trig = Math.PI + Math.acos(Math.abs(dx) / dist)
                        }
                    } else {
                        if (dy > 0) {
                            trig = Math.acos(Math.abs(dx) / dist);
                        } else {
                            trig = (2 * Math.PI) - Math.acos(Math.abs(dx) / dist)
                        }
                    }
                    // Coulombs Law
                    cl = (k * Math.abs(this.charge) * Math.abs(charges[i].charge) / Math.pow(dist, 2))
                    sign = -((this.charge * charges[i].charge) / Math.abs((this.charge * charges[i].charge)))
                    // Components of force for x and y direction
                    fx += sign * cl * Math.cos(trig)
                    fy += sign * cl * -Math.sin(trig)
                }
            }
            // Update x and y vel
            this.xvel += fx / this.mass
            this.yvel += fy / this.mass
        }
    }

    // Update charge position and call draw method
    this.update = function () {
        if (!pause && (this.dp == false)) {
            this.x += this.xvel
            this.y += this.yvel
        }
        this.draw()
    }
}


// Methods to draw modularized parts of the canvas
function sideBar() {
    // roundRect((4 * canvas.width) / 5, canvas.height / 9, canvas.width / 5 + 100, (7 * canvas.height) / 9, 20, "rgba(255, 255, 255, 0.2)")
    c.font = "15px Roboto Mono";
    c.fillStyle = "rgba(0, 0, 0, 0.7)"
    c.fillText("# of Charges: " + numCharges, 10, 50);
    c.fillText("Disection Pin Toggle: " + disectionPin, 10, 80);
    type = ((char == " =") ? 'Positive' : (char == " -") ? "Negative" : "N/A");
    c.fillText("Type of Charge: " + type, 10, 110);
    c.fillText("Field Lines: " + field, 10, 140);
    c.fillText("Delete Toggle: " + del, 10, 170);
    c.fillText("Info Toggle: " + info, 10, 200);
    c.fillText("Pause Toggle: " + pause, 10, 230);
    c.fillText("Selection Toggle: " + selection, 10, 260);

}

function potBar(t, k, p) {
    l = 200 / Math.max(Math.max(Math.abs(t), Math.abs(k)), Math.abs(p))
    // l = 200/ Math.abs(t)
    c.fillStyle = "rgb(255,0,0)"
    c.fillRect(canvas.width / 2, 3 * canvas.height / 4, l * t, 20);

    c.fillStyle = "rgb(0,0,255)"
    c.fillRect(canvas.width / 2, 3 * canvas.height / 4 - 30, l * k, 20);

    c.fillStyle = "rgb(0,255,0)"
    c.fillRect(canvas.width / 2, 3 * canvas.height / 4 - 60, l * p, 20);
}

function fieldLines() {
    for (var a = 20; a < canvas.width; a += canvas.height / 10) {
        for (var b = 20; b < canvas.width; b += canvas.height / 10) {
            charge = 0.01
            x = a
            y = b
            //commenting this makes it stop working
            //why?
            c.beginPath();
            // c.arc(x, y, 5, 0, Math.PI * 2, true);
            // c.fill();
            c.moveTo(x, y)
            c.strokeStyle = "rgb(0,0,0)"
            for (var z = 0; z < 25; z++) {
                fx = 0
                fy = 0
                for (var i = 0; i < numCharges; i++) {
                    // Delta x, y, and distance between two charges
                    dx = (x - charges[i].x)
                    dy = (y - charges[i].y)
                    dist = (distance(x, y, charges[i].x, charges[i].y))
                    // Calculate angles
                    if (dist != 0) {
                        if (dx > 0) {
                            if (dy > 0) {
                                trig = Math.PI - Math.acos(Math.abs(dx) / dist);
                            } else {
                                trig = Math.PI + Math.acos(Math.abs(dx) / dist)
                            }
                        } else {
                            if (dy > 0) {
                                trig = Math.acos(Math.abs(dx) / dist);
                            } else {
                                trig = (2 * Math.PI) - Math.acos(Math.abs(dx) / dist)
                            }
                        }
                        // Coulombs Law
                        cl = (k * Math.abs(charge) * Math.abs(charges[i].charge) / Math.pow(dist, 2))
                        sign = -((charge * charges[i].charge) / Math.abs((charge * charges[i].charge)))
                        // Components of force for x and y direction
                        fx += sign * cl * Math.cos(trig)
                        fy += sign * cl * -Math.sin(trig)
                    }
                }
                l = 0.2 / Math.max((fx / charge), (fy / charge))
                x += (fx / charge) * 0.1
                y += (fy / charge) * 0.1
                cont = true;
                for (var u = 0; u < numCharges; u++) {
                    dist = (distance(x, y, charges[u].x, charges[u].y))
                    if (dist <= charges[u].radius) {
                        cont = false;
                    }
                }
                if (cont) {
                    c.lineTo(x, y)
                    c.stroke()
                } else {
                    break;
                }
            }
            c.strokeStyle = "rgba(0,0,0,0)"
            if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) {
                continue;
            }
        }
    }
}




init()
