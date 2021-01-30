```
~/Code/workspace
➜ adb shell dumpsys meminfo com.example.htest
Applications Memory Usage (in Kilobytes):
Uptime: 591387346 Realtime: 2074243274

** MEMINFO in pid 15990 [com.example.htest] **
                   Pss  Private  Private  SwapPss     Heap     Heap     Heap
                 Total    Dirty    Clean    Dirty     Size    Alloc     Free
                ------   ------   ------   ------   ------   ------   ------
  Native Heap     9952     9936        0     3561    24064    18951     5112
  Dalvik Heap        0        0        0        0    20806     2374    18432
        Stack       56       56        0        8
       Ashmem       17        0       16        0
      Gfx dev     4912     4912        0        0
    Other dev      182      160        0        0
     .so mmap     6307      144     4616       82
    .apk mmap     7566       52     1528       72
    .ttf mmap       60        0       20        0
    .dex mmap     5363        0     2668       16
    .oat mmap      135        0       24        0
    .art mmap     3376     2800      184      540
   Other mmap      250        4       28        0
   EGL mtrack    13320    13320        0        0
    GL mtrack    22964    22964        0        0
      Unknown     6247     5820        0     4774
        TOTAL    89760    60168     9084     9053    44870    21325    23544

 App Summary
                       Pss(KB)
                        ------
           Java Heap:     2984
         Native Heap:     9936
                Code:     9052
               Stack:       56
            Graphics:    41196
       Private Other:     6028
              System:    20508

               TOTAL:    89760       TOTAL SWAP PSS:     9053

 Objects
               Views:       18         ViewRootImpl:        1
         AppContexts:        5           Activities:        1
              Assets:       11        AssetManagers:        0
       Local Binders:       28        Proxy Binders:       37
       Parcel memory:        7         Parcel count:       28
    Death Recipients:        4      OpenSSL Sockets:        0
            WebViews:        1

 SQL
         MEMORY_USED:        0
  PAGECACHE_OVERFLOW:        0          MALLOC_SIZE:        0

```
