import validationHandlers from "./_inc/_validationHandlers";
import formHandlers from "./_inc/_formHandlers";

const valForm = {
  init: formHandlers.initializeForm,
  partialValidation: validationHandlers.validatePartially,
  validateForm: validationHandlers.validateForm,
  validateHidden: validationHandlers.validateHidden,
  addValMethod: validationHandlers.addValMethod,
  addValMessage: validationHandlers.addValMessage
};

// module.exports = valForm;
export default valForm;

// export default function valForm () {
//   return {
//     init: formHandlers.initializeForm,
//     partialValidation: validationHandlers.validatePartially,
//     validateForm: validationHandlers.validateForm,
//     validateHidden: validationHandlers.validateHidden,
//     addValMethod: validationHandlers.addValMethod,
//     addValMessage: validationHandlers.addValMessage
//   }
// };
