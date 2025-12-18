import { formatDistanceToNowStrict, parseISO } from "date-fns"

export function formatRelativeTime(dateString: string): string {
  const date = parseISO(dateString)
  return formatDistanceToNowStrict(date, { addSuffix: true })
}

