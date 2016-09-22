//constants
var imageUrlMasks = {
    "Namba"     : "http://d2.files.namba.kg/files/",
    "4chanGif"  : "http://s.4cdn.org/image/title/@d.gif",
    "4chanPng"  : "http://s.4cdn.org/image/title/@d.png"
};
//UI elements
var picOnPageInput,
    currentImageIdInput,
    imageUrlMaskSelector,
    imageUrlMaskInput;
//vars
var cur_fulscreen_image = 1;

//LifeCycle
window.addEventListener("DOMContentLoaded", domContentLoaded);
function domContentLoaded() {
    bindViews();
    loadDataToUrlSelector();
    loadStateFromCookies();
    createImageViews();
}
function bindViews() {
    picOnPageInput          = document.getElementById("PicOnPage");
    imageUrlMaskSelector    = document.getElementById("imageUrlMaskSelector");
    imageUrlMaskInput       = document.getElementById("URLaddress");
    currentImageIdInput     = document.getElementById("imageID");
}
function loadDataToUrlSelector() {
    for (var imageMask in imageUrlMasks){
        var opt = document.createElement('option');
        opt.value = imageUrlMasks[imageMask];
        opt.innerHTML = imageMask;
        imageUrlMaskSelector.appendChild(opt);
    }
}

function createImageViews() {

    var imageViewsHtmlText = "";
    for (i = 1; i <= picOnPageInput.value; i++) {
        imageViewsHtmlText = imageViewsHtmlText +
            "<span id='exlink-" + i + "' class='image-link'><a href=''id = 'img_href" + i +
            "' target='_blank' name='expandfunc' onclick=" + '"' + "return click_on_img(" + i + ")" +
            '"' + " oncontextmenu=" + '"' + "return rclick_on_img(" + i + ")" + '"' +
            "  ><img src='' width = '120' height = '120'  id = 'img" +  i +
            "' class='img preview' onload = " + '"' + "inc_prbar();" + '"' +
            " onerror = " + '"' + "inc_prbar();" + '"' + "/></a></span>";
    }
    document.getElementById("ImageList").innerHTML = imageViewsHtmlText;//paste generated image views in to div
    reloadImages();
    reset_prbar();
}


function reloadImages() {
    var to = currentImageIdInput.value;//получить ID картинки
    to = parseInt(to);//преобразовать в int

    var i = 1;
    while (i <= picOnPageInput.value) { //отрисовка остальных картинок

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

//UI actions
function onSelectUrlMask() {
    imageUrlMaskInput.value = imageUrlMaskSelector.value
    reloadImages();
    reset_prbar();
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
    var imgid = parseInt(currentImageIdInput.value) + i * parseInt(document.getElementById("Step").value) - 1;
    var img_src = document.getElementById("user").value + imgid;
    window.open(img_src, '_blank');
    return false;
}
function right_arrow() // Открытие следующей картинки(движение вправо)
{
    currentImageIdInput.value = parseInt(currentImageIdInput.value) + parseInt(document.getElementById("Step").value) * (picOnPageInput.value);//новый imageID

    reloadImages();
}
function left_arrow() // Открытие предыдущей картинки(движение влево)
{
    currentImageIdInput.value = parseInt(currentImageIdInput.value) - parseInt(document.getElementById("Step").value) * (picOnPageInput.value);//новый imageID

    reloadImages();
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

//State
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

function loadStateFromCookies() {
    var state = new GalleryDefaultState();
    imageUrlMaskInput.value = state.URLaddress;
    currentImageIdInput.value = state.imageID;
    document.getElementById("Step").value = state.Step;
    document.getElementById("PicOnPage").value = state.PicOnPage;
    document.getElementById("user").value = state.user;
}
function saveStateToCookies(){
    var to = currentImageIdInput.value;//получить ID картинки
    setCookie(self.imageID, to, "Mon, 01-Jan-3000 00:00:00 GMT", "/");
    var step = document.getElementById("Step").value;//получить шаг
    setCookie(self.Step, step, "Mon, 01-Jan-3000 00:00:00 GMT", "/");
}

//alert('message');

//progress bar
var loaded_imgs = 0;//счетчик прогресс бара
function inc_prbar() {
    loaded_imgs++;
    document.getElementById("progress_bar").value++;
}
function reset_prbar() {//сброс счетчика прогресс бара
    loaded_imgs = 0;
    document.getElementById("progress_bar").value = 0;
    document.getElementById("progress_bar").max = picOnPageInput.value;
}

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
