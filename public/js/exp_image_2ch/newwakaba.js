var postByNum = [];
var ajaxPosts = [];
var ajaxThrds = {};
var refMap = [];
var Posts = [];
var opPosts = [];
var pView, dForm, pForm, pArea, makabadmin, QuickReplyLastPostNum;
var threadIntervalID = null;
var board = window.location.toString().split('/')[3];
var isIE = /*@cc_on!@*/0;
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt) {
        var len = this.length >>> 0;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0)
            from += len;
        for (; from < len; from++) {
            if (from in this && this[from] === elt)
                return from;
        }
        return -1;
    };
}
function get_cookie(name) {
    with (document.cookie) {
        var regexp = new RegExp('(^|;\\s+)' + name + '=(.*?)(;|$)');
        var hit = regexp.exec(document.cookie);
        if (hit && hit.length > 2)return unescape(hit[2]); else return '';
    }
}
function set_cookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        var expires = '; expires=' + date.toGMTString();
    }
    else expires = '';
    document.cookie = name + '=' + value + expires + '; path=/';
}
function $id(id) {
    return document.getElementById(id);
}
function $n(id) {
    return document.getElementsByName(id)[0];
}
function $t(id, root) {
    return (root || document).getElementsByTagName(id);
}
function $c(id, root) {
    return (root || document).getElementsByClassName(id);
}
function $each(arr, fn) {
    for (var el, i = 0; el = arr[i++];)
        fn(el);
}
function $html(el, htm) {
    var cln = el.cloneNode(false);
    cln.innerHTML = htm;
    el.parentNode.replaceChild(cln, el);
    return cln;
}
function $attr(el, attr) {
    for (var key in attr) {
        if (key == 'text') {
            el.textContent = attr[key];
            continue;
        }
        if (key == 'value') {
            el.value = attr[key];
            continue;
        }
        if (key == 'html') {
            el.innerHTML = attr[key];
            continue;
        }
        el.setAttribute(key, attr[key]);
    }
    return el;
}
function $event(el, events) {
    for (var key in events) {
        if (!events.hasOwnProperty(key))continue;
        if (el.addEventListener) {
            el.addEventListener(key, events[key], false);
        } else {
            el.attachEvent(key, events[key]);
        }
    }
}
function $before(el, nodes) {
    for (var i = 0, len = nodes.length; i < len; i++)
        if (nodes[i])el.parentNode.insertBefore(nodes[i], el);
}
function $after(el, nodes) {
    var i = nodes.length;
    while (i--)if (nodes[i])el.parentNode.insertBefore(nodes[i], el.nextSibling);
}
function $new(tag, attr, events) {
    var el = document.createElement(tag);
    if (attr)$attr(el, attr);
    if (events)$event(el, events);
    return el;
}
function $disp(el) {
    el.style.display = el.style.display == 'none' ? '' : 'none';
}
function $del(el) {
    if (!el)return;
    if (el.parentNode)el.parentNode.removeChild(el);
}
function $offset(el, xy) {
    var c = 0;
    while (el) {
        c += el[xy];
        el = el.offsetParent;
    }
    return c;
}
function $close(el) {
    if (!el)return;
    var h = el.clientHeight - 18;
    el.style.height = h + 'px';
    var i = 8;
    var closing = setInterval(function () {
        if (!el || i-- < 0) {
            clearInterval(closing);
            $del(el);
            return;
        }
        var s = el.style;
        s.opacity = i / 10;
        s.paddingTop = parseInt(s.paddingTop) - 1 + 'px';
        s.paddingBottom = parseInt(s.paddingBottom) - 1 + 'px';
        var hh = parseInt(s.height) - h / 10;
        s.height = (hh < 0 ? 0 : hh) + 'px';
    }, 35);
}
function $show(el) {
    var i = 0;
    var showing = setInterval(function () {
        if (!el || i++ > 8) {
            clearInterval(showing);
            return;
        }
        var s = el.style;
        s.opacity = i / 10;
        s.paddingTop = parseInt(s.paddingTop) + 1 + 'px';
        s.paddingBottom = parseInt(s.paddingBottom) + 1 + 'px';
    }, 35);
}
function _disabled_insert(txt) {
    var el = document.forms.postform.shampoo;
    if (el) {
        if (el.createTextRange && el.caretPos) {
            var caretPos = el.caretPos;
            caretPos.txt = caretPos.txt.charAt(caretPos.txt.length - 1) == ' ' ? txt + ' ' : txt;
        }
        else if (el.setSelectionRange) {
            var start = el.selectionStart;
            var end = el.selectionEnd;
            el.value = el.value.substr(0, start) + txt + el.value.substr(end);
            el.setSelectionRange(start + txt.length, start + txt.length);
        }
        else el.value += txt + ' ';
        el.focus();
    }
}
function AJAX(b, id, fn) {
    var xhr;
    if (window.XMLHttpRequest)xhr = new XMLHttpRequest()
    else if (window.ActiveXObject) {
        try {
            xhr = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {
            }
        }
    }
    else return false;
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4)return;
        if (xhr.status == 200) {
            var x = xhr.responseText;
            x = x.split(/<form[^>]+posts[^>]+>/)[1].split('</form>')[0];
            var thrds = x.substring(0, x.lastIndexOf(x.match(/<br[^>]+left/))).split(/<br[^>]+left[^>]*>\s*<hr[^>]*>/);
            for (var i = 0, tLen = thrds.length; i < tLen; i++) {
                var tNum = thrds[i].match(/<input[^>]+checkbox[^>]+>/i)[0].match(/(\d+)/)[0];
                var posts = thrds[i].split(/<table[^>]*>/);
                ajaxThrds[tNum] = {keys: [], pcount: posts.length};
                for (var j = 0, pLen = posts.length; j < pLen; j++) {
                    var x = posts[j];
                    var pNum = x.match(/<input[^>]+checkbox[^>]+>/i)[0].match(/(\d+)/)[0];
                    ajaxThrds[tNum].keys.push(pNum);
                    ajaxPosts[pNum] = x.substring(!/<td/.test(x) && /filesize[^>]*>/.test(x) ? x.search(/filesize[^>]*>/) - 13 : x.indexOf('<label'), /<td/.test(x) ? x.lastIndexOf('</td') : (/omittedposts[^>]*>/.test(x) ? x.lastIndexOf('</span') + 7 : x.lastIndexOf('</blockquote') + 13));
                    ajaxRefmap(ajaxPosts[pNum].substr(ajaxPosts[pNum].indexOf('<blockquote>') + 12), pNum);
                }
            }
            fn();
        }
        else fn('HTTP ' + xhr.status + ' ' + xhr.statusText);
    };
    xhr.open('GET', '/' + b + '/res/' + id + '.html', true);
    xhr.setRequestHeader('Accept-Encoding', 'deflate, gzip, x-gzip');
    xhr.send();
}
function getRefMap(pNum, rNum) {
    if (!refMap[rNum])refMap[rNum] = [];
    if ((',' + refMap[rNum].toString() + ',').indexOf(',' + pNum + ',') < 0)
        refMap[rNum].push(pNum);
}
function ajaxRefmap(txt, pNum) {
    var x = txt.match(/&gt; &gt; \d+/g);
    if (x)for (var i = 0; rLen = x.length, i < rLen; i++)
        getRefMap(pNum, x[i].match(/\d+/g));
}
function showRefMap(post, pNum, isUpd) {
    if (typeof refMap[pNum] !== 'object' || !post)return;
    var txt = 'Ответы: ' + refMap[pNum].toString().replace(/(\d+)/g, '<a href="#$1" onmouseover="showPostPreview(event)" onmouseout="delPostPreview(event)">&gt;&gt;$1</a>');
    var el = isUpd ? $id('ABU-refmap-' + pNum) : null;
    if (!el) {
        el = $new('div', {'class': 'ABU-refmap', 'id': 'ABU-refmap-' + pNum, 'html': txt});
        $after($t('blockquote', post)[0], [el]);
    }
    else $html(el, txt);
}
function addRefMap(post) {
    $each($t('a', post), function (link) {
        if (link.textContent.indexOf('>>') == 0) {
            var rNum = link.hash.match(/\d+/);
            if (postByNum[rNum]) {
                while ((link = link.parentNode).tagName != 'BLOCKQUOTE');
                getRefMap(link.parentNode.id.match(/\d+/), rNum);
            }
        }
    });
    for (var rNum in refMap)
        showRefMap(postByNum[rNum], rNum, Boolean(post));
}
function buildTablePost(id) {
    return $new('table', {
        'class': 'post',
        'id': 'post-' + id,
        'html': '<tbody><tr> ' + ajaxPosts[id] + ' </tr></tbody>'
    });
}
function _disabled_updateThread() {
    var btn = $id('ABU-getnewposts');
    btn.innerHTML = '[<span style="cursor:default">Обновить тред</span>]';
    $alert('Загрузка...', 'wait');
    var thrd = $c('thread')[0];
    var tNum = thrd.id.match(/\d+/)[0];
    var last = Posts.length + 1;
    AJAX(board, tNum, function (err) {
        $close($id('ABU-alert-wait'));
        if (err) {
            $alert(err);
            return;
        }
        if (ajaxThrds[tNum].pcount - last == 0)$alert('Нет новых постов');
        for (var i = last, len = ajaxThrds[tNum].pcount; i < len; i++) {
            var pNum = ajaxThrds[tNum].keys[i];
            var post = buildTablePost(pNum);
            post.Num = pNum;
            thrd.appendChild(post);
            postByNum[pNum] = post;
            Posts.push(post);
            eventPostPreview(post);
            addRefMap(post);
        }
        setTimeout(function () {
            btn.innerHTML = '[<a href="#" onclick="updateThread(); return false;">Обновить тред</a>]';
        }, 2000);
    }, true);
}
function _disabled_expandThread(tNum, last) {
    $alert('Загрузка...', 'wait');
    var thrd = $id('thread-' + tNum);
    AJAX(board, tNum, function (err) {
        $close($id('ABU-alert-wait'));
        if (err) {
            $alert(err);
            return;
        }
        var oppost = postByNum[tNum];
        var opbloq = $t('blockquote', oppost)[0];
        while (opbloq.nextSibling)$del(opbloq.nextSibling);
        while (oppost.nextSibling)$del(oppost.nextSibling);
        var len = ajaxThrds[tNum].keys.length;
        last = last ? len - last : 1;
        if (last > 1)oppost.appendChild($new('span', {
            'class': 'omittedposts', 'text': ' Пропущено ' + parseInt(last - 1)
            + ' ответов. Нажмите "ответ", чтобы увидеть тред целиком.'
        }));
        for (var i = last; i < len; i++) {
            var pNum = ajaxThrds[tNum].keys[i];
            var post = buildTablePost(pNum);
            post.Num = pNum;
            thrd.appendChild(post);
            postByNum[pNum] = post;
            Posts.push(post);
            eventPostPreview(post);
            addRefMap(post);
        }
    });
}
function expandPost(link) {
    $alert('Загрузка...', 'wait');
    var tNum = link.pathname.match(/\/(\d+)\./)[1];
    var pNum = link.hash.match(/\d+/) || tNum;
    AJAX(board, tNum, function (err) {
        $close($id('ABU-alert-wait'));
        if (err)return;
        link.parentNode.parentNode.innerHTML = ajaxPosts[pNum].substr(ajaxPosts[pNum].indexOf('class="postMessage">') + 20, ajaxPosts[pNum].indexOf('</blockquote>'));
    });
}
function areYouShure(el) {
    if (confirm('Вы уверены в своих действиях?')) {
        document.location = el.href;
    }
    return false;
}
function writeBan(el) {
    var reason = prompt('Напишите причину бана, пожалуйста:');
    if (reason)document.location = el.href + '&comment=' + encodeURIComponent(reason);
    return false;
}
function writeBoard(el) {
    var reason = prompt('Укажите доску, куда перенести тред:');
    if (reason)document.location = el.href + '&new_board=' + encodeURIComponent(reason);
    return false;
}
function addDate(n) {
    var d = new Date();
    d.setTime(d.getTime() + n * 24 * 60 * 60 * 1000);
    return d.getFullYear().toString() + '%2F' + (d.getMonth() + 1).toString() + '%2F' + d.getDate().toString();
}
function getMultiplePostsForBanset() {
    var ToAction = "";
    var All = document.forms['posts-form'];
    for (var i = 0; i < All.elements.length; ++i) {
        if (All.elements[i].checked) {
            ToAction += "&mod_id_" + All.elements[i].value + "=" + board + "_" + All.elements[i].value;
        }
    }
    return ToAction;
}
function removeAdminMenu(e) {
    var el = e.relatedTarget;
    while (1) {
        if (el.id == 'ABU-select')break; else {
            el = el.parentNode;
            if (!el)break;
        }
    }
    if (!el)$del($id('ABU-select'));
}
function addAdminMenu(el) {
    var pNum = $(el).closest('.post').data('num');
    var pMultipleNums = getMultiplePostsForBanset();
    if (pMultipleNums == "") {
        pMultipleNums = '&mod_id_single=' + board + '_' + pNum;
    }
    document.body.appendChild($new('div', {
        'class': 'reply',
        'id': 'ABU-select',
        'style': 'left:' + ($offset(el, 'offsetLeft').toString() - 18) + 'px; top:' +
        ($offset(el, 'offsetTop') + el.offsetHeight - 1).toString() + 'px',
        'html': '<a href="/makaba/makaba.fcgi?task=moder&action=posts_del' + pMultipleNums + '" onclick="return areYouShure(this)\">Удалить</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_ban' + pMultipleNums + '" onclick="return writeBan(this)\">Забанить</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_ban' + pMultipleNums + '&expires=' + addDate(2) + '" onclick="return writeBan(this)\">Забанить на два дня</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_ban' + pMultipleNums + '&expires=' + addDate(7) + '" onclick="return writeBan(this)\">Забанить на неделю</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_ban' + pMultipleNums + '&expires=' + addDate(30) + '" onclick="return writeBan(this)\">Забанить на месяц</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_del_ban' + pMultipleNums + '" onclick="return writeBan(this)\">Удалить и забанить</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_del_ban' + pMultipleNums + '&expires=' + addDate(2) + '" onclick="return writeBan(this)\">Удалить и забанить на два дня</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_del_ban' + pMultipleNums + '&expires=' + addDate(7) + '" onclick="return writeBan(this)\">Удалить и забанить на неделю</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_del_all' + pMultipleNums + '" onclick="return areYouShure(this)\">Удалить всё</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_del_all_ban' + pMultipleNums + '" onclick="return writeBan(this)\">Удалить всё и забанить</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_del_all_ban' + pMultipleNums + '&expires=' + addDate(2) + '" onclick="return writeBan(this)\">Удалить всё и забанить на два дня</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_del_all_in_thread' + pMultipleNums + '" onclick="return areYouShure(this)\">Удалить всё в треде</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_del_file' + pMultipleNums + '" onclick="return areYouShure(this)\">Удалить файл</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_mark' + pMultipleNums + '&mark_type=2" onclick="return areYouShure(this)\">Выдать предупреждение</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_mark' + pMultipleNums + '&mark_type=1" onclick="return areYouShure(this)\">Метка о бане</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=thread_stick' + pMultipleNums + '" onclick="return areYouShure(this)\">Прикрепить тред</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=thread_unstick' + pMultipleNums + '" onclick="return areYouShure(this)\">Открепить тред</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=thread_open' + pMultipleNums + '" onclick="return areYouShure(this)\">Открыть тред</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=thread_close' + pMultipleNums + '" onclick="return areYouShure(this)\">Закрыть тред</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=thread_move' + pMultipleNums + '" onclick="return writeBoard(this)\">Перенести тред</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=post_edit_show' + pMultipleNums + '" onclick="return areYouShure(this)\">Редактировать пост</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=add_mod_tag' + pMultipleNums + '" onclick="return areYouShure(this)\">Добавить мод тег</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_del_everywhere' + pMultipleNums + '" class="mod-action-massban" onclick="return areYouShure(this)\">Удалить всё на борде</a>'
        + '<a href="/makaba/makaba.fcgi?task=moder&action=posts_del_everywhere_ban' + pMultipleNums + '" class="mod-action-massban" onclick="return writeBan(this)\">Удалить все и забанить на борде</a>'
    }, {'mouseout': removeAdminMenu}));
}
function removePostOptionMenu(e) {
    var el = e.relatedTarget;
    while (1) {
        if (el.id == 'ABU-select')break; else {
            el = el.parentNode;
            if (!el)break;
        }
    }
    if (!el)$del($id('ABU-select'));
}
function addPostOptionMenu(el) {
    var pNum = el.parentNode.parentNode.parentNode.id.match(/\d+/);
    var pMultipleNums = getMultiplePostsForBanset();
    if (pMultipleNums == "") {
        pMultipleNums = '&mod_id_single=' + board + '_' + pNum;
    }
    document.body.appendChild($new('div', {
        'class': 'reply',
        'id': 'ABU-select',
        'style': 'left:' + ($offset(el, 'offsetLeft').toString() - 18) + 'px; top:' +
        ($offset(el, 'offsetTop') + el.offsetHeight - 1).toString() + 'px',
        'html': '<a href="" class="postbtn-reply-href">Ответить</a>' + '<a href="" onclick="return areYouShure(this)\">Пожаловаться</a>' + '<a href="" onclick="return areYouShure(this)\">Скрыть</a>' + '<a href="" onclick="return areYouShure(this)\">Найти картинку в google</a>'
    }, {'mouseout': removePostOptionMenu}));
}
function $alert(txt, id) {
    var el, nid = 'ABU-alert';
    if (id) {
        nid += '-' + id;
        el = $id(nid);
    }
    if (!el) {
        el = $new('div', {
            'class': 'reply',
            'id': nid,
            'style': 'float:right; clear:both; opacity:0; width:auto; min-width:0; padding:0 10px 0 10px;' + ' margin:1px; overflow:hidden; white-space:pre-wrap; outline:0; border:1px solid grey'
        });
        if (id == 'wait')el.appendChild($new('span', {'class': 'ABU-icn-wait'}));
        el.appendChild($new('div', {'style': 'display:inline-block; margin-top:4px'}));
        $show($id('ABU-alertbox').appendChild(el));
    }
    $t('div', el)[0].innerHTML = txt;
    if (id != 'wait')setTimeout(function () {
        $close(el);
    }, 6000);
}
function reverseCaptcha(e) {
    if (e.which < 1040 || e.which > 1279) {
        return;
    }
    e.preventDefault();
    var data = "f,dult;pbqrkvyjghcnea[wxio]sm'.z";
    var index = e.which - 1072;
    if (index < 0 || index >= data.length) {
        return;
    }
    var key = data[index];
    if (key < 'a' || key > 'z') {
        return;
    }
    e.target.value = e.target.value + key;
}
function GetCaptcha(CaptchaDiv, PostFormCaptcha) {
    var Resp = '';
    var UserCode = get_cookie('usercode');
    var Url = '/makaba/captcha.fcgi';
    if (UserCode != '' && PostFormCaptcha) {
        Url += '?usercode=' + UserCode;
    }
    $.ajax({
        url: Url, dataType: "html", timeout: 20000, async: false, success: function (data) {
            Resp = data;
        }
    });
    if (Resp.indexOf("VIPFAIL") != -1) {
        Resp = '<span class=\"captcha-notif\">Ваш пасс-код не действителен, пожалуйста, перелогиньтесь..</span>';
    } else if (Resp.indexOf("VIP") != -1) {
        Resp = '<span class=\"captcha-notif\">Вам не нужно вводить капчу, у вас введен пасс-код.</span>';
    } else if (Resp.indexOf("CHECK") != -1) {
        var Key = Resp.substr(Resp.lastIndexOf("\n") + 1);
        if (CaptchaDiv == '') {
            Resp = '<input type="hidden" name="captcha" id="captcha-captcha-div" value="' + Key + '"><img src="' + window.location.protocol + '//captcha.yandex.net/image?key=' + Key + '" onclick="GetCaptcha(\'captcha-div\', ';
        } else {
            Resp = '<input type="hidden" name="captcha" id="captcha-' + CaptchaDiv + '" value="' + Key + '"><img src="' + window.location.protocol + '//captcha.yandex.net/image?key=' + Key + '" onclick="GetCaptcha(\'' + CaptchaDiv + '\', ';
        }
        if (PostFormCaptcha) {
            Resp += 'true);"><br><input type="text" autocomplete="off" name="captcha_value_id_06">';
        } else {
            Resp += 'false);">';
        }
    } else {
        Resp = '<p>' + Resp + '</p>';
    }
    if (CaptchaDiv == '') {
        document.write(Resp);
    } else {
        $id(CaptchaDiv).innerHTML = Resp;
    }
}
function UnbanHide(ids) {
    $(ids).parent().hide();
}
function UnbanShow() {
    $('#unban-div').css("display", "");
    GetCaptcha('unban-captcha-div', false);
}
function UnbanSubmit() {
    var HashArray = new Object();
    HashArray['task'] = 'unban';
    HashArray['captcha'] = $('#captcha-unban-captcha-div').val();
    HashArray['captcha_value'] = $('#unban-captcha-input').val();
    HashArray['ban_num'] = $('#unban-ban-num-input').val();
    HashArray['request'] = $('#unban-comment-input').val();
    var Multipart = '--AaB03x';
    for (var k in HashArray) {
        if (HashArray.hasOwnProperty(k)) {
            Multipart += '\r\nContent-Disposition: form-data; name="' + k + '"\r\n\r\n' + HashArray[k] + '\r\n--AaB03x';
        }
    }
    Multipart += '--\r\n';
    $.ajax({
        type: "POST",
        url: '/makaba/makaba.fcgi',
        data: Multipart,
        dataType: "html",
        async: false,
        contentType: 'multipart/form-data; charset=UTF-8; boundary=AaB03x',
        success: function (data, status) {
            try {
                var JSONData = $.parseJSON(data);
                if (JSONData.Error == null) {
                    alert(JSONData.Result);
                }
                else {
                    alert(JSONData.Error);
                }
            }
            catch (e) {
            }
        },
        error: function (xhr, desc, err) {
            alert('Ошибка соединения!');
        }
    });
    $('#unban-div').hide();
    $('#unban-form')[0].reset();
}
function UnbanHide(ids) {
    $(ids).parent().hide();
}
function UnbanShow() {
    $('#unban-div').css("display", "");
    GetCaptcha('unban-captcha-div', false);
}
function UnbanSubmit() {
    var HashArray = {};
    HashArray['task'] = 'unban';
    HashArray['captcha'] = $('#captcha-unban-captcha-div').val();
    HashArray['captcha_value'] = $('#unban-captcha-input').val();
    HashArray['ban_num'] = $('#unban-ban-num-input').val();
    HashArray['request'] = $('#unban-comment-input').val();
    var Multipart = '--AaB03x';
    for (var k in HashArray) {
        if (HashArray.hasOwnProperty(k)) {
            Multipart += '\r\nContent-Disposition: form-data; name="' + k + '"\r\n\r\n' + HashArray[k] + '\r\n--AaB03x';
        }
    }
    Multipart += '--\r\n';
    $.ajax({
        type: "POST",
        url: '/makaba/makaba.fcgi',
        data: Multipart,
        dataType: "html",
        async: false,
        contentType: 'multipart/form-data; charset=UTF-8; boundary=AaB03x',
        success: function (data, status) {
            try {
                var JSONData = $.parseJSON(data);
                if (JSONData.Error == null) {
                    alert(JSONData.Result);
                }
                else {
                    alert(JSONData.Error);
                }
            }
            catch (e) {
            }
        },
        error: function (xhr, desc, err) {
            alert('Ошибка соединения!');
        }
    });
    $('#unban-div').hide();
    $('#unban-form')[0].reset();
}
function ToggleNormalReply(e) {
    if (!$id(e).hasChildNodes()) {
        pArea = $c(e)[0];
        pArea.append(pForm);
        pForm = pArea.firstChild;
        if (dForm)$attr(pArea.firstChild, {'target': 'ABU_submitframe'});
        $id(e + 'Label').innerHTML = 'Закрыть форму постинга';
        if ($id("adcopy-response")) {
            $id("adcopy-response").onkeypress = reverseCaptcha;
        }
    } else {
        pArea = $id('postform')[0];
        pArea.append(pForm);
        pForm = pArea.firstChild;
        if (isMain)$id(e + 'Label').innerHTML = 'Создать тред'; else $id(e + 'Label').innerHTML = 'Ответить в тред';
    }
}
function addQuickReply(pNum) {
    if (pNum != QuickReplyLastPostNum) {
        var post = postByNum[pNum];
        var tNum = post.parentNode.id.match(/\d+/);
        var Sel = GetSelectedText();
        pArea = post.parentNode;
        pArea.insertBefore(pForm, post.nextSibling);
        pForm = post.nextSibling;
        $attr(pForm, {'target': 'ABU_submitframe'});
        $n('thread').value = tNum;
        if (Sel) {
            insert('>>' + pNum + '\n>' + Sel + '\n');
        } else {
            insert('>>' + pNum + '\n');
        }
        addDate(1);
        QuickReplyLastPostNum = pNum;
        if (isMain)$id('TopNormalReplyLabel').innerHTML = $id('BottomNormalReplyLabel').innerHTML = 'Создать тред'; else $id('TopNormalReplyLabel').innerHTML = $id('BottomNormalReplyLabel').innerHTML = 'Ответить в тред';
    } else {
        pArea = $id('postform')[0];
        pArea.append(pForm);
        pForm = pArea.firstChild;
        QuickReplyLastPostNum = null;
    }
}
function doPost() {
    postform = $('#postform');
    var HashArray = {};
    postslength1 = $(".thread > div").length + 1;
    var fields = ['task', 'board', 'thread', 'code', 'email', 'captcha', 'icon', 'subject', 'name'];
    var len = fields.length;
    for (var i = 0; i < len; i++) {
        var field = fields[i];
        if (postform.find('input[name="' + field + '"]').val()) {
            HashArray[field] = postform.find('input[name="' + field + '"]').val();
        }
    }
    if (postform.find('input[name="captcha_value_id_06"]').val()) {
        HashArray['captcha_value_id_06'] = postform.find('input[name="captcha_value_id_06"]').val();
    }
    if (get_cookie('usercode')) {
        HashArray['usercode'] = get_cookie('usercode');
    }
    if (postform.find('input[name="image1"]').val() !== '') {
        var fd = new FormData();
        if ($('#image1')[0] !== undefined && $('#image1')[0].files !== undefined && $('#image1')[0].files[0] !== undefined) {
            fd.append('image', $('#image1')[0].files[0]);
        }
        fd.append('id', '123');
        fd.append('type', 'one');
        fd.append('img', $('#image1')[0].files[0]);
        HashArray['image1'] = new FormData();
        HashArray['image1']['type'] = 'jpg';
    }
    if (postform.find('textarea[name="comment"]').val()) {
        HashArray['comment'] = postform.find('textarea[name="comment"]').val();
    }
    var Multipart = '--AaB03x';
    for (var k in HashArray) {
        if (HashArray.hasOwnProperty(k)) {
            if (k == 'image1') {
                Multipart += '\r\nContent-Disposition: form-data; name="image1"; filename="hueta"\r\n\r\n' + $('#image1')[0].files[0] + '\r\n--AaB03x';
            } else {
                Multipart += '\r\nContent-Disposition: form-data; name="' + k + '"\r\n\r\n' + HashArray[k] + '\r\n--AaB03x';
            }
        }
    }
    Multipart += '--\r\n';
    console.debug(Multipart);
    $.ajax({
        type: "POST",
        url: '/makaba/makaba.fcgi',
        data: Multipart,
        dataType: "html",
        async: false,
        contentType: 'multipart/form-data; charset=UTF-8; boundary=AaB03x',
        success: function (data, status) {
            try {
                var JSONData = $.parseJSON(data);
                if (JSONData.Error == null) {
                    var board = postform.find('input[name="board"]').val();
                    var thread = postform.find('input[name="thread"]').val();
                    $alert('Сообщение успешно добавлено. Обновляем!');
                    postform.find('#shampoo').val('');
                    updatePosts(null, JSONData.Num);
                    /*$.getJSON("http://2ch.hk/"+board+"/res/"+thread+".json").done(
                     function(data){
                     //alert(data);
                     postslength2 = data.threads[0].posts.length;
                     //$alert('Количество постов после = '+postslength2);
                     for(var i=1;i<data.threads[0].posts.length;i++){
                     //i = data.threads[0].posts.length-1;
                     var thumb = '';
                     if (data.threads[0].posts[i].thumbnail !== void(0)) {
                     thumb = '<span class="filesize"><a href="'+data.threads[0].posts[i].image+'" target="_blank">'+data.threads[0].posts[i].image_name+'</a>&nbsp;<em>'+data.threads[0].posts[i].size+', '+data.threads[0].posts[i].width+'x'+data.threads[0].posts[i].height+'</em>)&nbsp;</span><span class="thumbnailmsg">Показана уменьшенная копия, оригинал по клику.</span><br class="turnmeoff"><span id="exlink-'+data.threads[0].posts[i].num+'"><a onclick="expand('+data.threads[0].posts[i].num+',\''+data.threads[0].posts[i].image+'\',\''+data.threads[0].posts[i].thumbnail+'\','+data.threads[0].posts[i].width+','+data.threads[0].posts[i].height+','+data.threads[0].posts[i].tn_width+','+data.threads[0].posts[i].tn_height+'); return false;" name="expandfunc" href="'+data.threads[0].posts[i].image+'"><img width="'+data.threads[0].posts[i].tn_width+'" height="'+data.threads[0].posts[i].tn_height+'" class="img" alt="'+data.threads[0].posts[i].size+'" src="'+data.threads[0].posts[i].thumbnail+'"><\/a></span>';
                     }

                     var name = '';

                     if(data.threads[0].posts[i].email){
                     name = '<a href="'+data.threads[0].posts[i].email+'">'+data.threads[0].posts[i].name+'<\/a>';
                     } else {
                     name = data.threads[0].posts[i].name;
                     }

                     var trip='';
                     if(data.threads[0].posts[i].trip == '!!%adm%!!') {
                     trip = '<span class="adm">## Abu ##<\/span>';
                     }else if(data.threads[0].posts[i].trip == '!!%mod%!!') {
                     trip = '<span class="mod">## Mod ##<\/span>';
                     }else if(data.threads[0].posts[i].trip == '!!%Inquisitor%!!') {
                     trip = '<span class="inquisitor">## Applejack ##<\/span>';
                     }else if(data.threads[0].posts[i].trip == '!!%coder%!!') {
                     trip = '<span class="mod">## Кодер ##<\/span>';
                     }else {
                     trip = '<span class="postertrip">'+data.threads[0].posts[i].trip+'<\/span>';
                     }

                     var hiclass = '';

                     if(data.threads[0].posts[i].num == JSONData.Num){
                     hiclass = ' hiclass'
                     }

                     var op = '';

                     if(data.threads[0].posts[i].op !== 0){
                     op = '<font color="green"># OP</font>&nbsp;';
                     }

                     var reflink = '';

                     if(data.threads[0].posts[i].parent == 0){
                     reflink = '<a href="javascript:insert(\'>>'+data.threads[0].posts[i].num+'\')">№'+data.threads[0].posts[i].num+'<\/a>&nbsp;';
                     }else {
                     reflink = '<a href="\/'+data.threads[0].posts[i].board+'\/res\/'+data.threads[0].posts[i].parent+'.html#'+data.threads[0].posts[i].num+'">№<\/a><a href="javascript:insert(\'>>'+data.threads[0].posts[i].num+'\')" onclick="javascript:addQuickReply(\''+data.threads[0].posts[i].num+'\'); return false;">'+data.threads[0].posts[i].num+'</a>';
                     }

                     //var match;

                     //if(match = />>/.exec(data.threads[0].posts[i].comment.toString())){
                     //    $alert('Есть совпадение');
                     //}
                     //var refid = data.threads[0].posts[i].comment.toString().match(new RegExp(/^[0-9]+$/i));
                     //var refid = data.threads[0].posts[i].comment.match(/>>/g).length;
                     //$alert(refid);

                     var video = '';

                     if(data.threads[0].posts[i].video !== void(0)) {
                     video = '<div style="float: left; margin: 5px; margin-right:10px">'+data.threads[0].posts[i].video+'<\/div>';
                     }

                     var commentmessage = '';

                     if(data.threads[0].posts[i].banned !== 0) {

                     if(data.threads[0].posts[i].banned == 1) {
                     commentmessage = '<br/><font color="#C12267"><em>(Автор этого поста был забанен. Помянем.)</em></font>';
                     }

                     if(data.threads[0].posts[i].banned == 2) {
                     commentmessage = '<br/><font color="#C12267"><em>(Автор этого поста был предупрежден.)</em></font>';
                     }

                     }

                     //<div class="image_details"></div>
                     // <div class="ABU_refmap" id="ABU_refmap_51672519">Ответы: <a href="#51672941" onmouseover="showPostPreview(event)" onmouseout="delPostPreview(event)">&gt;&gt;51672941</a></div>

                     var postshtml = '<div class="post" id="post-'+data.threads[0].posts[i].num+'">' +
                     '<div id="'+data.threads[0].posts[i].num+'" class="reply'+hiclass+'"><div class="post-details">' +
                     '<input type="checkbox" value="'+data.threads[0].posts[i].num+'" class="turnmeoff" name="delete">' +
                     '<span class="filetitle">'+data.threads[0].posts[i].subject+'<\/span>' +
                     '&nbsp;'+name+'&nbsp;'+trip+'&nbsp;'+op+
                     '<span class="posttime">'+data.threads[0].posts[i].date+'&nbsp;<\/span>' +
                     '<span class="reflink">'+reflink+'<span class="postpanel">' +
                     '<a href="javascript:void(0)" data-url="'+data.threads[0].posts[i].num+'" class="btn-reply postbtn-rep" title="Ответить"></a>'+
                     '<a onmouseout="javascript:removeAdminMenu(event); return false;" onclick="javascript:addAdminMenu(this); return false;" style="display:none" href="#" class="postbtn-adm"></a>' +
                     '<\/span><\/span>' +
                     '<br class=\"turnmeoff\"><\/div>'+thumb+video+
                     '<a id="'+data.threads[0].posts[i].num+'"><\/a>' +
                     '<blockquote class="postMessage" id="m'+data.threads[0].posts[i].num+'">'+data.threads[0].posts[i].comment+commentmessage+'<\/blockquote>' +
                     '<\/div><\/div>';
                     $('.thread').append(postshtml);
                     //console.log(postshtml);

                     //$('.thread').append(data.threads[0].posts[i].num+'<br>');
                     }

                     //if (postslength2 - postslength1) {
                     //    var titlemess = '<span class="newmess">Новые сообщения ('+(postslength2 - postslength1)+')</span>';
                     //   $('.logo').find('#title').append(titlemess);
                     //}

                     //$.each(data.threads[0].posts, function(i,item){
                     //    $('thread').append(item[i].num+'<br>');
                     //});
                     });*/
                } else {
                    $alert(JSONData.Error);
                }
            }
            catch (e) {
            }
        },
        error: function (xhr, desc, err) {
            $alert('Ошибка соединения!');
        }
    });
    return false;
}
function iframeLoad(e) {
    $close($id('ABU-alert-wait'));
    try {
        frm = e.target.contentDocument;
        if (!frm || !frm.body || !frm.body.innerHTML)return;
    }
    catch (e) {
        $alert('Iframe error:\n' + e);
        return;
    }
    var resp = JSON.parse(frm.body.innerHTML.replace(/(<([^>]+)>)/ig, ""));
    var err;
    if (resp.Error != null) {
        err = resp.Error;
    }
    if (err) {
        $alert('Ошибка:\n' + err);
        GetCaptcha('captcha-div', true);
    }
    else {
        $id('subject').value = '';
        $id('shampoo').value = '';
        $id('embed').value = '';
        var pFile = $id('image');
        $html(pFile.parentNode, pFile.parentNode.innerHTML);
        if (!isMain) {
            if (QuickReplyLastPostNum)addQuickReply(QuickReplyLastPostNum);
            updateThread();
            GetCaptcha('captcha-div', true);
        }
        else if (QuickReplyLastPostNum) {
            addQuickReply(QuickReplyLastPostNum);
            $alert('Быстрое сообщение отправлено');
            expandThread($n('thread').value, 5);
            $n('thread').value = '0';
            GetCaptcha('captcha-div', true);
        }
        else if (resp.Status == 'Redirect') {
            window.location = '/' + board + '/res/' + resp.Target + '.html';
        }
    }
    frm.location.replace('about:blank');
}
function delSubmitIframe() {
    var dv;
    dv = document.getElementById('ABU-submitframe');
    dv.parentNode.removeChild(dv);
}
function addSubmitIframe() {
    var load = window.opera ? 'DOMFrameContentLoaded' : 'load';
    $t('body')[0].appendChild($new('iframe', {
        'name': 'ABU_submitframe',
        'id': 'ABU-submitframe',
        'src': 'about:blank',
        'style': 'display:none; width:0px; height:0px; border:none'
    }, {load: iframeLoad}));
}
function toggleMommy() {
    set_cookie('mommy', (get_cookie('mommy') || 0) == 0 ? 1 : 0);
    scriptCSS();
}
function hotkeyMommy(e) {
    if (!e)e = window.event;
    if (e.altKey && e.keyCode == 78)toggleMommy();
}
function scriptCSS() {
    var x = [];
    if (makabadmin != '')x.push('.postbtn-adm,.admin-element {display:inline-block !important;}');
    if (get_cookie('mommy') == 1)
        x.push('img[src*="thumb"], object[width="320"] {opacity:0.04 !important} img[src*="thumb"]:hover, object[width="320"]:hover {opacity:1 !important}');
    if (!$id('ABU-css'))
        $t('head')[0].appendChild($new('style', {
            'id': 'ABU-css',
            'type': 'text/css',
            'text': x.join(' ')
        })); else $id('ABU-css').textContent = x.join(' ');
}
function fastload() {
    makabadmin = get_cookie('makabadmin');
    if (!makabadmin) {
        makabadmin = '';
    }
    else {
        $('.mod-code-input').val(makabadmin);
        $('#mod-mark-checkbox').show();
    }
    if ($id('usercode-input'))$('.usercode-input,.qr-usercode-input').val(get_cookie('usercode'));
    pForm = $id('postform');
    pArea = $id('postform')[0];
    dForm = $id('posts-form');
    scriptCSS();
    if (!dForm)return;
    dForm.appendChild($new('div', {'id': 'ABU-alertbox'}));
    if ($id("adcopy-response")) {
        $id("adcopy-response").onkeypress = reverseCaptcha;
    }
    document.onkeydown = hotkeyMommy;
}
function GetSelectedText() {
    var selectedText = (window.getSelection ? window.getSelection() : document.getSelection ? document.getSelection() : document.selection.createRange().text);
    if (!selectedText || selectedText == "") {
        return "";
    }
    return selectedText;
}
function ToggleSage() {
    if ($id("e-mail").value == "sage") {
        $id("e-mail").value = "";
        $id("sagecheckbox").checked = false;
    }
    else {
        $id("e-mail").value = "sage";
        $id("sagecheckbox").checked = true;
    }
}
function LakeNavRedirect(obj) {
    if ($id(obj).selectedIndex != 0) {
        window.location.href = "/.." + $id(obj).value;
    }
}
var ToolbarTextarea;
function _disables_edToolbar(obj) {
    document.write("<span class=\"m-bold\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/bold.png\" title=\"Жирный\" onClick=\"doAddTags('[b]','[/b]','" + obj + "')\"></span>");
    document.write("<span class=\"m-italic\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/italic.png\" title=\"Наклонный\" onClick=\"doAddTags('[i]','[/i]','" + obj + "')\"></span>");
    document.write("<span class=\"m-quote\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/quote1.png\" title=\"Цитирование\" onClick=\"doAddTags('>','','" + obj + "')\"></span>");
    document.write("<span class=\"m-underline\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/underline.png\" title=\"Нижнее подчёркивание\" onClick=\"doAddTags('[u]','[/u]','" + obj + "')\"></span>");
    document.write("<span class=\"m-overline\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/overline.png\" title=\"Верхнее подчёркивание\" onClick=\"doAddTags('[o]','[/o]','" + obj + "')\"></span>");
    document.write("<span class=\"m-spoiler\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/spoiler.png\" title=\"Спойлер\" onClick=\"doAddTags('[spoiler]','[/spoiler]','" + obj + "')\"></span>");
    document.write("<span class=\"m-strike\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/strike.png\" title=\"Зачёркнутый\" onClick=\"doAddTags('[s]','[/s]','" + obj + "')\"></span>");
    document.write("<span class=\"m-sup\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/sup.png\" title=\"Сдвиг текста вверх\" onClick=\"doAddTags('[sup]','[/sup]','" + obj + "')\"></span>");
    document.write("<span class=\"m-sub\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/sub.png\" title=\"Сдвиг текста вниз\" onClick=\"doAddTags('[sub]','[/sub]','" + obj + "')\"></span>");
    document.write("<br>");
}
function edToolbar(obj) {
    var ret = '';
    ret += ("<span class=\"m-bold\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/bold.png\" title=\"Жирный\" onClick=\"doAddTags('[b]','[/b]','" + obj + "')\"></span>");
    ret += ("<span class=\"m-italic\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/italic.png\" title=\"Наклонный\" onClick=\"doAddTags('[i]','[/i]','" + obj + "')\"></span>");
    ret += ("<span class=\"m-quote\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/quote1.png\" title=\"Цитирование\" onClick=\"doAddTags('>','','" + obj + "')\"></span>");
    ret += ("<span class=\"m-underline\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/underline.png\" title=\"Нижнее подчёркивание\" onClick=\"doAddTags('[u]','[/u]','" + obj + "')\"></span>");
    ret += ("<span class=\"m-overline\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/overline.png\" title=\"Верхнее подчёркивание\" onClick=\"doAddTags('[o]','[/o]','" + obj + "')\"></span>");
    ret += ("<span class=\"m-spoiler\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/spoiler.png\" title=\"Спойлер\" onClick=\"doAddTags('[spoiler]','[/spoiler]','" + obj + "')\"></span>");
    ret += ("<span class=\"m-strike\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/strike.png\" title=\"Зачёркнутый\" onClick=\"doAddTags('[s]','[/s]','" + obj + "')\"></span>");
    ret += ("<span class=\"m-sup\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/sup.png\" title=\"Сдвиг текста вверх\" onClick=\"doAddTags('[sup]','[/sup]','" + obj + "')\"></span>");
    ret += ("<span class=\"m-sub\"><img class=\"markup\" src=\"/icons/markup_buttons/photon/sub.png\" title=\"Сдвиг текста вниз\" onClick=\"doAddTags('[sub]','[/sub]','" + obj + "')\"></span>");
    ret += ("<br>");
    return ret;
}
function doAddTags(tag1, tag2, obj) {
    ToolbarTextarea = $id(obj);
    if (document.selection) {
        var sel = document.selection.createRange();
        sel.text = tag1 + sel.text + tag2;
    }
    else {
        var len = ToolbarTextarea.value.length;
        var start = ToolbarTextarea.selectionStart;
        var end = ToolbarTextarea.selectionEnd;
        var scrollTop = ToolbarTextarea.scrollTop;
        var scrollLeft = ToolbarTextarea.scrollLeft;
        var sel = ToolbarTextarea.value.substring(start, end);
        var rep = tag1 + sel + tag2;
        ToolbarTextarea.value = ToolbarTextarea.value.substring(0, start) + rep + ToolbarTextarea.value.substring(end, len);
        ToolbarTextarea.scrollTop = scrollTop;
        ToolbarTextarea.scrollLeft = scrollLeft;
        ToolbarTextarea.focus();
        ToolbarTextarea.setSelectionRange(start + tag1.length, end + tag1.length);
    }
    $('#' + obj).keyup();
}
function ShowLakeSettings() {
    for (var i = 0; i < $id('LakeSettingsStyle').options.length; i++) {
        if ($id('LakeSettingsStyle').options[i].value == get_cookie('wakabastyle')) {
            $id('LakeSettingsStyle').options[i].selected = true;
            break;
        }
    }
    var LSHideBoardsList, LSHideNonReqFields, LSHideToolbar, LSHideRules, LSPostForm, LSAutoUpdate, LSAutoUpdateInterval;
    LSHideBoardsList = localStorage.getItem('LakeSettingsHideBoardsList');
    LSHideNonReqFields = localStorage.getItem('LakeSettingsHideNonReqFields');
    LSHideToolbar = localStorage.getItem('LakeSettingsHideToolbar');
    LSHideRules = localStorage.getItem('LakeSettingsHideRules');
    LSPostForm = localStorage.getItem('LakeSettingsPostForm');
    LSAutoUpdate = localStorage.getItem('LakeSettingsAutoUpdate');
    LSAutoUpdateInterval = localStorage.getItem('LakeSettingsAutoUpdateInterval');
    if (LSHideBoardsList == '1') {
        $id('LakeSettingsHideBoardsList').checked = true;
    }
    if (LSHideNonReqFields == '1') {
        $id('LakeSettingsHideNonReqFields').checked = true;
    }
    if (LSHideToolbar == '1') {
        $id('LakeSettingsHideToolbar').checked = true;
    }
    if (LSHideRules == '1') {
        $id('LakeSettingsHideRules').checked = true;
    }
    $id('LakeSettingsPostForm').selectedIndex = LSPostForm;
    if (LSAutoUpdate == '1') {
        $id('LakeSettingsAutoUpdate').checked = true;
    }
    $id('LakeSettingsAutoUpdateInterval').value = LSAutoUpdateInterval;
    var el, nid = 'ABU-SettingsBox';
    if (!el) {
        el = $new('div', {
            'class': 'reply',
            'id': nid,
            'style': 'float:right; clear:both; opacity:0; width:auto; min-width:0; padding:0 10px 0 10px;' + ' margin:1px; overflow:hidden; white-space:pre-wrap; outline:0; border:1px solid grey'
        });
        el.appendChild($new('div', {'style': 'display:inline-block; margin-top:4px'}));
        $show($id('ABU-alertbox').appendChild(el));
    }
    $t('div', el)[0].appendChild($id('LakeSettings'));
}
function doLakeSettings() {
    var LSHideBoardsList, LSHideNonReqFields, LSHideToolbar, LSHideRules, LSPostForm, LSAutoUpdate, LSAutoUpdateInterval;
    LSHideBoardsList = localStorage.getItem('LakeSettingsHideBoardsList');
    LSHideNonReqFields = localStorage.getItem('LakeSettingsHideNonReqFields');
    LSHideToolbar = localStorage.getItem('LakeSettingsHideToolbar');
    LSHideRules = localStorage.getItem('LakeSettingsHideRules');
    LSPostForm = localStorage.getItem('LakeSettingsPostForm');
    LSAutoUpdate = localStorage.getItem('LakeSettingsAutoUpdate');
    LSAutoUpdateInterval = parseInt(localStorage.getItem('LakeSettingsAutoUpdateInterval'));
    if ($id('usrFlds') != null) {
        if (LSHideBoardsList == '1') {
            $id('boardNav').style.display = 'none';
            $id('boardNavBottom').style.display = 'none';
            $id('boardNavMobile').style.display = '';
        }
        else {
            $id('boardNav').style.display = '';
            $id('boardNavBottom').style.display = '';
            $id('boardNavMobile').style.display = 'none';
        }
        if (LSHideNonReqFields == '1') {
            $id('usrFlds').style.display = 'none';
        }
        else {
            $id('usrFlds').style.display = '';
        }
        if (LSHideToolbar == '1') {
            $id('CommentToolbar').style.display = 'none';
        }
        else {
            $id('CommentToolbar').style.display = '';
        }
        if (LSHideRules == '1') {
            $id('rules').style.display = 'none';
        }
        else {
            $id('rules').style.display = '';
        }
        switch (LSPostForm) {
            case"2":
            {
                ToggleNormalReply('BottomNormalReply');
                break;
            }
            case"0":
            {
                ToggleNormalReply('TopNormalReply');
                break;
            }
            case"1":
            default:
            {
                break;
            }
        }
        if (LSAutoUpdate == '1') {
            if (5 < LSAutoUpdateInterval && LSAutoUpdateInterval < 600) {
                threadIntervalID = setInterval(updateThread, LSAutoUpdateInterval * 1000);
            }
            else {
                threadIntervalID = setInterval(updateThread, 60000);
                $alert("Недопустимый интервал!");
            }
        }
        if (isMain)$id('TopNormalReplyLabel').innerHTML = $id('BottomNormalReplyLabel').innerHTML = '[Создать тред]'; else $id('TopNormalReplyLabel').innerHTML = $id('BottomNormalReplyLabel').innerHTML = '[Ответить в тред]';
    }
}
function LakeSettingsSave() {
    if ($id('LakeSettingsHideBoardsList').checked) {
        localStorage.setItem('LakeSettingsHideBoardsList', '1');
    }
    else {
        localStorage.setItem('LakeSettingsHideBoardsList', '0');
    }
    if ($id('LakeSettingsHideNonReqFields').checked) {
        localStorage.setItem('LakeSettingsHideNonReqFields', '1');
    }
    else {
        localStorage.setItem('LakeSettingsHideNonReqFields', '0');
    }
    if ($id('LakeSettingsHideToolbar').checked) {
        localStorage.setItem('LakeSettingsHideToolbar', '1');
    }
    else {
        localStorage.setItem('LakeSettingsHideToolbar', '0');
    }
    if ($id('LakeSettingsHideRules').checked) {
        localStorage.setItem('LakeSettingsHideRules', '1');
    }
    else {
        localStorage.setItem('LakeSettingsHideRules', '0');
    }
    localStorage.setItem('LakeSettingsPostForm', $id('LakeSettingsPostForm').value);
    if ($id('LakeSettingsAutoUpdate').checked) {
        localStorage.setItem('LakeSettingsAutoUpdate', '1');
    }
    else {
        localStorage.setItem('LakeSettingsAutoUpdate', '0');
    }
    localStorage.setItem('LakeSettingsAutoUpdateInterval', $id('LakeSettingsAutoUpdateInterval').value);
    set_cookie('wakabastyle', $id('LakeSettingsStyle').value, 365);
    set_stylesheet(get_cookie('wakabastyle'));
    doLakeSettings();
    $id('ShowLakeSettings').appendChild($id('ABU-SettingsBox').firstChild);
    $close($id('ABU-SettingsBox'));
}
function expand(num, src, thumb_src, n_w, n_h, o_w, o_h, minimize) {
    var win = $(window);
    if (Store.get('mobile.dont_expand_images', true) && (win.width() < 768 || win.height() < 480))return;
    if (!minimize && !window.expand_all_img && Store.get('other.fullscreen_expand', true))return fullscreenExpand(num, src, thumb_src, n_w, n_h, o_w, o_h);
    var element = $('#exlink-' + num).closest('.images');
    if (element.length) {
        if (element.hasClass('images-single')) {
            element.removeClass('images-single');
            element.addClass('images-single-exp');
        } else if (element.hasClass('images-single-exp')) {
            element.addClass('images-single');
            element.removeClass('images-single-exp');
        }
    }
    if (n_w > screen.width) {
        n_h = ((screen.width - 80) * n_h) / n_w;
        n_w = screen.width - 80;
    }
    var filetag, parts, ext;
    parts = src.split("/").pop().split(".");
    ext = (parts).length > 1 ? parts.pop() : "";
    if (ext == 'webm' && n_w > o_w && n_h > o_h) {
        closeWebm = $new('a', {
            'href': src,
            'id': 'close-webm-' + num,
            'class': 'close-webm',
            'html': '[Закрыть]',
            'onclick': ' return expand(\'' + num + "\','" + src + "','" + thumb_src + "'," + o_w + ',' + o_h + ',' + n_w + ',' + n_h + ', 1);'
        });
        refElem = $id('webm-icon-' + num);
        refElem.parentNode.insertBefore(closeWebm, refElem.nextSibling);
        filetag = '<video id="html5video" onplay="webmPlayStarted(this)" onvolumechange="webmVolumeChanged(this)" controls="" autoplay="" ' + (Store.get('other.webm_vol', false) ? '' : 'muted="1"') + ' loop="1" name="media"><source src="' + src + '" type="video/webm" width="' + n_w + '" height="' + n_h + '" class="video" ></video>';
    } else {
        if (ext == 'webm') {
            var el = document.getElementById('close-webm-' + num);
            el.parentNode.removeChild(el);
        }
        filetag = '<a href="' + src + '" name="expandfunc"  onClick="return expand(\'' + num + "\','" + src + "','" + thumb_src + "'," +
            o_w + ',' + o_h + ',' + n_w + ',' + n_h + ',' + (minimize ? 0 : 1) + ');"><img src="' + (!minimize ? src : thumb_src) + '" width="' + n_w + '" height="' + n_h + '" class="img ' + (!minimize ? 'fullsize' : 'preview') + ((ext == 'webm') ? ' webm-file' : '') + '" /></a>';
        if (minimize && Store.get('other.expand_autoscroll', true)) {
            var post = Post(num);
            var post_el;
            if (post.isRendered()) {
                post_el = post.el();
            } else {
                post_el = $('#preview-' + parseInt(num));
            }
            var doc = $(document);
            var pos = post_el.offset().top;
            var scroll = doc.scrollTop();
            if (scroll > pos)doc.scrollTop(pos);
        }
    }
    $id('exlink-' + num).innerHTML = filetag;
    return false;
}
function abortWebmDownload() {
    var el = $("#html5video");
    if (!el.length)return;
    var video = el.get(0);
    video.pause(0);
    video.src = "";
    video.load();
    el.remove();
}
function webmPlayStarted(el) {
    var video = $(el).get(0);
    video.volume = Store.get('other.webm_vol', 0);
}
function webmVolumeChanged(el) {
    var video = $(el).get(0);
    var vol = video.volume;
    if (video.muted)vol = 0;
    Store.set('other.webm_vol', vol);
}
function expandAllPics() {
    window.expand_all_img = true;
    var Pic = document.getElementsByName('expandfunc');
    for (var i = 0; i < Pic.length; i++) {
        Pic[i].click();
    }
    delete window.expand_all_img;
}
function showVideo(show, hide) {
    $id(show).style.display = "";
    $id(hide).style.display = "none";
}
function ctrlEnter(event, formElem) {
    if ((event.ctrlKey) && ((event.keyCode == 0xA) || (event.keyCode == 0xD))) {
        formElem.submit();
    }
}
function get_password(name) {
    var pass = get_cookie(name);
    if (!pass) {
        pass = '';
        var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (var i = 0; i < 8; i++) {
            var rnd = Math.floor(Math.random() * chars.length);
            pass += chars.substring(rnd, rnd + 1);
        }
    }
    return pass;
}
function load(id, url) {
    var element = $id(id);
    if (!element)return;
    var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        try {
            xhr = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {
            }
        }
    }
    else return false;
    if (xhr) {
        xhr.open('GET', url, false);
        xhr.send(null);
        element.innerHTML = xhr.responseText;
    }
    else element.innerHTML = 'NotLoaded';
}
function set_stylesheet_frame(styletitle, framename) {
    var list = get_frame_by_name(framename);
    set_stylesheet(styletitle);
    if (list)set_stylesheet(styletitle, list);
}
function set_stylesheet(styletitle, target) {
    set_cookie('wakabastyle', styletitle, 365);
    var links = target ? target.document.getElementsByTagName('link') : document.getElementsByTagName('link');
    var rel, title, found = false;
    for (var i = 0; i < links.length; i++) {
        var rel = links[i].getAttribute('rel');
        var title = links[i].getAttribute('title');
        if (rel.indexOf('style') != -1 && title) {
            links[i].disabled = true;
            if (styletitle == title) {
                links[i].disabled = false;
                found = true;
            }
        }
    }
    if (!found)set_preferred_stylesheet(target ? target : false)
}
function set_preferred_stylesheet(target) {
    var links = target ? target.document.getElementsByTagName('link') : document.getElementsByTagName('link');
    var rel, title;
    for (var i = 0; i < links.length; i++) {
        rel = links[i].getAttribute('rel');
        title = links[i].getAttribute('title');
        if (rel.indexOf('style') != -1 && title) {
            links[i].disabled = (rel.indexOf('alt') != -1);
        }
    }
}
function get_active_stylesheet() {
    var links = document.getElementsByTagName('link');
    var rel, title;
    for (var i = 0; i < links.length; i++) {
        rel = links[i].getAttribute('rel');
        title = links[i].getAttribute('title');
        if (rel.indexOf('style') != -1 && title && !links[i].disabled)return title;
    }
    return null;
}
function get_preferred_stylesheet() {
    var links = document.getElementsByTagName('link');
    var rel, title;
    for (var i = 0; i < links.length; i++) {
        rel = links[i].getAttribute('rel');
        title = links[i].getAttribute('title');
        if (rel.indexOf('style') != -1 && rel.indexOf('alt') == -1 && title)return title;
    }
    return null;
}
function get_frame_by_name(name) {
    var frames = window.parent.frames;
    for (i = 0; i < frames.length; i++)
        if (name == frames[i].name)return (frames[i]);
    return false;
}
function set_inputs(id) {
    var form = $id(id);
    var gb2 = form.gb2;
    var gb2val = get_cookie('gb2');
    if (gb2 && gb2val)
        for (var i = 0; i < gb2.length; i++)
            gb2[i].checked = (gb2[i].value == gb2val);
    $n("name").value = get_cookie('name');
    $n("email").value = get_cookie('email');
    if (get_cookie('email') == "sage") {
        $id("sagecheckbox").checked = true;
    }
    if ($id("anoniconsselectlist") != null)
        $id("anoniconsselectlist").selectedIndex = get_cookie("anoniconchoise");
}
function buttonOK() {
    $id('dynamicNamed').name = $id('opt' + select.selectedIndex).value;
}
function set_delpass(id) {
    try {
        $id(id).password.value = get_cookie('password');
    }
    catch (e) {
    }
}