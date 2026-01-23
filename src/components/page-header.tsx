import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-8", className)}>
      <div className="grid gap-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-base sm:text-lg text-gray-600">{description}</p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
