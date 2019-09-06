/**
 *  * @private
 * All defaults including messages & regex patterns
 */

let defaults = {
  form: {
    formId: "",
    validationErrorClass: "val--error",
    validationValidClass: "val--valid",
    errorElement: "small",
    appendAfter: null,
    dateFormat: "dd/mm/YYYY"
  },
  formInstance: null,
  formFields: [],
  formFieldsNames: {},
  DOMObserver: null,
  supportedDateFormats: [
    "dd/mm/YYYY",
    "YYYY-mm-dd",
    "mm/dd/YYYY",
    "isoDateTime"
  ],
  messages: {
    required: "The %s field is required.",
    matches: "The %s field does not match the %s field.",
    min_length: "The %s field must be at least %s characters in length.",
    max_length: "The %s field must not exceed %s characters in length.",
    exact_length: "The %s field must be exactly %s characters in length.",
    greater_than: "The %s field must contain a number greater than %s.",
    less_than: "The %s field must contain a number less than %s.",
    numeric: "The %s field must contain only numbers.",
    integer: "The %s field must contain an integer.",
    decimal: "The %s field must contain a decimal number.",
    is_natural: "The %s field must contain only positive numbers.",
    is_natural_no_zero: "The %s field must contain a number greater than zero.",
    valid_ip: "The %s field must contain a valid IP.",
    valid_base64: "The %s field must contain a base64 string.",
    valid_credit_card: "The %s field must contain a valid credit card number.",
    is_year: "The %s field must be a valid year.",
    year_in_past: "The %s field must be current year or in the past.",
    years_between: "The %s date must be %s years after %s date.",
    min_years_in_past: "The %s date must be at least %s years in the past.",
    max_years_in_past: "The %s date must be no more than %s years in the past.",
    valid_date: "The %s field must be a valid date.",
    date_in_past: "The %s field must be in the past.",
    date_in_future: "The %s field must be in the future.",
    date_greater_than: "The %s date must be greater than %s date.",
    date_less_than: "The %s date must be less than %s date.",
    valid_email: "The %s field must contain a valid email address.",
    uk_postcode: "The %s field must be a valid UK postcode.",
    uk_phonenumber: "The %s field must be UK phone number",
    valid_url: "The %s field must contain a valid URL.",
    equals_addition: "It can be equal to it.",
    date_addition: "It can be today."
  },
  regex: {
    ruleRegex: /^(.+?)\[(.+)\]$/,
    numericRegex: /^[0-9]+$/,
    integerRegex: /^\-?[0-9]+$/,
    decimalRegex: /^\-?[0-9]*\.?[0-9]+$/,
    emailRegex: /^([a-zA-Z0-9_\-\.\+]+)@((\[[0-2]{1}[0-5]{1}[0-5]{1}\.[0-2]{1}[0-5]{1}[0-5]{1}\.[0-2]{1}[0-5]{1}[0-5]{1}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-2]{1}[0-5]{1}[0-5]{1})(\]?)$/i,
    naturalRegex: /^[0-9]+$/i,
    naturalNoZeroRegex: /^[1-9][0-9]*$/i,
    ipRegex: /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
    base64Regex: /[^a-zA-Z0-9\/\+=]/i,
    yearRegex: /^\d{4}$/,
    postcodeRegex: /[a-z]{1,2}[0-9]{1,2} ?[0-9][a-z]{2}/i,
    UKPhoneNumberRegex: /^((\+44)|0)( ?[0-9]{3,4}){3}$/i,
    urlRegex: /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
    dateRegex: /\d{4}-\d{1,2}-\d{1,2}/
  }
};

/**
 * @public
 * Main method to initialize form and getting all fields
 *
 * @param args | {Object}
 */
let initializeForm = (args = null) => {
  defaults.form = { ...defaults.form, ...args };
  defaults.formInstance = getFormInstance(defaults.form.formId);
  defaults.formFields = createAllFields();
  defaults.formFieldsNames = getFormFieldsNames();

  console.log(defaults.formFields);
};

/**
 * @private
 * Get form instance and add listener
 *
 * @param formId | {String}
 * @returns Form instance
 */
const getFormInstance = formId => {
  let form = formId
    ? document.getElementById(formId)
    : document.querySelector("form");
  form.addEventListener("submit", processForm);

  attachDOMObserver(form);

  return form;
};

