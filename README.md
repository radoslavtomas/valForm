## valForm

valForm is lightweight javascript form validation library (26kb minified, 8kb gzip) inspired by Rick Harrison's validate.js - [http://rickharrison.github.io/validate.js](http://rickharrison.github.io/validate.js).

valForm does not have any dependencies, it's fully customizable and provides some basic validation methods and also tools to easily change/add different methods to your liking and needs. It will also accept asynchronous validation methods.

You should not forget about strong server side validation as well!

valForm uses javascript MutationObserver interface to watch for changes on the DOM which means it will always have fresh state of your form fields even these would be added dynamically.

### Installation

```javascript
npm install valform
```

### Usage

```javascript
import valForm from "valform";
valForm.init();
```

You would want to initialize valForm on the page where you have your form element. Form needs to be in the DOM so if you are using frameworks like react or vue etc. you need to place valForm.init method to respective lifecyle methods (e.g. in react to "componentDidMount()" or in vue to "mounted()").

### Configuration

#### HTML "data" attributes

###### data-val-rules

valForm will work out of the box. The only requirement is to place "data-val-rules" attribute to your inputs with at least 1 rule defined, e.g.:

```html
<input type="text" name="address" data-val-rules="required" />
```

If you need to apply more than one rule separate the rules with a pipe: |

```html
<input type="text" name="address" data-val-rules="required|max_length[32]" />
```

###### data-val-display

If not specified otherwise then "name" attribute will be used for validation message. Normally though you would want to specify this in most cases:

```html
<input
  type="text"
  name="dob"
  data-val-rules="required"
  data-val-dispaly="Date of birth"
/>
```

In case of error this would produce error message:
_The Date of birth field is required._

###### data-val-allow-empty

