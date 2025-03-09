import moment from "moment";

const currentDate = new Date();

export const year = currentDate.getFullYear();
export const month = currentDate.getMonth() + 1;
export const day = currentDate.getDate();

export const currentDateToString = moment().format("YYYY-MM-DD");