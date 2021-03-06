

*Note: This plugin has been rewritten and vastly improved.*


Notify.js
=====

> A simple, versatile notification library


See demos and full documentation at:

## http://notifyjs.com/


However, if you still want this old thing, keep scrolling...

.

.

.

.





### jQuery Prompt


Summary
---
A jQuery plugin for creating stylised text prompts on elements.

Downloads
---

* [Development Version]
* [Production Version]

Basic Usage
---

The following HTML:

``` html
<!-- jQuery -->
<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>

<!-- jQuery Prompt -->
<script src="http://jpillora.github.com/jquery.prompt/dist/jquery.prompt.min.js"></script>
 
<form>
  <input id="one" value="42"/>
  <input id="two" value="abc"/>
  <input type="submit"/>
</form>

<script>
  $(function() {
    $("#one").prompt("hello");
    $("#two").prompt("world");
  });
</script>
```

Should result in:

![basic usage result](http://jpillora.github.com/jquery.prompt/docs/screeny.png)

Demos
---
http://jpillora.github.com/jquery.prompt/

API
---

`$.prompt(element, text, options)`

`$('selector').prompt(text, options)`

Options:
---
*Todo*

Conceptual Overview
---
When first called on an element, the plugin will create a relatively positioned error container *above* the element with width and height set to 0. The inner content is then absolutely positioned based on the elements width and height. When clicked, the container is hidden so it does not need to be recreated if shown again. 

Todo
---
* Tests
* Finish Docs
* Left Top Right Positioning
* More styles
  * Bootstrap styles

*Note: All of these have been implemented in the rewrite.*

Contributing
---
Issues and Pull-requests welcome, though please add tests. To build and test: `cd *dir*` then `npm install -g grunt` then `grunt`.

Change Log
---

v0.0.1

* Added to jQuery plugin repo

* Released !

  [Development Version]: http://jpillora.github.com/jquery.prompt/dist/jquery.prompt.js
  [Production Version]: http://jpillora.github.com/jquery.prompt/dist/jquery.prompt.min.js



<!-- Tracker -->
[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/2ec87aabeaf1ff78eef8883aae18577c "githalytics.com")](http://githalytics.com/github.com/jpillora)

