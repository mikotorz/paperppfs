import clsx from 'clsx'

interface Tab {
  id: string
  label: string
}

interface TabBarProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
}

export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className="flex border-b border-zinc-700">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'flex-1 py-2 text-xs font-medium transition-colors',
            active === tab.id
              ? 'text-violet-400 border-b-2 border-violet-500 -mb-px'
              : 'text-zinc-500 hover:text-zinc-300',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
