import { Button } from "@/components/ui/button";
import {
	ErrorComponent,
	Link,
	rootRouteId,
	useMatch,
	useRouter,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
	const router = useRouter();
	const isRoot = useMatch({
		strict: false,
		select: (state) => state.id === rootRouteId,
	});

	console.error(error);

	const isDev = Boolean(import.meta.env?.DEV);

	return (
		<div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
			{isDev ? (
				<>
					<ErrorComponent error={error} />
					<div className="flex gap-2 items-center flex-wrap">
						<Button
							onClick={() => {
								router.invalidate();
							}}
						>
							Try Again
						</Button>
						{isRoot ? (
							<Button asChild variant="link">
								<Link to="/">Home</Link>
							</Button>
						) : (
							<Button asChild variant="link">
								<Link
									to="/"
									onClick={(e) => {
										e.preventDefault();
										window.history.back();
									}}
								>
									Go Back
								</Link>
							</Button>
						)}
					</div>
				</>
			) : (
				<div className="text-center">
					<p className="mb-4">
						We had trouble loading the page. You can try again or check your
						connection. If the problem persists, contact support.
					</p>
					<div className="flex gap-2 items-center justify-center">
						<Button
							onClick={() => {
								router.invalidate();
							}}
						>
							Try Again
						</Button>
						{isRoot ? (
							<Button asChild variant="link">
								<Link to="/">Home</Link>
							</Button>
						) : (
							<Button asChild variant="link">
								<Link
									to="/"
									onClick={(e) => {
										e.preventDefault();
										window.history.back();
									}}
								>
									Go Back
								</Link>
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
