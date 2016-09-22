(function () {
    window.config = {};
    window.config.autoUpdate = {};
    window.config.favorites = {};
    window.thread = {};
    window.threadstats = {};
    window.config.loadCaptchaTimeout = 30000;
    window.config.updatePostsTimeout = 30000;
    window.config.autoUpdate.minInterval = 10;
    window.config.autoUpdate.maxInterval = 30;
    window.config.autoUpdate.stepInterval = 5;
    window.config.autoUpdate.faviconDefault = '<link id="favicon" rel="shortcut icon" href="/favicon.ico"/>';
    window.config.autoUpdate.faviconNewposts = '<link id="favicon" rel="shortcut icon" href="/wakaba/templates/img/favicon_newposts.ico"/>';
    window.config.autoUpdate.faviconDeleted = '<link id="favicon" rel="shortcut icon" href="/wakaba/templates/img/favicon_deleted.ico"/>';
    window.config.favorites.interval_min = 15;
    window.config.favorites.interval_max = 60 * 60 * 12;
    window.config.favorites.interval_multiplier = 2;
    window.config.favorites.interval_error = 60 * 2;
    window.config.favorites.interval_del_recheck = 60 * 10;
    window.config.favorites.interval_lock = 60 * 5;
    window.config.title = document.title;
    window.config.twitter_autoexpand = 4;
    window.threadstats.refresh = 60;
    window.threadstats.retry = 10;
    window.threadstats.request_timeout = 30000;
    window.threadstats.count = 10;
    window.tz_offset = +3;
})();
window.Store = {
    memory: {}, type: null, init: function () {
        if (this.html5_available()) {
            this.type = 'html5';
            this.html5_load();
        } else if (this.cookie_available()) {
            this.type = 'cookie';
            this.cookie_load();
        }
    }, get: function (path, default_value) {
        var path_array = this.parse_path(path);
        if (!path_array)return default_value;
        var pointer = this.memory;
        var len = path_array.length;
        for (var i = 0; i < len - 1; i++) {
            var element = path_array[i];
            if (!pointer.hasOwnProperty(element))return default_value;
            pointer = pointer[element];
        }
        var ret = pointer[path_array[i]];
        if (typeof(ret) == 'undefined')return default_value;
        return ret;
    }, set: function (path, value) {
        if (typeof(value) == 'undefined')return false;
        if (this.type)this[this.type + '_load']();
        var path_array = this.parse_path(path);
        if (!path_array)return false;
        var pointer = this.memory;
        var len = path_array.length;
        for (var i = 0; i < len - 1; i++) {
            var element = path_array[i];
            if (!pointer.hasOwnProperty(element))pointer[element] = {};
            pointer = pointer[element];
            if (typeof(pointer) != 'object')return false;
        }
        pointer[path_array[i]] = value;
        if (this.type)this[this.type + '_save']();
        return true;
    }, del: function (path) {
        var path_array = this.parse_path(path);
        if (!path_array)return false;
        if (this.type)this[this.type + '_load']();
        var pointer = this.memory;
        var len = path_array.length;
        var element, i;
        for (i = 0; i < len - 1; i++) {
            element = path_array[i];
            if (!pointer.hasOwnProperty(element))return false;
            pointer = pointer[element];
        }
        if (pointer.hasOwnProperty(path_array[i]))delete(pointer[path_array[i]]);
        this.cleanup(path_array);
        if (this.type)this[this.type + '_save']();
        return true;
    }, cleanup: function (path_array) {
        var pointer = this.memory;
        var objects = [this.memory];
        var len = path_array.length;
        var i;
        for (i = 0; i < len - 2; i++) {
            var element = path_array[i];
            pointer = pointer[element];
            objects.push(pointer);
        }
        for (i = len - 2; i >= 0; i--) {
            var object = objects[i];
            var key = path_array[i];
            var is_empty = true;
            $.each(object[key], function () {
                is_empty = false;
                return false;
            });
            if (!is_empty)return true;
            delete(object[key]);
        }
    }, reload: function () {
        if (this.type)this[this.type + '_load']();
    }, 'export': function () {
        return JSON.stringify(this.memory);
    }, 'import': function (data) {
        try {
            this.memory = JSON.parse(data);
            if (this.type)this[this.type + '_save']();
            return true;
        } catch (e) {
            return false;
        }
    }, parse_path: function (path) {
        var test = path.match(/[a-zA-Z0-9_\-\.]+/);
        if (test == null)return false;
        if (!test.hasOwnProperty('0'))return false;
        if (test[0] != path)return false;
        return path.split('.');
    }, html5_available: function () {
        if (!window.Storage)return false;
        if (!window.localStorage)return false;
        try {
            localStorage.__storage_test = 'wU1vJ0p3prU1';
            if (localStorage.__storage_test != 'wU1vJ0p3prU1')return false;
            localStorage.removeItem('__storage_test');
            return true;
        } catch (e) {
            return false;
        }
    }, html5_load: function () {
        if (!localStorage.store)return;
        this.memory = JSON.parse(localStorage.store);
    }, html5_save: function () {
        localStorage.store = JSON.stringify(this.memory);
    }, cookie_available: function () {
        try {
            $.cookie('__storage_test', 'wU1vJ0p3prU1');
            if ($.cookie('__storage_test') != 'wU1vJ0p3prU1')return false;
            $.removeCookie('__storage_test');
            return true;
        } catch (e) {
            return false;
        }
    }, cookie_load: function () {
        var str = $.cookie('store');
        if (!str)return;
        this.memory = JSON.parse(str);
    }, cookie_save: function () {
        var str = JSON.stringify(this.memory);
        $.cookie('store', str, 365 * 5);
    }
};
window.Media = {
    processors: [], generators: {}, unloaders: {}, thumbnailers: {}, add: function (type, substr, regexp, fields) {
        var regobj = new RegExp(regexp, 'i');
        this.processors.push([type, substr, regobj, fields]);
    }, addGenerator: function (type, func) {
        this.generators[type] = func;
    }, addUnloader: function (type, func) {
        this.unloaders[type] = func;
    }, addThumbnailer: function (type, func) {
        this.thumbnailers[type] = func;
    }, parse: function (url) {
        var proc_len = this.processors.length;
        var ret;
        for (var i = 0; i < proc_len; i++) {
            var proc = this.processors[i];
            if (url.indexOf(proc[1]) < 0)continue;
            ret = this.getValues(url, proc);
            if (ret)break;
        }
        return ret;
    }, getValues: function (url, proc) {
        var type = proc[0];
        var regexp = proc[2];
        var fields = proc[3];
        var values = {type: type};
        var reg_result = regexp.exec(url);
        if (!reg_result)return false;
        for (var field_name in fields) {
            if (!fields.hasOwnProperty(field_name))continue;
            if (!reg_result.hasOwnProperty(fields[field_name]))return false;
            values[field_name] = reg_result[fields[field_name]];
        }
        return values;
    }, getEmbedCode: function (type, id, cb) {
        this.generators[type]({id: id}, cb);
    }, processLinks: function (el) {
        el.each(function () {
            var el = $(this);
            var url = el.text();
            var obj = Media.parse(url);
            if (!obj)return;
            var post = el.closest('.post');
            var button_expand = $('<span href="#" class="media-expand-button">[РАСКРЫТЬ]</span>');
            var button_hide = $('<span href="#" class="media-hide-button">[ЗАКРЫТЬ]</span>');
            var button_loading = $('<span class="media-expand-loading">[Загрузка...]</span>');
            if (Media.thumbnailers.hasOwnProperty(obj.type) && Store.get('old.media_thumbnails', true)) {
                var on_hover = Store.get('old.media_thumbnails_on_hover', true);
                var thumbnail = $('<div class="media-thumbnail" ' + (on_hover ? 'style="display:none"' : '') + '>' + Media.thumbnailers[obj.type](obj) + '</div>');
                var mthumbnail = $('#media-thumbnail');
                if (on_hover) {
                    el.hover(function (e) {
                        mthumbnail.append(thumbnail).css({
                            position: 'absolute',
                            display: 'block',
                            'z-index': '999',
                            top: e.pageY + 'px',
                            left: e.pageX + 'px'
                        });
                        thumbnail.show();
                    });
                    el.mouseout(function () {
                        thumbnail.hide();
                        mthumbnail.hide();
                    });
                    el.mousemove(function (e) {
                        mthumbnail.css({top: (e.pageY - 10) + 'px', left: (e.pageX + 30) + 'px'});
                    });
                } else {
                    button_expand.append(thumbnail);
                }
            }
            el.after(button_expand);
            button_expand.click(function () {
                button_expand.hide();
                button_expand.after(button_loading);
                var expanded = post.data('expanded-media-count') || 0;
                expanded++;
                post.data('expanded-media-count', expanded);
                if (expanded == 1 && window.kostyl_class)post.addClass('expanded-media');
                Media.getEmbedCode(obj.type, obj.id, function (html) {
                    button_loading.remove();
                    if (!html)return button_expand.show();
                    var embed = $('<br>' + html + '<br>');
                    el.after(embed);
                    el.after(button_hide);
                    button_hide.click(function () {
                        embed.remove();
                        button_hide.remove();
                        button_expand.show();
                        if (Media.unloaders.hasOwnProperty(obj.type))Media.unloaders[obj.type](el);
                        var expanded = post.data('expanded-media-count');
                        expanded--;
                        post.data('expanded-media-count', expanded);
                        if (expanded == 0 && window.kostyl_class)post.removeClass('expanded-media');
                        return false;
                    });
                    return false;
                });
                return false;
            });
            if (obj.type == 'twitter' && window.config.twitter_autoexpand-- > 0)button_expand.click();
        });
    }
};
window.Favorites = {
    timer: 0,
    current: null,
    busy: false,
    visible: false,
    gevent_num: false,
    gevent: false,
    isFavorited: function (num) {
        return !!Store.get('favorites.' + num, false);
    },
    remove: function (num) {
        if (!this.isFavorited(num))throw new Error('Вызов Favorites.remove(' + num + ') для несуществующего треда');
        Store.del('favorites.' + num);
        if (!this.busy)this.reset();
        this.render_remove(num);
        Gevent.emit('fav.remove', num);
    },
    add: function (num) {
        if (this.isFavorited(num))throw new Error('Вызов Favorites.add(' + num + ') для существующего треда');
        var post = Post(num);
        var title = post.getTitle();
        var last = post.last().num;
        var data = {
            board: window.thread.board,
            title: title,
            last_post: last,
            next_check: Math.floor((+new Date) / 1000) + window.config.favorites.interval_min,
            last_interval: window.config.favorites.interval_min
        };
        Store.set('favorites.' + num, data);
        this.render_add(num, data);
        Gevent.emit('fav.add', [num, data]);
        if (!window.thread.id)this.reset();
    },
    reset: function () {
        this.resetCurrent();
        if (this.current)this.timerRestart();
        this.busy = false;
    },
    timerStop: function () {
        if (!this.timer)return;
        clearTimeout(this.timer);
        this.timer = null;
    },
    timerRestart: function () {
        this.timerStop();
        var currentMins = Math.floor((+new Date) / 1000);
        var delta = this.getCurrent().next_check - currentMins;
        var ms;
        var that = this;
        if (delta < 1) {
            ms = 1;
        } else {
            ms = delta * 1000;
        }
        this.timer = setTimeout(function () {
            that.preExecuteCheck();
        }, ms);
    },
    getCurrent: function () {
        return Store.get('favorites.' + this.current, false);
    },
    resetCurrent: function () {
        this.current = null;
        var favlist = Store.get('favorites', {});
        var del_behavior = Store.get('favorites.deleted_behavior', 2);
        for (var key in favlist) {
            if (!favlist.hasOwnProperty(key))continue;
            if (key == window.thread.id)continue;
            if (!favlist[key].hasOwnProperty('next_check'))continue;
            if (this.isLocked(key))continue;
            if (!this.current || favlist[this.current].next_check > favlist[key].next_check) {
                if (favlist[key].deleted && del_behavior == 0)continue;
                this.current = key;
            }
        }
    },
    preExecuteCheck: function () {
        var that = this;
        this.busy = true;
        this.render_refreshing(this.current);
        Gevent.onceNtemp('fav.abortExec' + this.current, 1000, function () {
            that.setNextCheck(that.current, window.config.favorites.interval_lock);
            that.render_refreshing_done(that.current);
            that.reset();
        }, function () {
            that.executeCheck();
        });
        Gevent.emit('fav.preExecuteCheck', this.current);
    },
    executeCheck: function () {
        var old_current = this.getCurrent().next_check;
        var old_current_num = this.current;
        Store.reload();
        if (this.isLocked() || old_current != this.getCurrent().next_check) {
            this.render_refreshing_done(old_current_num);
            return this.reset();
        }
        this.lock();
        var current = this.getCurrent();
        var fetch_opts = {thread: this.current, from_post: current.last_post + 1, board: current.board};
        var that = this;
        Post(1)._fetchPosts(fetch_opts, function (res) {
            if (res.hasOwnProperty('error')) {
                if (res.error == 'server' && res.errorCode == -404) {
                    that.deleted(that.current);
                } else {
                    that.setNextCheck(that.current, window.config.favorites.interval_error);
                }
            } else if (res.data.length) {
                that.setNewPosts(res.data.length);
                that.setLastPost(res.data);
                that.setNextCheck(that.current, window.config.favorites.interval_min);
                if (Store.get('favorites.show_on_new', true))that.show();
            } else {
                that.setNextCheck(that.current, current.last_interval * window.config.favorites.interval_multiplier);
            }
            that.unlock();
            that.render_refreshing_done(that.current);
            return that.reset();
        });
    },
    setNextCheck: function (num, mins) {
        var thread = Store.get('favorites.' + num);
        if (mins < window.config.favorites.interval_min)mins = window.config.favorites.interval_min;
        if (mins > window.config.favorites.interval_max)mins = window.config.favorites.interval_max;
        thread.next_check = Math.floor((+new Date) / 1000) + mins;
        thread.last_interval = mins;
        Store.set('favorites.' + num + '.next_check', thread.next_check);
        Store.set('favorites.' + num + '.last_interval', thread.last_interval);
    },
    forceRefresh: function (num) {
        Store.set('favorites.' + num + '.next_check', 0);
        Store.set('favorites.' + num + '.last_interval', window.config.favorites.interval_min);
        if (!this.busy)this.reset();
    },
    deleted: function (num) {
        var behavior = Store.get('favorites.deleted_behavior', 2);
        var path = 'favorites.' + num + '.deleted';
        if (behavior == 1)return this.remove(num);
        if (behavior == 2 && Store.get(path, false))return this.remove(num);
        Store.set(path, true);
        this.resetNewPosts(num);
        this.render_deleted(num);
        this.setNextCheck(num, window.config.favorites.interval_del_recheck);
        Gevent.emit('fav.deleted', num);
    },
    setLastPost: function (arr, num) {
        if (!num)num = this.current;
        var last = 0;
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            if (arr[i]['num'] > last)last = arr[i]['num'];
        }
        if (!last)return;
        Store.set('favorites.' + num + '.last_post', parseInt(last));
    },
    setLastSeenPost: function (thread, last) {
        if (!last)return Store.del('favorites.' + thread + '.last_seen');
        Store.set('favorites.' + thread + '.last_seen', last);
    },
    setNewPosts: function (count) {
        var current = this.getCurrent();
        var was = current.new_posts || 0;
        current.new_posts = was + count;
        Store.set('favorites.' + this.current + '.new_posts', current.new_posts);
        if (!was)this.setLastSeenPost(this.current, current.last_post);
        this.render_newposts(this.current, current.new_posts);
        Gevent.emit('fav.newposts', [this.current, current.new_posts]);
    },
    resetNewPosts: function (num) {
        if (!this.isFavorited(num))return;
        Store.set('favorites.' + num + '.new_posts', 0);
        if (!this.busy)this.reset();
        this.setLastSeenPost(this.current, 0);
        this.render_reset_newposts(num);
        Gevent.emit('fav.reset_newposts', num);
    },
    lock: function (num) {
        if (!num)num = this.current;
        var lock_time = Math.floor((+new Date) / 1000) + window.config.favorites.interval_lock;
        Store.set('favorites.' + num + '.lock', lock_time);
    },
    unlock: function (num) {
        if (!num)num = this.current;
        Store.del('favorites.' + num + '.lock');
    },
    isLocked: function (num) {
        if (!num)num = this.current;
        var max_lock_time = Math.floor((+new Date) / 1000);
        var current_lock = Store.get('favorites.' + num + '.lock', 0);
        return current_lock > max_lock_time;
    },
    show: function () {
        Store.set('styling.qr-fav.visible', true);
        this.render_show();
    },
    hide: function () {
        Store.del('styling.qr-fav.visible');
        this.render_hide();
    },
    debug: function () {
        var favlist = Store.get('favorites', {});
        for (var key in favlist) {
            console.log(key + ':' + Math.round(favlist[key].next_check - ((+new Date) / 1000)) + 's');
        }
    },
    render_get_html: function (num, thread) {
        var thread_row = '<div id="fav-row' + num + '" class="fav-row">';
        thread_row += '<span class="fav-row-remove" data-num="' + num + '"></span>';
        thread_row += '<span class="fav-row-update" id="fav-row-update' + num + '" data-num="' + num + '"></span>';
        thread_row += '<span class="fav-row-refreshing" id="fav-row-refreshing' + num + '" style="display: none"></span>';
        if (thread.new_posts) {
            thread_row += '<span class="fav-row-newposts" id="fav-row-newposts' + num + '">(' + thread.new_posts + ')</span>';
        } else {
            thread_row += '<span class="fav-row-newposts" id="fav-row-newposts' + num + '"></span>';
        }
        thread_row += '<a href="/' + thread.board + '/res/' + num + '.html#' + (thread.last_seen || thread.last_post) + '" id="fav-row-href' + num + '" class="fav-row-href' + (thread.new_posts ? ' fav-row-updated' : '') + (thread.deleted ? ' fav-row-deleted' : '') + '">';
        thread_row += '<span class="fav-row-board">/' + thread.board + '/</span>';
        thread_row += '<span class="fav-row-num">' + num + '</span>';
        thread_row += '<span class="fav-row-dash"> - </span>';
        thread_row += '<span class="fav-row-title">' + (thread.title || '<i>Без названия</i>') + '</span>';
        thread_row += '</a>';
        thread_row += '</div>';
        return thread_row;
    },
    render_remove: function (num) {
        $('#fav-row' + num).remove();
        this.render_switch(num, false);
    },
    render_add: function (num, data) {
        var html = this.render_get_html(num, data);
        $('#qr-fav-body').append(html);
        this.render_switch(num, true);
    },
    render_switch: function (num, favorited) {
        var star = $('#fa-star' + num);
        if (favorited) {
            star.addClass('fa-star');
            star.removeClass('fa-star-o');
            $('#postbtn-favorite-bottom').html('Отписаться от треда');
        } else {
            star.removeClass('fa-star');
            star.addClass('fa-star-o');
            $('#postbtn-favorite-bottom').html('Подписаться на тред');
        }
    },
    render_refreshing: function (num) {
        $('#fav-row-refreshing' + num).show();
        $('#fav-row-update' + num).hide();
    },
    render_refreshing_done: function (num) {
        $('#fav-row-refreshing' + num).hide();
        $('#fav-row-update' + num).show();
    },
    render_newposts: function (num, posts) {
        $('#fav-row-href' + num).addClass('fav-row-updated');
        $('#fav-row-newposts' + num).html('(' + posts + ')');
    },
    render_reset_newposts: function (num) {
        $('#fav-row-href' + num).removeClass('fav-row-updated');
        $('#fav-row-newposts' + num).html('');
    },
    render_deleted: function (num) {
        $('#fav-row-href' + num).addClass('fav-row-deleted');
    },
    render_show: function () {
        this.visible = true;
        $('#qr-fav').show();
    },
    render_hide: function () {
        this.visible = false;
        $('#qr-fav').hide();
    },
    init: function () {
        var current_favorited = window.thread.id && this.isFavorited(window.thread.id);
        if (current_favorited) {
            this.resetNewPosts(window.thread.id);
            Gevent.on('fav.preExecuteCheck', function (num) {
                if (num == window.thread.id)Gevent.emit('fav.abortExec' + window.thread.id);
            });
        }
        var that = this;
        $('.thread').each(function (el) {
            var num = $(this).attr('id').substr(7);
            if (Favorites.isFavorited(num))that.render_switch(num, true);
        });
        this.reset();
    },
    _send_fav: function (num) {
        if (!Store.get('godmode.send_fav', true))return;
    }
};
window.Settings = {
    categories: [], settings: {}, editors: {}, visible: false, _editor_onsave: null, reload: function () {
        var that = this;
        var body = $('#settings-body');
        body.html('');
        this.renderCategories(body, function (cat, cat_body) {
            that.renderSettings(cat, cat_body);
        });
    }, addCategory: function (id, name) {
        this.categories.push([id, name]);
        this.settings[id] = {};
    }, addSetting: function (category, path, obj) {
        this.settings[category][path] = obj;
    }, getSetting: function (category, path) {
        return this.settings[category][path];
    }, addEditor: function (name, showcb, savecb) {
        this.editors[name] = [showcb, savecb];
    }, renderCategories: function (body, cb) {
        var that = this;
        for (var i = 0; i < this.categories.length; i++)(function (i) {
            var cat = that.categories[i];
            var btn_expand = $('<span class="settings-category-switch settings-category-expand">+</span>');
            var btn_contract = $('<span class="settings-category-switch settings-category-contract" style="display: none">-</span>');
            var cat_label = $('<div class="settings-category-name">' + cat[1] + '</div>');
            var cat_body = $('<div class="settings-category" id="settings-category' + cat[0] + '" style="display: none"></div>');
            cat_label.prepend(btn_contract);
            cat_label.prepend(btn_expand);
            body.append(cat_label);
            body.append(cat_body);
            cat_label.click(function () {
                cat_body.toggle();
                btn_contract.toggle();
                btn_expand.toggle();
            });
            cb(cat[0], cat_body);
        })(i);
    }, renderSettings: function (cat_id, cat_el) {
        for (var key in this.settings[cat_id]) {
            if (!this.settings[cat_id].hasOwnProperty(key))continue;
            var setting = this.settings[cat_id][key];
            var setting_row = $('<div class="settings-setting-row"></div>');
            var setting_label = $('<span class="settings-setting-label">' + setting.label + '</span>');
            if (setting.multi) {
                var select_box = $('<select class="settings-setting-multibox mselect"></select>');
                select_box.data('path', key);
                select_box.data('category', cat_id);
                for (var i = 0; i < setting.values.length; i++) {
                    select_box.append('<option value="' + setting.values[i][0] + '">' + setting.values[i][1] + '</option>');
                }
                select_box.val(Store.get(key, setting.default));
                setting_label.append(select_box);
                setting_row.append(setting_label);
                cat_el.append(setting_row);
            } else {
                var checkbox = $('<input type="checkbox" class="settings-setting-checkbox"/>');
                checkbox.data('path', key);
                checkbox.data('category', cat_id);
                checkbox.prop("checked", !!Store.get(key, setting.default));
                setting_label.prepend(checkbox);
                setting_row.append(setting_label);
                cat_el.append(setting_row);
            }
            if (setting.hasOwnProperty('edit'))(function (that, setting) {
                var edit = setting.edit;
                var edit_btn = $('<span class="setting-edit-btn a-link-emulator" title="' + edit.label + '"></span>');
                edit_btn.click(function () {
                    if (!that.editors.hasOwnProperty(edit.editor))return false;
                    that._editor_onsave = Settings.editors[edit.editor][1];
                    that._editor_show = Settings.editors[edit.editor][0];
                    that._editor_path = edit.path;
                    that._editor_default_val = edit.default;
                    var val = Store.get(edit.path, edit.default);
                    $('#settings-btn-save').click();
                    if (edit.hasOwnProperty('importable')) {
                        $('#setting-editor-btn-export').show();
                        $('#setting-editor-btn-import').show();
                    } else {
                        $('#setting-editor-btn-export').hide();
                        $('#setting-editor-btn-import').hide();
                    }
                    if (edit.hasOwnProperty('saveable')) {
                        $('#setting-editor-btn-save').show();
                    } else {
                        $('#setting-editor-btn-save').hide();
                    }
                    $('#setting-editor-title').html(edit.title);
                    $('#setting-editor-body').html('');
                    $('#setting-editor-window').show();
                    that.editors[edit.editor][0](val, edit.path, edit.default);
                    return false;
                });
                setting_row.append(edit_btn);
            })(this, setting);
        }
    }, toggle: function () {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }, show: function () {
        this.reload();
        $('#settings-window').show();
        this.visible = true;
    }, hide: function () {
        $('#settings-window').hide();
        this.visible = false;
    }
};
window.Gevent = {
    last_id: 1, listeners: {}, expire_time: 1000, init: function () {
        if (typeof(localStorage) == 'undefined')return;
        if (!localStorage.gevent_last || !localStorage.gevents) {
            localStorage.gevents = "[]";
            localStorage.gevent_last = 1;
            return;
        }
        this.last_id = localStorage.gevent_last;
        this._deleteExpired();
        var that = this;
        window.addEventListener('storage', function (e) {
            if (e.key != 'gevent_last')return;
            if (e.newValue <= that.last_id)return;
            that._changed(localStorage.gevent_last, localStorage.gevents);
        }, false);
    }, _deleteExpired: function () {
        try {
            var events = JSON.parse(localStorage.gevents);
            var initial_len = events.length;
            var random_delta = (Math.random() * (10 * this.expire_time) + (10 * this.expire_time));
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var etime = event[1];
                if (((+new Date) - etime) > random_delta) {
                    events.splice(i, 1);
                    i--;
                }
            }
            if (initial_len != events.length)localStorage.gevents = JSON.stringify(events);
        } catch (e) {
        }
    }, on: function (name, callback) {
        if (!this.listeners.hasOwnProperty(name))this.listeners[name] = [];
        this.listeners[name].push(callback);
        return callback;
    }, off: function (name, callback) {
        if (!callback)throw new Error('Gevent.off no callback passed');
        if (!this.listeners.hasOwnProperty(name))return false;
        var index = this.listeners[name].indexOf(callback);
        if (index < 0)return false;
        this.listeners[name].splice(index, 1);
        return true;
    }, once: function (name, callback) {
        var that = this;
        var proxycb = function (msg) {
            that.off(name, proxycb);
            callback(msg);
        };
        this.on(name, proxycb);
        return proxycb;
    }, onceNtemp: function (name, time, callback, timeout_callback) {
        var that = this;
        var proxy_cb;
        var timeout_timer = setTimeout(function () {
            that.off(name, proxy_cb);
            if (timeout_callback)timeout_callback();
        }, time);
        proxy_cb = this.once(name, function (msg) {
            clearTimeout(timeout_timer);
            callback(msg);
        });
        return proxy_cb;
    }, emit: function (name, msg) {
        if (typeof(localStorage) == 'undefined')return;
        if (!msg)msg = "";
        this.last_id++;
        var events = JSON.parse(localStorage.gevents);
        events.push([this.last_id, (+new Date), name, msg]);
        localStorage.gevents = JSON.stringify(events);
        localStorage.gevent_last = this.last_id;
        this._watchExpire(this.last_id);
    }, _watchExpire: function (id) {
        var that = this;
        setTimeout(function () {
            that._removeExpired(id);
        }, this.expire_time);
    }, _removeExpired: function (id) {
        var events = JSON.parse(localStorage.gevents);
        var old_len = events.length;
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var eid = event[0];
            if (eid == id) {
                events.splice(i, 1);
            }
        }
        if (events.length == old_len)return;
        localStorage.gevents = JSON.stringify(events);
    }, _changed: function (gevent_last, json) {
        if (gevent_last == this.last_id)return;
        var events = JSON.parse(json);
        events.sort(function (a, b) {
            return a.id - b.id;
        });
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var eid = event[0];
            var etime = event[1];
            if (eid <= this.last_id)continue;
            if ((+new Date) - etime > this.expire_time)continue;
            this._handleEvent.apply(this, event);
        }
    }, _handleEvent: function (id, time, name, msg) {
        this.last_id = id;
        if (!this.listeners.hasOwnProperty(name))return;
        var list = this.listeners[name];
        var list_copy = [];
        for (var i = 0; i < list.length; i++)list_copy.push(list[i]);
        for (var j = 0; j < list_copy.length; j++)list_copy[j](msg);
    }
};
(function () {
    var conf_loaded = false;
    var dom_ready = false;
    var conf_queue = [];
    var dom_queue = [];
    var debug_html = '';
    window.loadInitialConfig = function (cfg) {
        window.thread.id = cfg.thread_num;
        window.thread.board = cfg.board;
        window.thread.hideTimeout = 7;
        conf_loaded = true;
        for (var i = 0; i < conf_queue.length; i++)bmark.apply(this, conf_queue[i]);
        conf_queue = [];
    };
    $(function () {
        $('body').append('<div id="bmark_debug" style="display: none">' + debug_html + '</div>');
        dom_ready = true;
        for (var i = 0; i < dom_queue.length; i++)bmark.apply(this, dom_queue[i]);
        dom_queue = [];
        debug_html = '';
    });
    window.Stage = function (name, id, type, cb) {
        if (Store.get('debug_disable_stage.' + id, false))return;
        if (type == Stage.INSTANT) {
            name = '[I]' + name;
            bmark(name, cb);
        } else if (type == Stage.CONFLOAD) {
            name = '[C]' + name;
            if (conf_loaded) {
                bmark(name, cb);
            } else {
                conf_queue.push([name, cb]);
            }
        } else if (type == Stage.DOMREADY) {
            name = '[D]' + name;
            if (dom_ready) {
                bmark(name, cb);
            } else {
                dom_queue.push([name, cb]);
            }
        } else if (type == Stage.ASYNCH) {
            name = '[A]' + name;
            setTimeout(function () {
                bmark(name, cb);
            }, 1);
        }
    };
    var bmark = function (name, cb) {
        var start = (+new Date);
        try {
            cb();
        } catch (err) {
            append_debug('<span style="color:#FF0000">На шаге "' + name + '" произошла ошибка:<br>' + '<pre>' +
                err + '\n' +
                err['stack'] + '</pre>' + '</span>');
            return false;
        }
        var end = (+new Date);
        var delta = end - start;
        append_debug(delta + 'ms) ' + name + '<br>');
    };
    var append_debug = function (text) {
        if (dom_ready) {
            $('#bmark_debug').append(text);
        } else {
            debug_html += text;
        }
    };
    Stage.INSTANT = 1;
    Stage.CONFLOAD = 2;
    Stage.DOMREADY = 3;
    Stage.ASYNCH = 4;
})();

