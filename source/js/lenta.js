var chin = [],
    chinTarget = [111, 11],
    q,
    intervalID,
    anim = 0;
//создание DIV
for (q = 0; q < 30; q++) {
    var d = document.createElement("DIV");
    d.className = "yise";
    document.body.appendChild(d);
    chin.push([0, 0, d]);
}
//неидимые
for (q = 0; q < 30; q++) {
    document.getElementsByClassName("yise")[q].style.visibility = "hidden";
}
//анимация
function chinAnime() {
    var tick = new Date().getTime() / 400;
    var xv = chinTarget[0] - chin[0][0] + Math.sin(tick) * 65;//вращение точки назначения ленты вокруг указателя
    var yv = chinTarget[1] - chin[0][1] - Math.cos(tick) * 65;//вращение точки назначения ленты вокруг указателя
    if (xv != 0 || yv != 0) {
        chin.splice(0, 0, chin.splice(29, 1)[0]);
        var len = Math.sqrt(xv * xv + yv * yv);
        var so = chin[0][2].style;
        xv /= len;
        yv /= len;
        chin[0][0] = chin[1][0] + xv * 8;
        chin[0][1] = chin[1][1] + yv * 8;
        so.left = Math.floor(chin[0][0] - 10) + "px";
        so.top = Math.floor(chin[0][1] - 10) + "px";

        var aa = -Math.atan2(xv, yv) / Math.PI * 180;

        for (q in chin) {
            chin[q][2].style.zIndex = 100 - q;
            chin[q][2].className = "yise";
        }

        chin[0][2].className = "yise yf";

        var val = "rotate(" + aa + "deg)";
        so.transform = val;
        so.WebkitTransform = val;
        so.MozTransform = val;
        so.OTransform = val;
        so.msTransform = val;
    }
}

function onoffanim() {
    if (anim == 0) {
        intervalID = setInterval(chinAnime, 50);
        for (q = 0; q < 30; q++) {
            document.getElementsByClassName("yise")[q].style.visibility = "visible";
        }
        anim = 1;
    }
    else {
        clearInterval(intervalID);
        for (q = 0; q < 30; q++) {
            document.getElementsByClassName("yise")[q].style.visibility = "hidden";
        }
        anim = 0;
    }
}

//setInterval(chinAnime,50);


document.onmousemove = function (e) {
    chinTarget = [e.clientX, e.clientY];
}
