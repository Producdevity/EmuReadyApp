import { isString, isBoolean, isNumber, isNullish } from 'remeda'

/**
 * Checks if the value is a JSON primitive.
 * @param value - The value to check.
 */
export function isJsonPrimitive(value: unknown): boolean {
  return isString(value) || isBoolean(value) || isNumber(value) || isNullish(value)
}
