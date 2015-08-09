var path="flies.png";
var animfly3=0;

/* obtengo el tamaño de la ventana */
if( typeof( window.innerWidth ) == 'number' ) {
    var sw = window.innerWidth;
    var sh = window.innerHeight;
} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    var sw = document.documentElement.clientWidth;
    var sh = document.documentElement.clientHeight;
} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    var sw = document.body.clientWidth;
    var sh = document.body.clientHeight;
};

/* posicion y velocidad inicial */
var x=100;var xx=3;var y=100;var yy=3;

var offset = 200;
var offsetb = 250;
var caminando = true;

var f=document.createElement("DIV");
f.className="fly3";
f.style.width = "50px";
f.style.height = "50px";
f.style.backgroundImage = "url("+path+")";
f.style.backgroundPosition = "0px -"+offset+"px";
f.style.position="absolute";
f.style.left=Math.round(x)+"px";
f.style.top=Math.round(y)+"px";
f.style.zIndex=9999;
document.body.appendChild(f);

document.getElementsByClassName("fly3")[0].style.visibility = "hidden" ;



function move(){

	

	if(y>=(sh-100)){
		yy=-yy;c();
	}else if(y<=1){
		yy=-yy;c();
	}
	if(x>=(sw-100)){
		xx=-xx;c();
	}else if(x<=1){
		xx=-xx;c();
	}
	
	x=x+xx;y=y+yy;
	
	f.style.left=Math.round(x)+"px";f.style.top=Math.round(y)+"px";



	if(Math.random()<0.05){
		clearInterval(id);
		id=setInterval('p()',30);
		caminando = false;
		showOffset(offset);
	}else{
	    if (caminando) {
	      caminando = false;
	      showOffset(offset);
	    }else{
	      caminando = true;
	      showOffset(offsetb);
	    }
	}

};
function p(){
	if(Math.random()<0.075){
		clearInterval(id);
		id=setInterval('move()',30);
	}
};
function c(){
	if(yy<0){
		if(xx<0){
			offset = 100;
			offsetb = 150;
		}else{
			offset = 0;
			offsetb = 50;
		}
	}else if(xx<0){
		offset = 300;
		offsetb = 350;
	}else{
		offset = 200;
		offsetb = 250;
	}
};

function showOffset(o) {
  f.style.backgroundPosition = "0px -"+o+"px";
}
//setInterval('move()',30);void(0);


function onoffanimFly3(){

document.getElementsByClassName("fly3")[0].style.visibility = "visible" ;
if(animfly3 == 0) {
var id=setInterval('move()',30);void(0);
//document.getElementsByClassName("fly3")[0].style.visibility = "visible" ;
animfly3=1;
}
else {/*
//clearInterval(id);
document.getElementsByClassName("fly3")[0].style.visibility = "hidden" ;
animfly3=0;*/
}
}
