#!/usr/bin/env node
const { program } = require('@caporal/core');
const { TeachingTimeslot, Calendar } = require('./Classes.js');
const { loadDataFromFile } = require('./Fonction.js');

program
  .name('sru-scheduler')
  .version('0.0.1')
  .description('Système de gestion des salles pour SRU')

  // Commande pour lire et afficher le contenu du fichier
  .command('read', 'Lire et afficher le contenu du fichier')
  .argument('<file>', 'Fichier d\'entrée à lire')
  .action(({ args }) => {
      const calendar = loadDataFromFile(args.file);
      
      console.log('\n=== État du calendrier ===');
      console.log('Nombre de créneaux :', calendar.timeslots.length);
      
      console.log('\n=== Détail des créneaux ===');
      calendar.timeslots.forEach((slot, index) => {
        console.log(`\nCréneau ${index + 1}:`);
        console.log('Type de cours:', slot.courseType);
        console.log('Capacité:', slot.capacity);
        console.log('Date:', slot.date);
        console.log('Heure de début:', slot.startTime);
        console.log('Heure de fin:', slot.endTime);
        console.log('Sous-groupe:', slot.subgroupIndex);
        console.log('Salle:', slot.roomName);
      });

      // Test des salles uniques
      const rooms = calendar.getAllRoomNames();
      console.log('\n=== Salles utilisées ===');
      console.log(Array.from(rooms));

  })


// F3: Vérifier la disponibilité d'une salle
  .command('check-availability', 'Vérifier la disponibilité d\'une salle')
  .argument('<file>', 'Fichier d\'entrée à lire')
  .argument('<roomName>', 'Nom de la salle')
  .option('--date <date>', 'Date spécifique (L, MA, ME, J, V, S, D)', { validator: ['L', 'MA', 'ME', 'J', 'V', 'S', 'D'] })
  .action(({ args, options }) => {
      const calendar = loadDataFromFile(args.file);
      const roomSlots = calendar.getTimeslotsByRoom(args.roomName);
      
      // Définir les créneaux de la journée (8h à 20h)
      const timeSlots = [];
      for (let hour = 8; hour < 20; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`);
      }
      
      console.log(`\nDisponibilité de la salle ${args.roomName}:`);
      
      const daysToCheck = options.date ? [options.date] : ['L', 'MA', 'ME', 'J', 'V'];
      
      daysToCheck.forEach(day => {
        console.log(`\n${day}:`);
        const daySlots = roomSlots.filter(slot => slot.date === day);
        
        timeSlots.forEach(timeSlot => {
          const [start] = timeSlot.split('-');
          const isOccupied = daySlots.some(slot => {
            const slotStart = slot.startTime;
            const slotEnd = slot.endTime;
            return start >= slotStart && start < slotEnd;
          });
          
          if (!isOccupied) {
            console.log(`  ✓ ${timeSlot} : Disponible`);
          } else {
            const occupiedBy = daySlots.find(slot => {
              const slotStart = slot.startTime;
              const slotEnd = slot.endTime;
              return start >= slotStart && start < slotEnd;
            });
            console.log(`  ✗ ${timeSlot} : Occupé (${occupiedBy.courseType})`);
          }
        });
      });
  })


// Lancement du programme
program.run();