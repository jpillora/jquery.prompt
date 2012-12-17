
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
