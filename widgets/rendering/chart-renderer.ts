interface ChartGeometry {
  paddingLeft: number
  paddingRight: number
  paddingTop: number
  paddingBottom: number
}

interface ChartSeries {
  values: number[]
  color: string
}

export function drawChart(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  population: number,
  series: ChartSeries[],
): void {
  const width = canvas.width
  const height = canvas.height
  const geometry: ChartGeometry = {
    paddingLeft: 38,
    paddingRight: 12,
    paddingTop: 14,
    paddingBottom: 28,
  }

  const plotWidth = width - geometry.paddingLeft - geometry.paddingRight
  const plotHeight = height - geometry.paddingTop - geometry.paddingBottom

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = "#fcfdff"
  ctx.fillRect(0, 0, width, height)

  drawGrid(ctx, width, plotHeight, geometry)
  drawAxes(ctx, width, height, geometry)

  const maxY = Math.max(1, population)
  for (let i = 0; i < series.length; i += 1) {
    drawChartSeries(
      ctx,
      series[i].values,
      series[i].color,
      geometry.paddingLeft,
      geometry.paddingTop,
      plotWidth,
      plotHeight,
      maxY,
    )
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, plotHeight: number, geometry: ChartGeometry): void {
  ctx.strokeStyle = "#e2e8ef"
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i += 1) {
    const y = geometry.paddingTop + (plotHeight * i) / 4
    ctx.beginPath()
    ctx.moveTo(geometry.paddingLeft, y)
    ctx.lineTo(width - geometry.paddingRight, y)
    ctx.stroke()
  }
}

function drawAxes(ctx: CanvasRenderingContext2D, width: number, height: number, geometry: ChartGeometry): void {
  ctx.strokeStyle = "#94a3b8"
  ctx.beginPath()
  ctx.moveTo(geometry.paddingLeft, geometry.paddingTop)
  ctx.lineTo(geometry.paddingLeft, height - geometry.paddingBottom)
  ctx.lineTo(width - geometry.paddingRight, height - geometry.paddingBottom)
  ctx.stroke()
}

function drawChartSeries(
  ctx: CanvasRenderingContext2D,
  values: number[],
  color: string,
  left: number,
  top: number,
  width: number,
  height: number,
  maxY: number,
): void {
  if (values.length < 2) {
    return
  }
  const stepX = values.length > 1 ? width / (values.length - 1) : width
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < values.length; i += 1) {
    const x = left + i * stepX
    const y = top + height - (values[i] / maxY) * height
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()
}
