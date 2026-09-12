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

  return ensureNonEmptySearch(chunks)
}

const ensureNonEmptySearch = (chunks: SearchChunk[]): SearchChunk[] => {
  if (chunks.length > 0) {
    return chunks
  }

  return [{ start: 0, end: 0 }]
}

export const countChunks = (
  totalAssignments: number,
  chunkSize: number,
): number => Math.max(1, Math.ceil(totalAssignments / chunkSize))

export const pickChunkSize = (
  totalAssignments: number,
  desiredChunksPerWorker = 4,
  workerCount = 4,
  minChunkSize = 8,
  maxChunks = 256,
): number => {
  if (totalAssignments <= minChunkSize) {
    return minChunkSize
  }

  const desiredChunks = Math.min(maxChunks, workerCount * desiredChunksPerWorker)
  const idealSize = Math.ceil(totalAssignments / desiredChunks)

  return Math.max(minChunkSize, idealSize)
}
