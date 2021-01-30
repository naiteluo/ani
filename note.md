```
~/Code/workspace
➜ adb shell dumpsys meminfo com.google.android.webview:sandboxed_process5
Applications Memory Usage (in Kilobytes):
Uptime: 591270367 Realtime: 2074126294

** MEMINFO in pid 13482 [com.google.android.webview:sandboxed_process5] **
                   Pss  Private  Private  SwapPss     Heap     Heap     Heap
                 Total    Dirty    Clean    Dirty     Size    Alloc     Free
                ------   ------   ------   ------   ------   ------   ------
  Native Heap     3094     3084        0      112     9728     8091     1636
  Dalvik Heap        0        0        0        0    19840     1424    18416
        Stack       28       28        0        0
       Ashmem        8        0        8        0
    Other dev       24        4        0        0
     .so mmap      115       52        0       12
    .apk mmap    12839       60    10416       34
    .ttf mmap       83        0       36        0
    .dex mmap      778        0      100        2
    .oat mmap       75        0        0        0
    .art mmap      489      332        8        5
   Other mmap      787        4      688        0
      Unknown     3939     3924        0       98
        TOTAL    22522     7488    11256      263    29568     9515    20052

 App Summary
                       Pss(KB)
                        ------
           Java Heap:      340
         Native Heap:     3084
                Code:    10664
               Stack:       28
            Graphics:        0
       Private Other:     4628
              System:     3778

               TOTAL:    22522       TOTAL SWAP PSS:      263

 Objects
               Views:        0         ViewRootImpl:        0
         AppContexts:        3           Activities:        0
              Assets:        9        AssetManagers:        0
       Local Binders:        3        Proxy Binders:        6
       Parcel memory:        2         Parcel count:       10
    Death Recipients:        0      OpenSSL Sockets:        0
            WebViews:        0

 SQL
         MEMORY_USED:        0
  PAGECACHE_OVERFLOW:        0          MALLOC_SIZE:        0
```
