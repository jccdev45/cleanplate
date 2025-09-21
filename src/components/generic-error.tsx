import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	ErrorComponent,
	type ErrorComponentProps,
} from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";

type Props = ErrorComponentProps & {
	title?: string;
};

export function GenericErrorComponent({ error, title }: Props) {
	const isDev = Boolean(import.meta.env?.DEV);

	return (
		<div className="min-h-screen p-6 space-y-4">
			{isDev ? <ErrorComponent error={error} /> : null}
			<Alert variant="destructive">
				<AlertCircleIcon />
				<div className="flex flex-col">
					<AlertTitle>Unable to load {title ?? "page"}</AlertTitle>
					<AlertDescription>
						We had trouble loading the data. You can try again or check your
						connection. If the problem persists, contact support.
					</AlertDescription>

					{isDev ? (
						<div className="mt-3 flex flex-col items-center gap-2">
							<Accordion
								className="text-xs text-muted-foreground"
								type="single"
								collapsible
							>
								<AccordionItem value="technical-details">
									<Button variant="outline" asChild>
										<AccordionTrigger className="cursor-pointer">
											Technical Details
										</AccordionTrigger>
									</Button>
									<AccordionContent>
										<pre className="whitespace-pre-wrap mt-2 text-[12px]">
											{error instanceof Error
												? error.message
												: JSON.stringify(error, null, 2)}
										</pre>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						</div>
					) : null}
				</div>
			</Alert>
		</div>
	);
}

export default GenericErrorComponent;
