import validationHandlers from './_inc/_validationHandlers'
import formHandlers from './_inc/_formHandlers'

exports.valForm = () => {
    init: formHandlers.initializeForm,
    partialValidation: validationHandlers.validatePartially,
    validateForm: validationHandlers.validateForm,
    validateHidden: validationHandlers.validateHidden,
    addValMethod: validationHandlers.addValMethod,
    addValMessage: validationHandlers.addValMessage,
};
