
enum FMode {
  Free,
  MEMINFO,
  AppSummary,
  Objects,
  SQL
}

const reg1 = /\*\* MEMINFO in pid (\d+) \[(.*)\] \*\*/i
const reg2 = /App Summary/i
const reg3 = /Objects/i
const Divider = '~$~'

function processMeminfoRow(row: string) {
  const arr = row.replace(/\s{2,}/g, Divider).split(Divider).filter(v =>
    v.length !== 0
  )
  return arr
}

function processAppSummaryRow(row: string) {
  const arr = row.replace(/\s{2,}/g, Divider).split(Divider).filter(v =>
    v.length !== 0
  )
  return arr
}

export function formatMeminfo(input: string) {
  const rows = input.split('\n')

  let mode = FMode.Free

  let pid = ''
  let pname = ''
  const meminfoSection: any = {}

  for (let i = 0; i < rows.length; i++) {
    const rowStr = rows[i].trim()
    // check if in meminfo section and update pid and pname
    if (mode === FMode.Free) {
      const modeMatchingResult = rowStr.match(reg1)
      if (modeMatchingResult) {
        mode = FMode.MEMINFO
        pid = modeMatchingResult[1]
        pname = modeMatchingResult[2]
        // 跳过表头
        i += 3
        continue
      }
    } else if (mode === FMode.MEMINFO) {
      const modeMatchingResult = rowStr.match(reg2)
      if (modeMatchingResult) {
        mode = FMode.AppSummary
        // 跳过表头
        i += 2
        continue
      }
      if (rowStr.length !== 0) {
        const cols = processMeminfoRow(rowStr)
        meminfoSection[cols[0]] = cols.splice(1, cols.length - 1)
      }
    } else if (mode === FMode.AppSummary) {
      const modeMatchingResult = rowStr.match(reg3)
      if (modeMatchingResult) {
        mode = FMode.Objects
        break
      }
      if (rowStr.length !== 0) {
        // const cols = processAppSummaryRow(rowStr)
      }
      continue
    } else {
      continue
    }
  }
  return {
    pid,
    pname,
    meminfoSection,
  }
}
