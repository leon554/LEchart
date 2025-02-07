import { color } from "./Color";
import { Draw, HorizontalAllign} from "./Draw";


export enum chartType{
  bar,
  line
}
export class ChartParameters {
  // Default Colors
  defaultBlackColor = new color(0, 0, 0);
  Grey = new color(55, 55, 55);
  defaultWhiteColor = new color(255, 255, 255);

  // Axes Settings
  chartWidthRatio = 0.7;
  chartHeightRatio = 0.7;
  axisLineThickness = 2;
  xAxisPadding = 10;
  yAxisPadding = 0;
  displayRightYAxis = true;
  axisColor = this.defaultBlackColor;
  yAxisValuePadding = 0;
  backgroundColor = this.defaultWhiteColor

  // Grid and Horizontal Lines
  displayGridLines = true;
  gridLineColor = this.Grey; 
  gridLineThickness = 1;
  applyXSpacingToGridLines = false;

  // Data Line & Points
  dataLineThickness = 2;
  dataLineColor = this.defaultBlackColor;
  displayDataPoints = true;
  dataPointColor = this.defaultBlackColor;
  dataPointRadius = 5;

  // Spacing
  xAxisDataSpacing = 0;
  yAxisDataSpacing = 0;

  // X-Axis Labels
  xLabelFontSize = 12;
  xLabelColor = this.Grey
  xLabelVerticalOffset = 15;
  xLabelRotationAngle = 45;
  centerXLabels = false;
  xLabelInterval = 2;

  // Y-Axis Labels
  yLabelFontSize = 12;
  ylabelColor = this.Grey
  yLabelHorizontalOffset = 10;
  yLabelCount = 10;

  // Chart Titles
  chartTitle = "Title";
  chartTitleColor = this.defaultBlackColor;
  chartTitleFontSize = 20;
  chartTitleVerticalOffset = 20;

  xAxisTitle = "X-Axis";
  xAxisTitleColor = this.defaultBlackColor;
  xAxisTitleFontSize = 18;
  xAxisTitleVeritcalOffset = 50;

  yAxisTitle = "Y-Axis";
  yAxisTitleColor = this.defaultBlackColor;
  yAxisTitleFontSize = 18;
  yAxisTitleHorizontalOffset = 50;

  // General
  maxDataPoints = 20;
}
interface axesData{
  axesWidth: number,
  axesHeight: number,
  xStartingPoint: number,
  yStartingPoint: number
}
export class Chart{
  draw: Draw
  canvas: HTMLCanvasElement
  yData: number[] = []
  xData: string[] = []
  data: ChartParameters = new ChartParameters()

