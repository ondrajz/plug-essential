var plugEssential = false;

define('plugEssential/Config', { 
    plug: {
        roomView: $("#room-view"),
        wootBtn: $("#button-vote-positive"),
        djPlayBtn: $("#button-dj-play"),
        waitlistJoinBtn: $("#button-dj-waitlist-join"),
        chatInput: $("#chat-input-field")
    }
});

define('plugEssential/Model', ['app/base/Class', 'plugEssential/Config'], function (Class, Config) {
    return Class.extend({
        version: {
            major: 0,
            minor: 1,
            change: 0,
            getString: function () {
                return (this.major + "." + this.minor + "." + this.change);
            }
        },
        init: function () {
            console.log("Activating Plug Essential!");
            this.proxy = {
                togglePanel: $.proxy(this.togglePanel, this),
                onDjAdvance: $.proxy(this.onDjAdvance, this),
                onUpdateVote: $.proxy(this.onUpdateVote, this),
                ctrlAutowoot: $.proxy(this.ctrlAutowoot, this),
                ctrlAutojoin: $.proxy(this.ctrlAutojoin, this),
                refreshUserlist: $.proxy(this.refreshUserlist, this),
                onUserJoin: $.proxy(this.onUserJoin, this),
                onUserLeave: $.proxy(this.onUserLeave, this)
            };
            this.userlist = {}
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
            this.controlPanel.remove();
            this.controlPanelBtn.remove();
        },
        initEvents: function () {
            API.on(API.VOTE_UPDATE, this.proxy.onUpdateVote);
            API.on(API.DJ_ADVANCE, this.proxy.onDjAdvance);
            API.on(API.USER_JOIN, this.proxy.onUserJoin);
            API.on(API.USER_LEAVE, this.proxy.onUserLeave);
        },
        initGui: function () {
            this.controlPanelBtn = $("<div id=\"pe_control-panel-btn\"></div>").appendTo(Config.plug.roomView);
            this.controlPanel = $("<div id=\"pe_control-panel\"><div class=\"frame-background\"></div></div>").appendTo(Config.plug.roomView);
            this.controlPanelBtn.click(this.proxy.togglePanel);
            this.versionBox = $("<div id=\"pe_version-box\"><span style=\"font-size: 10px;color: #858585;\">Plug Essential v"+this.version.getString()+"</span></div>").appendTo(this.controlPanel);
            this.userlistBox = $("<div id=\"pe_userlist-box\"></div>").appendTo(this.controlPanel);
            this.userlistHeader = $("<div id=\"pe_userlist-header\" class=\"meta-header\"><span id=\"room-score-perc\" class=\"hnb\" style=\"left:0;\">USERLIST</span><span id=\"pe_userlist-count\">? users</span></div>").appendTo(this.userlistBox);
            this.userlistBody = $("<div id=\"pe_userlist-body\"></div>").appendTo(this.userlistBox);
            this.userlistTable = $("<table id=\"pe_userlist-table\"><tbody></tbody></table>").appendTo(this.userlistBody);
            this.autowootBtn = $("<div id=\"pe_autowoot-btn\" class=\"pe_control-btn\">\
                <div class=\"frame-background\" style=\"background-color: #73A024;\"></div>\
                <div style=\"top: 4px;display: block;height: 100%;position: absolute;text-align: center;width: 100%;\">\
                <span style=\"color: #FFF;text-shadow: 1px 1px #303030;\">Autowoot</span></div></div>").appendTo(this.controlPanel);
            this.autowootBtn.click(this.proxy.ctrlAutowoot);
            this.autojoinBtn = $("<div id=\"pe_autojoin-btn\" class=\"pe_control-btn\">\
                <div class=\"frame-background\" style=\"background-color: #73A024;\"></div>\
                <div style=\"top: 4px;display: block;height: 100%;position: absolute;text-align: center;width: 100%;\">\
                <span style=\"color: #FFF;text-shadow: 1px 1px #303030;\">Autojoin</span></div></div>").appendTo(this.controlPanel);
            this.autojoinBtn.click(this.proxy.ctrlAutojoin);
        },
        togglePanel: function () {
            if (this.controlPanel.is(":visible")) {
                this.controlPanel.slideUp();
            } else {
                this.controlPanel.slideDown();
            }
        },
        addUserItem: function (user) {
            var userRow = $("<tr class=\"pe_user-row\"></tr>").appendTo(this.userlistTable);
            this.userlist[user.id] = userRow
            var nameCell = $("<td class=\"pe_user-cell-name\"></td>").appendTo(userRow);
            var extraCell = $("<td class=\"pe_user-cell-extra\"></td>").appendTo(userRow);
            var mentionBtn = $("<span style=\"cursor: pointer;font-weight: bold;padding: 0 3px;\">@</span>").appendTo(extraCell);
            mentionBtn.click(function () {
                Config.plug.chatInput.val("@"+user.username+" ");
                Config.plug.chatInput.focus();
            });
            if (user.vote != 0) {
                if (user.vote>0) {
                    userRow.find("td").addClass("pe_woot");
                }else{
                    userRow.find("td").addClass("pe_meh");
                }
            }
            var userElement = $("<span style=\"padding: 3px;text-shadow: 1px 1px #111;\">"+user.username+"</span>").appendTo(nameCell);
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
        },
        refreshUserlist: function () {
            $("#pe_userlist-count").html(API.getUsers().length + " users");
            this.userlistTable.find("tr").remove();
            for (i = 0; i < API.getUsers().length; i++) {
                this.addUserItem(API.getUsers()[i]);
            }
        },
        onUserJoin: function (user) {
            console.log("user joined: "+user.username);
            this.addUserItem(user);
        },
        onUserLeave: function (user) {
            console.log("user leaving: "+user.username);
            this.userlist[user.id].remove()
        },
        onDjAdvance: function () {
            this.refreshUserlist();
            if (this.autowootActive) {
                this.doWoot();
            }
            if (this.autojoinActive && API.getBoothPosition() < 0 && API.getWaitListPosition() < 0) {
                this.doJoin();
            }
        },
        onUpdateVote: function (obj) {
            console.log("update vote: "+obj.user.username, obj.vote);
            var userRow = this.userlist[obj.user.id];
            userRow.find("td").removeClass("pe_woot");
            userRow.find("td").removeClass("pe_meh");
            if (obj.vote != 0) {
                if (obj.vote>0) {
                    userRow.find("td").addClass("pe_woot");
                }else{
                    userRow.find("td").addClass("pe_meh");
                }
            }
        },
        ctrlAutowoot: function () {
            if (this.autowootActive) {
                console.log("autowoot deactivated!");
                this.autowootActive = false;
                this.autowootBtn.find(".frame-background").css("background-color", "#73A024");
            } else {
                console.log("autowoot activated!");
                this.autowootActive = true;
                this.doWoot();
                this.autowootBtn.find(".frame-background").css("background-color", "#A33A46");
            }
        },
        ctrlAutojoin: function () {
            if (this.autojoinActive) {
                console.log("autojoin deactivated!");
                this.autojoinActive = false;
                this.autojoinBtn.find(".frame-background").css("background-color", "#73A024");
            } else {
                console.log("autojoin activated!");
                this.autojoinActive = true;
                this.doJoin();
                this.autojoinBtn.find(".frame-background").css("background-color", "#A33A46");
            }
        },
        doWoot: function () {
            if (API.getDJs().length === 0) return;
            var dj = API.getDJs()[0];
            if (dj === null || dj == API.getUser()) return;
            Config.plug.wootBtn.click();
        },
        doJoin: function () {
            if (Config.plug.djPlayBtn.css('display') === 'block' || Config.plug.waitlistJoinBtn.css('display') === 'block')
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
