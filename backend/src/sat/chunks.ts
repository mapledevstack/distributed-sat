export interface SearchChunk {
  start: number
  end: number
}

export const splitSearchSpace = (
  totalAssignments: number,
  chunkSize: number,
): SearchChunk[] => {
  const chunks: SearchChunk[] = []

  for (let start = 0; start < totalAssignments; start += chunkSize) {
    chunks.push({ start, end: Math.min(start + chunkSize, totalAssignments) })
  }

  return chunks
}

export const countChunks = (
  totalAssignments: number,
  chunkSize: number,
): number => Math.ceil(totalAssignments / chunkSize)