  constructor(canvas: HTMLCanvasElement, data: ChartParameters){
    this.draw = new Draw(canvas, canvas.width, canvas.height)
    this.canvas = canvas
    this.data = data
    this.draw.fill(new color(255,255,255))
  }
  drawChart(){
    this.draw.fill(this.data.backgroundColor)
    const axesData = this.drawAxes()
    this.drawAxesTitles(axesData)
    this.drawLineChart(axesData)
  }
  drawLineChart(axesData: axesData){
    const numDataPoints = this.xData.length
    const maxYValue = (this.data.yAxisValuePadding == 0) ? Math.max(...this.yData) : Math.max(...this.yData) + this.data.yAxisValuePadding
    const minYValue = (this.data.yAxisValuePadding == 0) ? Math.min(...this.yData) : Math.min(...this.yData) - this.data.yAxisValuePadding
    const spaceBetweenXValues = (axesData.axesWidth - this.data.xAxisDataSpacing)/(numDataPoints-1)
    let yValueScale = (axesData.axesHeight - this.data.yAxisDataSpacing)/(maxYValue - minYValue)

    let currentX = axesData.xStartingPoint + this.data.xAxisDataSpacing/2 
    let previosPosition = {x: 0, y: 0}
    const getYPointPos = (yDataPoint: number) => {
      return ((axesData.yStartingPoint + axesData.axesHeight + minYValue * yValueScale) - this.data.yAxisDataSpacing/2) - (yDataPoint * yValueScale)
    }

    this.drawYLabels(getYPointPos, axesData)
    this.drawHorizontalLine(getYPointPos, axesData)
    this.yData.map((yDataPoint, i) => {
      if(i == 0){
        previosPosition = {x: currentX,  y: getYPointPos(yDataPoint)}
      }else{
        this.draw.line(previosPosition.x, 
                       previosPosition.y,
                       currentX,  
                       getYPointPos(yDataPoint),
                       this.data.dataLineColor,
                       this.data.dataLineThickness)
      }
      if(i%this.data.xLabelInterval == 0){
        this.drawXLabel(currentX, axesData, this.xData[i])
      }
      previosPosition = {x: currentX, y:  getYPointPos(yDataPoint)}
      currentX += spaceBetweenXValues
    })
    if(!this.data.displayDataPoints) return
    currentX = axesData.xStartingPoint + this.data.xAxisDataSpacing/2
    this.yData.map((yDataPoint) => {
      this.draw.circle(currentX, 
        getYPointPos(yDataPoint), 
        this.data.dataPointRadius, 
        true, 
        this.data.dataPointColor)
      currentX += spaceBetweenXValues
    })
  }
  drawAxesTitles(axesData: axesData){
    this.draw.text(this.data.chartTitle, 
                   this.data.chartTitleFontSize, 
                   axesData.xStartingPoint + axesData.axesWidth/2, 
                   axesData.yStartingPoint - this.data.chartTitleVerticalOffset,
                   HorizontalAllign.centre,
                   undefined,
                   this.data.chartTitleColor)
    this.draw.text(this.data.xAxisTitle, 
                    this.data.xAxisTitleFontSize, 
                    axesData.xStartingPoint + axesData.axesWidth/2, 
                    axesData.yStartingPoint + axesData.axesHeight + this.data.xAxisTitleVeritcalOffset,
                    HorizontalAllign.centre,
                    undefined,
                    this.data.xAxisTitleColor)
    this.draw.ninetyDegText(this.data.yAxisTitle,
                            this.data.yAxisTitleFontSize,
                            axesData.xStartingPoint - this.data.yAxisTitleHorizontalOffset,
                            axesData.yStartingPoint + axesData.axesHeight/2,
                            HorizontalAllign.centre,
                            undefined,
                            this.data.yAxisTitleColor)
  }
  drawHorizontalLine(getYPointPos: (yDataPoint: number, ignoreSpacing: boolean) => number, axesData: axesData){
    if(!this.data.displayGridLines) return
    
    const maxYValue = (this.data.yAxisValuePadding == 0) ? Math.max(...this.yData) : Math.max(...this.yData) + this.data.yAxisValuePadding
    const minYValue = (this.data.yAxisValuePadding == 0) ? Math.min(...this.yData) : Math.min(...this.yData) - this.data.yAxisValuePadding
    const YDelata = maxYValue - minYValue
    const increment = YDelata/(this.data.yLabelCount-1)
    const spacing = (this.data.applyXSpacingToGridLines) ? 
                      this.data.xAxisDataSpacing/2 : 0

    for(let i = 0; i < this.data.yLabelCount; i++){
      this.draw.line(axesData.xStartingPoint + spacing,
                     getYPointPos(minYValue + increment*i, false),
                     axesData.xStartingPoint + axesData.axesWidth - spacing,
                     getYPointPos(minYValue + increment*i, false),
                     this.data.gridLineColor,
                     this.data.gridLineThickness)
    }
  }
  drawYLabels(getYPointPos: (yDataPoint: number, ignoreSpacing: boolean) => number, axesData: axesData){
    const maxYValue = (this.data.yAxisValuePadding == 0) ? Math.max(...this.yData) : Math.max(...this.yData) + this.data.yAxisValuePadding
    const minYValue = (this.data.yAxisValuePadding == 0) ? Math.min(...this.yData) : Math.min(...this.yData) - this.data.yAxisValuePadding
    const YDelata = maxYValue - minYValue
    const increment = YDelata/(this.data.yLabelCount-1)

    for(let i = 0; i < this.data.yLabelCount;i++){
      this.draw.text(`${this.shortenNumber(minYValue + i*increment, true)}`,
                     this.data.yLabelFontSize,
                     axesData.xStartingPoint - this.data.yLabelHorizontalOffset,
                     getYPointPos(minYValue + i*increment, false),
                     HorizontalAllign.end,
                     undefined,
                     this.data.ylabelColor

      )
    }
  }
  drawXLabel(currentX: number, axesData: axesData, label: string){
    this.draw.drawRotatedText(label,
                              this.data.xLabelFontSize,
                              currentX,
                              axesData.yStartingPoint + axesData.axesHeight + this.data.xLabelVerticalOffset,
                              this.data.xLabelRotationAngle, 
                              (this.data.centerXLabels) ? HorizontalAllign.centre : HorizontalAllign.start, 
                              undefined, 
                              this.data.xLabelColor
    )
  }
  drawAxes(){
    const axesWidth = Math.round(this.canvas.width*this.data.chartWidthRatio)
    const xStartingPoint = Math.round((this.canvas.width - axesWidth)/2) + this.data.xAxisPadding

    const axesHeight = Math.round(this.canvas.height*this.data.chartHeightRatio)
    const yStartingPoint = Math.round((this.canvas.height - axesHeight)/2) + this.data.yAxisPadding

    this.draw.line(xStartingPoint, 
                   yStartingPoint + axesHeight, 
                   xStartingPoint + axesWidth, 
                   yStartingPoint + axesHeight,
                   this.data.axisColor,
                   this.data.axisLineThickness)

    this.draw.line(xStartingPoint,
                   yStartingPoint,
                   xStartingPoint,
                   yStartingPoint + axesHeight,
                   this.data.axisColor,
                   this.data.axisLineThickness)

    if(this.data.displayRightYAxis){
      this.draw.line(xStartingPoint + axesWidth,
                     yStartingPoint,
                     xStartingPoint + axesWidth,
                     yStartingPoint + axesHeight,
                     this.data.axisColor,
                     this.data.axisLineThickness)
    }

    return {
      axesWidth: axesWidth,
      axesHeight: axesHeight,
      xStartingPoint: xStartingPoint,
      yStartingPoint: yStartingPoint
    }
  }
  addXY(x: string, y: number){
    if(this.xData.length >= this.data.maxDataPoints){
      this.xData.shift()
      this.yData.shift()
    }
    this.xData.push(x)
    this.yData.push(y)
  }
  shortenNumber(n:number, useShortened: boolean){
    if(!useShortened) {return Math.round(n)}
    if(n < 100){
      return Math.round(n*100)/100
    }
    else if(n < 1000){return Math.round(n)}
    else if(n < 10000){
      n = n/1000
      return `${(Math.round(n*10)/10)}k`
    }
    else if(n < 1000000){
      n = n/1000
      return `${(Math.round(n))}k`
    }
    else if(n < 100000000){
      n = n/1000000
      return`${(Math.round(n*10)/10)}m`
    }
    else{
      return n
    }
  }
}