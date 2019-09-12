let defaults = require("./_defaults");
let validationHandlers = require("./_validationHandlers");

const validateField = validationHandlers.validateField;
const validateWith = validationHandlers.validateWith;
const processForm = validationHandlers.processForm;

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

const formHandlers = {
  initializeForm: initializeForm
};

module.exports = formHandlers;
