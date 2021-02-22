import { Component, OnInit } from '@angular/core'
import { io, Socket } from 'socket.io-client'
import { LineSeriesOption } from 'echarts'

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss'],
})
export class MonitorComponent implements OnInit {
  private socket: Socket;

  processDataArr: {
    [key: string]: {
      processName: string;
      chartOption: any;
      xArr: number[];
      data: any[];
    };
  } = {};

  displayedRawColumns: string[] = [
    // 'Pss Total',
    // 'Private Dirty',
    // 'Private Clean',
    // 'SwapPss Dirty',
    // 'Heap Size',
    // 'Heap Alloc',
    // 'Heap Free',
  ];

  displayedSummaryColumns: string[] = [
    'JavaHeap',
    'NativeHeap',
    'Code',
    'Stack',
    'Graphics',
    'PrivateOther',
    'System',
    'Total',
    'TotalSwapPss',
  ];

  chartOptionTpl: any = {
    title: {
      text: 'Meminfo',
    },
    legend: {
      data: this.displayedSummaryColumns.slice(),
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
      // min: 0,
      // max: 1028 * 1 * 1024,
      // interval: 1024 * 100, // 100MB
    },
    series:
      this.displayedSummaryColumns.slice().map(v => {
        return {
          name: v,
          type: 'line',
          stack: v !== 'Total' ? 'Total' : '',
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
          data: [],
        }
      }),

  }

  columnsToDisplay: string[] = this.displayedSummaryColumns.slice()

  constructor() {
    this.socket = io('ws://localhost:3000')
  }

  private cur = 0;

  private commonXArr: number[] = [];

  ngOnInit(): void {
    this.socket.connect()
    this.socket.on('data', (dataArr: any) => {
      this.commonXArr.push(this.cur)
      const marks: any = {}
      // process data from server
      dataArr.forEach((data: any) => {
        if (!this.processDataArr[data.pname]) {
          this.processDataArr[data.pname] = {
            processName: data.pname,
            chartOption: JSON.parse(JSON.stringify(this.chartOptionTpl)),
            xArr: [],
            data: [],
          }
          this.processDataArr[data.pname].chartOption.title.text = data.pname
        }
        const newData = this.processDataArr[data.pname]
        const result: any = {}
        for (const key in data.appSummarySection) {
          if (Object.prototype.hasOwnProperty.call(data.appSummarySection, key)) {
            const element: Array<number> = data.appSummarySection[key]
            result[key] = element
          }
        }
        newData.data = [result, ...newData.data]
        newData.xArr = [...this.commonXArr]
        newData.chartOption.xAxis = {
          ...newData.chartOption.xAxis,
          data: [...newData.xArr],
        }
        const series: Array<LineSeriesOption> = newData.chartOption.series
        newData.chartOption.series = series.map((s: LineSeriesOption) => {
          const temp = [...(s.data as Array<number>)]
          temp[this.cur] = Number(result[s.name || '']) || 0
          return {
            ...s,
            data: temp,
          }
        })
        newData.chartOption = { ...newData.chartOption }
        marks[data.pname] = true
      })
      // update yaxis and process data not in server res but in local data arr
      for (const key in this.processDataArr) {
        if (marks[key]) continue
        if (Object.prototype.hasOwnProperty.call(this.processDataArr, key)) {
          const newData = this.processDataArr[key]
          newData.data = [{}, ...newData.data]
          newData.xArr = [...this.commonXArr]
          newData.chartOption.xAxis = {
            ...newData.chartOption.xAxis,
            data: [...newData.xArr],
          }
          const series: Array<LineSeriesOption> = newData.chartOption.series
          newData.chartOption.series = series.map((s: LineSeriesOption) => {
            const temp = [...(s.data as Array<number>)]
            temp[this.cur] = 0
            return {
              ...s,
              data: temp,
            }
          })
          newData.chartOption = { ...newData.chartOption }
        }
      }
      this.cur++
    })
  }

  ngOnDestory() {
    this.socket.disconnect()
  }

  onStartBtnClick() {
    this.socket.emit('start')
  }

  onStopBtnClick() {
    this.socket.emit('stop')
  }
}
