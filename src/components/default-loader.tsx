export function DefaultLoader({ text }: { text?: string }) {
	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<div className="flex flex-col items-center gap-2">
				<svg
					className="animate-spin h-12 w-12 text-primary"
					viewBox="3 3 18 18"
				>
					<title>Loading spinner</title>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="9"
						stroke="currentColor"
						strokeWidth="2"
						fill="none"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M12 3c-1.306 0-2.417.835-2.83 2h-3.17v3h3.17c.413 1.165 1.524 2 2.83 2s2.417-.835 2.83-2h3.17v-3h-3.17c-.413-1.165-1.524-2-2.83-2z"
					/>
				</svg>
				<p className="text-muted-foreground">{text || "Loading..."}</p>
			</div>
		</div>
	);
}
