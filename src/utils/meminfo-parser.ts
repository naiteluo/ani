import { SummaryType } from "./meminfo-keys"

enum FMode {
  Free = 'Free',
  MEMINFO = 'MEMINFO',
  AppSummary = 'AppSummary',
  Objects = 'Objects',
  SQL = 'SQL'
}

export const MemRawColNames = [
  'Pss Total',
  'Private Dirty',
  'Private Clean',
  'SwapPss Dirty',
  'Heap Size',
  'Heap Alloc',
  'Heap Free',
]

export const MemSummaryColNames = [
  SummaryType.JavaHeap,
  SummaryType.NativeHeap,
  SummaryType.Code,
  SummaryType.Stack,
  SummaryType.Graphics,
  SummaryType.PrivateOther,
  SummaryType.System,
  SummaryType.Total,
  SummaryType.TotalSwapPss,
]

export const MemSummaryColMatcher = {
  [SummaryType.JavaHeap]: /Java\s+Heap:\s+(\d+)/,
  [SummaryType.NativeHeap]: /Native\s+Heap:\s+(\d+)/,
  [SummaryType.Code]: /Code:\s+(\d+)/,
  [SummaryType.Stack]: /Stack:\s+(\d+)/,
  [SummaryType.Graphics]: /Graphics:\s+(\d+)/,
  [SummaryType.PrivateOther]: /Private\s+Other:\s+(\d+)/,
  [SummaryType.System]: /System:\s+(\d+)/,
  [SummaryType.Total]: /TOTAL:\s+(\d+)/,
  [SummaryType.TotalSwapPss]: /TOTAL\s+SWAP\s+PSS:\s+(\d+)/,
}

const reg1 = /\*\* MEMINFO in pid (\d+) \[(.*)\] \*\*/i
const Divider = '~$~'

function processRawSectionRow(row: string) {
  const arr = row.replace(/\s{2,}/g, Divider).split(Divider).filter(v =>
    v.length !== 0
  )
  return arr
}

function parseRawSection(input: string) {
  const start = input.indexOf('** MEMINFO')
  const end = input.indexOf('App Summary')
  const cut = input.substring(start, end)
  const section: any = {}
  const rows = cut.split('\n')

  let mode = FMode.Free

  for (let i = 0; i < rows.length; i++) {
    const rowStr = rows[i].trim()
    // check if in meminfo section and update pid and pname
    if (mode === FMode.Free) {
      const modeMatchingResult = rowStr.match(reg1)
      if (modeMatchingResult) {
        mode = FMode.MEMINFO
        // 跳过表头
        i += 3
        continue
      }
    } else if (mode === FMode.MEMINFO) {
      if (rowStr.length !== 0) {
        const cols = processRawSectionRow(rowStr)
        section[cols[0]] = cols.splice(1, cols.length - 1)
      }
    }
  }
  return section
}

export function parseAppSummarySection(input: string) {
  const start = input.indexOf('App Summary')
  const end = input.indexOf('Objects')
  const cut = input.substring(start, end)
  const section: any = {}
  for (const key in MemSummaryColMatcher) {
    if (Object.prototype.hasOwnProperty.call(MemSummaryColMatcher, key)) {
      const matcher = MemSummaryColMatcher[key]
      const matched = cut.match(matcher)
      if (matched && matched?.length > 0) {
        section[key] = Number(matched[1])
      }
    }
  }
  // console.log(section)
  return section
}

export function formatMeminfo(input: string) {
  const pidMatched = input.match(/pid\s+(\d+)/)
  const pid = pidMatched && pidMatched.length > 0 ? pidMatched[1] : ''
  const pnameMatched = input.match(/\[(.+)\]/)
  const pname = pnameMatched && pnameMatched.length > 0 ? pnameMatched[1] : ''

  return {
    pid,
    pname,
    rawSection: parseRawSection(input),
    appSummarySection: parseAppSummarySection(input),
  }
}

export function formatIntoAlignCol(input: string, length: number) {
  const emptyStr = (new Array(length + 1)).join(' ')
  return `${input}${emptyStr.slice(input.length - 1, length - 1)}`
}

