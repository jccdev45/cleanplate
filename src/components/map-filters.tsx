import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
	ArrowDownNarrowWide,
	ArrowUpNarrowWide,
	CircleQuestionMark,
	FilterIcon,
} from "lucide-react";
import { useState } from "react";

const boroughData = {
	Manhattan: { latitude: 40.776676, longitude: -73.971321, zoom: 12 },
	Brooklyn: { latitude: 40.650002, longitude: -73.949997, zoom: 12 },
	Queens: { latitude: 40.742054, longitude: -73.769417, zoom: 12 },
	Bronx: { latitude: 40.837048, longitude: -73.865433, zoom: 12 },
	"Staten Island": { latitude: 40.579021, longitude: -74.151535, zoom: 12 },
};

// GradeFilter component
function GradeFilter({ value }: { value?: string }) {
	return (
		<div className="flex flex-col gap-2">
			<Label className="font-semibold mb-1">Grade:</Label>
			<div className="flex gap-2">
				<Link
					to="/map"
					search={(prev) => ({ ...prev, grade: "A" })}
					className={`px-3 py-1 rounded-md text-sm ${value === "A" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
				>
					A
				</Link>
				<Link
					to="/map"
					search={(prev) => ({ ...prev, grade: "B" })}
					className={`px-3 py-1 rounded-md text-sm ${value === "B" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
				>
					B
				</Link>
				<Link
					to="/map"
					search={(prev) => ({ ...prev, grade: "C" })}
					className={`px-3 py-1 rounded-md text-sm ${value === "C" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
				>
					C
				</Link>
				<Link
					to="/map"
					search={(prev) => ({ ...prev, grade: undefined })}
					className={`px-3 py-1 rounded-md text-sm ${!value ? "bg-primary text-primary-foreground" : "bg-muted"}`}
				>
					All
				</Link>
			</div>
		</div>
	);
}

// LimitFilter component
function LimitFilter({ value }: { value?: string }) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2 mb-1">
				<Label className="font-semibold">Limit:</Label>
				<Tooltip>
					<TooltipTrigger>
						<CircleQuestionMark className="size-4" />
					</TooltipTrigger>
					<TooltipContent>
						<div className="text-balance">
							<p>
								The limit controls the maximum number of raw results returned
								from the API. <br /> Actual displayed results may be fewer due
								to data sanitization.
							</p>
							<p className="text-destructive-foreground w-fit bg-destructive-foreground/50 p-1 font-bold">
								NOTE: Higher limits may cause slower load times.
							</p>
						</div>
					</TooltipContent>
				</Tooltip>
			</div>
			<RadioGroup defaultValue={value || "1000"} className="flex gap-2">
				{[1000, 2000, 3000, 5000].map((limit) => (
					<div className="flex items-center gap-1" key={limit}>
						<Link
							className="flex items-center space-x-2"
							to="/map"
							search={(prev) => ({ ...prev, $limit: limit })}
						>
							<RadioGroupItem value={limit.toString()} id={limit.toString()} />
						</Link>
						<Label htmlFor={limit.toString()}>{limit}</Label>
					</div>
				))}
			</RadioGroup>
		</div>
	);
}

export function MapFilters() {
	const searchParams = useSearch({ from: "/map" });
	const navigate = useNavigate({ from: "/map" });
	const [query, setQuery] = useState(searchParams?.$q || "");

	const handleSearch = () => {
		navigate({ search: (prev) => ({ ...prev, $q: query || undefined }) });
	};

	return (
		<Sheet>
			<SheetTrigger className="flex items-center gap-2">
				<FilterIcon className="fill-primary/70" />
				<span className="font-bold">Filters</span>
			</SheetTrigger>
			<TooltipProvider>
				<SheetContent side="left">
					<SheetHeader>
						<SheetTitle>Filters</SheetTitle>
						<SheetDescription>
							Use these filters to refine the restaurant results shown on the
							map. Adjust grade, result limit, or borough to explore different
							areas and data sets. Higher limits may impact performance.
						</SheetDescription>
					</SheetHeader>
					<Button asChild className="w-1/2 mx-auto">
						<SheetClose asChild>
							<Link to="/map">Reset Filters</Link>
						</SheetClose>
					</Button>
					<div className="p-4 border-b flex flex-col gap-6">
						<div className="w-full flex flex-col gap-2">
							<Label htmlFor="search" className="font-semibold mb-1">
								Search:
							</Label>
							<div className="flex gap-2">
								<Input
									id="search"
									type="search"
									placeholder="Search restaurants, zipcode, cuisines, etc..."
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleSearch()}
								/>
								<Button onClick={handleSearch}>Search</Button>
							</div>
						</div>
						<GradeFilter value={searchParams?.grade} />
						<LimitFilter value={searchParams?.$limit?.toString()} />
						<div className="flex flex-col gap-2">
							<Label className="font-semibold mb-1">Borough:</Label>
							<div className="flex gap-2 flex-wrap">
								{Object.entries(boroughData).map(([name, data]) => (
									<Link
										key={name}
										to="/map"
										search={(prev) => ({
											...prev,
											boro: name,
											latitude: data.latitude,
											longitude: data.longitude,
											zoom: data.zoom,
										})}
										className={`px-3 py-1 rounded-md text-sm ${searchParams?.boro === name ? "bg-primary text-primary-foreground" : "bg-muted"}`}
									>
										{name}
									</Link>
								))}
								<Link
									to="/map"
									search={(prev) => ({
										...prev,
										boro: undefined,
										latitude: undefined,
										longitude: undefined,
										zoom: undefined,
									})}
									className={`px-3 py-1 rounded-md text-sm ${!searchParams?.boro ? "bg-primary text-primary-foreground" : "bg-muted"}`}
								>
									All
								</Link>
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<Label className="font-semibold mb-1">Inspection Date:</Label>
							<div className="flex gap-2">
								<Button asChild size="sm" variant="outline">
									<Link
										to="/map"
										search={(prev) => ({
											...prev,
											$order: "inspection_date DESC",
										})}
										activeProps={{
											className: buttonVariants({ variant: "default" }),
										}}
									>
										<ArrowDownNarrowWide />
										Newest
									</Link>
								</Button>
								<Button asChild size="sm" variant="outline">
									<Link
										to="/map"
										search={(prev) => ({
											...prev,
											$order: "inspection_date ASC",
										})}
										activeProps={{
											className: buttonVariants({ variant: "default" }),
										}}
									>
										<ArrowUpNarrowWide />
										Oldest
									</Link>
								</Button>
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<div className="flex items-center gap-2 mb-1">
								<Label className="font-semibold">Critical Flag:</Label>
								<Tooltip>
									<TooltipTrigger>
										<CircleQuestionMark className="size-4" />
									</TooltipTrigger>
									<TooltipContent>
										<div className="text-balance">
											<p>
												Critical violations are those most likely to contribute
												to food-borne illness
											</p>
										</div>
									</TooltipContent>
								</Tooltip>
							</div>
							<RadioGroup
								defaultValue={searchParams?.critical_flag || "Not Applicable"}
								className="flex gap-2"
							>
								{["Critical", "Not Critical", "Not Applicable"].map((flag) => (
									<div className="flex items-center gap-1" key={flag}>
										<Link
											className="flex items-center space-x-2"
											to="/map"
											search={(prev) => ({ ...prev, critical_flag: flag })}
										>
											<RadioGroupItem
												value={flag.toString()}
												id={flag.toString()}
											/>
										</Link>
										<Label htmlFor={flag.toString()}>{flag}</Label>
									</div>
								))}
							</RadioGroup>
						</div>
					</div>
				</SheetContent>
			</TooltipProvider>
		</Sheet>
	);
}
