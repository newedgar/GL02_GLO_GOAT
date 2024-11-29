const fs = require('fs');
const { TeachingTimeslot, Calendar } = require('./Classes.js');

function loadDataFromFile(filename) {
  const data = fs.readFileSync(filename, 'utf-8');
  const lines = data.split('\n');
  const calendar = new Calendar();
  let currentCourseId = '';

  for (const line of lines) {
    if (line.startsWith('+')) {
      currentCourseId = line.trim();
    } else if (line.trim() !== '') {
      const [_, type, capacity, dayTime, subgroupIndex, roomName] = line.split(',');
      if (dayTime) {
        const [day, time] = dayTime.split(' ');
        const [startTime, endTime] = time.split('-');
        
        const timeslotObj = new TeachingTimeslot(
          type.trim(),
          parseInt(capacity.replace('P=', '')),
          day.replace('H=', ''),
          startTime,
          endTime,
          subgroupIndex.trim(),
          roomName.replace('S=', '').replace('//', '').trim()
        );
        
        calendar.addTimeslot(timeslotObj);
      }
    }
  }

  return calendar;
}

module.exports = { loadDataFromFile };