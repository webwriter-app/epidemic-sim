import {Chart} from "chart.js/auto"

export interface ChartSeries {
  label: string
  values: number[]
  color: string
  dash?: number[]
  lineWidth?: number
}

const chartCache = new WeakMap<HTMLCanvasElement, Chart<"line", number[], string>>()

export function drawChart(
  canvas: HTMLCanvasElement,
  population: number,
  series: ChartSeries[],
  options?: {showLegend?: boolean; labels?: string[]; xAxisTitle?: string},
): void {
  const longestSeriesLength = getLongestSeriesLength(series)
  const labels = options?.labels ?? Array.from({length: longestSeriesLength}, (_, index) => String(index))
  const showLegend = options?.showLegend ?? true

  let chart = chartCache.get(canvas)
  if (!chart) {
    const parent = canvas.parentElement
    chart = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [],
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: true,
            grid: {
              color: "#e2e8ef",
            },
            ticks: {
              display: true,
              autoSkip: true,
              maxTicksLimit: 10,
            },
            title: {
              display: true,
              text: options?.xAxisTitle ?? "Time (days)",
            },
          },
          y: {
            min: 0,
            max: Math.max(1, population),
            grid: {
              color: "#e2e8ef",
            },
            ticks: {
              precision: 0,
            },
          },
        },
        plugins: {
          legend: {
            display: showLegend,
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        interaction: {
          mode: "nearest",
          intersect: false,
        },
        elements: {
          line: {
            borderWidth: 2,
            tension: 0.15,
          },
          point: {
            radius: 0,
            hitRadius: 6,
            hoverRadius: 3,
          },
        },
      },
    })
    chartCache.set(canvas, chart)
    if (parent) {
      chart.resize()
    }
  }

  chart.data.labels = labels
  chart.data.datasets = series.map((entry) => ({
    label: entry.label,
    data: [...entry.values],
    borderColor: entry.color,
    backgroundColor: entry.color,
    pointBackgroundColor: entry.color,
    pointBorderColor: entry.color,
    borderDash: entry.dash ?? [],
    borderWidth: entry.lineWidth ?? 2,
    fill: false,
    spanGaps: true,
  }))

  const yScale = chart.options.scales?.y
  if (yScale) {
    yScale.max = Math.max(1, population)
  }
  if (chart.options.plugins?.legend) {
    chart.options.plugins.legend.display = showLegend
  }
  const xScale = chart.options.scales?.x
  if (xScale?.title) {
    xScale.title.text = options?.xAxisTitle ?? "Time (days)"
  }

  chart.update("none")
}

export function destroyChart(canvas: HTMLCanvasElement | null): void {
  if (!canvas) {
    return
  }
  const chart = chartCache.get(canvas)
  if (!chart) {
    return
  }
  chart.destroy()
  chartCache.delete(canvas)
}

export function resetChart(canvas: HTMLCanvasElement | null): void {
  destroyChart(canvas)
}

function getLongestSeriesLength(series: ChartSeries[]): number {
  let maxLength = 0
  for (let i = 0; i < series.length; i += 1) {
    maxLength = Math.max(maxLength, series[i].values.length)
  }
  return maxLength
}
