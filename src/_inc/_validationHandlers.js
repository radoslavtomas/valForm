let defaults = require("./_defaults");
let hooks = require("./_validationMethods");
let DOMHandlers = require("./_DOMHandlers");

const createErrorElement = DOMHandlers.createErrorElement;
const appendErrorElement = DOMHandlers.appendErrorElement;

/**
 * @private
 * Validate field
 *
 * If error --> create error element & append it after validated field
 *
 * @param field | {Object}
 * @returns true or false
 */
const validateField = field => {
  field.visited = true;
  let fieldElement = document.getElementsByName(field.name)[0];

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

      // setFieldValidationClass(fieldElement, defaults.form.validationErrorClass, 'add');
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

const validateHidden = (name, value) => {
  let index = defaults.formFields.findIndex(field => {
    return field.name === name;
  });
  defaults.formFields[index].value = value;

  validateField(defaults.formFields[index]);

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
 * @public
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
 * @public
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

const validationHandlers = {
  validateField: validateField,
  validateWith: validateWith,
  validatePartially: validatePartially,
  validateForm: validateForm,
  validateHidden: validateHidden,
  addValMethod: addValMethod,
  addValMessage: addValMessage,
  processForm: processForm
};

module.exports = validationHandlers;
