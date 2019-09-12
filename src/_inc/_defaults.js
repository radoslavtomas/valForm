/**
 *  * @public
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

module.exports = defaults;