/**
 * @private
 * Attach hook to observe if DOM has changed -
 * in case there are dynamic fields added to DOM
 *
 * @param form | {HTMLElement}
 */
const attachDOMObserver = form => {
  // Options for the observer (which mutations to observe)
  let mutationConfig = { attributes: false, childList: true, subtree: true };
  // Create an observer instance linked to the callback function
  defaults.DOMObserver = new MutationObserver(mutationCallback);
  // Start observing the target node for configured mutations
  defaults.DOMObserver.observe(form, mutationConfig);
};

/**
 * @private
 * Callback function to execute when mutations are observed
 *
 * @param mutationsList
 * @param observer
 */
const mutationCallback = (mutationsList, observer) => {
  // console.log('DOM has changed');
  let newFields = createAllFields();
  defaults.formFields = mergedArrays(defaults.formFields, newFields);
  defaults.formFieldsNames = getFormFieldsNames();
};

/**
 * @private
 * Merged two arrays of objects
 *
 * @param formFields | {Array}
 * @param newFields | {Array}
 * @returns Array
 */
const mergedArrays = (formFields, newFields) => {
  let mergedArr = [];

  // get arrays of IDs to compare the length
  let nameArrOld = [];
  for (let field of formFields) {
    nameArrOld.push(field.name);
  }

  let nameArrNew = [];
  for (let field of newFields) {
    nameArrNew.push(field.name);
  }

  // we only need to compare array of new names...
  for (let name of nameArrNew) {
    const objToPush1 = formFields.filter(obj => obj.name === name)[0];
    const objToPush2 = newFields.filter(obj => obj.name === name)[0];

    if (objToPush1 && objToPush2) {
      mergedArr.push(objToPush1);
    } else {
      // ... and if the length is greater that length of array of old IDs then add it
      if (nameArrOld.length < nameArrNew.length) {
        mergedArr.push(objToPush2);
      }
    }
  }

  return mergedArr;
};

/**
 * @private
 * Get form field display names
 * to be able to create correct error messages
 *
 * @returns Object of field names with name attributes as keys
 */
const getFormFieldsNames = () => {
  let names = {};

  for (let obj of defaults.formFields) {
    names[obj.name] = obj.display;
  }

  return names;
};

/**
 * @private
 * Get all fields with validation rules
 *
 * @returns Array of all form fields
 */
const createAllFields = () => {
  let formFields = [];
  let fieldNodeList = null;

  if (defaults.form.formId) {
    fieldNodeList = document.querySelectorAll(
      `#${defaults.form.formId} [data-val-rules]`
    );
  } else {
    fieldNodeList = document.querySelectorAll("[data-val-rules]");
  }

  if (!fieldNodeList) {
    console.warn("No fields for validation defined");
    return [];
  }

  let fieldsToAdd = Array.from(fieldNodeList);

  // remove fields that have empty data-val-rules
  fieldsToAdd = fieldsToAdd.filter(field => {
    return field.dataset.valRules.length > 0;
  });

  for (let field of fieldsToAdd) {
    field.addEventListener("change", fieldChanged);
    // field.addEventListener('validated', fieldValidated) => still here for reference

    if (field.type === "checkbox" || field.type === "radio") {
      let collectAll = document.querySelectorAll(
        'input[name^="' + field.name.replace(/[^a-z0-9 ,.?!]/gi, "") + '"]'
      );
      let arrAll = Array.from(collectAll);

      for (let single of arrAll) {
        single.addEventListener("change", fieldChanged);
      }
    }

    if (
      formFields.findIndex(fieldToCheck => fieldToCheck.name === field.name) ===
      -1
    ) {
      formFields.push(addField(field));
    }
  }

  return formFields;
};

/**
 * @private
 * Add new field when initializing the form
 *
 * @param field | {HTMLElement}
 * @returns Object with all field attributes we might need
 */
