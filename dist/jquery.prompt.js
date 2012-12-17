/*! jQuery Prompt - v1.0.0 - 2012-12-17
* https://github.com/jpillora/jquery.prompt
* Copyright (c) 2012 Jaime Pillora; Licensed MIT */

(function() {

$(function() { $("head").append($("<style/>").html(".jqPromptWrapper{z-index:1 !important;overflow:visible;height:0;width:0;position:absolute;display:inline-block;vertical-align:top}\n" + 
".jqPrompt{z-index:1 !important;position:absolute;display:block;cursor:pointer;}\n" + 
".jqPrompt .jqPromptArrow{z-index:2 !important}\n" + 
".jqPrompt.redPopup .jqPromptContent{color:#ee0101;border:2px solid #ee0101}\n" + 
".jqPrompt.redPopup .jqPromptArrow div{background:#ee0101}\n" + 
".jqPrompt.greenPopup .jqPromptContent{color:#33be40;border:2px solid #33be40}\n" + 
".jqPrompt.greenPopup .jqPromptArrow div{background:#33be40}\n" + 
".jqPrompt.blackPopup .jqPromptContent{color:#393939;border:2px solid #393939}\n" + 
".jqPrompt.blackPopup .jqPromptArrow div{background:#393939}\n" + 
".jqPrompt .jqPromptContent{background:#fff;position:relative;font-size:11px;box-shadow:0 0 6px #000;-moz-box-shadow:0 0 6px #000;-webkit-box-shadow:0 0 6px #000;padding:4px 10px 4px 8px;border-radius:6px;-moz-border-radius:6px;-webkit-border-radius:6px;white-space:nowrap}\n" + 
".jqPrompt .jqPromptArrow{opacity:.87;width:15px;margin:-2px 0 0 13px;position:relative;}\n" + 
".jqPrompt .jqPromptArrow.invisible div,.jqPrompt .jqPromptArrow div.invisible{background:none}\n" + 
".jqPrompt .jqPromptArrow div{border:none;font-size:0;height:1px;margin:0 auto;line-height:0;font-size:0;display:block;}\n" + 
".jqPrompt .jqPromptArrow div.shadow{box-shadow:0 2px 6px #444;-moz-box-shadow:0 2px 6px #444;-webkit-box-shadow:0 2px 6px #444}\n" + 
"body[dir='rtl'] .jqPrompt .jqPromptArrow,body.rtl .jqPrompt .jqPromptArrow{margin:-2px 13px 0 0}\n" + 
"\n")); });

(function() {

  var className = "jqPrompt";

  //plugin variables
  var arrowHtml = (function() {
    var i, a = [];
    a.push('<div class="' + className + 'Arrow">');
    //3 blank divs for IE bug
    for(i = 0; i<3; ++i)
      a.push('<div class="invisible"></div>');
    for(i = 0; i<6; ++i) {
      a.push('<div class="line');
      if(i < 4) a.push(' shadow');
      a.push('" style="width:');
      a.push((2*i)+1);
      a.push('px;"><!-- --></div>');
    }
    a.push('</div>');
    return a.join('');
  }());

  var pluginOptions = {
    // Auto-hide prompt
    autoHidePrompt: false,
    // Delay before auto-hide
    autoHideDelay: 10000,
    // Should display little arrow
    showArrow: true,
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


  function create(tag) {
    return $(document.createElement(tag));
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

    var elementType = initialElement.attr("type"),
        element = getPromptElement(initialElement),
        prompt = element.data("promptElement"),
        options = (prompt && prompt.data("promptOptions")) || new CustomOptions(userOptions),
        showArrow = options.showArrow && elementType !== 'radio',
        content = null,
        arrow = null,
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
    arrow = prompt.find('.' + className + 'Arrow:first');

    arrow.toggleClass('invisible', !showArrow);

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

    if(element.parent().css('position') === 'relative')
      promptWrapper.css({position:'absolute'});

    prompt.append(arrowHtml);
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
