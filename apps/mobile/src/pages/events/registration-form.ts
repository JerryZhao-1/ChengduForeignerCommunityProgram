export const PHONE_NUMBER_LENGTH = 11;

export const normalizePhoneNumber = (value: string) =>
  value.replace(/\D/g, "").slice(0, PHONE_NUMBER_LENGTH);

export const isValidPhoneNumber = (value: string) =>
  normalizePhoneNumber(value).length === PHONE_NUMBER_LENGTH;
