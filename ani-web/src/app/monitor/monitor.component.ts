import { Component, OnInit } from '@angular/core'
import { io, Socket } from 'socket.io-client'
import { EChartsOption, LineSeriesOption } from 'echarts'

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss'],
})
export class MonitorComponent implements OnInit {
  private socket: Socket;

  displayedColumns: string[] = [
    'Pss Total',
    'Private Dirty',
    'Private Clean',
    'SwapPss Dirty',
    'Heap Size',
    'Heap Alloc',
    'Heap Free',
  ];

  chartOption: any = {
    title: {
      text: 'Meminfo',
    },
    legend: {
      data: this.displayedColumns.slice(),
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
    },
    yAxis: {
      type: 'value',
    },
    series:
      this.displayedColumns.slice().map(v => {
        return {
          name: v,
          type: 'line',
          stack: v,
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
          data: [],
        }
      }),

  }

  columnsToDisplay: string[] = this.displayedColumns.slice()

  xArr: number[] = []

  data: Array<any> = []

  constructor() {
    this.socket = io('ws://localhost:3000')
  }

  ngOnInit(): void {
    this.socket.connect()
    this.socket.on('data', (data: any) => {
      const result: any = {}
      for (const key in data.meminfoSection) {
        if (Object.prototype.hasOwnProperty.call(data.meminfoSection, key)) {
          const element: Array<number> = data.meminfoSection[key]
          result[key] = {}
          element.forEach((v, i) => {
            result[key][this.displayedColumns[i]] = v
          })
        }
      }
      this.data = [result.TOTAL, ...this.data]
      this.xArr = [...this.xArr, this.data.length]
      this.chartOption.xAxis = {
        ...this.chartOption.xAxis,
        data: [...this.xArr],
      }
      const series: Array<LineSeriesOption> = this.chartOption.series
      this.chartOption.series = series.map((s: LineSeriesOption) => {
        return {
          ...s,
          data: [...(s.data as Array<number>), Number(result.TOTAL[s.name || '']) || 0],
        }
      })
      this.chartOption = { ...this.chartOption }
    })
  }

  ngOnDestory() {
    this.socket.disconnect()
  }
}
