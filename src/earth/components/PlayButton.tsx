interface PlayButtonProps {
  isPlaying: boolean
  onToggle: () => void
  label: string
}

export function PlayButton({ isPlaying, onToggle, label }: PlayButtonProps) {
  return (
    <button
      type="button"
      className={`earth-play ${isPlaying ? 'is-playing' : ''}`}
      onClick={onToggle}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? `Pause ${label}` : `Play ${label}`}
    >
      <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} aria-hidden="true" />
    </button>
  )
}
