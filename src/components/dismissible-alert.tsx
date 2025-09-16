import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

type Props = {
	title?: string;
	children: React.ReactNode;
	variant?: "default" | "destructive";
	action?: React.ReactNode;
};

export function DismissibleAlert({ title, children, variant, action }: Props) {
	const [open, setOpen] = useState(true);

	if (!open) return null;

	return (
		<Alert variant={variant} className="flex items-start justify-between">
			<div>
				{title && <AlertTitle>{title}</AlertTitle>}
				<AlertDescription>{children}</AlertDescription>
			</div>
			<div className="flex items-center gap-2">
				{action}
				<Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
					<X className="size-4" />
				</Button>
			</div>
		</Alert>
	);
}

export default DismissibleAlert;
