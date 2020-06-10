import defaults from "./_defaults";
import hooks from "./_validationMethods";
import DOMHandlers from "./_DOMHandlers";

const createErrorElement = DOMHandlers.createErrorElement;
const appendErrorElement = DOMHandlers.appendErrorElement;

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
async function validateField(field, formIndex, hidden = false) {
  const formId = defaults.formInstances[formIndex].formId;
  field.visited = true;

  let fieldElement = document.querySelector(
    `#${formId} input[name='${field.name}']`
  );

  if (!hidden) {
    field.value = fieldElement.value;
  }

  // clear old error message
  const oldError = document.querySelector(
    `#${formId} .${field.name.replace(/[^a-z0-9 ,.?!]/gi, "")}_error`
  );

  if (oldError) {
    oldError.remove();
  }

  fieldElement.classList.remove(defaults.form_config.validationValidClass);
  fieldElement.classList.remove(defaults.form_config.validationErrorClass);

  if (!field.value && field.allowEmpty === true) {
    field.valid = true;
    field.error = null;
    // setFieldValidationClass(fieldElement, defaults.form_config.validationValidClass);
    fieldElement.classList.add(defaults.form_config.validationValidClass);
    dispatchFieldValidationEvent(fieldElement, field.name, formIndex);

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
      check = await hooks[rule](field, param);
    } else {
      check = await hooks[rule](field);
    }

    if (check === false) {
      field.valid = false;

      let errorElement = createErrorElement(field.name);
      errorElement.textContent = field.error = getValidationErrorMessage(
        rule,
        field.display,
        formIndex,
        param
      );

      appendErrorElement(errorElement, field, fieldElement);

      fieldElement.classList.add(defaults.form_config.validationErrorClass);
      dispatchFieldValidationEvent(fieldElement, field.name, formIndex);

      return false;
    }
  }

  field.valid = true;
  field.error = null;
  // setFieldValidationClass(fieldElement, defaults.form_config.validationValidClass, 'remove');
  fieldElement.classList.add(defaults.form_config.validationValidClass);
  dispatchFieldValidationEvent(fieldElement, field.name, formIndex);

  return true;
}

/**
 * @public
 * Validate hidden field
 *
 * @param name | {String}
 * @param value | {mixed}
 * @param formId | {String}
 */
async function validateHidden(name, value, formId) {
  const formIndex = defaults.formInstances.findIndex(
    obj => obj.formId === formId
  );

  let index = defaults.formInstances[formIndex].fields.findIndex(field => {
    return field.name === name;
  });

  defaults.formInstances[formIndex].fields[index].value = value;

  await validateField(
    defaults.formInstances[formIndex].fields[index],
    formIndex,
    true
  );

  // re-validate field connected to this one
  await validateWith(
    defaults.formInstances[formIndex].fields[index].with,
    formIndex
  );
}

/**
 * @private
 * Re-validate field in val-with
 *
 * @param fieldName | {String}
 */
async function validateWith(fieldName, formIndex) {
  if (fieldName) {
    let validateWith = defaults.formInstances[formIndex].fields.filter(obj => {
      return obj.name === fieldName;
    })[0];

    // make sure that we only validate after user interacted with the validatedWith field
    if (validateWith.visited) {
      await validateField(validateWith, formIndex);
    }
  }
}

/**
 * @private
 * Get validation error message
 *
 * @param rule | {String}
 * @param fieldName | {String}
 * @param param | {String}
 * @returns String with an error message
 */
function getValidationErrorMessage(rule, fieldName, formIndex, param = null) {
  // replace first placeholder in default message
  let errorMessage = defaults.messages[rule].replace("%s", fieldName);

  // if we have param => replace also second placeholder
  if (param) {
    if (param.split(":").length > 1) {
      let split = param.split(":");

      errorMessage = errorMessage.replace("%s", split[1]);
      errorMessage = errorMessage.replace(
        "%s",
        defaults.formInstances[formIndex].fieldNames[split[0]]
      );
    } else {
      if (
        Object.keys(defaults.formInstances[formIndex].fieldNames).indexOf(
          param.replace("=", "")
        ) >= 0
      ) {
        errorMessage = errorMessage.replace(
          "%s",
          defaults.formInstances[formIndex].fieldNames[param.replace("=", "")]
        );
      } else {
        errorMessage = errorMessage.replace("%s", param.replace("=", ""));
      }
    }
  }

  return errorMessage;
}

/**
 * @private
 * Create and dispatch custom "validated" event
 *
 * @param element | {HTMLElement}
 * @param fieldName | {String}
 */
function dispatchFieldValidationEvent(element, fieldName, formIndex) {
  let fieldData = defaults.formInstances[formIndex].fields.filter(
    obj => obj.name === fieldName
  )[0];
  let event = new CustomEvent("validated", { detail: fieldData });
  element.dispatchEvent(event);
}

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
function validatePartially(args, returnData = false) {
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
}

/**
 * @public
 * Validate whole form
 *
 * @param returnData
 * @returns Boolean or data objects for each passed field
 */
async function validateForm(formId, returnData = false) {
  const formIndex = defaults.formInstances.findIndex(
    obj => obj.formId === formId
  );

  let check = await validatePartiallyArray(
    Object.keys(defaults.formInstances[formIndex].fieldNames),
    formIndex,
    returnData
  );
  return check;
}

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
async function validatePartiallyArray(arr, formIndex, returnData) {
  let check = returnData ? [] : true;

  let resolvedFinalArray = await Promise.all(
    arr.map(async field => {
      const result = await validatePartiallyString(
        field,
        formIndex,
        returnData
      );
      return result;
    })
  );

  if (returnData) {
    check = resolvedFinalArray;
  } else {
    resolvedFinalArray.forEach(bool => {
      check = check && bool;
    });
  }

  return check;
}

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
async function validatePartiallyString(fieldName, formIndex, returnData) {
  let index = defaults.formInstances[formIndex].fields.findIndex(field => {
    return field.name === fieldName;
  });

  if (index === -1) {
    console.warn(
      `Passed argument (${fieldName}) doesn't match any field and it's skipped from the validation. Typo?`
    );
    return false;
  }

  let field = defaults.formInstances[formIndex].fields[index];

  const check = await validateField(field, formIndex);

  if (returnData) {
    return field;
  } else {
    return check;
  }
}

/**
 * @public
 * Add validation method
 *
 * @param name
 * @param fn
 */
function addValMethod(name, fn) {
  hooks[name] = fn;
}

/**
 * @public
 * Add validation message
 *
 * @param name
 * @param message
 */
function addValMessage(name, message) {
  defaults.messages[name] = message;
}

/**
 * @private
 * Process form after it was submitted
 *
 * @param event | {Event}
 */
async function processForm(formId, event) {
  event.preventDefault();

  const check = await validateForm(formId);
  const index = defaults.formInstances.findIndex(obj => obj.formId === formId);

  if (check) {
    defaults.formInstances[index].form.submit();
  } else {
    console.warn(
      `#${defaults.formInstances[index].formId} form has fields that are not valid.`
    );
    return {
      error: `#${defaults.formInstances[index].formId} form has fields that are not valid.`
    };
  }
}

let validationHandlers = {
  validateField: validateField,
  validateWith: validateWith,
  validatePartially: validatePartially,
  validateForm: validateForm,
  validateHidden: validateHidden,
  addValMethod: addValMethod,
  addValMessage: addValMessage,
  processForm: processForm
};

export default validationHandlers;
