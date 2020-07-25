export default function stringToBool(s: string): boolean {
  if (/^(true|[1-9][0-9]*|y(?:es)?|on)$/i.test(s)) return true
  if (/^(false|0|n(?:o)?|off)$/i.test(s)) return false
  throw new Error(
    `Invalid value '${s}' given. Use one of true|y|yes|on|false|n|no|off or a number.`
  )
}
