
"use strict"

#plugin constants
pluginName = "prompt"
className = "jqPrompt"

arrowDirs =
  top: "bottom"
  bottom: "top"
  left: "right"
  right: "left"

#overridable options
pluginOptions =
  autoHidePrompt: false
  autoHideDelay: 10000
  arrowShow: true
  arrowSize: 5
  arrowPosition: "top"
  # Default color
  color: "red"
  # Color mappings
  colors:
    red: "#ee0101"
    green: "#33be40"
    black: "#393939"
    blue: "#00f"
  showAnimation: "fadeIn"
  showDuration: 200
  hideAnimation: "fadeOut"
  hideDuration: 600
  # Gap between prompt and element
  gap: 0
  #TODO add z-index watches
  #parents:  { '.ui-dialog': 5001 }

#plugin variables
pluginOptions = {
  foo: 42
}

# plugin helpers
create = (tag) ->
  $ document.createElement(tag)

# inherit plugin options
Options = (options) ->
  $.extend @, options if $.isPlainObject(options)
Options:: = pluginOptions

#define plugin
class Prompt
  
  #setup instance variables
  constructor: (elem, text, options) ->
    @options = new Options if $.isPlainObject(options) then options else {}
    @elementType = elem.attr("type")
    @originalElement = elem
    @originalElement.data pluginName, @
    @elem = @getPromptElement()
    
    @buildWrapper()
    @buildContent()
    @buildArrow()
    @buildPrompt()

    # connect elements
    @wrapper.append @prompt
    @prompt.append @content

    # add into dom
    @elem.before @wrapper
    @prompt.css @calculateCSS()

    @run(text)

  buildArrow = ->
    dir = @options.arrowPosition
    size = @options.arrowSize
    alt = arrowDirs[dir]
    @arrow = create("div")
    @arrow.addClass(className + "Arrow").css(
      width: 0
      height: 0
    ).css("border-" + alt, size + "px solid " + @options.color).css "z-index", "2 !important"
    for d of arrowDirs
      @arrow.css "border-" + d, size + "px solid transparent"  if d isnt dir and d isnt alt
    @arrow

  #construct dom to represent prompt
  buildPrompt = ->
    @prompt = create("div").addClass(className).hide()

  buildWrapper = ->
    @wrapper = create("div").addClass("#{className}Wrapper")

  buildContent = ->
    @content = create("div").addClass("#{className}Content")

  showPrompt = (show) ->
    hidden = @prompt.data("parentElement").parents(":hidden").length > 0
    @prompt.show()  if hidden and show
    @prompt.hide()  if hidden and not show
    @prompt[@options.showAnimation] @options.showDuration  if not hidden and show
    @prompt[@options.hideAnimation] @options.hideDuration  if not hidden and not show


  #gets first on n radios, and gets the fancy stylised input for hidden inputs
  getPromptElement = () ->
    element = @originalElement
    #choose the first of n radios
    if element.is("[type=radio]")
      radios = element.parents("form:first").find("[type=radio]").filter (i, e) ->
        $(e).attr("name") is element.attr("name")
      element = radios.first()
    #custom-styled inputs - find thier real element
    fBefore = element.prev()
    element = fBefore  if fBefore.is("span.styled,span.OBS_checkbox")
    element

  calculateCSS = (element, prompt) ->
    elementPosition = element.position()
    promptPosition = prompt.parent().position()
    height = element.outerHeight()
    left = elementPosition.left - promptPosition.left
    height += (elementPosition.top - promptPosition.top)  unless $.browser.msie
    return {
      top: height - 2
      left: left
    }

  #run plugin
  run: (text, options) ->
    #update options
    if $.isPlainObject(options)
      $.extend @options, options 
    #shortcut special case
    else if $.type(options) is "string"
      @options.color = options

    if @prompt and not text
      showPrompt false #hide
      return
    else if not @prompt and not text
      return

    #update text
    @content.html text.replace("\n", "<br/>")

    #prompt.toggleClass("...", @options.showArrow and @elementType isnt "radio");
    @showPrompt prompt, true

    #autohide
    if @options.autoHidePrompt
      clearTimeout @elem.data "promptTimer"
      t = setTimeout ->
        @showPrompt false
      , @options.autoHideDelay
      @elem.data "promptTimer", t


#when ready, bind permanent hide listener
$ -> $(document).on "click", ".#{className}", -> showPrompt $(@), false

# publicise jquery plugin
return alert "$.#{pluginName} already defined" if $[pluginName]?
# $.pluginName( { ...  } ) changes options for all instances
$[pluginName] = (options) -> $.extend pluginOptions, options
# $( ... ).pluginName( { .. } ) creates a cached instance on each
# selected item with custom options for just that instance
return alert "$.fn#{pluginName} already defined" if $.fn[pluginName]?
$.fn[pluginName] = (text, options) ->
  $(@).each ->
    inst = $(@).data pluginName
    if inst?
      inst.run text, options
    else
      new Prompt $(@), text, options

#ps. alex is gay.

