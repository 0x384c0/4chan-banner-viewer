var pic_on_page;//картинок на странице
var cur_fulscreen_image = 1;//номер картинка ктоорая во весь экран

var loaded_imgs = 0;//счетчик прогресс бара
function inc_prbar()
{
loaded_imgs++;
document.getElementById("progress_bar").value ++;
}
function reset_prbar()//сброс счетчика прогресс бара
{
loaded_imgs=0;
document.getElementById("progress_bar").value = 0;
document.getElementById("progress_bar").max = pic_on_page;
}

function Create() 
{
pic_on_page = document.getElementById("PicOnPage").value;//Кол-во картинок сохранить
var imagelisttmp = "";//формирование html текста
for (i=1;i<=pic_on_page;i++)
{
imagelisttmp =imagelisttmp + "<span id='exlink-"+i+"' class='image-link'><a href=''id = 'img_href"+i+"' target='_blank' name='expandfunc' onclick="+ '"'+"return click_on_img("+i+")"+ '"'+" oncontextmenu="+ '"'+"return rclick_on_img("+i+")"+ '"'+"  ><img src='' width = '120' height = '120'  id = 'img"+i+"' class='img preview' onload = "+ '"'+"inc_prbar();"+ '"'+" onerror = "+ '"'+"inc_prbar();"+ '"'+"/></a></span>";
}
document.getElementById("ImageList").innerHTML = imagelisttmp;//вывод html на страницу
REdraw();
reset_prbar();
}


function REdraw() 
{
var to = document.getElementById("imageID").value;//получить ID картинки
to=parseInt(to);//преобразовать в int

var i = 1;
while (i <= pic_on_page) //отрисовка остальных картинок
{
var obj = document.getElementById("img"+i);//картинка как obj
obj.src = document.getElementById("URLaddress").value + to;//задать новую ссылку для  картинки

var obj = document.getElementById("img_href"+i);//задать новую ссылку для картинки для клика
obj.href = document.getElementById("URLaddress").value + to;//вывод
to=to+parseInt(document.getElementById("Step").value);//ID ссылка для след картинки

/*obj.onclick =  function(){var tmp_i = i; return  click_on_img()};//return не дает открыться картинке в новой вкладке*/

i++;
}
reset_prbar();
}

function click_on_img(i)//нажатие левой кнопки - во весь экран
{
cur_fulscreen_image=i;
var myimage = document.getElementById("img"+i);
var rw = myimage.naturalWidth;  // real image width 
var rh = myimage.naturalHeight; // real image height
var img_src = myimage.src;
return expand('1',img_src,'',rw,rh,220,220);
}

function rclick_on_img(i)//нажатие правой кнопки
{
var imgid = parseInt(document.getElementById("imageID").value) + i * parseInt(document.getElementById("Step").value) - 1;
var img_src = document.getElementById("user").value + imgid;
window.open(img_src,'_blank');
return false;
}

function right_arrow() // Открытие следующей картинки(движение вправо)
{ 	
document.getElementById("imageID").value=parseInt(document.getElementById("imageID").value) + parseInt(document.getElementById("Step").value)*(pic_on_page);//новый imageID
REdraw();
}

function left_arrow() // Открытие предыдущей картинки(движение влево)
{  
document.getElementById("imageID").value=parseInt(document.getElementById("imageID").value) - parseInt(document.getElementById("Step").value)*(pic_on_page);//новый imageID
REdraw();	
}

function key_detect(event)
{
switch (event.keyCode)
{
case 37: if(document.getElementById("fullscreen-container").offsetHeight==0) left_arrow();  else setTimeout('click_on_img(' + cur_fulscreen_image + '-1)', 50); break; //если offsetHeight то контейнер с картинкой скрыт
case 39: if(document.getElementById("fullscreen-container").offsetHeight==0) right_arrow(); else setTimeout('click_on_img(' + cur_fulscreen_image + '+1)', 50); break;
default: break;
}
}


//alert('message');