
'use strict'

#plugin constants
pluginName = 'prompt'
className = 'jqPrompt'

arrowDirs =
  top: 'bottom'
  bottom: 'top'
  left: 'right'
  right: 'left'

#overridable options
pluginOptions =
  autoHidePrompt: false
  autoHideDelay: 10000
  arrowShow: true
  arrowSize: 5
  arrowPosition: 'top'
  # Default color
  color: 'red'
  # Color mappings
  colors:
    red: '#ee0101'
    green: '#33be40'
    black: '#393939'
    blue: '#00f'
  showAnimation: 'fadeIn'
  showDuration: 200
  hideAnimation: 'fadeOut'
  hideDuration: 600
  # Gap between prompt and element
  gap: 2
  #TODO add z-index watches
  #parents:  { '.ui-dialog': 5001 }

# plugin helpers
create = (tag) ->
  $ document.createElement(tag)

# inherit plugin options
Options = (options) ->
  $.extend @, options if $.isPlainObject(options)
Options:: = pluginOptions

  #gets first on n radios, and gets the fancy stylised input for hidden inputs
getAnchorElement = (element) ->
  #choose the first of n radios
  if element.is('[type=radio]')
    radios = element.parents('form:first').find('[type=radio]').filter (i, e) ->
      $(e).attr('name') is element.attr('name')
    element = radios.first()
  #custom-styled inputs - find thier real element
  fBefore = element.prev()
  element = fBefore  if fBefore.is('span.styled,span.OBS_checkbox')
  element

#define plugin
class Prompt
  
  #setup instance variables
  constructor: (elem, node, options) ->
    options = {color: options} if $.type(options) is 'string'
    @options = new Options if $.isPlainObject(options) then options else {}
    @elementType = elem.attr('type')
    @originalElement = elem
    @elem = getAnchorElement(elem)
    @elem.data pluginName, @
    
    @buildWrapper()

    @buildPrompt()
    @wrapper.append @prompt

    @buildContent()
    @prompt.append @content

    #extra reference
    @prompt.data pluginName, @

    # add into dom
    @elem.before @wrapper
    @prompt.css @calculateCSS()

    @run(node)

  buildArrow: ->
    dir = @options.arrowPosition
    size = @options.arrowSize
    alt = arrowDirs[dir]
    @arrow = create("div")
    @arrow.addClass(className + 'Arrow').css(
      'margin-top': 2 + (if document.documentMode is 5 then (size*-4) else 0)
      'position': 'relative'
      'z-index': '2'
      'margin-left': 10
      'width': 0
      'height': 0
    ).css(
      'border-' + alt, size + 'px solid ' + @getColor()
    )
    for d of arrowDirs
      @arrow.css 'border-' + d, size + 'px solid transparent'  if d isnt dir and d isnt alt

    showArrow = @options.arrowShow and @elementType isnt 'radio'
    if showArrow then @arrow.show() else @arrow.hide()

  #construct dom to represent prompt
  buildPrompt: ->
    @prompt = create('div').addClass(className).hide().css
      'z-index': '1'
      'position': 'absolute'
      'cursor': 'pointer'

  buildWrapper: ->
    @wrapper = create('div').addClass("#{className}Wrapper").css
      'z-index': '1'
      #overflow: 'visible'
      'position': 'absolute'
      'display': 'inline-block'
      'height': 0
      'width': 0

  buildContent: ->
    @content = create('div').addClass("#{className}Content").css
      'background': '#fff'
      'position': 'relative'
      'font-size': '11px'
      'box-shadow': '0 0 6px #000'
      '-moz-box-shadow': '0 0 6px #000'
      '-webkit-box-shadow': '0 0 6px #000'
      'padding': '4px 10px 4px 8px'
      'border-radius': '6px'
      'border-style': 'solid'
      'border-width': '2px'
      '-moz-border-radius': '6px'
      '-webkit-border-radius': '6px'
      'white-space': 'nowrap'

  showPrompt: (show) ->
    hidden = @prompt.parent().parents(':hidden').length > 0
    @prompt.show()  if hidden and show
    @prompt.hide()  if hidden and not show
    @prompt[@options.showAnimation] @options.showDuration  if not hidden and show
    @prompt[@options.hideAnimation] @options.hideDuration  if not hidden and not show

  calculateCSS: () ->
    elementPosition = @elem.position()
    promptPosition = @prompt.parent().position()
    height = @elem.outerHeight()
    left = elementPosition.left - promptPosition.left
    height += (elementPosition.top - promptPosition.top)  unless $.browser.msie
    return {
      top: height + @options.gap
      left: left
    }

  getColor: ->
    c = @options.colors[@options.color] or @options.color
    console.log c
    c

  #run plugin
  run: (node, options) ->
    #update options
    if $.isPlainObject(options)
      $.extend @options, options 
    #shortcut special case
    else if $.type(options) is 'string'
      @options.color = options

    if @prompt and not node
      @showPrompt false #hide
      return
    else if not @prompt and not node
      return

    #update content
    if $.type(node) is 'string'
      @content.html node.replace('\n', '<br/>')
    else
      @content.empty().append(node)

    @content.css
      'color': @getColor()
      'border-color': @getColor()

    @arrow.remove() if @arrow
    @buildArrow()
    @content.before @arrow

    @showPrompt true

    #autohide
    if @options.autoHidePrompt
      clearTimeout @elem.data 'promptTimer'
      t = setTimeout ->
        @showPrompt false
      , @options.autoHideDelay
      @elem.data 'promptTimer', t

#when ready, bind permanent hide listener
$ -> 
  $(document).on 'click', ".#{className}", ->
    inst = getAnchorElement($(@)).data pluginName
    inst.showPrompt false if inst?

# publicise jquery plugin
return alert "$.#{pluginName} already defined" if $[pluginName]?
# $.pluginName( { ...  } ) changes options for all instances
$[pluginName] = (elem, node, options) ->
  $(elem)[pluginName](node, options)

# publicise options method
$[pluginName].options = (options) -> $.extend pluginOptions, options

# $( ... ).pluginName( { .. } ) creates a cached instance on each
# selected item with custom options for just that instance
return alert "$.fn#{pluginName} already defined" if $.fn[pluginName]?
$.fn[pluginName] = (node, options) ->
  $(@).each ->
    inst = getAnchorElement($(@)).data pluginName
    if inst?
      inst.run node, options
    else
      new Prompt $(@), node, options

#ps. alex is gay.

