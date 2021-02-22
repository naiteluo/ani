import chalk = require('chalk')
import { formatIntoAlignCol, MemRawColNames } from './meminfo-parser'

export function printTableHeaderCLI() {
  const str = MemRawColNames.map(v => {
    return formatIntoAlignCol(`${v}`, 19) + '|'
  }).join('')
  return [
    new Array(str.length + 1).join('-'),
    `${str}`,
    new Array(str.length + 1).join('-'),
  ]
}

export function printRowCLI(data: any, lastRowData: any) {
  const str = data.map((v: any, i: number) => {
    const last = lastRowData[i]
    const diff = v - last
    let originStr = ''
    let diffStr = ''
    if (last && diff !== 0) {
      diffStr = `(${diff > 0 ? '+' : ''}${(diff / last * 100).toFixed(2)}%)`
      originStr = diffStr
      if (diff > 0) {
        diffStr = chalk.black.bgGreen(diffStr)
      } else {
        diffStr = chalk.black.bgRed(diffStr)
      }
    }
    return formatIntoAlignCol(`${v} ${diffStr}`, 19 + diffStr.length - originStr.length) + '|'
  }).join('')
  return str
}
