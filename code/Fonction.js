const fs = require('fs');
const path = require('path');
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

// Fonction pour parcourir les sous-dossiers et récupérer les fichiers .cru
function getAllCruFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true }); // Liste les fichiers et dossiers
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllCruFiles(fullPath)); // Récursion pour les sous-dossiers
    } else if (item.isFile() && fullPath.endsWith('.cru')) {
      files.push(fullPath); // Ajouter les fichiers .cru
    }
  }
  return files;
}

function getConflicts(calendar) {
  const conflicts = [];
  for (let i = 0; i < calendar.timeslots.length; i++) {
    for (let j = i + 1; j < calendar.timeslots.length; j++) {
      if (calendar.timeslots[i].conflictsWith(calendar.timeslots[j])) {
        conflicts.push({
          slot1: calendar.timeslots[i],
          slot2: calendar.timeslots[j]
        });
      }
    }
  }
  return conflicts;
}


module.exports = { loadDataFromFile, getAllCruFiles, getConflicts };