#!/usr/bin/python
import json, time

curtime = int(time.time())
dump = []

f = open('/afs/sipb/project/door/log', 'r')
for line in f:
  if line[0] != '#': 
    arr = line.split(',')
    toggle = ("start" if int(arr[0]) else "end")
    unixtime = int(arr[1])
    if len(dump) == 0:
      if toggle == "start":
        dump.append([unixtime]) 
    else:
      if len(dump[-1]) == 1:
        dump[-1].append(unixtime)
      else:
        dump.append([unixtime])

if len(dump[-1]) == 1:
  dump.pop()
        
f.close()

print "Content-type: application/json\n"
print json.dumps(dump)
