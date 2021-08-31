import defaults from "./_defaults";
import dateHandlers from "./_dateHandlers";
import DOMHandlers from "./_DOMHandlers";

const getDateParts = dateHandlers.getDateParts;
const getDateInstance = dateHandlers.getDateInstance;
const calculateDiffInYears = dateHandlers.calculateDiffInYears;

function getFormIndex(fieldName) {
  const el = document.getElementsByName(fieldName);

  if (el.length > 1) {
    console.warn(
      `You have more than one elemnt with "${fieldName}" name on the page. Some validation methods might not work correctly.`
    );
  }
  const formElement = DOMHandlers.getNearestForm(el[0]);
  const formId = formElement.id;

  return defaults.formInstances.findIndex(obj => obj.formId === formId);
}

/**
 * @public
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
    const formIndex = getFormIndex(matchName);

    let matchField = defaults.formInstances[formIndex].fields.filter(
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

    return field.value.toString().length >= parseInt(length, 10);
  },

  max_length: (field, length) => {
    if (!defaults.regex.numericRegex.test(length)) {
      return false;
    }

    if (field.value === null) {
      return false;
    }

    return field.value.toString().length <= parseInt(length, 10);
  },

  exact_length: (field, length) => {
    if (!defaults.regex.numericRegex.test(length)) {
      return false;
    }

    if (field.value === null) {
      return false;
    }

    return field.value.toString().length === parseInt(length, 10);
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
    now.setHours(0, 0, 0, 0);

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
    now.setHours(0, 0, 0, 0);

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
    const fieldName = param.replace("=", "");
    const formIndex = getFormIndex(fieldName);

    let paramField = defaults.formInstances[formIndex].fields.filter(
      obj => obj.name === fieldName
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
    const fieldName = param.replace("=", "");
    const formIndex = getFormIndex(fieldName);

    let paramField = defaults.formInstances[formIndex].fields.filter(
      obj => obj.name === fieldName
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
    const date = getDateInstance(field.value);
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
    const formIndex = getFormIndex(fieldAgainst);

    const fieldAgainstData = defaults.formInstances[formIndex].fields.filter(
      obj => obj.name === fieldAgainst
    )[0];

    if (!fieldAgainstData.value) {
      return true;
    }

    const years = paramSplit[1];
    const fieldDate = getDateInstance(field.value);
    const fieldAgainstDate = getDateInstance(fieldAgainstData.value);

    return calculateDiffInYears(fieldDate, fieldAgainstDate) >= years;
  },

  min_years_in_past: (field, param) => {
    const fieldDate = getDateInstance(field.value);
    let now = new Date();
    now.setHours(0, 0, 0, 0);

    return calculateDiffInYears(fieldDate, now) >= param;
  },

  max_years_in_past: (field, param) => {
    const fieldDate = getDateInstance(field.value);
    let now = new Date();
    now.setHours(0, 0, 0, 0);

    return calculateDiffInYears(fieldDate, now) <= param;
  },

  valid_email: field => {
    return defaults.regex.emailRegex.test(field.value);
  },

  uk_postcode: field => {
    const postcode = field.value.replace(/\s/g, "");

    if (postcode.length > 7 || postcode.length < 5) {
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

export default hooks;
