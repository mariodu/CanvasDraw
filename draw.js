/**
 * Author: 凌恒-mariodu
 * Date: 14-8-5
 * Email: dujiakun@gmail.com & jiakun.dujk@gmail.com
 * Blog: http://dujiakun.com
 */

function Point(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

function Edge(){
    this.y_max = 0; //边最大的y值
    this.x = 0; //与扫描线交点x坐标
    this.dx = 0; //斜率的倒数，deltaX
    this.next = null; //下一条边
}

function CanvasDraw() {
    this.init();
}
var colorReg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
function hexToRGB(color) {
    var sColor = color.toLowerCase();
    if (sColor && colorReg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for(var i = 1; i < 4; i += 1){
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }
        var sColorChange = [];
        for(var i = 1; i < 7; i += 2){
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        return "RGB(" + sColorChange.join(",") + ")";
    } else {
        return sColor;
    }
}

function RBGToArray(rgb, alpha) {
    alpha = alpha || 255;
    var res = rgb.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",").concat(alpha);
    res.forEach(function(item, index) {
        res[index] = parseInt(item, 10);
    });
    return res;
}

CanvasDraw.prototype = {
    init: function() {
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');
        this.ctx.ImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.defaultColor = '#000';
        this.pImage = this.ctx.createImageData(1, 1);
        this.pColor = this.pImage.data;
        this.width = 500;
        this.height = 500;
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0,0,500,500);
        this.full = this.ctx.getImageData(0, 0, this.width, this.height);
        this.imageData = this.full.data;
    },

    drawPoint: function(x, y, color) {
        var pointX, pointY;
        if (x instanceof Array) {
            pointX = x[0];
            pointY = x[1];
            color = y || this.defaultColor;
        } else {
            pointX = x;
            pointY = y;
            color = color || this.defaultColor;
        }
        this.putpixel(x, y, color);
        /*color = RBGToArray(hexToRGB(color), 255);

        with(this){
            pColor[0] = color[0];
            pColor[1] = color[1];
            pColor[2] = color[2];
            pColor[3] = color[3];
            ctx.putImageData(this.pImage, pointX, pointY);
        }*/
    },

    drawLineDDA: function(x1, y1, x2, y2, color) {
        var dx = x2 - x1,
            dy = y2 - y1,
            k = dy / dx;

        if (x1 < x2) {
            if (k <= 1 && k >= -1) {
                y = y1;
                for(x = x1; x <= x2; x++) {
                    this.drawPoint(x, parseInt(y + 0.5, 10), color);
                    y += k;
                }
            }
        }

        if (x1 > x2) {
            if ( k <= 1 && k >= -1) {
                y = y1;
                for (x = x1; x >= x2; x --) {
                    this.drawPoint(x, parseInt(y + 0.5, 10), color);
                    y -= k;
                }
            }
        }

        if (y1 < y2) {
            if (k >= 1 || k <= -1) {
                k = 1 / k;
                x = x1;
                for (y = y1; y <= y2; y ++) {
                    this.drawPoint(parseInt(x + 0.5, 10), y, color);
                    x += k;
                }
            }
        }

        if (y1 > y2) {
            if (k <= -1 || k >= 1) {
                k = 1 / k;
                x = x1;
                for (y = y1; y >= y2; y--) {
                    this.drawPoint(parseInt(x + 0.5, 10), y, color);
                    x -= k;
                }
            }
        }
    },

    drawLineMID: function(x1, y1, x2, y2, color) {
        var dx = x2 - x1,
            dy = y1 - y2,
            d = 2 * dy + dx,
            delta1 = 2 * dy,
            delta2 = 2 * (dx + dy),
            x = x1,
            y = y1;

        this.drawPoint(x, y, color);

        while(x < x2) {
            if (d < 0) {
                x ++;
                y ++;
                d += delta2;
            } else {
                x ++;
                d += delta1;
            }

            this.drawPoint(x, y, color);
        }
    },

    drawLineBresenham: function(x1, y1, x2, y2, color) {
        var dx, dy, e;
        var  oldx, oldy;
        if(Math.abs(y2 - y1) < Math.abs(x2 - x1)) {
            if(x1 > x2) {
                x2 = [x1, x1 = x2][0];
                y2 = [y1, y1 = y2][0];
            }
            dx = (x2 - x1) << 1;
            dy = (y2 - y1) << 1;
            e = - (dx >> 1);
            if(y1 < y2) {
                while(x1 != x2) {
                    this.drawPoint(x1, y1, color);
                    oldy = y1;
                    ++ x1;
                    e = e + dy;
                    if(e > 0) {
                        ++ y1;
                        e -= dx;
                    }
                }
            } else {
                while(x1 <= x2) {
                    this.drawPoint(x1, y1, color);
                    oldy = y1;
                    ++ x1;
                    if(y1 != y2) {
                        e = e + dy;
                        if(e < 0) {
                            -- y1;
                            e += dx;
                        }
                    }
                }
            }
        } else {
            if(y1 > y2) {
                x2 = [x1, x1 = x2][0];
                y2 = [y1, y1 = y2][0];
            }
            dx = (x2 - x1) << 1;
            dy = (y2 - y1) << 1;
            e = - (dy >> 1);
            if(x1 < x2) {
                while(y1 != y2) {
                    this.drawPoint(x1, y1, color);
                    ++ y1;
                    e = e + dx;
                    if(e > 0) {
                        ++ x1;
                        e -= dy;
                    }
                }
            } else {
                while(y1 <= y2) {
                    this.drawPoint(x1, y1, color);
                    ++ y1;
                    if (x1 != x2){
                        e = e + dx;
                        if(e <= 0) {
                            -- x1;
                            e += dy;
                        }
                    }
                }
            }
        }
    },
    getStartIndex: function(x, y) {
        return y * this.width * 4 + x * 4;
    },

    putpixel: function(x, y, color) {
        color = RBGToArray(hexToRGB(color), 255);
        x = parseInt(x);
        y = parseInt(y);
        var index = this.getStartIndex(x, y);
        for(var i = 0; i< 4; i++) {
            this.imageData[index + i] = color[i];
        }

    },

    circle_MidBresenham: function(x, y, r) {
        var tx = 0, ty = r, d = 1 - r;

        while(tx <= ty){
            // 利用圆的八分对称性画点
            this.putpixel(x + tx, y + ty, '#000');
            this.putpixel(x + tx, y - ty, '#000');
            this.putpixel(x - tx, y + ty, '#000');
            this.putpixel(x - tx, y - ty, '#000');
            this.putpixel(x + ty, y + tx, '#000');
            this.putpixel(x + ty, y - tx, '#000');
            this.putpixel(x - ty, y + tx, '#000');
            this.putpixel(x - ty, y - tx, '#000');

            if(d < 0){
                d += 2 * tx + 3;
            }else{
                d += 2 * (tx - ty) + 5;
                ty--;
            }

            tx++;
        }
    },

    draw_poly: function(points) {
        var startPoint = points[0];
        for(var i = 0; i < points.length; i++){
            if ((i + 1) == points.length) {
                this.drawLineBresenham(points[i].x, points[i].y, startPoint.x, startPoint.y);
                return;
            }
            this.drawLineBresenham(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
        }
    },

    polyFill: function(points) {
        var insideFlag = -1,
            c1 = 0,
            c2 = 0;
        var maxX = points[0].x,
            minX = points[0].x,
            maxY = points[0].y,
            minY = points[0].y;
        var i = 0,
            j = 0,
            x,
            y;

        for (i = 0; i < points.length; i ++) {
            if (points[i].y < minY) {
                minY = points[i].y;
            } else if (points[i].y > maxY) {
                maxY = points[i].y;
            }
        }

        for (i = 0; i < points.length; i ++) {
            if (points[i].x < minX) {
                minX = points[i].x;
            } else if (points[i].x > maxX) {
                maxX = points[i].x;
            }
        }
        var yIn = [];
        var xIn = {};
        for (i = 0; i < points.length; i ++) {
            if (yIn.indexOf(points[i].y) <= -1) {
                yIn.push(points[i].y);
                (xIn[points[i].y.toString()] = []).push(points[i].x);
            } else {
                (xIn[points[i].y.toString()]).push(points[i].x);
            }

        }

        console.log(maxX);
        console.log(maxY);
        console.log(minX);
        console.log(minY);
        var oldx = minX;
        var extream = this.getExtreamPoint(points);
        var isE = false;
        for(y = minY; y <= maxY; y++)
        {
            insideFlag = -1;
            var rangeA = null, rangeB = null;
            if (xIn[y] != undefined) {
                if(xIn[y].length = 2) {
                    rangeA = xIn[y][0];
                    rangeB = xIn[y][1];
                    if (rangeA > rangeB)
                        rangeB = [rangeA, rangeA = rangeB][0];
                }
            }
            for(x = minX; x <= maxX; x++)
            {
                if (rangeA && rangeB && x >= rangeA && x <= rangeB) {
                    continue;
                }
                for (j=0; j < extream.length; j++) {
                    if (x == extream[j].x && y == extream[j].y) {
                        console.log('in x is ' + x + ' y is ' + y);
                        console.log(insideFlag);
                        isE = true;
                        break;
                    }
                }
                var color = this.getpixel(x ,y);
                var color_next = this.getpixel(x + 1, y);
                var color_before = this.getpixel(x - 1, y);
                if(color.r == 0 && color.g == 0 && color.b == 0){
                    if (Math.abs(x-oldx) == 1) {
                        oldx = x;
//                        isE = true;
                        insideFlag = -1;
                        if (color_next.r != 0 && color_next.g != 0 && color_next.b != 0)
                            insideFlag = 1;
//                            isE = false;
                        continue;
                    }
                    oldx = x;
                    if(!isE) insideFlag = -insideFlag;
                    continue;
                }
                if(insideFlag == 1){
                    this.putpixel(x, y, '#f00');
                    if((y == maxY) || (y == minY)){
                        this.putpixel(x,y, '#fff');
                        insideFlag = -1;
                    }
                }

                if (x == maxX) {
                    if (insideFlag == 1) {
                        for (var i = oldx + 1; i <= maxX; i ++) {
                            this.putpixel(i, y, '#fff');
                        }
                        insideFlag = -1;
                    }
                }
                isE = false;
            }
        }
    },

    getpixel: function(x, y) {
        var data = this.imageData;

        var s = y * (this.width * 4) + (x * 4);

        var r = data[s],
            g = data[s + 1],
            b = data[s + 2],
            a = data[s + 3];

        return {
            r: r,
            g: g,
            b: b,
            a: a
        };
    },

    getExtreamPoint: function(points) {
        result = [];
        for (var i = 1; i < points.length - 1; i++) {
            if (((points[i].y - points[i - 1].y) * (points[i].y - points[i + 1].y)) > 0) {
                result.push(points[i]);
            }
        }
        return result;
    }

};

var draw = new CanvasDraw();
//draw.drawPoint(0, 0);
//draw.drawPoint([100, 100]);
//draw.drawPoint(60, 60, '#f00');
//draw.drawPoint([70, 70], '#00f');
//draw.drawLineDDA(20, 20, 300, 155, '#00f');
//draw.drawLineMID(40, 20, 320, 155, '#000');
//draw.drawLineBresenham(50, 20, 330, 155, '#f00');
//draw.circle_MidBresenham(300, 300, 50);
var pointsNormal = [
    {x: 100, y: 100},
    {x: 160, y: 55},
    {x: 300, y: 200},
    {x: 320, y: 360}
];

var pointsCross = [
    {x: 100, y: 100},
    {x: 160, y: 55},
    {x: 300, y: 200},
    {x: 320, y: 200}
];

var pointsConcave = [
    {x: 100, y: 100},
    {x: 160, y: 100},
    {x: 160, y: 200},
    {x: 320, y: 200},
    {x: 320, y: 100},
    {x: 380, y: 100},
    {x: 380, y: 300},
    {x: 100, y: 300}
];

var pointsConcave2 = [
    {x: 100, y: 100},
    {x: 160, y: 100},
    {x: 190, y: 200},
    {x: 320, y: 100},
    {x: 380, y: 100},
    {x: 380, y: 300},
    {x: 100, y: 300}
];

var pointsConcave3 = [
    {x: 100, y: 100},
    {x: 190, y: 200},
    {x: 380, y: 100},
    {x: 380, y: 300},
    {x: 100, y: 300}
];
draw.draw_poly(pointsNormal);
console.log(draw.getpixel(160, 55));
draw.polyFill(pointsNormal);
console.log(draw.getExtreamPoint(pointsConcave2));
draw.ctx.putImageData(draw.full, 0, 0);
//with(draw.ctx) {
//    beginPath();
//    strokeStyle = '#0f0';
//    lineWidth = 1.0;
//    moveTo(30, 20);
//    lineTo(310, 155);
//    stroke();
//    closePath();
//    beginPath();
//    arc(150, 300, 50, 0, Math.PI*2, true);
//    lineWidth = 1.0;
//    strokeStyle = "#000";
//    stroke();
//    closePath();
//}