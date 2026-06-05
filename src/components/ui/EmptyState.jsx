export default function EmptyState({ icon = 'inbox', title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in-up">
      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-4xl text-outline-variant">{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-on-surface-variant mb-1">{title}</h3>
      {description && <p className="text-sm text-outline max-w-xs">{description}</p>}
    </div>
  );
}
