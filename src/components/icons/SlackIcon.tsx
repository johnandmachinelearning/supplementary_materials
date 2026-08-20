export function SlackIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v5a2.5 2.5 0 0 0 5 0v-5A2.5 2.5 0 0 0 14.5 2z" />
      <path d="M22 9.5a2.5 2.5 0 0 0-2.5-2.5h-5a2.5 2.5 0 0 0 0 5h5A2.5 2.5 0 0 0 22 9.5z" />
      <path d="M9.5 22A2.5 2.5 0 0 0 12 19.5v-5a2.5 2.5 0 0 0-5 0v5A2.5 2.5 0 0 0 9.5 22z" />
      <path d="M2 14.5A2.5 2.5 0 0 0 4.5 17h5a2.5 2.5 0 0 0 0-5h-5A2.5 2.5 0 0 0 2 14.5z" />
    </svg>
  );
}