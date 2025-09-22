import type { SVGProps } from "react";

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 64 64"
			width="32"
			height="32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			{...props}
		>
			{/* Plate */}
			<circle
				cx="32"
				cy="28"
				r="20"
				fill="#F8FAFC"
				stroke="#94A3B8"
				strokeWidth="2"
			/>
			<circle
				cx="32"
				cy="28"
				r="14"
				fill="#E6EEF6"
				stroke="#60A5FA"
				strokeWidth="1.5"
			/>

			{/* Apple / cleanliness hint: stylized apple with a leaf and subtle sparkle */}
			<g transform="translate(18 12) scale(0.9)">
				<path
					d="M18 10.5c0-3.2-2.6-6.5-6.9-6.5-3 0-4.8 1.7-6 3.1-1.2 1.3-2.1 3.6-2.1 5.9 0 4.1 3.4 8.3 8 8.3 4.7 0 7-3.6 7-10.8z"
					fill="#F97316"
				/>
				<path
					d="M12.5 3.2c1.2-.6 3.1-.7 4.2.2.2.2.2.5 0 .7-.9.8-2.8.9-4.1.7-.2 0-.4-.2-.3-.4.2-.5.4-1.1.2-1.2z"
					fill="#15803D"
					opacity="0.95"
				/>
			</g>

			{/* Cutlery: fork + spoon, subtle and centered */}
			<g transform="translate(28 22) rotate(-15) scale(0.8)">
				<rect x="-1" y="-6" width="2" height="18" rx="1" fill="#334155" />
				<path
					d="M0 10c2 0 2.5-1 2.5-2.5S2 5 0 5-2.5 5.5-2.5 7.5  -1.5 10 0 10z"
					fill="#334155"
				/>
				<rect
					x="6"
					y="-6"
					width="2"
					height="18"
					rx="1"
					fill="#334155"
					transform="translate(0 0)"
				/>
				<path
					d="M7 10c1.2 0 2-.8 2-2s-.8-2-2-2-2 .8-2 2 .8 2 2 2z"
					fill="#334155"
				/>
			</g>

			{/* sparkle to hint "clean" */}
			<g transform="translate(46 10)" fill="#60A5FA">
				<path
					d="M2 0l.6 1.6L4.3 2.3 2.9 3.2 2 4.8 1.1 3.2.1 2.3 1.6 1.6z"
					opacity="0.95"
				/>
			</g>
		</svg>
	);
}

export default LogoIcon;
