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
    
### Planned
- Advanced userlist
    * Detailed user information
    * Chat mention on click
    * User filter (friends, strangers, meh-hers, wooters)
- Estimated time until playing

How to use
---------
    
Add this piece of code to a bookmark or tampermonkey:

```javascript
javascript: (function () {
    var jsCode = document.createElement('script');
    jsCode.setAttribute('id', 'plug-ultimate');
    jsCode.setAttribute('src', 'https://raw.github.com/TrueFurby/plug-essential/master/plug_essential.js');
    document.body.appendChild(jsCode);
}());
```