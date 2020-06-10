import defaults from "./_defaults";
import validationHandlers from "./_validationHandlers";
import DOMHandlers from "./_DOMHandlers";

const validateField = validationHandlers.validateField;
const validateWith = validationHandlers.validateWith;
const processForm = validationHandlers.processForm;
const getNearestForm = DOMHandlers.getNearestForm;

/**
 * @public
 * Main method to initialize form and getting all fields
 *
 * @param args | {Object}
 */
function initializeForm(args) {
  if (!args) {
    console.warn(
      'valForm requires config object with at least "formID" element to work with.'
    );
    return false;
  }

  if (!args.formId) {
    console.warn('valForm requires "formID" element to work with.');
    return false;
  }

  defaults.form_config = { ...defaults.form_config, ...args };
  let form = getFormInstance(args.formId);

  if (!form) {
    console.warn("No form element found on the page.");
    return false;
  }

  const formId = args.formId;
  const fields = createAllFields(args.formId);
  const fieldNames = getFormFieldsNames(fields);

  defaults.formInstances.push({
    formId,
    form,
    fields,
    fieldNames
  });
}

/**
 * @private
 * Get form instance and add listener
 *
 * @param formId | {String}
 * @returns Form instance
 */
function getFormInstance(formId) {
  let form = document.getElementById(formId);

  if (!form) {
    return false;
  }

  form.addEventListener("submit", processForm.bind(this, formId));

  attachDOMObserver(form, formId);

  return form;
}

/**
 * @private
 * Attach hook to observe if DOM has changed -
 * in case there are dynamic fields added to DOM
 *
 * @param form | {HTMLElement}
 */
function attachDOMObserver(form, formId) {
  // Options for the observer (which mutations to observe)
  let mutationConfig = { attributes: false, childList: true, subtree: true };

  // Create an observer instance linked to the callback function
  const newObserver = {
    formId,
    observer: new MutationObserver(mutationCallback(formId))
  };

  // Start observing the target node for configured mutations
  newObserver.observer.observe(form, mutationConfig);

  defaults.DOMObservers.push(newObserver);
}

/**
 * @private
 * Callback function to execute when mutations are observed
 *
 * @param formId
 */
function mutationCallback(formId) {
  return function () {
    // console.log('DOM has changed');
    let newFields = createAllFields(formId);

    const index = defaults.formInstances.findIndex(
      obj => obj.formId === formId
    );

    defaults.formInstances[index].fields = mergedArrays(
      defaults.formInstances[index].fields,
      newFields
    );

    defaults.formInstances[index].fieldNames = getFormFieldsNames(
      defaults.formInstances[index].fields
    );
  };
}

/**
 * @private
 * Merged two arrays of objects
 *
 * @param formFields | {Array}
 * @param newFields | {Array}
 * @returns Array
 */
function mergedArrays(formFields, newFields) {
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
}

/**
 * @private
 * Get form field display names
 * to be able to create correct error messages
 *
 * @returns Object of field names with name attributes as keys
 */
function getFormFieldsNames(fields) {
  let names = {};

  for (let obj of fields) {
    names[obj.name] = obj.display;
  }

  return names;
}

/**
 * @private
 * Get all fields with validation rules
 *
 * @returns Array of all form fields
 */
function createAllFields(formId) {
  let formFields = [];
  let fieldNodeList = null;

  fieldNodeList = document.querySelectorAll(`#${formId} [data-val-rules]`);

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
}

/**
 * @private
 * Add new field when initializing the form
 *
 * @param field | {HTMLElement}
 * @returns Object with all field attributes we might need
 */
function addField(field) {
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
}

/**
 * @private
 * Process field chang
 *
 * @param formId | {string}
 */
function fieldChanged(event) {
  const formElement = getNearestForm(event.target);
  const formId = formElement.id;

  const formIndex = defaults.formInstances.findIndex(
    obj => obj.formId === formId
  );

  let index = defaults.formInstances[formIndex].fields.findIndex(field => {
    return field.name === event.target.name;
  });

  if (event.target.type === "checkbox" || event.target.type === "radio") {
    const validCheckboxes = document.querySelectorAll(
      'input[name="' + event.target.name + '"]:checked'
    );
    if (validCheckboxes.length > 0) {
      defaults.formInstances[formIndex].fields[index].checked = true;
      defaults.formInstances[formIndex].fields[index].value = [];
      for (let box of validCheckboxes) {
        defaults.formInstances[formIndex].fields[index].value.push(box.value);
      }
    } else {
      defaults.formInstances[formIndex].fields[index].checked = false;
      defaults.formInstances[formIndex].fields[index].value = [];
    }
  } else {
    defaults.formInstances[formIndex].fields[index].value = event.target.value;
  }

  validateField(defaults.formInstances[formIndex].fields[index], formIndex);

  // re-validate field connected to this one
  validateWith(defaults.formInstances[formIndex].fields[index].with, formIndex);
}

let formHandlers = {
  initializeForm: initializeForm
};

export default formHandlers;
