import { formatDistanceToNowStrict, parseISO } from "date-fns"

export function formatRelativeTime(dateString: string): string {
  const date = parseISO(dateString)
  return formatDistanceToNowStrict(date, { addSuffix: true })
}

export function formatCfa(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('XAF', 'FCFA').trim();
}
