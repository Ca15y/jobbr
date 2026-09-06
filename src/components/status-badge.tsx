import { STATUS_LABELS, type ApplicationStatus } from "@/types/application";
import { statusTone } from "@/lib/utils";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className="status-badge" data-tone={statusTone(status)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