const addField = field => {
  let obj = {
    name: field.name,
    display: field.dataset.valDisplay ? field.dataset.valDisplay : field.name,
    rules: field.dataset.valRules.split("|"),
    allowEmpty: false,
    value: null,
    type: field.type,
    valid: false,
    visited: false,
    error: null,
    with: null
  };

  if (field.dataset.valAllowEmpty) {
    obj.allowEmpty = true;
  }

  if (field.dataset.valWith) {
    obj.with = field.dataset.valWith;
  }

  if (field.type === "checkbox" || field.type === "radio") {
    obj.checked = false;
    obj.value = [];
  }

  return obj;
};

/**
 * @private
 * Process field chang
 *
 * @param event | {Event}
 */
const fieldChanged = event => {
  let index = defaults.formFields.findIndex(field => {
    return field.name === event.target.name;
  });

  if (event.target.type === "checkbox" || event.target.type === "radio") {
    const validCheckboxes = document.querySelectorAll(
      'input[name="' + event.target.name + '"]:checked'
    );
    if (validCheckboxes.length > 0) {
      defaults.formFields[index].checked = true;
      defaults.formFields[index].value = [];
      for (let box of validCheckboxes) {
        defaults.formFields[index].value.push(box.value);
      }
    } else {
      defaults.formFields[index].checked = false;
      defaults.formFields[index].value = [];
    }
  } else {
    defaults.formFields[index].value = event.target.value;
  }

  validateField(defaults.formFields[index]);

  // re-validate field connected to this one
  validateWith(defaults.formFields[index].with);
};

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
const getAppendAfterElement = field => {
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
const getSiblings = element => {
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
const checkSiblings = field => {
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
const checkParent = element => {
  let parent = element.parentNode;

  if (parent.classList.contains(defaults.form.appendAfter)) {
    return parent;
  }

  return false;
};

/**
 * @private
 * Append error element
 *
 * @param errorElement | {String}
 * @param field | {Object}
 */
const appendErrorElement = (errorElement, field) => {
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
 * @private
 * Create error element
 *
 * @param fieldName | {String}
 * @returns HTMLElement
 */
const createErrorElement = fieldName => {
  const errorElement = document.createElement(defaults.form.errorElement);
  const cleanFieldName = fieldName.replace(/[^a-z0-9 ,.?!]/gi, ""); // in case we have a name attribute for checkboxes in format "checkbox[]"
  errorElement.setAttribute(
    "class",
    `${defaults.form.validationErrorClass} ${cleanFieldName}_error`
  );

  return errorElement;
};

/**
 * @private
 * Validate field
 *
 * If error --> create error element & append it after validated field
 *
 * Note: hidden comes validateHidden method => we don't want to update the value from DOM
 * as it moght not be there yet when dealing with components. We also pass a value
 * for hidden field so we already have a fresh update there.
 *
 * @param field | {Object}
 * @param hidden | {Boolean}
 * @returns true or false
 */
const validateField = (field, hidden = false) => {
  field.visited = true;
  let fieldElement = document.getElementsByName(field.name)[0];

  field.value = fieldElement.value;

  // clear old error message
  const oldError = document.querySelector(
    "." + field.name.replace(/[^a-z0-9 ,.?!]/gi, "") + "_error"
  );
  if (oldError) {
    oldError.remove();
  }

  fieldElement.classList.remove(defaults.form.validationValidClass);
  fieldElement.classList.remove(defaults.form.validationErrorClass);

  if (!field.value && field.allowEmpty === true) {
    field.valid = true;
    field.error = null;
    // setFieldValidationClass(fieldElement, defaults.form.validationValidClass);
    fieldElement.classList.add(defaults.form.validationValidClass);
    dispatchFieldValidationEvent(fieldElement, field.name);

    return true;
  }

  for (let i = 0; i < field.rules.length; i++) {
    let check,
      param = null;
    let rule = field.rules[i];
    let parts = defaults.regex.ruleRegex.exec(rule);

    if (parts) {
      rule = parts[1];
      param = parts[2];
      check = hooks[rule](field, param);
    } else {
      check = hooks[rule](field);
    }

    if (check === false) {
      field.valid = false;

      let errorElement = createErrorElement(field.name);
      errorElement.textContent = field.error = getValidationErrorMessage(
        rule,
        field.display,
        param
      );

      appendErrorElement(errorElement, field);

      fieldElement.classList.add(defaults.form.validationErrorClass);
      dispatchFieldValidationEvent(fieldElement, field.name);

      return false;
    }
  }

  field.valid = true;
  field.error = null;
  // setFieldValidationClass(fieldElement, defaults.form.validationValidClass, 'remove');
  fieldElement.classList.add(defaults.form.validationValidClass);
  dispatchFieldValidationEvent(fieldElement, field.name);

  return true;
};

/**
 * @public
 * Validate hidden field
 *
 * @param fieldName | {String}
 */
const validateHidden = (name, value) => {
  let index = defaults.formFields.findIndex(field => {
    return field.name === name;
  });
  defaults.formFields[index].value = value;

  validateField(defaults.formFields[index], true);

  // re-validate field connected to this one
  validateWith(defaults.formFields[index].with);
};

/**
 * @private
 * Re-validate field in val-with
 *
 * @param fieldName | {String}
 */
const validateWith = fieldName => {
  if (fieldName) {
    let validateWith = defaults.formFields.filter(obj => {
      return obj.name === fieldName;
    })[0];

    // make sure that we only validate after user interacted with the validatedWith field
    if (validateWith.visited) {
      validateField(validateWith);
    }
  }
};

/**
 * @private
 * Get validation error message
 *
 * @param rule | {String}
 * @param fieldName | {String}
 * @param param | {String}
 * @returns String with an error message
 */
const getValidationErrorMessage = (rule, fieldName, param = null) => {
  // replace first placeholder in default message
  let errorMessage = defaults.messages[rule].replace("%s", fieldName);

  // if we have param => replace also second placeholder
  if (param) {
    if (param.split(":").length > 1) {
      let split = param.split(":");

      errorMessage = errorMessage.replace("%s", split[1]);
      errorMessage = errorMessage.replace(
        "%s",
        defaults.formFieldsNames[split[0]]
      );
    } else {
      console.log(param);
      if (
        Object.keys(defaults.formFieldsNames).indexOf(param.replace("=", "")) >=
        0
      ) {
        errorMessage = errorMessage.replace(
          "%s",
          defaults.formFieldsNames[param.replace("=", "")]
        );
      } else {
        errorMessage = errorMessage.replace("%s", param.replace("=", ""));
      }
    }
  }

  return errorMessage;
};

/**
 * @private
 * Create and dispatch custom "validated" event
 *
 * @param element | {HTMLElement}
 * @param fieldName | {String}
 */
const dispatchFieldValidationEvent = (element, fieldName) => {
  let fieldData = defaults.formFields.filter(obj => obj.name === fieldName)[0];
  let event = new CustomEvent("validated", { detail: fieldData });
  element.dispatchEvent(event);
};

/**
 * @public
 * Partial form validation
 *
 * If returnData is true then the array of fields will be returned
 *
 * @param args | {String || Array}
 * @param returnData | {Boolean}
 * @returns Boolean or data objects for each passed field
 */
const validatePartially = (args, returnData = false) => {
  if (Array.isArray(args)) {
    return validatePartiallyArray(args, returnData);
  } else if (typeof args === "string") {
    return validatePartiallyString(args, returnData);
  } else {
    console.error(
      "Passed argument in partialValidation method must be of type string or array."
    );
    return false;
  }
};

/**
 * @public
 * Validate whole form
 *
 * @param returnData
 * @returns Boolean or data objects for each passed field
 */
const validateForm = (returnData = false) => {
  // console.log(Object.keys(defaults.formFieldsNames));
  return validatePartiallyArray(
    Object.keys(defaults.formFieldsNames),
    returnData
  );
};

/**
 * @private
 * Partial form validation (array given)
 *
 * If returnData is true then the array of fields will be returned
 *
 * @param args | {Array}
 * @param returnData | {Boolean}
 * @returns Boolean or data objects for each passed field
 */
const validatePartiallyArray = (arr, returnData) => {
  let check = returnData ? [] : true;

  for (let fieldName of arr) {
    let result = validatePartiallyString(fieldName, returnData);

    if (returnData) {
      check.push(result);
    } else {
      check = check && result;
    }
  }

  return check;
};

/**
 * @private
 * Partial form validation (string given)
 *
 * If returnData is true then the array of fields will be returned
 *
 * @param args | {String}
 * @param returnData | {Boolean}
 * @returns Boolean or data objects for each passed field
 */
const validatePartiallyString = (fieldName, returnData) => {
  let index = defaults.formFields.findIndex(field => {
    return field.name === fieldName;
  });

  if (index === -1) {
    console.warn(
      `Passed argument (${fieldName}) doesn't match any field and it's skipped from the validation. Typo?`
    );
    return false;
  }

  let field = defaults.formFields[index];

  if (returnData) {
    validateField(field);
    return field;
  } else {
    return validateField(field);
  }
};

/**
 * @public
 * Add validation method
 *
 * @param name
 * @param fn
 */
const addValMethod = (name, fn) => {
  hooks[name] = fn;
};

/**
 * @public
 * Add validation message
 *
 * @param name
 * @param message
 */
const addValMessage = (name, message) => {
  defaults.messages[name] = message;
};

/**
 * @private
 * Process form after it was submitted
 *
 * @param event | {Event}
 */
const processForm = event => {
  event.preventDefault();

  const check = validateForm();

  if (check) {
    defaults.formInstance.submit();
  } else {
    console.log("Not valid yet");
  }
};

/**
 * @private
 * Create date parts
 *
 * Helper function for getDateParts
 *
 * @param date
 * @param delimiter
 * @param order
 * @param regex
 * @returns Object with day, month and year values
 */
const createDateParts = (date, delimiter, order, regex) => {
  if (!date.match(regex)) {
    return false;
  }

  let dateParts = {
    day: null,
    month: null,
    year: null
  };

  let dateArray = date.split(delimiter);

  dateParts.day = dateArray[order.day];
  dateParts.month = dateArray[order.month];
  dateParts.year = dateArray[order.year];

  return dateParts;
};

/**
 * @private
 * Get date parts
 *
 * Returns object that can be used for validation
 *
 * @param date
 * @returns Object with day, month and year values
 */
const getDateParts = date => {
  const dateFormat = defaults.form.dateFormat;

  if (defaults.supportedDateFormats.indexOf(dateFormat) < 0) {
    console.error("Date format not recognised.");
    return false;
  }

  if (dateFormat === "dd/mm/YYYY") {
    const regex = /\d{2}\/\d{2}\/\d{4}/;
    const order = { day: 0, month: 1, year: 2 };
    return createDateParts(date, "/", order, regex);
  }

  if (dateFormat === "YYYY-mm-dd") {
    const regex = /\d{4}-\d{2}-\d{2}/;
    const order = { day: 2, month: 1, year: 0 };
    return createDateParts(date, "-", order, regex);
  }

  if (dateFormat === "mm/dd/YYYY") {
    const regex = /\d{2}\/\d{2}\/\d{4}/;
    const order = { day: 1, month: 2, year: 2 };
    return createDateParts(date, "/", order, regex);
  }

  if (dateFormat === "isoDateTime") {
    const dateOnly = date.split("T")[0];
    const regex = /\d{4}-\d{2}-\d{2}/;
    const order = { day: 2, month: 1, year: 0 };
    return createDateParts(dateOnly, "-", order, regex);
  }
};

/**
 * @private
 * Calculate difference between two dates in years
 * @param date1
 * @param date2
 * @returns true or false
 */
const calculateDiffInYears = (date1, date2) => {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  let years = diff / (1000 * 60 * 60 * 24 * 365.2422);
  if (
    years
      .toString()
      .split(".")[1]
      .startsWith("999")
  ) {
    return Math.ceil(years);
  }
  return diff / (1000 * 60 * 60 * 24 * 365.2422);
};

/**
 * @private
 * Get formatted date instance
 *
 * @param date
 * @returns Date
 */
const getDateInstance = date => {
  const dateParts = getDateParts(date);
  const dateInstance = new Date(
    `${dateParts.year}-${dateParts.month}-${dateParts.day} 00:00`
  );
  return dateInstance;
};

/**
 * @private
 * Validation methods
 */
let hooks = {
  required: field => {
    let value = field.value;

    if (field.type === "checkbox" || field.type === "radio") {
      return field.checked === true;
    }

    return value !== null && value !== "";
  },

  matches: (field, matchName) => {
    let matchField = defaults.formFields.filter(
      obj => obj.name === matchName
    )[0];

    if (matchField) {
      return field.value === matchField.value;
    }

    return false;
  },

  min_length: (field, length) => {
    if (!defaults.regex.numericRegex.test(length)) {
      return false;
    }

    if (field.value === null) {
      return false;
    }

    return field.value.length >= parseInt(length, 10);
  },

  max_length: (field, length) => {
    if (!defaults.regex.numericRegex.test(length)) {
      return false;
    }

    if (field.value === null) {
      return false;
    }

    return field.value.length <= parseInt(length, 10);
  },

  exact_length: (field, length) => {
    if (!defaults.regex.numericRegex.test(length)) {
      return false;
    }

    if (field.value === null) {
      return false;
    }

    return field.value.length === parseInt(length, 10);
  },

  greater_than: (field, param) => {
    if (!defaults.regex.decimalRegex.test(field.value)) {
      return false;
    }

    let message = defaults.messages.greater_than;
    let add = defaults.messages.equals_addition;

    if (param.startsWith("=")) {
      if (message.indexOf(add) === -1) {
        defaults.messages.greater_than += " " + add;
      }
      return parseFloat(field.value) >= parseFloat(param.substring(1));
    }

    if (message.indexOf(add) !== -1) {
      defaults.messages.greater_than = message.replace(" " + add, "");
    }

    return parseFloat(field.value) > parseFloat(param);
  },

  less_than: (field, param) => {
    if (!defaults.regex.decimalRegex.test(field.value)) {
      return false;
    }

    let message = defaults.messages.greater_than;
    let add = defaults.messages.equals_addition;

    if (param.startsWith("=")) {
      if (message.indexOf(add) === -1) {
        defaults.messages.less_than += " " + add;
      }
      return parseFloat(field.value) <= parseFloat(param.substring(1));
    }

    if (message.indexOf(add) !== -1) {
      defaults.messages.less_than = message.replace(" " + add, "");
    }

    return parseFloat(field.value) < parseFloat(param);
  },

  alpha: field => {
    return defaults.regex.alphaRegex.test(field.value);
  },

  alpha_numeric: field => {
    return defaults.regex.alphaNumericRegex.test(field.value);
  },

  alpha_dash: field => {
    return defaults.regex.alphaDashRegex.test(field.value);
  },

  numeric: field => {
    return defaults.regex.numericRegex.test(field.value);
  },

  integer: field => {
    return defaults.regex.integerRegex.test(field.value);
  },

  decimal: field => {
    return defaults.regex.decimalRegex.test(field.value);
  },

  is_natural: field => {
    return defaults.regex.naturalRegex.test(field.value);
  },

  is_natural_no_zero: field => {
    return defaults.regex.naturalNoZeroRegex.test(field.value);
  },

  valid_ip: field => {
    return defaults.regex.ipRegex.test(field.value);
  },

  valid_base64: field => {
    return defaults.regex.base64Regex.test(field.value);
  },

  valid_credit_card: field => {
    // Luhn Check Code from https://gist.github.com/4075533
    // accept only digits, dashes or spaces
    if (!defaults.regex.numericDashRegex.test(field.value)) return false;

    let nCheck = 0,
      nDigit = 0,
      bEven = false;
    let strippedField = field.value.replace(/\D/g, "");

    for (let n = strippedField.length - 1; n >= 0; n--) {
      let cDigit = strippedField.charAt(n);
      nDigit = parseInt(cDigit, 10);
      if (bEven) {
        if ((nDigit *= 2) > 9) nDigit -= 9;
      }

      nCheck += nDigit;
      bEven = !bEven;
    }

    return nCheck % 10 === 0;
  },

  date_in_past: (field, param = null) => {
    const date = getDateInstance(field.value);
    let now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    let message = defaults.messages.date_in_past;
    let add = defaults.messages.date_addition;

    if (Boolean(param) && param == "=") {
      if (message.indexOf(add) === -1) {
        defaults.messages.date_in_past += " " + add;
      }
      return date <= now;
    }

    if (message.indexOf(add) !== -1) {
      defaults.messages.date_in_past = message.replace(" " + add, "");
    }

    return date < now;
  },

  date_in_future: (field, param = null) => {
    const date = getDateInstance(field.value);
    let now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    let message = defaults.messages.date_in_future;
    let add = defaults.messages.date_addition;

    if (Boolean(param) && param == "=") {
      if (message.indexOf(add) === -1) {
        defaults.messages.date_in_future += " " + add;
      }
      return date >= now;
    }

    if (message.indexOf(add) !== -1) {
      defaults.messages.date_in_future = message.replace(" " + add, "");
    }

    return date > now;
  },

  date_greater_than: (field, param) => {
    let paramField = defaults.formFields.filter(
      obj => obj.name === param.replace("=", "")
    )[0];

    if (!paramField.visited || !paramField.value) {
      return true;
    }

    let message = defaults.messages.date_greater_than;
    let add = defaults.messages.equals_addition;

    const fieldDate = getDateInstance(field.value);
    const paramDate = getDateInstance(paramField.value);

    if (param.startsWith("=")) {
      if (message.indexOf(add) === -1) {
        defaults.messages.date_greater_than += " " + add;
      }
      return fieldDate >= paramDate;
    }

    if (message.indexOf(add) !== -1) {
      defaults.messages.date_greater_than = message.replace(" " + add, "");
    }

    return fieldDate > paramDate;
  },

  date_less_than: (field, param) => {
    let paramField = defaults.formFields.filter(
      obj => obj.name === param.replace("=", "")
    )[0];

    if (!paramField.visited || !paramField.value) {
      return true;
    }

    let message = defaults.messages.date_less_than;
    let add = defaults.messages.equals_addition;

    const fieldDate = getDateInstance(field.value);
    const paramDate = getDateInstance(paramField.value);

    if (param.startsWith("=")) {
      if (message.indexOf(add) === -1) {
        defaults.messages.date_less_than += " " + add;
      }
      return fieldDate <= paramDate;
    }

    if (message.indexOf(add) !== -1) {
      defaults.messages.date_less_than = message.replace(" " + add, "");
    }

    return fieldDate < paramDate;
  },

  valid_date: field => {
    const dateParts = getDateParts(field.value);
    const date = new Date(
      `${dateParts.year}-${dateParts.month}-${dateParts.day} 00:00`
    );
    const isValid = Boolean(+date) && date.getDate() == dateParts.day;

    return isValid;
  },

  is_year: field => {
    return defaults.regex.yearRegex.test(field.value);
  },

  year_in_past: field => {
    let now = new Date();
    const year = now.getFullYear();

    return field.value <= year;
  },

  years_between: (field, param) => {
    let paramSplit = param.split(":");

    if (paramSplit.length < 2) {
      console.warn(
        `Parameter in ${field.name} is not configured correctly. Expected format: [field:years]`
      );
      return false;
    }

    const fieldAgainst = paramSplit[0];
    const fieldAgainstData = defaults.formFields.filter(
      obj => obj.name === fieldAgainst
    )[0];

    if (!fieldAgainstData.value) {
      return true;
    }

    const years = paramSplit[1];
    const fieldDate = getDateInstance(field.value);
    const fieldAgainstDate = getDateInstance(fieldAgainstData.value);

    console.log(calculateDiffInYears(fieldDate, fieldAgainstDate));
    console.log(
      calculateDiffInYears(fieldDate, fieldAgainstDate) >= parseFloat(years)
    );
    return calculateDiffInYears(fieldDate, fieldAgainstDate) >= years;
  },

  min_years_in_past: (field, param) => {
    const fieldDate = getDateInstance(field.value);
    let now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    return calculateDiffInYears(fieldDate, now) >= param;
  },

  max_years_in_past: (field, param) => {
    const fieldDate = getDateInstance(field.value);
    let now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    return calculateDiffInYears(fieldDate, now) <= param;
  },

  valid_email: field => {
    return defaults.regex.emailRegex.test(field.value);
  },

  uk_postcode: field => {
    if (field.value.length > 8 || field.value.length < 6) {
      return false;
    }

    return defaults.regex.postcodeRegex.test(field.value);
  },

  uk_phonenumber: field => {
    return defaults.regex.UKPhoneNumberRegex.test(field.value);
  },

  valid_url: field => {
    return defaults.regex.urlRegex.test(field.value);
  }
};

const valForm = {
  init: initializeForm,
  partialValidation: validatePartially,
  validateForm: validateForm,
  validateHidden: validateHidden,
  addValMethod: addValMethod,
  addValMessage: addValMessage
};

module.exports = valForm;
