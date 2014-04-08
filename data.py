#!/usr/bin/python
import json, time

curtime = int(time.time())
lasttime = curtime - 60*60*24*10
dump = dict()

f = open('/afs/sipb/project/door/log', 'r')
for line in f:
  if line[0] != '#': 
    arr = line.split(',')
    toggle = ("start" if int(arr[0]) else "end")
    unixtime = int(arr[1])
    datetime = arr[3].split()
    day = datetime[2]
    time = datetime[3][:-3]
    if unixtime >= lasttime:
      if day in dump:
        dump[day][-1][toggle] = time
      else:
        dump[day] = list()
        dump[day].append(dict())
        dump[day][0][toggle] = time
f.close()

print "Content-type: application/json\n"
print json.dumps(dump)
