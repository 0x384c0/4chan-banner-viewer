var pic_on_page;//�������� �� ��������
var cur_fulscreen_image = 1;//����� �������� ������� �� ���� �����

var loaded_imgs = 0;//������� �������� ����
function inc_prbar()
{
loaded_imgs++;
document.getElementById("progress_bar").value ++;
}
function reset_prbar()//����� �������� �������� ����
{
loaded_imgs=0;
document.getElementById("progress_bar").value = 0;
document.getElementById("progress_bar").max = pic_on_page;
}

function Create() 
{
pic_on_page = document.getElementById("PicOnPage").value;//���-�� �������� ���������
var imagelisttmp = "";//������������ html ������
for (i=1;i<=pic_on_page;i++)
{
imagelisttmp =imagelisttmp + "<span id='exlink-"+i+"' class='image-link'><a href=''id = 'img_href"+i+"' target='_blank' name='expandfunc' onclick="+ '"'+"return click_on_img("+i+")"+ '"'+" oncontextmenu="+ '"'+"return rclick_on_img("+i+")"+ '"'+"  ><img src='' width = '120' height = '120'  id = 'img"+i+"' class='img preview' onload = "+ '"'+"inc_prbar();"+ '"'+" onerror = "+ '"'+"inc_prbar();"+ '"'+"/></a></span>";
}
document.getElementById("ImageList").innerHTML = imagelisttmp;//����� html �� ��������
REdraw();
reset_prbar();
}


function REdraw() 
{
var to = document.getElementById("imageID").value;//�������� ID ��������
to=parseInt(to);//������������� � int

var i = 1;
while (i <= pic_on_page) //��������� ��������� ��������
{
var obj = document.getElementById("img"+i);//�������� ��� obj
obj.src = document.getElementById("URLaddress").value + to;//������ ����� ������ ���  ��������

var obj = document.getElementById("img_href"+i);//������ ����� ������ ��� �������� ��� �����
obj.href = document.getElementById("URLaddress").value + to;//�����
to=to+parseInt(document.getElementById("Step").value);//ID ������ ��� ���� ��������

/*obj.onclick =  function(){var tmp_i = i; return  click_on_img()};//return �� ���� ��������� �������� � ����� �������*/

i++;
}
reset_prbar();
}

function click_on_img(i)//������� ����� ������ - �� ���� �����
{
cur_fulscreen_image=i;
var myimage = document.getElementById("img"+i);
var rw = myimage.naturalWidth;  // real image width 
var rh = myimage.naturalHeight; // real image height
var img_src = myimage.src;
return expand('1',img_src,'',rw,rh,220,220);
}

function rclick_on_img(i)//������� ������ ������
{
var imgid = parseInt(document.getElementById("imageID").value) + i * parseInt(document.getElementById("Step").value) - 1;
var img_src = document.getElementById("user").value + imgid;
window.open(img_src,'_blank');
return false;
}

function right_arrow() // �������� ��������� ��������(�������� ������)
{ 	
document.getElementById("imageID").value=parseInt(document.getElementById("imageID").value) + parseInt(document.getElementById("Step").value)*(pic_on_page);//����� imageID
REdraw();
}

function left_arrow() // �������� ���������� ��������(�������� �����)
{  
document.getElementById("imageID").value=parseInt(document.getElementById("imageID").value) - parseInt(document.getElementById("Step").value)*(pic_on_page);//����� imageID
REdraw();	
}

function key_detect(event)
{
switch (event.keyCode)
{
case 37: if(document.getElementById("fullscreen-container").offsetHeight==0) left_arrow();  else setTimeout('click_on_img(' + cur_fulscreen_image + '-1)', 50); break; //���� offsetHeight �� ��������� � ��������� �����
case 39: if(document.getElementById("fullscreen-container").offsetHeight==0) right_arrow(); else setTimeout('click_on_img(' + cur_fulscreen_image + '+1)', 50); break;
default: break;
}
}


//alert('message');