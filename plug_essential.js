/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

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
            minor: 5,
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
                onUpdateVote: $.proxy(this.onUpdateVote, this),
                ctrlAutowoot: $.proxy(this.ctrlAutowoot, this),
                ctrlAutojoin: $.proxy(this.ctrlAutojoin, this),
                refreshUserlist: $.proxy(this.refreshUserlist, this),
                onUserJoin: $.proxy(this.onUserJoin, this),
                onUserLeave: $.proxy(this.onUserLeave, this),
                refreshInfo: $.proxy(this.refreshInfo, this)
            };
            this.userlist = {}
            this.autowootActive = false;
            this.autojoinActive = false;
            this.initGui();
            this.initEvents();
            this.refreshUserlist();
            this.refreshUserDetail();
            this.refreshTop();
            this.refreshInfo();
        },
        lateInit: function () {
            this.refreshTop();
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
            API.on(API.WAIT_LIST_UPDATE, this.proxy.refreshInfo);
            API.on(API.DJ_UPDATE, this.proxy.refreshInfo);
        },
        initGui: function () {
            this.controlPanelBtn = $("<div id=\"pe_control-panel-btn\"></div>").appendTo(Config.plug.roomView);
            this.controlPanelBtn.addClass("pe_control-panel-btn-close");
            this.controlPanel = $("<div id=\"pe_control-panel\"><div class=\"frame-background\"></div></div>").appendTo(Config.plug.roomView);
            this.controlPanelBtn.click(this.proxy.togglePanel);
            this.userlistBox = $("<div id=\"pe_userlist-box\"></div>").appendTo(this.controlPanel);
            this.userlistHeader = $("<div id=\"pe_userlist-header\" class=\"meta-header\"><span id=\"room-score-perc\" class=\"hnb\" style=\"left:0;\">USERLIST</span><span id=\"pe_userlist-count\">? users</span></div>").appendTo(this.userlistBox);
            this.userlistBody = $("<div id=\"pe_userlist-body\"></div>").appendTo(this.userlistBox);
            this.userlistTable = $("<table id=\"pe_userlist-table\"><tbody></tbody></table>").appendTo(this.userlistBody);
            this.userdetailBox = $("<div id=\"pe_user-detail-box\"></div>").appendTo(this.controlPanel);
            this.userdetailHeader = $("<div class=\"meta-header\" id=\"pe_user-detail-header\"><span id=\"room-score-perc\" class=\"hnb\" style=\"left:0;\">USER DETAIL</span></div>").appendTo(this.userdetailBox);
            this.userdetailBody = $("<div id=\"pe_user-detail-body\"></div>").appendTo(this.userdetailBox);
            this.userdetailBody.append("<div style=\"position: absolute; top: 6px; left: 8px;\"><span style=\"font-size: 10px;color: #858585;font-weight: bold;\">USERNAME</span></div>");
            this.userdetailBody.append("<div style=\"position: absolute; top: 50px; left: 8px;\"><span style=\"font-size: 10px;color: #858585;font-weight: bold;\">RANK</span></div>");
            this.userdetailBody.append("<div style=\"position: absolute; top: 90px; left: 8px;\"><span style=\"font-size: 10px;color: #858585;font-weight: bold;\">STATUS</span></div>");
            this.userdetailBody.append("<div style=\"position: absolute; top: 130px; left: 8px;\"><span style=\"font-size: 10px;color: #858585;font-weight: bold;\">JOIN DATE</span></div>");
            this.userdetailBody.append("<div style=\"position: absolute; top: 10px; left: 150px; width: 100px;\"><span style=\"font-size: 9px;color: #858585;font-weight: bold;float: right;\">DJ POINTS</span></div>");
            this.userdetailBody.append("<div style=\"position: absolute; top: 45px; left: 150px; width: 100px;\"><span style=\"font-size: 9px;color: #858585;font-weight: bold;float: right;\">LISTENER POINTS</span></div>");
            this.userdetailBody.append("<div style=\"position: absolute; top: 80px; left: 150px; width: 100px;\"><span style=\"font-size: 9px;color: #858585;font-weight: bold;float: right;\">CURATOR POINTS</span></div>");
            this.userdetailBody.append("<div style=\"position: absolute; top: 115px; left: 150px; width: 100px;\"><span style=\"font-size: 9px;color: #858585;font-weight: bold;float: right;\">FANS</span></div>");
            this.userdetailBody.append("<div style=\"position: absolute; top: 150px; left: 150px; width: 100px;\"><span style=\"font-size: 9px;color: #858585;font-weight: bold;float: right;\">SCORE</span></div>");
            this.detailUsername = $("<div class=\"meta-value hnb\" style=\"width: 250px;top: 25px; left: 8px;\"><span style=\"font-size: 16px;\"></span></div>").appendTo(this.userdetailBody);
            this.detailRank = $("<div class=\"meta-value hnb\" style=\"width: 250px;top: 66px; left: 8px;\"><span style=\"font-size: 14px;\"></span></div>").appendTo(this.userdetailBody);
            this.detailStatus = $("<div class=\"meta-value hnb\" style=\"width: 250px;top: 106px; left: 8px;\"><span style=\"font-size: 12px;\"></span></div>").appendTo(this.userdetailBody);
            this.detailJoined = $("<div class=\"meta-value hnb\" style=\"width: 250px;top: 146px; left: 8px;\"><span style=\"font-size: 12px;\"></span></div>").appendTo(this.userdetailBody);
            this.detailDjPoints = $("<div class=\"meta-value hnb\" style=\" top: 23px; left: 170px; width: 80px;\"><span style=\"font-size: 14px;float: right;\"></span></div>").appendTo(this.userdetailBody);
            this.detailListenerPoints = $("<div class=\"meta-value hnb\" style=\" top: 58px; left: 170px; width: 80px;\"><span style=\"font-size: 14px;float: right;\"></span></div>").appendTo(this.userdetailBody);
            this.detailCuratorPoints = $("<div class=\"meta-value hnb\" style=\" top: 93px; left: 170px; width: 80px;\"><span style=\"font-size: 14px;float: right;\"></span></div>").appendTo(this.userdetailBody);
            this.detailFans = $("<div class=\"meta-value hnb\" style=\" top: 128px; left: 170px; width: 80px;\"><span style=\"font-size: 14px;float: right;\"></span></div>").appendTo(this.userdetailBody);
            this.detailScore = $("<div class=\"meta-value hnb\" style=\" top: 163px; left: 170px; width: 80px;\"><span style=\"font-size: 14px;float: right;\"></span></div>").appendTo(this.userdetailBody);
            this.topHistoryBox = $("<div id=\"pe_top-history-box\"></div>").appendTo(this.controlPanel);
            this.topHistoryHeader = $("<div class=\"meta-header\" id=\"pe_top-history-header\"><span id=\"room-score-perc\" class=\"hnb\" style=\"left:0;\">TOP FROM HISTORY</span></div>").appendTo(this.topHistoryBox);
            this.topImage = $("<img id=\"pe_top-history-image\">").appendTo(this.topHistoryBox);
            this.topHistoryBody = $("<div id=\"pe_top-history-body\"></div>").appendTo(this.topHistoryBox);
            this.topInfo = $("<div style=\"left: 85px;width: 100%;position:absolute;\"></div>").appendTo(this.topHistoryBody);
            this.topAuthor = $("<div class=\"meta-value hnb\" style=\"width: 300%;top: 3px;\"><span style=\"font-size: 14px;\"></span></div>").appendTo(this.topInfo);
            this.topTitle = $("<div class=\"meta-value hnb\" style=\"width: 300%;top: 20px;color: #CCC;\"><span style=\"font-size: 11px;\"></span></div>").appendTo(this.topInfo);
            this.topScore = $("<div class=\"meta-value hnb\" style=\"width: 300%;top: 40px;color: #CCC;\"></div>").appendTo(this.topInfo);
            this.topScore.append("<span class=\"pe_top-score-img pe_mini-woot\" style=\"display: none;\"></span>");
            this.topWoot = $("<span class=\"pe_top-score\"></span>").appendTo(this.topScore);
            this.topScore.append("<span class=\"pe_top-score-img pe_mini-meh\" style=\"display: none;\"></span>");
            this.topMeh = $("<span class=\"pe_top-score\"></span>").appendTo(this.topScore);
            this.topScore.append("<span class=\"pe_top-score-img pe_mini-curate\" style=\"display: none;\"></span>");
            this.topCurate = $("<span class=\"pe_top-score\"></span>").appendTo(this.topScore);
            this.topPlayedBy = $("<span style=\"font-size: 10px;float: left;margin-left: 5px;margin-top: 1px;\"></span>").appendTo(this.topScore);
            this.controlsBox = $("<div id=\"pe_controls-box\"></div>").appendTo(this.controlPanel);
            this.controlsHeader = $("<div class=\"meta-header\" id=\"pe_controls-header\"><span id=\"room-score-perc\" class=\"hnb\" style=\"left:0;\">PLUG ESSENTIAL v"+this.version.getString()+"</span></div>").appendTo(this.controlsBox);
            this.controlsBody = $("<div id=\"pe_controls-body\"></div>").appendTo(this.controlsBox);
            this.controlsBody.append("<div style=\"position: absolute; top: 6px;width:100%;text-align: center;\"><span style=\"font-size: 10px;color: #858585;font-weight: bold;\">AUTOWOOT</span></div>");
            this.controlsBody.append("<div style=\"position: absolute; top: 53px;width:100%;;text-align: center;\"><span style=\"font-size: 10px;color: #858585;font-weight: bold;\">AUTOJOIN</span></div>");
            this.autowootBtn = $("<div style=\"top: 28px;\" class=\"pe_control-btn\">\
                <div class=\"frame-background\" style=\"background-color: #73A024;\"></div>\
                <div style=\"top: 1px;display: block;height: 100%;position: absolute;text-align: center;width: 100%;\">\
                <span style=\"color: #FFF;text-shadow: 1px 1px #303030;\">Enable</span></div></div>").appendTo(this.controlsBody);
            this.autowootBtn.click(this.proxy.ctrlAutowoot);
            this.autojoinBtn = $("<div style=\"top: 75px;\" class=\"pe_control-btn\">\
                <div class=\"frame-background\" style=\"background-color: #73A024;\"></div>\
                <div style=\"top: 1px;display: block;height: 100%;position: absolute;text-align: center;width: 100%;\">\
                <span style=\"color: #FFF;text-shadow: 1px 1px #303030;\">Enable</span></div></div>").appendTo(this.controlsBody);
            this.autojoinBtn.click(this.proxy.ctrlAutojoin);
            this.infoBox = $("<div style=\"position: absolute;left: 105px;top: 10px;width: 195px;\"></div>").appendTo(this.controlPanel);
            this.infoBody = $("<div id=\"pe_info-body\"></div>").appendTo(this.infoBox);
            this.infoPlace = $("<div style=\"position: absolute; top: 45px;width:100%;text-align: center;\"><span style=\"color: #B9B9B9;\">You are in booth:</span></div>").appendTo(this.infoBody);
            this.infoPosition = $("<div style=\"position: absolute; top:65px;width:100%;text-align: center;\"><span style=\"font-size: 20px;font-weight:bold;\">You are in booth:</span></div>").appendTo(this.infoBody);
        },
        togglePanel: function () {
            if (this.controlPanel.is(":visible")) {
                this.controlPanel.slideUp();
                this.controlPanelBtn.addClass("pe_control-panel-btn-open");
                this.controlPanelBtn.removeClass("pe_control-panel-btn-close");
            } else {
                this.controlPanel.slideDown();
                this.controlPanelBtn.removeClass("pe_control-panel-btn-open");
                this.controlPanelBtn.addClass("pe_control-panel-btn-close");
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
            if (API.getDJs().length>0 && user.id === API.getDJs()[0].id) {
                userRow.find("td").addClass("pe_dj");
            }else if (!(typeof(user.vote)==='undefined') && user.vote != 0) {
                if(user.vote>0) {
                    userRow.find("td").addClass("pe_woot");
                }else{
                    userRow.find("td").addClass("pe_meh");
                }
            }
            var userElement = $("<span style=\"padding: 3px;text-shadow: 1px 1px #111;cursor: pointer;\">"+user.username+"</span>").appendTo(nameCell);
            userElement.click($.proxy(function(){
                this.refreshUserDetail(user);
            }, this));
            if (user.id === API.getUser().id) {
                userElement.css("font-weight", "bold");
                userElement.addClass("pe_role-you");
            } else {
                if (user.relationship == 1) {
                    userElement.css("font-style", "italic");
                } else if (user.relationship == 2) {
                    userElement.css("font-weight", "bold");
                    userElement.css("font-style", "italic");
                } else if (user.relationship == 3) {
                    userElement.css("font-weight", "bold");
                } else {
                    userElement.css("opacity", ".5");
                }
                var role = user.permission;
                if (role == API.ROLE.ADMIN) {
                    userElement.addClass("pe_role-admin");
                }else if (role == API.ROLE.AMBASSADOR) {
                    userElement.addClass("pe_role-ambassador");
                }else if (role == API.ROLE.HOST || role == API.ROLE.COHOST) {
                    userElement.addClass("pe_role-host");
                }else if (role == API.ROLE.MANAGER) {
                    userElement.addClass("pe_role-moderator");
                }else if (role >= API.ROLE.FEATUREDDJ) {
                    userElement.addClass("pe_role-bouncer");
                }else{
                    userElement.addClass("pe_role-none");
                }
            }
        },
        refreshInfo: function() {
            if (API.getDJs().length > 0 && API.getDJs()[0].id == API.getUser().id) {
                this.infoPlace.find("span").html("You are:");
                this.infoPosition.find("span").css("color", "#FFF");
                this.infoPosition.find("span").css("color", "#CCFF20");
                this.infoPosition.find("span").html("Playing now!");
            } else if (API.getBoothPosition() < 0 && API.getWaitListPosition() < 0) {
                this.infoPlace.find("span").html("You are not in queue.");
                this.infoPosition.find("span").css("color", "#FFF");
                this.infoPosition.find("span").html("-");
            } else if (API.getWaitListPosition() >= 0) {
                this.infoPlace.find("span").html("You are in the waitlist:");
                this.infoPosition.find("span").css("color", "#20CCFF");
                this.infoPosition.find("span").html(API.getWaitListPosition()+"/"+API.getWaitList().length);
            } else if (API.getBoothPosition() >= 0) {
                this.infoPlace.find("span").html("You are in the booth:");
                this.infoPosition.find("span").css("color", "#CCFF20");
                this.infoPosition.find("span").html(API.getBoothPosition());
            }
        },
        refreshTop: function () {
            setTimeout($.proxy(function() {
                console.log("len: "+API.getHistory().length+" media: "+API.getMedia());
                var top;
                for(var i=1;i<API.getHistory().length;i++){
                    var entry = API.getHistory()[i];
                    if (!top || ((entry.room.positive+entry.room.curates)-entry.room.negative)>=((top.room.positive+top.room.curates)-top.room.negative)) {
                        top = entry;
                    }
                }
                if (top) {
                    console.log("new top: "+top);
                    this.topImage.attr("src", top.media.image).load($.proxy(function() {
                        this.topInfo.css("left", this.topImage.width()-3);
                        this.topAuthor.find("span").html(top.media.author);
                        this.topTitle.find("span").html(top.media.title);
                        this.topScore.find(".pe_top-score-img").show();
                        this.topWoot.html(top.room.positive);
                        this.topMeh.html(top.room.negative);
                        this.topCurate.html(top.room.curates);
                        this.topPlayedBy.html(top.user.username);
                    }, this));
                }
            }, this), 3000);
        },
        refreshUserDetail: function (user) {
            if(typeof(this.detailOf) === 'undefined'){
                this.detailOf = API.getUser().id;
            }
            if(typeof(user) === 'undefined'){
                user = API.getUser(this.detailOf);
            }else{
                this.detailOf = user.id;
            }
            this.detailUsername.find("span").html(user.username);
            var status = user.status;
            var statusSpan = this.detailStatus.find("span");
            if (status == API.STATUS.AVAILABLE) {
                statusSpan.html("Available");
            }else if (status == API.STATUS.AFK) {
                statusSpan.html("AFK");
            }else if (status == API.STATUS.WORKING) {
                statusSpan.html("Working");
            }else if (status == API.STATUS.SLEEPING) {
                statusSpan.html("Sleeping");
            }else{
                statusSpan.html(status);
            }
            var role = user.permission;
            var roleSpan = this.detailRank.find("span");
            if (role == API.ROLE.NONE) {
                roleSpan.html("None");
            } else if (role == API.ROLE.FEATUREDDJ) {
                roleSpan.html("Featured DJ");
            } else if (role == API.ROLE.BOUNCER) {
                roleSpan.html("Bouncer");
            } else if (role == API.ROLE.MANAGER) {
                roleSpan.html("Manager");
            } else if (role == API.ROLE.COHOST) {
                roleSpan.html("Co-host");
            } else if (role == API.ROLE.HOST) {
                roleSpan.html("Host");
            } else if (role == API.ROLE.AMBASSADOR) {
                roleSpan.html("Ambassador");
            } else if (role == API.ROLE.ADMIN) {
                roleSpan.html("Admin");
            } else {
                roleSpan.html(role);
            }
            roleSpan.removeClass("pe_role-admin");
            roleSpan.removeClass("pe_role-ambassador");
            roleSpan.removeClass("pe_role-host");
            roleSpan.removeClass("pe_role-moderator");
            roleSpan.removeClass("pe_role-bouncer");
            roleSpan.removeClass("pe_role-none");
            if (role == API.ROLE.ADMIN) {
                roleSpan.addClass("pe_role-admin");
            }else if (role == API.ROLE.AMBASSADOR) {
                roleSpan.addClass("pe_role-ambassador");
            }else if (role == API.ROLE.HOST || role == API.ROLE.COHOST) {
                roleSpan.addClass("pe_role-host");
            }else if (role == API.ROLE.MANAGER) {
                roleSpan.addClass("pe_role-moderator");
            }else if (role >= API.ROLE.FEATUREDDJ) {
                roleSpan.addClass("pe_role-bouncer");
            }else{
                roleSpan.addClass("pe_role-none");
            }
            var joinDate = new Date(parseInt(user.id.substring(0,8), 16)*1000);
            var oldDate = new Date(2012, 10, 24);
            if(joinDate.getTime()<oldDate.getTime()) {
                this.detailJoined.find("span").html("Old user");
            }else{
                this.detailJoined.find("span").html(dateFormat(joinDate, "mmmm dS yyyy"));
            }
            this.detailDjPoints.find("span").html(user.djPoints);
            this.detailListenerPoints.find("span").html(user.listenerPoints);
            this.detailCuratorPoints.find("span").html(user.curatorPoints);
            this.detailFans.find("span").html(user.fans);
            var score = user.fans/(user.djPoints+user.listenerPoints+user.curatorPoints)
            if (isNaN(score)){
                this.detailScore.find("span").html("-");
            }else{
                if(user.fans<100){
                    score = score*(user.fans/100);
                }
                this.detailScore.find("span").html((score*1000).toFixed(2));
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
            this.refreshTop();
            this.refreshUserDetail();
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
                this.autowootBtn.find("span").html("Enable");
            } else {
                console.log("autowoot activated!");
                this.autowootActive = true;
                this.doWoot();
                this.autowootBtn.find(".frame-background").css("background-color", "#A33A46");
                this.autowootBtn.find("span").html("Disable");
            }
        },
        ctrlAutojoin: function () {
            if (this.autojoinActive) {
                console.log("autojoin deactivated!");
                this.autojoinActive = false;
                this.autojoinBtn.find(".frame-background").css("background-color", "#73A024");
                this.autojoinBtn.find("span").html("Enable");
            } else {
                console.log("autojoin activated!");
                this.autojoinActive = true;
                this.doJoin();
                this.autojoinBtn.find(".frame-background").css("background-color", "#A33A46");
                this.autojoinBtn.find("span").html("Disable");
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
