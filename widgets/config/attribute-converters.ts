import {isEpidemicModelType, type EpidemicModelType} from "../simulation/epidemic-models"

export const booleanAttributeConverter = {
  fromAttribute: (value: string | null): boolean => value !== null && value.toLowerCase() !== "false",
  toAttribute: (value: boolean): string | null => (value ? "" : null),
}

export const numberAttributeConverter = {
  fromAttribute: (value: string | null): number => {
    if (value === null || value === "") {
      return NaN
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : NaN
  },
  toAttribute: (value: number): string | null => (Number.isFinite(value) ? String(value) : null),
}

export const modelTypeAttributeConverter = {
  fromAttribute: (value: string | null): EpidemicModelType => {
    if (value && isEpidemicModelType(value)) {
      return value
    }
    return "sir"
  },
  toAttribute: (value: EpidemicModelType): string => value,
}
