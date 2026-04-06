type DashboardSectionPlaceholderProps = {
  title: string;
};

export function DashboardSectionPlaceholder({ title }: DashboardSectionPlaceholderProps) {
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-10 text-center">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">This section is coming soon.</p>
    </div>
  );
}
