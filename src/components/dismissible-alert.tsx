import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

type Props = {
	title?: string;
	children: React.ReactNode;
	variant?: "default" | "destructive";
	action?: React.ReactNode;
	/**
	 * If false, the alert cannot be dismissed (close button hidden).
	 * Default: true
	 */
	isActuallyDismissable?: boolean;
	/**
	 * Optional leading icon to display next to the title.
	 */
	icon?: React.ReactNode;
};

export function DismissibleAlert({
	title,
	children,
	variant,
	action,
	isActuallyDismissable = true,
	icon = null,
}: Props) {
	const [open, setOpen] = useState(true);

	if (!open) return null;

	return (
		<Alert variant={variant} className="flex items-start justify-between">
			<div>
				{title && (
					<div className="flex items-center gap-2">
						{icon}
						<AlertTitle>{title}</AlertTitle>
					</div>
				)}
				<AlertDescription>{children}</AlertDescription>
			</div>
			<div className="flex items-center gap-2">
				{action}
				{isActuallyDismissable ? (
					<Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
						<X className="size-4" />
					</Button>
				) : null}
			</div>
		</Alert>
	);
}

export default DismissibleAlert;
