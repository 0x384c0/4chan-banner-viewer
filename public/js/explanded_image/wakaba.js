var board = window.location.toString().split('/')[3];
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