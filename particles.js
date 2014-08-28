/**
 * Author: 凌恒-mariodu
 * Date: 14-8-21
 * Email: dujiakun@gmail.com & jiakun.dujk@alibaba-inc.com
 * Blog: http://dujiakun.com
 */


/*
* 向量
*/
var Vector = function(x, y) {
    this.x = x;
    this.y = y;
};

Vector.prototype = {
    length: function() {
        return Math.sqrt(this.square());
    },
    add: function(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    },
    subtract: function(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    },
    multiply: function(time) {
        return new Vector(this.x * time, this.y * time);
    },
    divide: function(time) {
        var inverse = 1 / time;
        return new Vector(this.x * inverse, this.y * inverse);
    },
    crossProduct: function(vector) {
        return this.x * v.x + this.y * v.y;
    },
    negetive: function() {
        return new Vector(-this.x, -this.y);
    },
    normalize: function() {
        var inverse = 1 / this.length();
        return new Vector(this.x * inverse, this.y * inverse);
    },
    square: function() {
        return this.x * this.x + this.y * this.y;
    },
    duplicate: function() {
        return new Vector(this.x, this.y);
    }
};

Vector.ZERO = new Vector(0, 0);

/*
* requestAnimationFrame 兼容
* */

var RAF = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame
    || window.oRequestAnimationFrame
    || function(callback) {
        setTimeout(callback, 1000 / 60);
    };

var CRAF = window.cancelAnimationFrame
    || window.mozCancelAnimationFrame
    || window.webkitCancelAnimationFrame
    || window.msCancelAnimationFrame
    || window.oCancelAnimationFrame
    || function(timeoutID) {
        clearTimeout(timeoutID);
    };

/*
* Base Utils
* */

var rafID = null, canvas = null, ctx, isContinue = false;

var start = function(canvasID, func) {
    if (rafID)
        stop();

    canvas = document.getElementById(canvasID);
    ctx = canvas.getContext('2d');
    isContinue = true;

    var loop = function() {
        func();
        if (isContinue)
            rafID = RAF(loop);
    };

    loop();
};

var stop = function() {
    CRAF(rafID);
    isContinue = false;
};

var clearCanvas = function() {
    ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/*
* Particle
* */

var Particle = function(position, velocity, life, color, size) {
    this.position = position;
    this.velocity = velocity;
    this.acceleration = Vector.zero;
    this.age = 0;
    this.life = life;
    this.color = color;
    this.size = size;
};

/*
* Particle System
* */

function ParticleSystem() {
    var that = this;
    var particles = new Array();

    this.gravity = new Vector(0, 100);
    this.effectors = new Array();

    this.emit = function(particle) {
        particles.push(particle);
    };

    this.simulate = function(dt) {
        aging(dt);
        applyGravity();
        applyEffectors();
        kinematics(dt);
    };

    this.render = function(ctx) {
        for (var i in particles) {
            var p = particles[i];
            var alpha = 1 - p.age / p.life;
            ctx.fillStyle = "rgba("
                + Math.floor(p.color.r * 255) + ","
                + Math.floor(p.color.g * 255) + ","
                + Math.floor(p.color.b * 255) + ","
                + alpha.toFixed(2) + ")";
            ctx.beginPath();
            ctx.arc(p.position.x, p.position.y, p.size, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }
    }

    function aging(dt) {
        for (var i = 0; i < particles.length; ) {
            var p = particles[i];
            p.age += dt;
            if (p.age >= p.life)
                kill(i);
            else
                i++;
        }
    }

    function kill(index) {
        if (particles.length > 1)
            particles[index] = particles[particles.length - 1];
        particles.pop();
    }

    function applyGravity() {
        for (var i in particles)
            particles[i].acceleration = that.gravity;
    }

    function applyEffectors() {
        for (var j in that.effectors) {
            var apply = that.effectors[j].apply;
            for (var i in particles)
                apply(particles[i]);
        }
    }

    function kinematics(dt) {
        for (var i in particles) {
            var p = particles[i];
            p.position = p.position.add(p.velocity.multiply(dt));
            p.velocity = p.velocity.add(p.acceleration.multiply(dt));
        }
    }
}

/*
* Color
* */


Color = function(r, g, b) { this.r = r; this.g = g; this.b = b };

Color.prototype = {
    copy : function() { return new Color(this.r, this.g, this.b); },
    add : function(c) { return new Color(this.r + c.r, this.g + c.g, this.b + c.b); },
    multiply : function(s) { return new Color(this.r * s, this.g * s, this.b * s); },
    modulate : function(c) { return new Color(this.r * c.r, this.g * c.g, this.b * c.b); },
    saturate : function() { this.r = Math.min(this.r, 1); this.g = Math.min(this.g, 1); this.b = Math.min(this.b, 1); }
};

Color.black = new Color(0, 0, 0);
Color.white = new Color(1, 1, 1);
Color.red = new Color(1, 0, 0);
Color.green = new Color(0, 1, 0);
Color.blue = new Color(0, 0, 1);
Color.yellow = new Color(1, 1, 0);
Color.cyan = new Color(0, 1, 1);
Color.purple = new Color(1, 0, 1);

/*
CharmBox
 */
function ChamberBox(x1, y1, x2, y2) {
    this.apply = function(particle) {
        if (particle.position.x - particle.size < x1 || particle.position.x + particle.size > x2)
            particle.velocity.x = -particle.velocity.x;

        if (particle.position.y - particle.size < y1 || particle.position.y + particle.size > y2)
            particle.velocity.y = -particle.velocity.y;
    };
}

/*
* Kinematics
* */
//
//var position = new Vector(10, 200);
//var velocity = new Vector(50, -50);
//var acceleration = new Vector(0, 10);
//var dt = 0.1;
//
//function step() {
//    position = position.add(velocity.multiply(dt));
//    velocity = velocity.add(acceleration.multiply(dt));
//
//    ctx.strokeStyle = "#000000";
//    ctx.fillStyle = "#FFFFFF";
//    ctx.beginPath();
//    ctx.arc(position.x, position.y, 5, 0, Math.PI*2, true);
//    ctx.closePath();
//    ctx.fill();
//    ctx.stroke();
//}
//
//start("kCanvas", step);

/*
* Base Particle
* */

//var ps = new ParticleSystem();
//var dt = 0.01;
//
//function sampleDirection() {
//    var theta = Math.random() * 2 * Math.PI;
//    return new Vector(Math.cos(theta), Math.sin(theta));
//}
//
//function stepForPS() {
//    ps.emit(new Particle(new Vector(200, 200), sampleDirection().multiply(100), 1, Color.red, 5));
//    ps.simulate(dt);
//
//    clearCanvas();
//    ps.render(ctx);
//}
//
//start("bpCanvas", stepForPS);