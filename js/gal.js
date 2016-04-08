var pic_on_page;//картинок на странице
var cur_fulscreen_image = 1;//номер картинка ктоорая во весь экран

var loaded_imgs = 0;//счетчик прогресс бара
function inc_prbar() {
    loaded_imgs++;
    document.getElementById("progress_bar").value++;
}
function reset_prbar() {//сброс счетчика прогресс бара
    loaded_imgs = 0;
    document.getElementById("progress_bar").value = 0;
    document.getElementById("progress_bar").max = pic_on_page;
}

function Create() {
    pic_on_page = document.getElementById("PicOnPage").value;//Кол-во картинок сохранить
    var imagelisttmp = "";//формирование html текста
    for (i = 1; i <= pic_on_page; i++) {
        imagelisttmp = imagelisttmp +
            "<span id='exlink-" + i + "' class='image-link'><a href=''id = 'img_href" + i +
            "' target='_blank' name='expandfunc' onclick=" + '"' + "return click_on_img(" + i + ")" +
            '"' + " oncontextmenu=" + '"' + "return rclick_on_img(" + i + ")" + '"' +
            "  ><img src='' width = '120' height = '120'  id = 'img" +  i +
            "' class='img preview' onload = " + '"' + "inc_prbar();" + '"' +
            " onerror = " + '"' + "inc_prbar();" + '"' + "/></a></span>";
    }
    document.getElementById("ImageList").innerHTML = imagelisttmp;//вывод html на страницу
    REdraw();
    reset_prbar();
}


function REdraw() {
    var to = document.getElementById("imageID").value;//получить ID картинки
    to = parseInt(to);//преобразовать в int

    var i = 1;
    while (i <= pic_on_page) { //отрисовка остальных картинок

        var img = document.getElementById("img" + i);//картинка как obj
        img.src = document.getElementById("URLaddress").value + to;//задать новую ссылку для  картинки

        var img_href = document.getElementById("img_href" + i);//задать новую ссылку для картинки для клика
        img_href.href = document.getElementById("URLaddress").value + to;//вывод
        to = to + parseInt(document.getElementById("Step").value);//ID ссылка для след картинки

        /*obj.onclick =  function(){var tmp_i = i; return  click_on_img()};//return не дает открыться картинке в новой вкладке*/

        i++;
    }
    reset_prbar();
    saveStateToCookies();
}

function click_on_img(i)//нажатие левой кнопки - во весь экран
{
    cur_fulscreen_image = i;
    var myimage = document.getElementById("img" + i);
    var rw = myimage.naturalWidth;  // real image width 
    var rh = myimage.naturalHeight; // real image height
    var img_src = myimage.src;
    return expand('1', img_src, '', rw, rh, 220, 220);
}

function rclick_on_img(i)//нажатие правой кнопки
{
    var imgid = parseInt(document.getElementById("imageID").value) + i * parseInt(document.getElementById("Step").value) - 1;
    var img_src = document.getElementById("user").value + imgid;
    window.open(img_src, '_blank');
    return false;
}

function right_arrow() // Открытие следующей картинки(движение вправо)
{
    document.getElementById("imageID").value = parseInt(document.getElementById("imageID").value) + parseInt(document.getElementById("Step").value) * (pic_on_page);//новый imageID

    REdraw();
}

function left_arrow() // Открытие предыдущей картинки(движение влево)
{
    document.getElementById("imageID").value = parseInt(document.getElementById("imageID").value) - parseInt(document.getElementById("Step").value) * (pic_on_page);//новый imageID

    REdraw();
}

function key_detect(event) {
    switch (event.keyCode) {
        case 37:
            if (document.getElementById("fullscreen-container").offsetHeight == 0)
                left_arrow();
            else
                setTimeout('click_on_img(' + cur_fulscreen_image + '-1)', 50);
            break; //если offsetHeight то контейнер с картинкой скрыт
        case 39:
            if (document.getElementById("fullscreen-container").offsetHeight == 0)
                right_arrow();
            else
                setTimeout('click_on_img(' + cur_fulscreen_image + '+1)', 50);
            break;
        default:
            break;
    }
}

window.addEventListener("DOMContentLoaded", loadStateToWindow);
function loadStateToWindow() {
    var state = new GalleryDefaultState();
    document.getElementById("URLaddress").value = state.URLaddress;
    document.getElementById("imageID").value = state.imageID;
    document.getElementById("Step").value = state.Step;
    document.getElementById("PicOnPage").value = state.PicOnPage;
    document.getElementById("user").value = state.user;
    Create();
}


function GalleryDefaultState() {
    //default values
    this.URLaddress = "http://d2.files.namba.kg/files/";

    var imageid = getCookie(self.imageID);
    var step = getCookie(self.Step);

    if (imageid != undefined)
        this.imageID = imageid;
    else
        this.imageID = 321;

    if (step != undefined)
        this.Step = step;
    else
        this.Step = 1;

    this.PicOnPage = 60;
    this.user = "http://namba.kg/#!/photo/";


}

function saveStateToCookies(){
    var to = document.getElementById("imageID").value;//получить ID картинки
    setCookie(self.imageID, to, "Mon, 01-Jan-3000 00:00:00 GMT", "/");
    var step = document.getElementById("Step").value;//получить шаг
    setCookie(self.Step, step, "Mon, 01-Jan-3000 00:00:00 GMT", "/");
}

//alert('message');


//cookies
var
    URLaddress = "cookies.URLaddress",
    imageID = "cookies.imageID",
    Step = "cookies.Step",
    PicOnPage = "cookies.PicOnPage",
    userUrl = "cookies.userUrl";


function getCookie(name) { // возвращает cookie с именем name, если есть, если нет, то undefined
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));


    return matches ? decodeURIComponent(matches[1]) : undefined;
}
function setCookie (name, value, expires, path, domain, secure) {

    document.cookie = name + "=; expires=Fri, 31 Dec 1999 23:59:59 GMT;";

    document.cookie = name + "=" + value +
        ((expires) ? "; expires=" + expires : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");


}
