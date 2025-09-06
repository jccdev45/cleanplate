export function Footer() {
	return (
		<footer className="mt-16 py-8 text-center text-muted-foreground border-t border-border animate-in fade-in duration-700">
			<span className="font-mono">
				© {new Date().getFullYear()} Clean Plate NYC
			</span>
		</footer>
	);
}
