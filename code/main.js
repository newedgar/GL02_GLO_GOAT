const fs = require('fs');
const path = require('path');
const { getAllCruFiles, loadDataFromFile } = require('./Fonction.js');
const { Calendar } = require('./Classes.js');

const DATA_DIR = path.join(__dirname, '../src', 'SujetA_data'); // Chemin vers le dossier data

// Charger toutes les données dans un seul calendrier
const calendar = new Calendar();
const allCruFiles = getAllCruFiles(DATA_DIR);

allCruFiles.forEach(file => {
    const partialCalendar = loadDataFromFile(file); // Charger le fichier en utilisant votre fonction
    partialCalendar.timeslots.forEach(timeslot => {
        calendar.addTimeslot(timeslot); // Ajouter chaque créneau au calendrier principal
    });
});

console.log(`Données chargées : ${calendar.timeslots.length} créneaux.`);

// Exemple de commandes
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage: node main.js <command> [options]');
    console.log('Commands:');
    console.log('--find-rooms-by-course <courseId>');
    console.log('--max-capacity <roomName>');
    console.log('--room-availability <roomName>');
    console.log('--available-rooms <day> <time>');
    console.log('--check-conflicts');
    console.log('--list-timeslots');
    console.log('--export-ical <outputFile>');
    process.exit(0);
}

// Commande: Trouver les salles pour un cours
if (args[0] === '--find-rooms-by-course') {
    const courseId = args[1];
    const timeslots = calendar.timeslots.filter(ts => ts.courseType === courseId);
    if (timeslots.length > 0) {
        console.log(`Rooms for course ${courseId}:`, timeslots);
    } else {
        console.log(`No rooms found for course ${courseId}`);
    }
}

// Commande: Capacité maximale d'une salle
else if (args[0] === '--max-capacity') {
    const roomName = args[1];
    const roomTimeslots = calendar.getTimeslotsByRoom(roomName);
    if (roomTimeslots.length > 0) {
        const maxCapacity = Math.max(...roomTimeslots.map(ts => ts.capacity));
        console.log(`Maximum capacity for room ${roomName}: ${maxCapacity}`);
    } else {
        console.log(`Room ${roomName} not found.`);
    }
}

// Commande: Vérifier les conflits
else if (args[0] === '--check-conflicts') {
    const conflicts = [];
    calendar.timeslots.forEach(ts => {
        if (calendar.hasConflicts(ts)) {
            conflicts.push(ts);
        }
    });
    if (conflicts.length > 0) {
        console.log(`Conflicts detected:`);
        conflicts.forEach(conflict => console.log(conflict));
    } else {
        console.log('No conflicts detected.');
    }
}

// Commande: Disponibilité d'une salle
else if (args[0] === '--room-availability') {
    const roomName = args[1];
    const roomTimeslots = calendar.getTimeslotsByRoom(roomName);
    if (roomTimeslots.length > 0) {
        console.log(`Timeslots for room ${roomName}:`);
        roomTimeslots.forEach(ts => console.log(ts));
    } else {
        console.log(`No timeslots found for room ${roomName}`);
    }
}

// Commande: Salles disponibles pour une plage horaire
else if (args[0] === '--available-rooms') {
    const day = args[1];
    const time = args[2];
    const freeRooms = calendar.getFreeRoomsByDateAndTime(day, time);
    console.log(`Available rooms on ${day} at ${time}:`, freeRooms);
}

// Commande: Lister tous les créneaux
else if (args[0] === '--list-timeslots') {
    console.log(`Total de créneaux chargés : ${calendar.timeslots.length}`);
    calendar.timeslots.forEach(ts => console.log(ts));
}

// Commande: Exporter au format iCalendar
else if (args[0] === '--export-ical') {
    const outputFile = args[1];
    let icalContent = 'BEGIN:VCALENDAR\nVERSION:2.0\n';
    calendar.timeslots.forEach(ts => {
        icalContent += `BEGIN:VEVENT\nSUMMARY:${ts.courseType}\nLOCATION:${ts.roomName}\nDTSTART:${ts.date}T${ts.startTime.replace(':', '')}00\nDTEND:${ts.date}T${ts.endTime.replace(':', '')}00\nEND:VEVENT\n`;
    });
    icalContent += 'END:VCALENDAR\n';
    fs.writeFileSync(outputFile, icalContent);
    console.log(`iCalendar file exported to ${outputFile}`);
}

// Commande inconnue
else {
    console.log('Unknown command. Use --help for the list of commands.');
}
