var plugEssential = false;

define('plugEssential/Model', ['app/base/Class'], function (Class) {
    return Class.extend({
        version: {
            major: 0,
            minor: 0,
            change: 1,
            getString: function () {
                return (this.major + "." + this.minor + "." + this.change);
            }
        },
        init: function () {
            console.log("Activating Plug Essential!");
            this.proxy = {
                togglePanel: $.proxy(this.togglePanel, this),
                onDjAdvance: $.proxy(this.onDjAdvance, this),
                ctrlAutowoot: $.proxy(this.ctrlAutowoot, this),
                ctrlAutojoin: $.proxy(this.ctrlAutojoin, this),
                refreshUserlist: $.proxy(this.refreshUserlist, this)
            };
            /* FIRST JOIN */
            if (API.getBoothPosition() < 0 && API.getWaitListPosition() < 0) {
                console.log("Adding yourself to waitlist/booth: " + API.djJoin());
            }
            this.autowootActive = false;
            this.autojoinActive = false;
            this.initGui();
            this.initEvents();
            this.refreshUserlist();
        },
        close: function () {
            console.log("Closing Plug Essential!");
        },
        initEvents: function () {
            API.on(API.DJ_ADVANCE, this.proxy.onDjAdvance);
            API.on(API.USER_JOIN, this.proxy.refreshUserlist);
            API.on(API.USER_LEAVE, this.proxy.refreshUserlist);
        },
        initGui: function () {
            this.controlPanelBtn = $("<div id=\"control-panel-btn\" style=\"\
                position: absolute;\
                height: 30px;\
                width: 32px;\
                top: 288px;\
                z-index: 15;\
                padding: 0;\
                cursor: pointer;\
                background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAeCAYAAABNChwpAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAANpJREFUeNrslr0NwyAQhY8kRTrEALigtieg9E4oEjWLuPIi3oApqOIJnBxSpETCDhBFNPcakDj0Pn6egCmlOADcoZFO0FgEQAAEcCmdoLWGvu+TY+u6wjzP/wVAc2NMcmxZll2AbduAMdbuCFLmdAkJIDsFGL2Xuq7breOcf9R672M0fwaQUoJzLiui0zTFPsYRY/lNZyHE9dnejopwJSEEGMcxa1vR3FqbVZsFUAJRYl4EkANRal4McARRY14FkIKoNa96jN5XjBqGodo8vhH0LScAAmgN8BBgALa+WJ5I3jxIAAAAAElFTkSuQmCC);\
                \"></div>").appendTo("#room-view");
            this.controlPanel = $("<div id=\"control-panel\" style=\"\
                position: absolute;\
                width: 845px;\
                top: 288px;\
                left: 1px;\
                z-index: 10;\
                padding: 0;\
                height: 292px;\
                \"><div class=\"frame-background\"></div></div>").appendTo("#room-view");
            this.controlPanelBtn.click(this.proxy.togglePanel);
            this.versionBox = $("<div style=\"position: absolute; padding: 0;display: block;left: 40px;top: 8px;vertical-align: middle;\"><span style=\"font-size: 10px;color: #858585;\">Plug Essential v"+this.version.getString()+"</span></div>").appendTo("#control-panel");
            this.userlistBox = $("<div id=\"userlist\" style=\"position: absolute; width: 230px; height: 270px; padding: 0px;display: block;left: 600px;top: 10px;\"></div>").appendTo("#control-panel");
            this.userlistBox.append("<div id=\"userlist-header\" class=\"meta-header\" style=\"top: 0;left: 0;width: 220px;\"><span id=\"room-score-perc\" class=\"hnb\" style=\"left:0;\">USERLIST</span><span id=\"user-count\" style=\"float: right;position: relative;color:#BBB;font-size:11px;\">? users</span></div>");
            this.userlistBox.append("<div id=\"userlist-body\" style=\" top: 25px; height: 240px; width: 100%; border: 1px solid #252525; position: absolute; overflow-y: auto; overflow-x: hidden; \"></div>");
            this.autowootBtn = $("<div id=\"autowoot-btn\" style=\"position: absolute; width: 90px; height: 25px; padding: 0;display: block;left: 20px;top: 65px;text-align: center;border: 1px solid #AAA;cursor: pointer;\">\
                <div class=\"frame-background\" style=\"background-color: #73A024;\"></div>\
                <div style=\"top: 4px;display: block;height: 100%;position: absolute;text-align: center;width: 100%;\">\
                <span style=\"color: #FFF;text-shadow: 1px 1px #303030;\">Autowoot</span></div></div>").appendTo("#control-panel");
            this.autowootBtn.click(this.proxy.ctrlAutowoot);
            this.autojoinBtn = $("<div id=\"autojoin-btn\" style=\"position: absolute; width: 90px; height: 25px; padding: 0;display: block;left: 20px;top: 100px;text-align: center;border: 1px solid #AAA;cursor: pointer;\">\
                <div class=\"frame-background\" style=\"background-color: #73A024;\"></div>\
                <div style=\"top: 4px;display: block;height: 100%;position: absolute;text-align: center;width: 100%;\">\
                <span style=\"color: #FFF;text-shadow: 1px 1px #303030;\">Autojoin</span></div></div>").appendTo("#control-panel");
            this.autojoinBtn.click(this.proxy.ctrlAutojoin);
        },
        togglePanel: function () {
            if (this.controlPanel.is(":visible")) {
                this.controlPanel.slideUp();
            } else {
                this.controlPanel.slideDown();
            }
        },
        refreshUserlist: function () {
            $("#user-count").html(API.getUsers().length + " users");
            var userlistBody = $("#userlist-body");
            userlistBody.children().filter(".user-element").remove();
            for (i = 0; i < API.getUsers().length; i++) {
                var user = API.getUsers()[i];
                var userElement = $("<div class=\"user-element\" style=\"padding: 3px;\">" + user.username + "</div>").appendTo("#userlist-body");
                if (user.relationship == 1 || user.relationship == 2) {
                    userElement.css("font-style", "italic");
                } else if (user.relationship == 3) {
                    userElement.css("font-weight", "bold");
                } else {
                    userElement.css("color", "#AAA");
                }
                if (user.permission >= 2) {
                    userElement.css("color", "#e90e82");
                }
            }
        },
        onDjAdvance: function () {
            if (this.autowootActive) {
                this.doWoot();
            }
            if (this.autojoinActive && API.getBoothPosition() < 0 && API.getWaitListPosition() < 0) {
                this.doJoin();
            }
        },
        ctrlAutowoot: function () {
            if (this.autowootActive) {
                console.log("autowoot deactivated!");
                this.autowootActive = false;
                $("#autowoot-btn .frame-background").css("background-color", "#73A024");
            } else {
                console.log("autowoot activated!");
                this.autowootActive = true;
                this.doWoot();
                $("#autowoot-btn .frame-background").css("background-color", "#A33A46");
            }
        },
        ctrlAutojoin: function () {
            if (this.autojoinActive) {
                console.log("autojoin deactivated!");
                this.autojoinActive = false;
                $("#autojoin-btn .frame-background").css("background-color", "#73A024");
            } else {
                console.log("autowoot activated!");
                this.autojoinActive = true;
                this.doJoin();
                $("#autojoin-btn .frame-background").css("background-color", "#A33A46");
            }
        },
        doWoot: function () {
            if (API.getDJs().length === 0) return;
            var dj = API.getDJs()[0];
            if (dj === null || dj == API.getUser()) return;
            $('#button-vote-positive').click();
        },
        doJoin: function () {
            if ($('#button-dj-play').css('display') === 'block' || $('#button-dj-waitlist-join').css('display') === 'block')
                console.log("Adding yourself to waitlist/booth: " + API.djJoin());
        }
    });
});

define('plugEssential/Loader', ['app/base/Class', 'plugEssential/Model'], function (Class, Model) {
    if (plugEssential) {
        plugEssential.close();
    }
    return Class.extend({
        init: function () {
            this.initTimer = setInterval($.proxy(this.tryInit, this), 1000);
        },
        tryInit: function () {
            if (typeof (API) === 'undefined' || typeof (API.getHistory) === 'undefined' || typeof (API.getHistory()) === 'undefined') {
                console.log("not ready");
                return;
            }
            clearInterval(this.initTimer);
            plugEssential = new Model();
        }
    });
});

require(['plugEssential/Loader'], function (Loader) {
    new Loader();
});