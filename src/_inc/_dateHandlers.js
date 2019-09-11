import defaults from "./_defaults";

/**
 * @private
 * Create date parts
 *
 * Helper function for getDateParts
 *
 * @param date
 * @param delimiter
 * @param order
 * @param regex
 * @returns Object with day, month and year values
 */
const createDateParts = (date, delimiter, order, regex) => {
  if (!date.match(regex)) {
    return false;
  }

  let dateParts = {
    day: null,
    month: null,
    year: null
  };

  let dateArray = date.split(delimiter);

  dateParts.day = dateArray[order.day];
  dateParts.month = dateArray[order.month];
  dateParts.year = dateArray[order.year];

  return dateParts;
};

/**
 * @public
 * Get date parts
 *
 * Returns object that can be used for validation
 *
 * @param date
 * @returns Object with day, month and year values
 */
const getDateParts = date => {
  const dateFormat = defaults.form.dateFormat;

  if (defaults.supportedDateFormats.indexOf(dateFormat) < 0) {
    console.error("Date format not recognised.");
    return false;
  }

  if (dateFormat === "dd/mm/YYYY") {
    const regex = /\d{2}\/\d{2}\/\d{4}/;
    const order = { day: 0, month: 1, year: 2 };
    return createDateParts(date, "/", order, regex);
  }

  if (dateFormat === "YYYY-mm-dd") {
    const regex = /\d{4}-\d{2}-\d{2}/;
    const order = { day: 2, month: 1, year: 0 };
    return createDateParts(date, "-", order, regex);
  }

  if (dateFormat === "mm/dd/YYYY") {
    const regex = /\d{2}\/\d{2}\/\d{4}/;
    const order = { day: 1, month: 2, year: 2 };
    return createDateParts(date, "/", order, regex);
  }

  if (dateFormat === "isoDateTime") {
    const dateOnly = date.split("T")[0];
    const regex = /\d{4}-\d{2}-\d{2}/;
    const order = { day: 2, month: 1, year: 0 };
    return createDateParts(dateOnly, "-", order, regex);
  }
};

/**
 * @public
 * Calculate difference between two dates in years
 * @param date1
 * @param date2
 * @returns true or false
 */
const calculateDiffInYears = (date1, date2) => {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  let years = diff / (1000 * 60 * 60 * 24 * 365.2422);
  if (
    years
      .toString()
      .split(".")[1]
      .startsWith("999")
  ) {
    return Math.ceil(years);
  }
  return diff / (1000 * 60 * 60 * 24 * 365.2422);
};

/**
 * @public
 * Get formatted date instance
 *
 * @param date
 * @returns Date
 */
const getDateInstance = date => {
  const dateParts = getDateParts(date);
  const dateInstance = new Date(
    `${dateParts.year}-${dateParts.month}-${dateParts.day} 00:00`
  );
  return dateInstance;
};

const dateHandlers = {
  getDateParts: getDateParts,
  getDateInstance: getDateInstance,
  calculateDiffInYears: calculateDiffInYears
};

module.exports = dateHandlers;