Sometimes the field is optional (it's not required) but if it contains value you might want to validate it:

```html
<input
  type="tel"
  name="phone"
  id="phone"
  data-val-rules="numeric|uk_phonenumber"
  data-val-allow-empty="true"
/>
```

In this case the field can be empty and would validate as valid but as soon as there's a value it will be validated against the specified rules.

###### data-val-with

There might be cases when you need to validate two fields against each other, e.g. date of birth field against insurance policy inception date. Then you just need to provide "name" attribute of that field:

```html
<input
  type="text"
  name="dob"
  data-val-rules="required|years_between[17]"
  data-val-with="inception"
/>
<input
  type="text"
  name="dob"
  data-val-rules="required|years_between[17]"
  data-val-with="dob"
/>
```

#### Config object

You can configure valForm with a simple object:

```javascript
const valConfig = {
  formId: "my-form",
  validationErrorClass: "not-valid",
  validationValidClass: "valid",
  errorElement: "div",
  appendAfter: "input-form",
  dateFormat: "YYYY-mm-dd"
};

valForm.init(valConfig);
```

**formId**: this might be useful if you need to handle more than one form on a page, e.g. you have main form with several fields and then small one for newsletter subscription. In that case you can specify which form shall be handled when submit button is pressed. **NB:** _You can handle validation programmatically..._

@TODO: link to programmatic way

**validationErrorClass**: by default it's "val--error",

**validationValidClass**: by default it's "val--valid",

**errorElement**: by default it's "small",

**appendAfter**: class of an element after which should be errorElement appended. By default error element will come staright after input field,

**dateFormat**: specify which date format you are using, by default it's 'mm/dd/YYYY', available ones are:

```javascript
"dd/mm/YYYY", "YYYY-mm-dd", "mm/dd/YYYY", "isoDateTime";
```

#### Custom validation methods

Adding custom methods is straightforward:

```javascript
valForm.addValMethod("greater_than_6", field => {
  return field.value > 6;
});
```

You just need to return true or false at the end. Also, you will automatically have an access to a "field" object that might look like this:

```javascript
{
    allowEmpty: false,
    display: "Date of birth",
    error: null,
    name: "dob",
    rules: ["required"],
    type: "text",
    valid: false,
    value: '05/05/1980',
    visited: false,
    with: null
}
```

Most of the time you will only need to work with "value" property.

**NB:** You can add these methods even inside your (react/vue...) components and use for validation data properties defined in there.

Naturally, you will need to add then your custom validation message:

```javascript
valForm.addValMessage("greater_than_6", "The number must be greater than 6.");
```

Use "%s" placeholder to specify field name:

```html
'The %s field must be greater than 6.'
```

This will transform to (let's assume "Number of months" field):

```html
'The Number of months field must be greater than 6.'
```

**NB:** if used to add new methods and messages then "addValMethod" and "addValMessage" must be used together for the validation to work properly. Alternatively, you can use it to overwrite any method or to adjust validation message to your liking.

#### Messages with dynamic additions

Because some methods can have optional parameters there are some messages that may or may not have additions to them, e.g.:

Method "greater_than" can accept number parameter which can start (but doesn't have to) with equals sign: greater_that[20] or greater_than[=20]. The latter will include parameter to comparison and add to error message this addition: 'It can be equal to it.'

So the whole message in case or error would be: The %s field must contain a number greater than %s. It can be equal to it.

There are two possible additions:

- equals_addition: 'It can be equal to it.' => when dealing with numbers
- date_addition: 'It can be today.' => when dealing with dates

If you need to change this messages you can also use addValMessage method provided to you:

```javascript
valForm.addValMessage("equals_addition", "Can be the same"); // changing
valForm.addValMessage("equals_addition", ""); // removing
```

##### Validation methods with optional dynamic additions

- greater_than (equals_addition)
- less_than (equals_addition)
- date_greater_than (equals_addition)
- date_less_than (equals_addition)
- date_in_past (date_addition)
- date_in_future (date_addition)

#### Asynchronous validation

In this case the only thing you need to do is to provide an asynchronous validation method that will return a promise, it can look something like this:

```javascript
valForm.addValMethod("async_validation", async (field) => {
  return new Promise((resolve, reject) => {
    try {
      const data = await fetch(`http://example.com/validate?value=${field.value}`);
      const result = await data.json();
      resolve(result.validity);
    } catch (error) {
      console.error(error);
      reject(false);
    }
  });
});
```

### Programmatic validation

#### Validating the whole form

If you want to be in a control of the whole validation process you can use "validateForm" method. Note that this is asynchronous process so it needs to be handled asynchronously, e.g.:

```javascript
async function handleFormSubmission(event) {
    // prevent form from submitting
    event.preventDefault();
    const formEl = document.getElementById('my_form');    

    const check = await valForm.validateForm();
    
    if(check) {
        formEl.submit();
    } else {
        console.log('Form is not valid');
        // your own logic
    }
}
```

It will return true if the whole form is valid or false if not.

If you pass optional boolean parameter (true) it will return an object containing every field with all the attributes as shown above. So you can process it any way you like.

#### Validating form partially

There's also a method to partially validate only few fields:

```javascript
const check = await valForm.partialValidation(["name", "dob"], true);
```

First parameter is required and can be either string (if it's one field) or array (more fields). This expects name attributes of the fields. Again, optional second parameter controls if the return value is boolean or the object with passed fields' information.

#### Handling validation of hidden inputs

There might be cases when you build your own custom inputs using hidden inputs which should be validated. As the input and change events do not apply to hidden input types you can control this with a helper method:

```javascript
const check = await valForm.validateHidden(name, value);
```

This method accepts two parameters - name attribute and the value of an input. For now this method does not accept third parameter to return the the object with field information. (in progress)

**NB:** _Using "data-val-rules" on hidden inputs and not handling validation with this method will cause form validation to fail._

### Hooks

Validation of any field will dispatch custom "validated" event which you can use to hook up to. It can look like this:

```javascript
let elem = document.getElementsByName("email")[0];
elem.addEventListener("validated", event => {
  console.log("Email has been validated");
  console.log(event.detail);
  // any callback you need
});
```

### Supported inputs

1. text
2. number
3. tel
4. textarea
5. select
6. radio
7. checkbox

### Validation methods & examples

#### required

_Checks if the form element is empty._

**Error message:** 'The %s field is required.'

#### matches

_Checks if the form element value match the one in parameter._

**Error message:** 'The %s field does not match the %s field.'

**Usage:** matches[field_name]

**Example:** matches[email_verify]

#### min_length

_Checks if the form element value is shorter than the parameter._

**Error message:** 'The %s field must be at least %s characters in length.'

**Usage:** min_length[Number]

**Example:** min_length[3]

#### max_length

_Checks if the form element value is longer than the parameter._

**Error message:** 'The %s field must not exceed %s characters in length.'

**Usage:** max_length[Number]

**Example:** max_length[32]

#### exact_length

_Checks if the form element value matches the parameter._

**Error message:** 'The %s field must be exactly %s characters in length.'

**Usage:** exact_length[Number]

**Example:** exact_length[11]

#### greater_than

_Checks if the form element is greater (non-greedy) than the parameter after using parseFloat._

**Error message:** 'The %s field must contain a number greater than %s.'

**Options:** If you pass equals sign in front of the number then the method would check if the form element is greater or equal to the parameter. **NB:** If "=" is passed error message will contain addition: 'It can be equal to it.'

**Usage:** greater_than[Number], greater_than[=Number]

**Example:**

- greater_than[20] => must be 21 or more
- greater_than[=20] => must be 20 or more

#### less_than

_Checks if the form element is less (non-greedy) than the parameter after using parseFloat._

**Error message:** 'The %s field must contain a number less than %s.'

**Options:** If you pass equals sign in front of the number then the method would check if the form element is less or equal to the parameter. **NB:** If "=" is passed error message will contain addition: 'It can be equal to it.'

**Usage:** less_than[Number], less_than[=Number]

**Example:**

- less_than[20] => can't be 21 or more
- less_than[=20] => can't be 20 or more

#### numeric

_Checks if form element contains only numeric characters._

**Error message:** 'The %s field must contain only numbers.'

#### integer

_Checks if form element value is integer._

**Error message:** 'The %s field must be an integer.'

#### decimal

_Checks if form element value is a decimal._

**Error message:** 'The %s field must contain a decimal number.'

#### is_natural

_Checks if form element contains anything other than a natural number: 0, 1, 2, 3, etc._

**Error message:** 'The %s field must contain only positive numbers.'

#### is_natural_no_zero

_Checks if form element contains anything other than a natural number, but not zero: 1, 2, 3, etc._

**Error message:** 'The %s field must contain a number greater than zero.'

#### valid_ip

_Checks if form element value is valid IP._

**Error message:** 'The %s field must contain a valid IP.'

#### valid_base64

_Checks if form element value contains only valid base64 characters._

**Error message:** 'The %s field must contain a base64 string.'

#### valid_credit_card

_Checks if form element value is valid credit card._

**Error message:** 'The %s field must contain a valid credit card number.'

#### is_year

_Checks if form element value is year - in this case if it contains 4 digits (2019 => valid, 105 => not valid)._

**Error message:** 'The %s field must be a valid year.'

#### year_in_past

_Checks if form element value is year in the past._

**Error message:** 'The %s field must be current year or in the past.'

#### years_between

_Checks if specified amount of years have passed between this form element value and another specified field in the form._

**Error message:** 'The %s date must be %s years after %s date.'

**Usage:** years_between[field_name:Number]

**Example:** years_between[date_of_birth:18]

#### min_years_in_past

_Checks if form element date is at least specified amount of years in the past._

**Error message:** 'The %s date must be at least %s years in the past.'

**Usage:** min_years_in_past[Number]

**Example:** min_years_in_past[18]

#### max_years_in_past

_Checks if form element date is no more than specified amount of years in the past._

**Error message:** 'The %s date must be no more than %s years in the past.'

**Usage:** max_years_in_past[Number]

**Example:** min_years_in_past[99]

#### valid_date

_Checks if form element value is a valid date._

**Error message:** 'The %s field must be a valid date.'

#### date_in_past

_Checks if form element date is in the past (non-greedy)._

**Error message:** 'The %s field must be in the past.'

**Options:** If you pass equals sign in front of the field name then the method would check if the form element value is less than or equal to the present day. **NB:** If "=" is passed error message will contain addition: 'It can be today.'

**Usage:** date_in_past[], date_in_past[=]

**Example:**

- date_in_past[] => must be less than today's date
- date_in_past[=] => must be equal to or less than today's date

**NB:** Method to calculate today's date:

```javascript
let today = new Date();
today.setUTCHours(0, 0, 0, 0);
```

#### date_in_future

_Checks if form element date is in the future (non-greedy)._

**Error message:** 'The %s field must be in the future.'

**Options:** If you pass equals sign in front of the field name then the method would check if the form element value is greater than or equal to the present day. **NB:** If "=" is passed error message will contain addition: 'It can be today.'

**Usage:** date_in_future[], date_in_future[=]

**Example:**

- date_in_future[] => must be greater than today's date
- date_in_future[=] => must be equal to or greater than today's date

**NB:** Method to calculate today's date:

```javascript
let today = new Date();
today.setUTCHours(0, 0, 0, 0);
```

#### date_greater_than

_Checks if form element date is greater (non-greedy) than the date of the specified field._

**Error message:** 'The %s date must be greater than %s date.'

**Options:** If you pass equals sign in front of the field name then the method would check if the form element value is greater or equal to the parameter's date. **NB:** If "=" is passed error message will contain addition: 'It can be equal to it.'

**Usage:** date_greater_than[field_name], date_greater_than[=field_name]

**Example:**

- date_greater_than[date_of_birth] => must be greater than date_of_birth's value
- date_greater_than[=date_of_birth] => must be equal to or greater than date_of_birth's value

#### date_less_than

_Checks if form element date is less (non-greedy) than the date of the specified field._

**Error message:** 'The %s date must be less than %s date.'

**Options:** If you pass equals sign in front of the field name then the method would check if the form element value is less or equal to the parameter's date. **NB:** If "=" is passed error message will contain addition: 'It can be equal to it.'

**Usage:** date_less_than[field_name], date_less_than[=field_name]

**Example:**

- date_less_than[inception_date] => must be less than inception_date's value
- date_less_than[=inception_date] => must be equal to or less than inception_date's value

#### valid_email

_Checks if form element value is a valid email._

**Error message:** 'The %s field must contain a valid email address.'

#### uk_postcode

_Checks if form element value is a UK postcode._

**Error message:** 'The %s field must be a valid UK postcode.'

#### uk_phonenumber

_Checks if form element value is a valid UK phone number._

**Error message:** 'The %s field must be UK phone number'

#### valid_url

_Checks if form element value is a valid URL._

**Error message:** 'The %s field must contain a valid URL.'

### Used regular expression

This is a list of regex used in the library, feel free to change validation methods using your own regular expressions / logic.

```javascript
{
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
    dateRegex: /\d{4}-\d{1,2}-\d{1,2}/,
}
```

**NB:** dateRegex might be different according to the date format passed through configuration.
