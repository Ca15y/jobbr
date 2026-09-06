import type { Icon } from "@phosphor-icons/react";
import { BriefcaseIcon } from "@phosphor-icons/react/ssr";

export function EmptyState({
  title,
  description,
  action,
  icon: IconComponent = BriefcaseIcon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: Icon;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-inner">
        <span className="empty-state-icon" aria-hidden="true">
          <IconComponent size={23} />
        </span>
        <h2>{title}</h2>
        <p>{description}</p>
        {action}
      </div>
    </div>
  );
}
