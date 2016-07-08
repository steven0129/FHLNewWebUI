
/// fhlev 即 FHL event 的縮寫.
/// 程式碼參照 : ISBN 978-986-434-076-7
/// addEvent、removeEvent 是首先要熟悉的. (並 google 事件 氣泡程序 概念)
/// triggerEvent 可以產生標準 'click' 或 自訂的 'aaa' 事件名稱,
/// sumbit, change (本來不具有 氣泡程序, 但此 lib 使它們可以)
/// addEvent(docuemnt, 'ready', fn ) ; 已經使 IE9 之前也可以用了 
/// hover, focusin, focusout 我自己還沒弄清楚 ..
var fhlev = (function () {
  function fhlev() { };
  var fn = fhlev.prototype;

  var fn1 = (function () {

    // getData removeData 要共用的變數
    var cache = {},
        guidCounter = 1,
        expando = "data" + (new Date).getTime();

    return {
      getData: function (elem) {
        /// <summary> getData </summary>
        var guid = elem[expando];
        if (!guid) {
          guid = elem[expando] = guidCounter++;
          cache[guid] = {};
        }
        return cache[guid];
      },
      removeData: function (elem) {
        /// <summary> removeData </summary>
        var guid = elem[expando];
        if (!guid) return;
        delete cache[guid];
        try {
          delete elem[expando];
        }
        catch (e) {
          if (elem.removeAttribute) {
            elem.removeAttribute(expando);
          }
        }
      }
    };
  })();
  var fn2 = (function () {

    var isSubmitEventSupported = isEventSupported("submit");

    function isInForm(elem) {                                      //#1 Function that checks if the passed element is in a form.
      var parent = elem.parentNode;
      while (parent) {
        if (parent.nodeName.toLowerCase() === "form") {
          return true;
        }
        parent = parent.parentNode;
      }
      return false;
    }

    function triggerSubmitOnClick(e) {                              //#2 Handler that will trigger a submit event for clicks on controls with submit semantics.
      var type = e.target.type;
      if ((type === "submit" || type === "image") &&
          isInForm(e.target)) {
        return triggerEvent(this, "submit");
      }
    }

    function triggerSubmitOnKey(e) {                                //#3 Handler that will trigger a submit event for key presses on controls with submit semantics.
      var type = e.target.type;
      if ((type === "text" || type === "password") &&
          isInForm(e.target) && e.keyCode === 13) {
        return triggerEvent(this, "submit");
      }
    }

    return {
      addSubmit: function (elem, fn) {                        //#4 Defines the special binding function

        addEvent(elem, "submit", fn);                               //#5 Normal binding
        if (isSubmitEventSupported) return;                     //#5 Short-circuit if browser support is adequate

        // But we need to add extra handlers if we're not on a form
        // Only add the handlers for the first handler bound
        if (elem.nodeName.toLowerCase() !== "form" &&               //#6 Checks isf we need piggybacking
            getData(elem).handlers.submit.length === 1) {
          addEvent(elem, "click", triggerSubmitOnClick);
          addEvent(elem, "keypress", triggerSubmitOnKey);
        }

      },
      removeSubmit: function (elem, fn) {                    //#7 Defines the special unbinding function

        removeEvent(elem, "submit", fn);                           //#8 Unbinds as usual
        if (isEventSupported("submit")) return;                    //#8 Shirt-circuit if browser is adquate

        var data = getData(elem);

        if (elem.nodeName.toLowerCase() !== "form" &&             //#9 Remove piggybacking if all submit handlers gone
            !data || !data.events || !data.events.submit) {
          removeEvent(elem, "click", triggerSubmitOnClick);
          removeEvent(elem, "keypress", triggerSubmitOnKey);
        }
      }
    };
  })();
  var fn3 = (function () {

    return {
      addChange: function (elem, fn) {                          //#A

        addEvent(elem, "change", fn);                                 //#B
        if (isEventSupported("change")) return;                       //#B

        if (getData(elem).events.change.length === 1) {               //#C Piggyback on first binding
          addEvent(elem, "focusout", triggerChangeIfValueChanged);
          addEvent(elem, "click", triggerChangeOnClick);
          addEvent(elem, "keydown", triggerChangeOnKeyDown);
          addEvent(elem, "beforceactivate", triggerChangeOnBefore);
        }
      },
      removeChange: function (elem, fn) {                       //#D

        removeEvent(elem, "change", fn);                              //#E
        if (isEventSupported("change")) return;                       //#E

        var data = getData(elem);
        if (!data || !data.events || !data.events.submit) {           //#F Remove piggybacks on last unbind
          addEvent(elem, "focusout", triggerChangeIfValueChanged);
          addEvent(elem, "click", triggerChangeOnClick);
          addEvent(elem, "keydown", triggerChangeOnKeyDown);
          addEvent(elem, "beforceactivate", triggerChangeOnBefore);
        }
      }
    };

    function triggerChangeOnClick(e) {                               //#G
      var type = e.target.type;
      if (type === "radio" || type === "checkbox" ||
          e.target.nodeName.toLowerCase() === "select") {
        return triggerChangeIfValueChanged.call(this, e);
      }
    }

    function triggerChangeOnKeyDown(e) {                             //#H
      var type = e.target.type,
          key = e.keyCode;
      if (key === 13 && e.target.nodeName.toLowerCase() !== "textarea" ||
          key === 32 && (type === "checkbox" || type === "radio") ||
          type === "select-multiple") {
        return triggerChangeIfValueChanged.call(this, e);
      }
    }

    function triggerChangeOnBefore(e) {                               //#I Stores target value for later checking
      getData(e.target)._change_data = getVal(e.target);
    }

    function getVal(elem) {                                           //#J Utility to get element value
      var type = elem.type,
          val = elem.value;
      if (type === "radio" || type === "checkbox") {
        val = elem.checked;
      } else if (type === "select-multiple") {
        val = "";
        if (elem.selectedIndex > -1) {
          for (var i = 0; i < elem.options.length; i++) {
            val += "-" + elem.options[i].selected;
          }
        }
      } else if (elem.nodeName.toLowerCase() === "select") {
        val = elem.selectedIndex;
      }
      return val;
    }

    function triggerChangeIfValueChanged(e) {                            //#K Checks to see if a change in the value has occurred
      var elem = e.target, data, val;
      var formElems = /textarea|input|select/i;
      if (!formElems.test(elem.nodeName) || elem.readOnly) {
        return;
      }
      data = getData(elem)._change_data;
      val = getVal(elem);
      if (e.type !== "focusout" || elem.type !== "radio") {
        getData(elem)._change_data = val;
      }
      if (data === undefined || val === data) {
        return;
      }
      if (data != null || val) {
        return triggerEvent(elem, "change");
      }
    }

  })();

  // private function 
  var getData = fn1.getData;
  var removeData = fn1.removeData;
  function fixEvent(event) {

    function returnTrue() { return true; }
    function returnFalse() { return false; }

    if (!event || !event.stopPropagation) {
      var old = event || window.event;

      // Clone the old object so that we can modify the values
      event = {};

      for (var prop in old) {
        event[prop] = old[prop];
      }

      // The event occurred on this element
      if (!event.target) {
        event.target = event.srcElement || document;
      }

      // Handle which other element the event is related to
      event.relatedTarget = event.fromElement === event.target ?
          event.toElement :
          event.fromElement;

      // Stop the default browser action
      event.preventDefault = function () {
        event.returnValue = false;
        event.isDefaultPrevented = returnTrue;
      };

      event.isDefaultPrevented = returnFalse;

      // Stop the event from bubbling
      event.stopPropagation = function () {
        event.cancelBubble = true;
        event.isPropagationStopped = returnTrue;
      };

      event.isPropagationStopped = returnFalse;

      // Stop the event from bubbling and executing other handlers
      event.stopImmediatePropagation = function () {
        this.isImmediatePropagationStopped = returnTrue;
        this.stopPropagation();
      };

      event.isImmediatePropagationStopped = returnFalse;

      // Handle mouse position
      if (event.clientX != null) {
        var doc = document.documentElement, body = document.body;

        event.pageX = event.clientX +
            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
            (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
            (doc && doc.scrollTop || body && body.scrollTop || 0) -
            (doc && doc.clientTop || body && body.clientTop || 0);
      }

      // Handle key presses
      event.which = event.charCode || event.keyCode;

      // Fix button for mouse clicks:
      // 0 == left; 1 == middle; 2 == right
      if (event.button != null) {
        event.button = (event.button & 1 ? 0 :
            (event.button & 4 ? 1 :
                (event.button & 2 ? 2 : 0)));
      }
    }

    return event;

  }
  function isEventSupported(eventName) {

    var element = document.createElement('div'),          //#1
        isSupported;

    eventName = 'on' + eventName;                         //#2
    isSupported = (eventName in element);                 //#2

    if (!isSupported) {                                   //#3
      element.setAttribute(eventName, 'return;');
      isSupported = typeof element[eventName] == 'function';
    }

    element = null;                                        //#4

    return isSupported;
  }
  function tidyUp(elem, type) {

    function isEmpty(object) {                         //#1
      for (var prop in object) {
        return false;
      }
      return true;
    }

    var data = getData(elem);

    if (data.handlers[type].length === 0) {             //#2

      delete data.handlers[type];

      if (document.removeEventListener) {
        elem.removeEventListener(type, data.dispatcher, false);
      }
      else if (document.detachEvent) {
        elem.detachEvent("on" + type, data.dispatcher);
      }
    }

    if (isEmpty(data.handlers)) {                        //#3
      delete data.handlers;
      delete data.dispatcher;
    }

    if (isEmpty(data)) {                                 //#4
      removeData(elem);
    }
  }


  // public function
  fn.addEvent = (function () {

    var nextGuid = 1;

    return function (elem, type, fn) {
      /// <summary> 使現有的與IE9之前都相容, 並且有使用快取機制. 當然也能支援氣泡 </summary>
      /// <param type="String" name="input">input string</param>
      /// <param type="RegExp/String" name="pattern">RegExp or Pattern string</param>
      /// <param type="Optional:String" name="flags" optional="true">If pattern is String then can use regexp flags "i" or "m" or "im"</param>
      var data = getData(elem);                           //#1

      if (!data.handlers) data.handlers = {};             //#2

      if (!data.handlers[type])                           //#3
        data.handlers[type] = [];                           //#3

      if (!fn.guid) fn.guid = nextGuid++;                 //#4

      data.handlers[type].push(fn);                       //#5

      if (!data.dispatcher) {                            // #6
        data.disabled = false;
        data.dispatcher = function (event) {

          if (data.disabled) return;
          event = fixEvent(event);

          var handlers = data.handlers[event.type];       //#7
          if (handlers) {
            for (var n = 0; n < handlers.length; n++) {   //#7
              handlers[n].call(elem, event);              //#7
            }
          }
        };
      }

      if (data.handlers[type].length == 1) {              //#8
        if (document.addEventListener) {
          elem.addEventListener(type, data.dispatcher, false);
        }
        else if (document.attachEvent) {
          elem.attachEvent("on" + type, data.dispatcher);
        }
      }

    };

  })();
  fn.removeEvent = function (elem, type, fn) {

    var data = getData(elem);                          //#2

    if (!data.handlers) return;                        //#3

    var removeType = function (t) {                      //#4
      data.handlers[t] = [];
      tidyUp(elem, t);
    };

    if (!type) {                                       //#5
      for (var t in data.handlers) removeType(t);
      return;
    }

    var handlers = data.handlers[type];              //#6
    if (!handlers) return;

    if (!fn) {                                          //#7
      removeType(type);
      return;
    }

    if (fn.guid) {                              //#8
      for (var n = 0; n < handlers.length; n++) {
        if (handlers[n].guid === fn.guid) {
          handlers.splice(n--, 1);
        }
      }
    }
    tidyUp(elem, type);
  };
  fn.triggerEvent = function (elem, event) {

    var elemData = getData(elem),                         //#1 Fetch element data and parent reference.
        parent = elem.parentNode || elem.ownerDocument;

    if (typeof event === "string") {                      //#2 If passed as a string, create an event out out of it
      event = { type: event, target: elem };
    }
    event = fixEvent(event);                              //#3 Normalize the event

    if (elemData.dispatcher) {                             //#4 If the passed element has a dispatcher, execute the established handlers
      elemData.dispatcher.call(elem, event);
    }

    if (parent && !event.isPropagationStopped()) {        //#5 Unless explicitly stopped, recursively call this function to bubble the event up the DOM
      triggerEvent(parent, event);
    }

    else if (!parent && !event.isDefaultPrevented()) {    //#6 We're at the top of the DOM, so trigger the default action unless disabled

      var targetData = getData(event.target);

      if (event.target[event.type]) {                     //#7 If event has a default action for this event..

        targetData.disabled = true;                       //#8 Temporarily disable event dispatching on the target as we already executed the handler

        event.target[event.type]();                       //#9 Execute the default action

        targetData.disabled = false;                      //#10 Re-enable the delagator

      }

    }
  };
  fn.addSubmit = fn2.addSubmit;
  fn.removeSubmit = fn2.removeSubmit;
  fn.addChange = fn3.addChange;
  fn.removeChange = fn3.removeChange;
  fn.hover = (function () {

    if (isEventSupported("mouseenter")) {                    //#A Test if the browser supports the mouseenter and mouseleave events

      return function (elem, fn) {                     //#B In supporting browsers,  add handlers for the supporting events that simply trigger the handler
        addEvent(elem, "mouseenter", function () {
          fn.call(elem, "mouseenter");
        });

        addEvent(elem, "mouseleave", function () {
          fn.call(elem, "mouseleave");
        });
      };

    }
    else {

      return function (elem, fn) {                     //#C In non-supporting browsers handle mouseover and mouseout using a handler that detects the "within" condition
        addEvent(elem, "mouseover", function (e) {
          withinElement(this, e, "mouseenter", fn);
        });

        addEvent(elem, "mouseout", function (e) {
          withinElement(this, e, "mouseleave", fn);
        });
      };

    }

    function withinElement(elem, event, type, handle) {      //#D Handler that mimics non-standard behavior

      var parent = event.relatedTarget;                      //#E Get the element we are entering from, or exiting to.

      while (parent && parent != elem) {                     //#F Traverse upward until we hit the top or the hovered element
        try {
          parent = parent.parentNode;
        }
        catch (e) {                                          //#G In case of error (Firefox XUL elements)
          break;
        }
      }
      if (parent != elem) {                                  //#H If not exiting or entering the hovered element trigger the handler
        handle.call(elem, type);
      }
    }

  })();

  // document ready event ,  會 trigger 
  (function () {

    var isReady = false,                                   //#A Start off assuming that we're not ready
        contentLoadedHandler;

    function ready() {                                     //#B Function that triggers the ready handler and records that fact
      if (!isReady) {
        fn.triggerEvent(document, "ready");
        isReady = true;
      }
    }

    if (document.readyState === "complete") {               //#C If the DOM is already ready by the time we get here, fire the handler
      ready();
    }

    if (document.addEventListener) {                       //#D For W3C browsers, create a handler for the DOMContentLoaded event that fires off the ready handler and removes itself
      contentLoadedHandler = function () {
        document.removeEventListener(
            "DOMContentLoaded", contentLoadedHandler, false);
        ready();
      };

      document.addEventListener(                             //#E Establish the handler
          "DOMContentLoaded", contentLoadedHandler, false);

    }

    else if (document.attachEvent) {                        //#F For IE Event Model, create a handler that removes itself and fires the ready handler if the document readyState is complete
      contentLoadedHandler = function () {
        if (document.readyState === "complete") {
          document.detachEvent(
              "onreadystatechange", contentLoadedHandler);
          ready();
        }
      };

      document.attachEvent(                                  //#G Establish the handler. Probably late, but is iframe-safe.
          "onreadystatechange", contentLoadedHandler);

      var toplevel = false;
      try {
        toplevel = window.frameElement == null;
      }
      catch (e) {
      }

      if (document.documentElement.doScroll && toplevel) {     //#H If not in an iframe try the scroll check
        doScrollCheck();
      }
    }

    function doScrollCheck() {                                  //#I Scroll check process for legacy IE
      if (isReady) return;
      try {
        document.documentElement.doScroll("left");
      }
      catch (error) {
        setTimeout(doScrollCheck, 1);
        return;
      }
      ready();
    }
  })();

  return new fhlev();
})();

