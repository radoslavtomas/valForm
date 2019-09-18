import defaults from "./_defaults";

/**
 * Custom "appendAfter" function to be able to append new elements to DOM
 */
(Element.prototype.appendAfter = function(element) {
  element.parentNode.insertBefore(this, element.nextSibling);
}),
  false;

/**
 * @private
 * Get append after element
 *
 * @param field | {HTMLElement}
 * @returns Element
 */
function getAppendAfterElement (field) {
  // check siblings
  let sibling = checkSiblings(field);

  if (sibling) {
    return sibling;
  }

  // check parent
  let parent = checkParent(field);

  if (parent) {
    return parent;
  }

  if (field.parentNode.nodeName === "FORM") {
    console.error(
      "Error: appendAfter class has not been found in current form. Typo?"
    );
    return false;
  } else {
    return getAppendAfterElement(field.parentNode);
  }
};

/**
 * @private
 * Get element's siblings
 *
 * @param element | {HTMLElement}
 * @returns {Array}
 */
function getSiblings (element) {
  let siblings = [];
  let sibling = element.parentNode.firstChild;

  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== element) {
      siblings.push(sibling);
    }
    sibling = sibling.nextSibling;
  }

  return siblings;
};

/**
 * @private
 * Check siblings to match given class
 *
 * @param field | {HTMLElement}
 * @returns Element with a searched class or false
 */
function checkSiblings (field) {
  let siblings = getSiblings(field);

  if (siblings) {
    for (let sibling of siblings) {
      if (sibling.classList.contains(defaults.form.appendAfter)) {
        return sibling;
      }
    }
  }

  return false;
};

/**
 * @private
 * Check parent element to match given class
 *
 * @param element | {HTMLElement}
 * @returns Element with a searched class or false
 */
function checkParent (element) {
  let parent = element.parentNode;

  if (parent.classList.contains(defaults.form.appendAfter)) {
    return parent;
  }

  return false;
};

/**
 * @public
 * Append error element
 *
 * @param errorElement | {String}
 * @param field | {Object}
 */
function appendErrorElement (errorElement, field) {
  if (defaults.form.appendAfter) {
    let fieldEl = document.getElementsByName(field.name)[0];
    let element = getAppendAfterElement(fieldEl);

    if (element) {
      errorElement.appendAfter(element);
    }
  } else {
    // if it's checkbox or radio input find parent element
    if (field.type === "checkbox" || field.type === "radio") {
      errorElement.appendAfter(
        document.getElementsByName(field.name)[0].parentNode
      );
    } else {
      errorElement.appendAfter(document.getElementsByName(field.name)[0]);
    }
  }
};

/**
 * @public
 * Create error element
 *
 * @param fieldName | {String}
 * @returns HTMLElement
 */
function createErrorElement (fieldName) {
  const errorElement = document.createElement(defaults.form.errorElement);
  const cleanFieldName = fieldName.replace(/[^a-z0-9 ,.?!]/gi, ""); // in case we have a name attribute for checkboxes in format "checkbox[]"
  errorElement.setAttribute(
    "class",
    `${defaults.form.validationErrorClass} ${cleanFieldName}_error`
  );

  return errorElement;
};

const DOMHandlers = {
  createErrorElement: createErrorElement,
  appendErrorElement: appendErrorElement
};

export default DOMHandlers;
