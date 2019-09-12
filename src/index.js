const validationHandlers = require("./_inc/_validationHandlers");
const formHandlers = require("./_inc/_formHandlers");

const valForm = {
  init: formHandlers.initializeForm,
  partialValidation: validationHandlers.validatePartially,
  validateForm: validationHandlers.validateForm,
  validateHidden: validationHandlers.validateHidden,
  addValMethod: validationHandlers.addValMethod,
  addValMessage: validationHandlers.addValMessage
};

module.exports = valForm;
