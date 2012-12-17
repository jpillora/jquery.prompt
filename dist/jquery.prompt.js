/*! jQuery Prompt - v1.0.0 - 2012-12-17
* https://github.com/jpillora/jquery.prompt
* Copyright (c) 2012 Jaime Pillora; Licensed MIT */

(function() {

$(function() { $("head").append($("<style/>").html(".jqPromptWrapper{z-index:1 !important;overflow:visible;height:0;width:0;position:absolute;display:inline-block;vertical-align:top}\n" + 
".jqPrompt{z-index:1 !important;position:absolute;display:block;cursor:pointer;}\n" + 
".jqPrompt .jqPromptContent{background:#fff;position:relative;font-size:11px;box-shadow:0 0 6px #000;-moz-box-shadow:0 0 6px #000;-webkit-box-shadow:0 0 6px #000;padding:4px 10px 4px 8px;border-radius:6px;-moz-border-radius:6px;-webkit-border-radius:6px;white-space:nowrap}\n" + 
".jqPrompt .jqPromptArrow{opacity:.87;width:15px;margin:-2px 0 0 13px;position:relative;}\n" + 
".jqPrompt .jqPromptArrow.invisible div,.jqPrompt .jqPromptArrow div.invisible{background:none}\n" + 
".jqPrompt .jqPromptArrow div{border:none;font-size:0;height:1px;margin:0 auto;line-height:0;font-size:0;display:block;}\n" + 
".jqPrompt .jqPromptArrow div.shadow{box-shadow:0 2px 6px #444;-moz-box-shadow:0 2px 6px #444;-webkit-box-shadow:0 2px 6px #444}\n" + 
"body[dir='rtl'] .jqPrompt .jqPromptArrow,body.rtl .jqPrompt .jqPromptArrow{margin:-2px 13px 0 0}\n" + 
"\n")); });

(function() {

  //plugin variables
  var className = "jqPrompt",
    arrowDirs = {
      top: "bottom",
      bottom: "top",
      left: "right",
      right: "left"
    },
    //overridable options
    pluginOptions = {
      // Auto-hide prompt
      autoHidePrompt: false,
      // Delay before auto-hide
      autoHideDelay: 10000,
      // Should display little arrow
      arrowShow: true,
      arrowSize: 5,
      arrowPosition: 'top',
      // Default color
      color: 'red',
      // Color mappings
      colors: {
        red: '#ee0101',
        green: '#33be40',
        black: '#393939',
        blue: '#00f'
      },
      // Animation methods
      showAnimation: 'fadeIn',
      hideAnimation: 'fadeOut',
      // Fade out duration while hiding the validations
      showDuration: 200,
      hideDuration: 600,
      // Gap between prompt and element
      gap: 0
      //TODO add z-index watches
      //parents:  { '.ui-dialog': 5001 }
    };



  // plugin helpers
  function CustomOptions(options){
    if($.isPlainObject(options))
      $.extend(this, options);
  }
  CustomOptions.prototype = pluginOptions;


  function Prompt(initialElement, text, userOptions) {

    var elementType = initialElement.attr("type"),
        element = getPromptElement(initialElement),
        prompt = element.data("promptElement"),
        options = (prompt && prompt.data("promptOptions")) || new CustomOptions(userOptions),
        showArrow = options.showArrow && elementType !== 'radio',
        content = null,
        type = null;

    //shortcut special case
    if($.type(userOptions) === 'string') {
      type = userOptions;
    } else if (options.type) {
      type = options.type;
    }

    if(prompt && !text) {
      showPrompt(prompt, false); //hide
      return;
    } else if(!prompt &&!text)
      return;

    //no prompt - build
    if(!prompt)
      prompt = buildPrompt(element, options);
    
    content = prompt.find('.' + className + 'Content:first');

    //prompt.toggleClass("...", showArrow);

    //update text
    content.html(text.replace("\n","<br/>"));

    //update type
    prompt.removeClass("greenPopup").removeClass("blackPopup").removeClass("redPopup");
    if      (type === "pass") prompt.addClass("greenPopup");
    else if (type === "load") prompt.addClass("blackPopup");
    else                     prompt.addClass("redPopup");

    clearTimeout(element.data('promptTimer'));
    if (options.autoHidePrompt) {
      var t = setTimeout(function(){
        showPrompt(prompt,false);
      }, options.autoHideDelay);
      element.data('promptTimer', t);
    }

    showPrompt(prompt,true);
  }

  function create(tag) {
    return $(document.createElement(tag));
  }


  function buildArrow(options) {

    var dir = options.arrowPosition,
        size = options.arrowSize,
        alt = arrowDirs[dir],
        arrow = create("div");

    arrow.addClass(className+"Arrow").
      css({ width: 0, height: 0 }).
      css('border-'+alt, size + 'px solid ' + options.color).
      css('z-index', '2 !important');

    for(var d in arrowDirs)
      if(d !== dir && d !== alt)
        arrow.css('border-'+d, size + 'px solid transparent');

    return arrow;
  }


  function execPromptEach(initialElements, text, userOptions) {
    initialElements.each(function() {
      execPrompt($(this), text, userOptions);
    });
  }

  /**
  * Builds or updates a prompt with the given information
  */
  function execPrompt(initialElement, text, userOptions) {


  }

  //construct dom to represent prompt, done once
  function buildPrompt(element, options) {

    var promptWrapper = create('div').addClass(className + "Wrapper"),
        prompt = create('div').addClass(className).hide(),
        content = create('div').addClass(className + "Content");

    //cache in element
    element.data("promptElement", prompt);
    prompt.data("promptOptions", options);
    prompt.data("parentElement", element);

    promptWrapper.append(prompt);

    prompt.append(buildArrow(options));
    prompt.append(content);

    //add into dom
    element.before(promptWrapper);
    prompt.css(calculateCSS(element, prompt));

    return prompt;
  }


  function showPrompt(prompt, show) {
    var hidden = prompt.data("parentElement").parents(":hidden").length > 0,
        options = prompt.data("promptOptions");

    if (hidden && show) {
      prompt.show();
    }
    if (hidden && !show) {
      prompt.hide();
    }
    if (!hidden && show) {
      prompt[options.showAnimation](options.showDuration);
    }
    if (!hidden && !show) {
      return prompt[options.hideAnimation](options.hideDuration);
    }
  }

  //gets first on n radios, and gets the fancy stylised input for hidden inputs
  function getPromptElement(element) {
    //choose the first of n radios
    if(element.is('[type=radio]')) {
      var radios = element.parents("form:first").find('[type=radio]').filter(function(i,e) {
        return $(e).attr('name') === element.attr('name');
      });
      element = radios.first();
    }

    //custom-styled inputs - find thier real element
    var fBefore = element.prev();
    if(fBefore.is('span.styled,span.OBS_checkbox'))
      element = fBefore;

    return element;
  }

  /**
  * Calculates prompt position
  */
  function calculateCSS(element, prompt) {

    var elementPosition = element.position(),
        promptPosition = prompt.parent().position(),
        height = element.outerHeight(),
        left = elementPosition.left - promptPosition.left;

    if(!$.browser.msie)
      height += (elementPosition.top - promptPosition.top);

    return {
      top: height-2,
      left: left
    };

  }


  //when ready, bind permanent hide listener
  $(function() {
    $(document).on("click", "." + className, function() {
      showPrompt($(this),false);
    });
  });

  //public interface
  $.prompt = execPromptEach;
  $.prompt.options = function(userOptions) {
    $.extend(pluginOptions, userOptions);
  };

  $.fn.prompt = function(text, opts) {
    execPromptEach($(this), text, opts);
    return $(this);
  };


}());

}());
