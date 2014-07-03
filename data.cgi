#!/usr/bin/python
import sys,json,time
SEC_IN_DAY = 86400
UNIX_WEEK_DEVIATION = 259200
DAY_IN_WEEK = 7
UTC_DEVIATION = 14400
SEC_IN_WEEK = SEC_IN_DAY * DAY_IN_WEEK

doorLogs = [line.split(',') for line in open('/afs/sipb/project/door/log','r').readlines() if all(['#' not in a for a in line])]

# params is an object containing the start time and end time
params = sys.stdin.read()
if params:
  params = json.loads(params)
  startDate = params["startDate"]
  endDate = params["endDate"]
  selectedDoorLogs=[]
  for n in doorLogs:
    if int(startDate)<=int(n[1])<=int(endDate):
      selectedDoorLogs.append(n)
  doorLogs = selectedDoorLogs[:]

# Get the number of seconds since the most recent 
# week start (midnight between Sat. and Sun.)
def seconds_since_week_start(time):
  return int(time - UNIX_WEEK_DEVIATION - UTC_DEVIATION) % SEC_IN_WEEK

# Given a list of tuples of open and close times, 
# return list of tuples of times since first week start
def map_relative_times(list_of_tuples):
  first_time = list_of_tuples[0][0]
  most_recent_week_start = first_time - seconds_since_week_start(first_time)
  relatively_timed_tuples = []
  for open_tuple in list_of_tuples:
    relatively_timed_tuples.append((open_tuple[0]-most_recent_week_start,open_tuple[1]-most_recent_week_start))
  return relatively_timed_tuples

if doorLogs[0][0]=="0":
  doorLogs=doorLogs[1:] # removes first line if it's a closed line
doorIntervals = [(doorLogs[2*n],doorLogs[2*n+1]) for n in range(len(doorLogs)/2)] # full lines from file
timeIntervals = [(int(line[0][1]),int(line[1][1])) for line in doorIntervals]
dump = map_relative_times(timeIntervals)

print "Content-type: application/json\n"
print json.dumps(dump)
