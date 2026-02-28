export default function SectionHeader({ title, description, className = "" }: { title: string; description?: string; className?: string }) {
    return (
        <div className={`mb-5 mt-8 first:mt-2 ${className}`}>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h2>
            {description && <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>
    );
}
