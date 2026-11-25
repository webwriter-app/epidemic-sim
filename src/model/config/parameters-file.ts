import {CONFIG_SCHEMA, type ConfigSchemaKey} from "./widget-schema"
import {isEpidemicModelType} from "../simulation/epidemic-models"

type Translate = (text: string) => string

/** The parameters of a simulation by property name, as stored in a parameter file. */
export type Parameters = Partial<Record<ConfigSchemaKey, string | number | boolean>>

const KEYS = Object.keys(CONFIG_SCHEMA) as ConfigSchemaKey[]

export function buildParametersJson(values: Record<ConfigSchemaKey, string | number | boolean>): string {
  const parameters = Object.fromEntries(KEYS.map((key) => [key, values[key]]))
  return `${JSON.stringify(parameters, null, 2)}\n`
}

function isValid(key: ConfigSchemaKey, value: unknown): boolean {
  const schema = CONFIG_SCHEMA[key]
  if (schema.kind === "toggle") return typeof value === "boolean"
  if (schema.kind === "select") return typeof value === "string" && isEpidemicModelType(value)
  return typeof value === "number" && Number.isFinite(value) && value >= schema.min && value <= schema.max
}

/** Reads a parameter file completely before anything is applied; unknown keys are ignored. */
export function parseParametersJson(text: string, msg: Translate): Parameters {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(msg("The file is not valid JSON."))
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error(msg("The file holds no epidemic simulation parameters."))
  }
  const record = data as Record<string, unknown>
  const parameters: Parameters = {}
  for (const key of KEYS) {
    if (!(key in record)) continue
    if (!isValid(key, record[key])) {
      throw new Error(`${msg("A parameter value is invalid or out of range")}: ${key}`)
    }
    parameters[key] = record[key] as string | number | boolean
  }
  if (Object.keys(parameters).length === 0) {
    throw new Error(msg("The file holds no epidemic simulation parameters."))
  }
  return parameters
}
