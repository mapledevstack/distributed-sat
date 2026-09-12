export const formatInteger = (value: number): string =>
  value.toLocaleString("en-US")

export const formatRange = (start: number, end: number): string =>
  `[${formatInteger(start)}, ${formatInteger(end)})`

export const formatPercent = (done: number, total: number): number => {
  if (total <= 0) {
    return 0
  }

  return Math.min(100, Math.round((done / total) * 100))
}

export const shortId = (id: string, chars = 8): string =>
  id.length <= chars ? id : `${id.slice(0, chars)}…`

export const shortWorkerId = (workerId: string | null): string => {
  if (!workerId) {
    return "unassigned"
  }

  const tail = workerId.split("-").pop() ?? workerId

  return tail.length > 10 ? `${tail.slice(0, 10)}…` : tail
}
