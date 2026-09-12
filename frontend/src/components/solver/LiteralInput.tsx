import { Button } from "@/components/ui/button.tsx"

type LiteralInputProps = {
  value: string
  showOrSeparator: boolean
  onChange: (value: string) => void
  onRemove: () => void
}

export const LiteralInput = ({
  value,
  showOrSeparator,
  onChange,
  onRemove,
}: LiteralInputProps) => {
  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-20 rounded-md border bg-background px-3 text-center font-mono text-sm transition outline-none focus:ring-2 focus:ring-ring"
        placeholder="A"
      />

      {showOrSeparator && (
        <span className="text-xs font-medium text-muted-foreground">OR</span>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onRemove}
        aria-label={`Remove literal ${value}`}
      >
        ×
      </Button>
    </div>
  )
}
