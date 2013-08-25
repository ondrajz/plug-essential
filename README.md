Plug Essential
==========

Plug Essential is a browser javascript plugin for plug.dj website.

Features
---------
### Current
- Autowoot
- Autojoin
- Userlist
    * Colors by rank
    * Font style by relationship
    * Chat mention link
    
### Planned
- Advanced userlist
    * Detailed user information
    * User filter (friends, strangers, meh-hers, wooters)
- Estimated time until playing

How to use
---------
    
Add this piece of code to a bookmark and run it in plug.dj room:

```javascript
javascript: (function () {
    plugEssentialSrc = "http://plug.phoenixlair.com";
    var jsCode = document.createElement('script');
    jsCode.setAttribute('id', 'plug-ultimate');
    jsCode.setAttribute('src', plugEssentialSrc+'/plug_essential.js');
    document.body.appendChild(jsCode);
}());
```