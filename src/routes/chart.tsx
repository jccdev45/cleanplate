import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import { Monitor } from 'lucide-react'
import { restaurantQueries } from '@/utils/restaurant'

const chartConfig = {
  count: {
    label: 'Restaurants',
    icon: Monitor,
    color: 'var(--chart-1)',
  },
  scores: {
    label: 'Scores',
    color: 'var(--chart-2)',
  },
  critical: { label: 'Critical', color: 'hsl(var(--chart-1))' },
  notCritical: { label: 'Not Critical', color: 'hsl(var(--chart-2))' },
  notApplicable: {
    label: 'Not Applicable',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

export const Route = createFileRoute('/chart')({
  component: RouteComponent,
  ssr: "data-only"
})

function RouteComponent() {
  // Fetch restaurant data client-side
  const { data, isLoading, isError } = useQuery(restaurantQueries.list({
    $limit: 5000
  }))

  if (isLoading) return <div className="p-8">Loading chart...</div>
  if (isError || !data) return <div className="p-8 text-red-600">Failed to load restaurant data.</div>

  // Top cuisines
  const cuisineCounts: Record<string, number> = {}
  // Top boroughs
  const boroughCounts: Record<string, number> = {}
  // Grade distribution
  const gradeCounts: Record<string, number> = {}
  // Critical flag distribution
  const criticalFlagCounts: Record<string, number> = {}
  // Score distribution
  const scores: number[] = []

  for (const r of data.restaurants) {
    const cuisine = r.cuisine_description || 'Other'
    cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1

    const boro = r.boro || 'Other'
    boroughCounts[boro] = (boroughCounts[boro] || 0) + 1

    const grade = r.inspections[0]?.grade || 'N/A'
    gradeCounts[grade] = (gradeCounts[grade] || 0) + 1

    const criticalFlag = r.inspections[0]?.critical_flag || 'Not Applicable'
    criticalFlagCounts[criticalFlag] = (criticalFlagCounts[criticalFlag] || 0) + 1

    if (r.inspections[0]?.score !== null && r.inspections[0]?.score !== undefined) {
      scores.push(r.inspections[0].score)
    }
  }

  // Top 12 cuisines
  const cuisineChartData = Object.entries(cuisineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([cuisine, count]) => ({ cuisine, count }))

  // Top boroughs
  const boroughChartData = Object.entries(boroughCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([boro, count]) => ({ boro, count }))

  // Grade distribution
  const gradeChartData = Object.entries(gradeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([grade, count]) => ({ grade, count }))

  // Critical flag distribution
  const criticalFlagChartData = Object.entries(criticalFlagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([flag, count]) => ({ name: flag, value: count, fill: `var(--color-${flag.toLowerCase().replace(/ /g, '')})` }))

  // Score distribution
  const scoreBins = [0, 13, 27, 45, 150]
  const scoreLabels = ['0-13 (A)', '14-27 (B)', '28-44 (C)', '45+ (C or worse)']
  const scoreDistribution = scoreBins.slice(0, -1).map((bin, i) => {
    const nextBin = scoreBins[i + 1]
    return {
      name: scoreLabels[i],
      count: scores.filter(score => score >= bin && score < nextBin).length
    }
  })

  return (
    <section className="max-w-4xl mx-auto p-8 flex flex-col gap-12">
      <div>
        <h1 className="text-2xl font-bold mb-6">Top Restaurant Cuisines in NYC</h1>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart accessibilityLayer data={cuisineChartData} barSize={32}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="cuisine"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.length > 10 ? value.slice(0, 10) + '…' : value}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent nameKey="cuisine" />} />
            <Bar dataKey="count" fill={chartConfig.count.color} radius={4} />
          </BarChart>
        </ChartContainer>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6">Restaurants by Borough</h2>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            layout="vertical"
            accessibilityLayer
            data={boroughChartData}
            barSize={32}
            width={600}
            height={300}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide domain={[0, 'dataMax + 50']} />
            {/* YAxis for borough names */}
            <YAxis
              type="category"
              dataKey="boro"
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent nameKey="boro" />} />
            <Bar dataKey="count" fill={chartConfig.count.color} radius={4} />
          </BarChart>
        </ChartContainer>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6">Grade Distribution</h2>
        <ChartContainer config={chartConfig} className="h-[300px] w-full flex items-center justify-center">
          <PieChart width={340} height={300}>
            <Pie
              data={gradeChartData}
              dataKey="count"
              nameKey="grade"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ grade }) => grade}
            >
              {gradeChartData.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={`hsl(${(idx * 60) % 360}, 70%, 60%)`} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-6">Critical Flag Distribution</h2>
          <ChartContainer config={{
            critical: { label: 'Critical', color: 'hsl(0 84.2% 60.2%)' },
            notcritical: { label: 'Not Critical', color: 'hsl(221.2 83.2% 53.3%)' },
            notapplicable: { label: 'Not Applicable', color: 'hsl(215.4 16.3% 46.9%)' },
          }} className="h-[300px] w-full flex items-center justify-center">
            <PieChart width={340} height={300}>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={criticalFlagChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
              />
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6">Score Distribution</h2>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={scoreDistribution} barSize={40}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-scores)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </section>
  )
}
