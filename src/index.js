import validationHandlers from "./_inc/_validationHandlers";
import formHandlers from "./_inc/_formHandlers";

const valForm = {
  init: formHandlers.initializeForm,
  destroyForm: formHandlers.destroyForm,
  partialValidation: validationHandlers.validatePartially,
  validateForm: validationHandlers.validateForm,
  validateHidden: validationHandlers.validateHidden,
  addValMethod: validationHandlers.addValMethod,
  addValMessage: validationHandlers.addValMessage
};

export default valForm;
