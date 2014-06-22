import time
SEC_IN_DAY = 86400
UNIX_WEEK_DEVIATION = 259200
DAY_IN_WEEK = 7
SEC_IN_WEEK = SEC_IN_DAY * DAY_IN_WEEK

# Get the number of seconds since the most recent 
# week start (midnight between Sat. and Sun.)
def seconds_since_week_start(time):
  return int(time - UNIX_WEEK_DEVIATION) % SEC_IN_WEEK

# Given a list of tuples of open and close times, 
# return list of tuples of times since first week start
def map_relative_times(list_of_tuples):
  first_time = list_of_tuples[0][0]
  most_recent_week_start = first_time - seconds_since_week_start(first_time)
  relatively_timed_tuples = []
  for open_tuple in list_of_tuples:
    relatively_timed_tuples.append((open_tuple[0]-most_recent_week_start,open_tuple[1]-most_recent_week_start))
  return relatively_timed_tuples
