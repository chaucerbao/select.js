(function(window, document) {
  var SELECT_FOCUSED = "select--focused";
  var OVERLAY = "select__overlay";
  var OPTIONS = "select__options";
  var OPTIONS_TOP = "select__options--top";
  var OPTION = "select__option";
  var OPTION_SELECTED = "select__option--selected";
  var OPTION_CHECKED = "option:checked";
  var MOUSEDOWN = "mousedown";
  var KEYUP = "keyup";
  var KEYDOWN = "keydown";
  var DATA_INDEX = "data-index";

  var activeSelect;

  // Shortcuts
  function $(selector, context) { return (context || document).querySelector(selector); }
  function $$(selector, context) { return (context || document).querySelectorAll(selector); }
  function isOpen(select) { return select.classList.contains(SELECT_FOCUSED); }
  function addClass(element, classes) { element.classList.add(classes); }
  function removeClass(element, classes) { element.classList.remove(classes); }
  function appendChild(element, child) { element.appendChild(child); }
  function createElement(element) { return document.createElement(element); }
  function addEventListener(element, eventName, callback, useCapture) { element.addEventListener(eventName, callback, useCapture); }
  function reqAnimationFrame(callback) { return window.requestAnimationFrame(callback) };
  function optionIndex(select) { return select.getAttribute(DATA_INDEX); }

  function scaffold(selectElement) {
    // Create a wrapper element
    var selectWrapper = createElement("div");
    addClass(selectWrapper, "select");

    // Make an option list from the <option> tags
    var optionList = createElement("ol");
    addClass(optionList, OPTIONS);

    var optionsFragment = document.createDocumentFragment();
    var options = $$("option", selectElement);
    for (var i = 0, len = options.length; i < len; i++) {
      // Create a list item to mirror the option
      var option = options[i];
      var optionElement = createElement("li");

      option.setAttribute(DATA_INDEX, i);
      optionElement.setAttribute(DATA_INDEX, i);
      addClass(optionElement, OPTION);
      appendChild(optionElement, document.createTextNode(option.textContent));

      if (option.selected) {
        addClass(optionElement, OPTION_SELECTED);
      }

      appendChild(optionsFragment, optionElement);
    }

    // Add an overlay layer
    var overlayElement = createElement("div");
    addClass(overlayElement, OVERLAY);
    appendChild(selectWrapper, overlayElement);

    // Wrap the `selectElement`
    selectElement.parentNode.insertBefore(selectWrapper, selectElement);
    appendChild(selectWrapper, selectElement);

    // Append the options list
    appendChild(optionList, optionsFragment)
    appendChild(selectWrapper, optionList);

    bindEvents(selectWrapper);

    return selectWrapper;
  }

  function bindEvents(select) {
    // Toggle the option list when the <select> is clicked
    addEventListener($("select", select), MOUSEDOWN, function() {
      toggleSelectBox(select);
    });

    // Close the option list when the overlay is clicked
    addEventListener($("." + OVERLAY, select), MOUSEDOWN, function(e) {
      e.stopPropagation();

      closeSelectBox(select, true);
    });

    // Select an option when an option list item is clicked
    addEventListener($("." + OPTIONS, select), MOUSEDOWN, function(e) {
      var index = optionIndex(e.target);

      selectOption(select, index);
      closeSelectBox(select);
    });

    // Keyboard controls
    addEventListener(select, KEYUP, function() {
      selectOption(select, optionIndex($(OPTION_CHECKED, select)));
    });
    addEventListener(select, KEYDOWN, function(e) {
      var selected = $(OPTION_CHECKED, select);

      switch (e.keyCode) {
        case 9:
          // Tab
          if (activeSelect) {
            closeSelectBox(select);
          }
          break;
        case 13:
        case 32:
          // Enter or Spacebar
          toggleSelectBox(select);
          break;
        case 27:
          // ESC
          closeSelectBox(select, true);
          break;
        case 38:
        case 40:
          // (Up/Down)-arrow
          var toOption;

          if (!isOpen(select)) {
            // Open
            openSelectBox(select);
          } else if (e.keyCode === 38) {
            // Up
            toOption = selected.previousElementSibling;
          } else {
            // Down
            toOption = selected.nextElementSibling;
          }

          if (toOption) {
            selectOption(select, optionIndex(toOption));
          }
          break;
      }
    });
  }

  function openSelectBox(select) {
    if (!isOpen(select)) {
      activeSelect = {
        initialIndex: optionIndex($(OPTION_CHECKED, select)),
        optionList: $("." + OPTIONS, select)
      };
      selectOption(select, activeSelect.initialIndex);

      // Reveal the option list
      addClass(select, SELECT_FOCUSED);

      reqAnimationFrame(renderOptionList);
    }
  }

  function closeSelectBox(select, shouldEscape) {
    removeClass(select, SELECT_FOCUSED);

    // Reset to the previously selected option
    if (shouldEscape && activeSelect) {
      selectOption(select, activeSelect.initialIndex);
    }

    // Trigger the "change" event if the selected option has changed
    if (optionIndex($(OPTION_CHECKED, select)) !== activeSelect.initialIndex) {
      $("select", select).dispatchEvent(new Event("change"));
    }

    activeSelect = null;
  }

  function toggleSelectBox(select) {
    if (isOpen(select)) {
      closeSelectBox(select);
    } else {
      openSelectBox(select);
    }
  }

  function selectOption(select, toIndex) {
    var attributeIdentifier = "[" + DATA_INDEX + "=\"" + toIndex + "\"]";

    // Mark the <option> tag as selected
    $("option" + attributeIdentifier, select).selected = true;

    // Update the option list
    removeClass($("." + OPTION_SELECTED, select), OPTION_SELECTED);
    addClass($("." + OPTION + attributeIdentifier, select), OPTION_SELECTED);
  }

  function renderOptionList() {
    if (activeSelect) {
      var optionList = activeSelect.optionList ;
      var optionListRect = optionList.getBoundingClientRect();
      var selectRect = optionList.parentNode.getBoundingClientRect();

      if (optionList.classList.contains(OPTIONS_TOP)) {
        // Option list is above the custom-select
        if (
          // Option list is past the top of the window
          optionListRect.top < 0 ||
          // Or, option list can fit below the custom-select
          selectRect.bottom + optionListRect.height < window.innerHeight
        ) {
          removeClass(optionList, OPTIONS_TOP);
        }
      } else {
        // Option list is below the custom-select
        if (
          // Option list is past the bottom of the window
          optionListRect.top + optionListRect.height > window.innerHeight &&
          // And, option list can fit above the custom-select
          selectRect.top - optionListRect.height > 0
        ) {
          addClass(optionList, OPTIONS_TOP);
        }
      }

      reqAnimationFrame(renderOptionList);
    }
  }

  function initialize(shouldOpen, e) {
    var target = e.target;

    if (target && target.tagName === "SELECT" && !target.isInitialized) {
      target.isInitialized = true;

      var select = scaffold(target);

      if (shouldOpen) {
        toggleSelectBox(select);
      }

      target.focus();
    }
  }

  // Initialize the custom select box on first click/keyup
  addEventListener(document, MOUSEDOWN, initialize.bind(this, true));
  addEventListener(document, KEYUP, initialize.bind(this, false));
}(window, document));
