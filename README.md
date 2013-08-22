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
    var src = "https://raw.github.com/TrueFurby/plug-essential/master";
    $('body').append('<script id="plug-essential" src='+src+'/plug_essential.js"></script>');
    $('body').prepend('<link rel="stylesheet" type="text/css" id="plug-essential-css" href='+src+'/plug_essential.css" />')
}());
```