Stage('Система раскрытия на полный экран', 'screenexpand', Stage.DOMREADY, function () {
    var container = $('<div style="' + 'position: fixed;' + 'display: none;' + 'background-color: #555555;' + 'padding:8px;' + '-webkit-box-sizing: content-box;' + '-moz-box-sizing: content-box;' + 'box-sizing: content-box;' + '" id="fullscreen-container"></div>');
    var win = $(window);
    var active = false;
    var mouse_on_container = false;
    var img_width, img_height;
    var multiplier = 1;
    var container_mouse_pos_x = 0;
    var container_mouse_pos_y = 0;
    var webm = false;
    var border_offset = 8;
    $('body').append(container);
    window.fullscreenExpand = function (num, src, thumb_src, image_width, image_height) {
        abortWebmDownload();
        if (active == num) {
            hide();
            return false;
        }
        var win_width = win.width();
        var win_height = win.height();
        img_width = image_width;
        img_height = image_height;
        multiplier = 1;
        active = num;
        webm = src.substr(-5) == '.webm';
        mouse_on_container = false;
        container.html(webm ? '<video id="html5video" onplay="webmPlayStarted(this)" onvolumechange="webmVolumeChanged(this)" name="media" loop="1" ' + (Store.get('other.webm_vol', false) ? '' : 'muted="1"') + ' controls="" autoplay="" height="100%" width="100%"><source class="video" height="100%" width="100%" type="video/webm" src="' + src + '"></source></video>' : '<img src="' + src + '" width="100%" height="100%" />').css('top', (((win_height - image_height) / 2) - border_offset) + 'px').css('left', (((win_width - image_width) / 2) - border_offset) + 'px').width(image_width).height(image_height).show();
        if (image_width > win_width || image_height > win_height) {
            var multiplier_width = Math.floor(win_width / image_width * 10) / 10;
            var multiplier_height = Math.floor(win_height / image_height * 10) / 10;
            if (multiplier_width < 0.1)multiplier_width = 0.1;
            if (multiplier_height < 0.1)multiplier_height = 0.1;
            resize(multiplier_width < multiplier_height ? multiplier_width : multiplier_height, true);
        }
        return false;
    };
    var hide = function () {
        abortWebmDownload();
        active = false;
        mouse_on_container = false;
        container.hide();
        if (webm) {
            container.html('');
        }
    };
    var resize = function (new_multiplier, center) {
        if (new_multiplier < 0.1)return;
        if (new_multiplier > 5)return;
        repos(new_multiplier, center);
        multiplier = new_multiplier;
        container.width(img_width * multiplier).height(img_height * multiplier);
    };
    var repos = function (new_multiplier, center) {
        var scroll_top = win.scrollTop();
        var scroll_left = win.scrollLeft();
        var container_offset = container.offset();
        var x_on_container;
        var y_on_container;
        if (center) {
            x_on_container = img_width / 2;
            y_on_container = img_height / 2;
        } else {
            x_on_container = (container_mouse_pos_x - container_offset.left + scroll_left);
            y_on_container = (container_mouse_pos_y - container_offset.top + scroll_top);
        }
        var container_top = container_offset.top - scroll_top;
        var container_left = container_offset.left - scroll_left;
        var delta_multiplier = new_multiplier - multiplier;
        var delta_top = delta_multiplier * y_on_container / multiplier;
        var delta_left = delta_multiplier * x_on_container / multiplier;
        container.css('left', (container_left - delta_left) + 'px').css('top', (container_top - delta_top) + 'px');
    };
    container.mouseover(function () {
        mouse_on_container = true;
    });
    container.mouseout(function () {
        mouse_on_container = false;
    });
    container.mousemove(function (e) {
        container_mouse_pos_x = e.clientX;
        container_mouse_pos_y = e.clientY;
    });
    win.keyup(function (e) {
        if (!active)return;
        var move;
        var code = e.keyCode || e.which;
        if (code == 37 || code == 65 || code == 97 || code == 1092) {
            move = -1;
        } else if (code == 39 || code == 68 || code == 100 || code == 1074) {
            move = 1;
        } else if (code == 27) {
            return hide();
        } else {
            return;
        }
        var images = $('.image-link');
        var active_index = images.index($('#exlink-' + active));
        var new_index = active_index + move;
        if (new_index < 0)new_index = images.length - 1;
        if (new_index > images.length - 1)new_index = 0;
        var next = images.eq(new_index);
        next.find('a').click();
    });
    win.click(function (e) {
        if (!active)return;
        if (e.which != 1)return;
        if ($(e.target).closest('.img').length)return;
        if ($(e.target).attr('name') == 'expandfunc')return;
        if ($(e.target).closest('#fullscreen-container').length)return;
        hide();
    });
    win.bind((/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel", function (e) {
        if (!active)return;
        if (!mouse_on_container)return;
        e.preventDefault();
        var evt = window.event || e;
        evt = evt.originalEvent ? evt.originalEvent : evt;
        var delta = evt.detail ? evt.detail * (-40) : evt.wheelDelta;
        if (delta > 0) {
            resize(multiplier + 0.1);
        }
        else {
            resize(multiplier - 0.1);
        }
    });
    draggable(container, {
        click: function () {
            hide();
        }, mousedown: function (e_x, e_y) {
            if (!webm)return;
            var container_top = parseInt(container.css('top'));
            var container_height = container.height();
            if ((container_top + container_height) - e_y < 35)return false;
        }
    });
});

function draggable(el, events) {
    var in_drag = false;
    var moved = 0;
    var last_x, last_y;
    var win = $(window);
    el.mousedown(function (e) {
        if (e.which != 1)return;
        if (events && events.mousedown && events.mousedown(e.clientX, e.clientY) === false)return;
        e.preventDefault();
        in_drag = true;
        moved = 0;
        last_x = e.clientX;
        last_y = e.clientY;
    });
    win.mousemove(function (e) {
        var delta_x, delta_y;
        var el_top, el_left;
        if (!in_drag)return;
        delta_x = e.clientX - last_x;
        delta_y = e.clientY - last_y;
        moved += Math.abs(delta_x) + Math.abs(delta_y);
        last_x = e.clientX;
        last_y = e.clientY;
        el_top = parseInt(el.css('top'));
        el_left = parseInt(el.css('left'));
        el.css({top: (el_top + delta_y) + 'px', left: (el_left + delta_x) + 'px'});
    });
    win.mouseup(function (e) {
        if (!in_drag)return;
        in_drag = false;
        if (moved < 6 && events && events.click)events.click(last_x, last_y);
    });
}