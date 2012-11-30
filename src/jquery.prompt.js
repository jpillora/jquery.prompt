$(function() {

  var options = {
    // Auto-hide prompt
    autoHidePrompt: false,
    // Delay before auto-hide
    autoHideDelay: 10000,
    // set to true, when the prompt arrow needs to be displayed
    showArrow: true,
    // Fade out duration while hiding the validations
    fadeDuration: 600,
    // Gap between prompt and element
    gap: 0,
    // Opacities
    hiddenOpacity: 0,
    shownOpacity: 0.87
    //TODO add z-index watches
    //parents:  { '.ui-dialog': 5001 }
  };

  //change options
  function setDefaults(userOptions) {
    $.extend(options, userOptions);
  }

  //permanent hide listener
  $(document).on("click", ".formError", function() {
    showElem($(this),false);
  });

  //build arrow
  var arrowHtml = (function() {
    var i, a = [];
    a.push('<div class="formErrorArrow">');
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

  /**
  * Builds or updates a prompt with the given information
  */
  function build(element, text, opts) {

    var fieldType = element.attr("type"),
        field = getPromptField(element),
        prompt = field.data("promptElement"),
        showArrow = options.showArrow && fieldType !== 'radio',
        content = null,
        arrow = null,
        type = null;

    //apply options
    if($.isPlainObject(opts)) {
      type = opts.type;

      if(opts.arrow) showArrow = opts.arrow;

    } else {
      type = opts;
      opts = null;
    }

    if(prompt &&!text)
      return showElem(prompt, false); //hide
    else if(!prompt &&!text)
      return; //nothing to hide

    //no prompt - build
    if(!prompt)
      prompt = buildPrompt(field);

    content = prompt.find('.formErrorContent:first');
    arrow = prompt.find('.formErrorArrow:first');

    arrow.toggleClass('invisible', !showArrow);

    //update text
    content.html(text.replace("\n","<br/>"));

    //update type
    prompt.removeClass("greenPopup").removeClass("blackPopup").removeClass("redPopup");
    if      (type === "pass") prompt.addClass("greenPopup");
    else if (type === "load") prompt.addClass("blackPopup");
    else                     prompt.addClass("redPopup");

    clearTimeout(field.data('promptTimer'));
    if (options.autoHidePrompt) {
      var t = setTimeout(function(){
        showElem(prompt,false);
      }, options.autoHideDelay);
      field.data('promptTimer', t);
    }

    showElem(prompt,true);

    return field;
  }

  function create(tag) {
    return $(document.createElement(tag));
  }

  function buildPrompt(field) {

      var promptWrapper = create('div').addClass("formErrorWrapper"),
          prompt = create('div').addClass("formError"),
          content = create('div').addClass("formErrorContent");

      promptWrapper.append(prompt);

      if(field.parent().css('position') === 'relative') {
        promptWrapper.css({position:'absolute'});
      }

      prompt.append($(arrowHtml));

      prompt.append(content);

      //add into dom
      field.before(promptWrapper);
      //cache in field
      field.data("promptElement", prompt);

      var css = calculateCSS(field, prompt);
      css.opacity = options.hiddenOpacity;
      prompt.css(css);

      return prompt;
  }

  //basic hide show
  function showElem(elem, show) {
    if(show) elem.show();
    elem.stop().fadeTo(options.fadeDuration,
      show ? options.shownOpacity : options.hiddenOpacity,
      function() {
        if(!show) elem.hide();
      }
    );
  }

  /**
  *
  */
  function getPromptField(f) {
    //choose the first of n radios
    if(f.is('[type=radio]')) {
      var radios = f.parents("form:first").find('[type=radio]').filter(function(i,e) {
        return $(e).attr('name') === f.attr('name');
      });
      f = radios.first();
    }

    //custom-styled inputs - find thier real element
    var fBefore = f.prev();
    if(fBefore.is('span.styled,span.OBS_checkbox'))
      f = fBefore;

    return f;
  }

  /**
  * Calculates prompt position
  *
  * @param {jqObject}
  *            field
  * @param {jqObject}
  *            the prompt
  * @param {Map}
  *            options
  * @return positions
  */
  function calculateCSS(field, prompt) {

    var fieldPosition = field.position(),
        promptPosition = prompt.parent().position(),
        height = field.outerHeight(),
        left = fieldPosition.left - promptPosition.left;

    if(!$.browser.msie)
      height += (fieldPosition.top - promptPosition.top);

    return {
      top: height-2,
      left: left
    };

  }

  //public interface
  $.prompt = buildPrompt;
  $.prompt.setDefaults = setDefaults;

  $.fn.prompt = function(text, opts) {
    buildPrompt($(this), text, opts);
  };

});
