#!/usr/bin/env node
const { program } = require('@caporal/core');
const { TeachingTimeslot, Calendar } = require('./Classes.js');
const { loadDataFromFile, getConflicts } = require('./Fonction.js');
const fs = require('fs');


program
  .name('sru-scheduler')
  .version('0.0.3')
  .description('Système de gestion des salles pour SRU')

  // Commande pour lire et afficher le contenu du fichier
  .command('read', 'Lire et afficher le contenu du fichier')
  .argument('<file>', 'Fichier d\'entrée à lire')
  .action(({ args }) => {
    try {
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

    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error.message);
      console.error(error.stack);
    }
  })

  // F1: Trouver les salles pour un cours
    .command('find-rooms-by-course', 'Trouver les salles associées à un cours')
    .argument('<file>', 'Fichier d\'entrée à lire')
    .argument('<courseId>', 'Identifiant du cours')
    .action(({ args }) => {
      try{
        const calendar = loadDataFromFile(args.file);
        const timeslots = calendar.timeslots.filter(ts => ts.courseType === args.courseId);
        if (timeslots.length > 0) {
          console.log(`Salles pour le cours ${args.courseId}:`);
          timeslots.forEach(ts => console.log(ts));
        } else {
          console.log(`Aucune salle trouvée pour le cours ${args.courseId}`);
        }
      }
        catch (error) {
            console.error('Erreur:', error.message);
        }
    })

  // F2: Capacité maximale d'une salle
    .command('max-capacity', 'Afficher la capacité maximale d\'une salle')
    .argument('<file>', 'Fichier d\'entrée à lire')
    .argument('<roomName>', 'Nom de la salle')
    .action(({ args }) => {
      try {
        const calendar = loadDataFromFile(args.file);
        const roomTimeslots = calendar.getTimeslotsByRoom(args.roomName);
        if (roomTimeslots.length > 0) {
          const maxCapacity = Math.max(...roomTimeslots.map(ts => ts.capacity));
          console.log(`Capacité maximale de la salle ${args.roomName}: ${maxCapacity}`);
        } else {
          console.log(`Salle ${args.roomName} introuvable.`);
        }
      }
      catch (error) {
        console.error('Erreur:', error.message);
      }
    })

  // F3: Vérifier la disponibilité d'une salle
  .command('check-availability', 'Vérifier la disponibilité d\'une salle')
  .argument('<file>', 'Fichier d\'entrée à lire')
  .argument('<roomName>', 'Nom de la salle')
  .option('--date <date>', 'Date spécifique (L, MA, ME, J, V, S, D)', { validator: ['L', 'MA', 'ME', 'J', 'V', 'S', 'D'] })
  .action(({ args, options }) => {
    try {
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
      
    } catch (error) {
      console.error('Erreur:', error.message);
    }
  })
  
  // F4: Liste des salles par créneau horaire
  .command('list-rooms', 'Lister les salles par créneau horaire')
  .argument('<file>', 'Fichier d\'entrée à lire')
  .option('--date <date>', 'Jour spécifique (L, MA, ME, J, V, S, D)', { validator: ['L', 'MA', 'ME', 'J', 'V', 'S', 'D'] })
  .option('--time <time>', 'Heure spécifique (format HH:MM)', { validator: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/ })
  .option('--status <status>', 'Filtre par statut (available/occupied)', { validator: ['available', 'occupied'] })
  .action(({ args, options }) => {
    try {
      const calendar = loadDataFromFile(args.file);
      const allRooms = calendar.getAllRoomNames();
      
      // Définition des jours et créneaux horaires à afficher
      const days = options.date 
        ? [options.date] 
        : ['L', 'MA', 'ME', 'J', 'V'];
        
      const timeSlots = options.time 
        ? [options.time]
        : Array.from({length: 13}, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

      days.forEach(day => {
        timeSlots.forEach(time => {
          console.log(`\n=== ${day} ${time} ===`);
          
          // Pour chaque salle, vérifie si elle est occupée à ce moment
          allRooms.forEach(room => {
            const roomSlots = calendar.getTimeslotsByRoom(room);
            const isOccupied = roomSlots.some(slot => {
              return slot.date === day && 
                     time >= slot.startTime && 
                     time < slot.endTime;
            });

            // Récupère les détails si la salle est occupée
            const occupiedSlot = roomSlots.find(slot => {
              return slot.date === day && 
                     time >= slot.startTime && 
                     time < slot.endTime;
            });

            // Affiche selon le filtre demandé
            if (!options.status || 
                (options.status === 'available' && !isOccupied) || 
                (options.status === 'occupied' && isOccupied)) {
              
              if (isOccupied) {
                console.log(`  ${room} : Occupé - ${occupiedSlot.courseType} (${occupiedSlot.startTime}-${occupiedSlot.endTime})`);
              } else {
                console.log(`  ${room} : Disponible`);
              }
            }
          });
        });
      });

    } catch (error) {
      console.error('Erreur:', error.message);
      console.error(error.stack);
    }
  })

  // F5: Exporter au format iCalendar
  .command('export-ical', 'Exporter les créneaux au format iCalendar')
  .argument('<file>', 'Fichier d\'entrée à lire')
  .argument('<outputFile>', 'Fichier de sortie pour l\'export iCalendar')
  .action(({ args }) => {
    try {
      const calendar = loadDataFromFile(args.file);
      let icalContent = 'BEGIN:VCALENDAR\nVERSION:2.0\n';
      calendar.timeslots.forEach(ts => {
        icalContent += `BEGIN:VEVENT\nSUMMARY:${ts.courseType}\nLOCATION:${ts.roomName}\nDTSTART:${ts.date}T${ts.startTime.replace(':', '')}00\nDTEND:${ts.date}T${ts.endTime.replace(':', '')}00\nEND:VEVENT\n`;
      });
      icalContent += 'END:VCALENDAR\n';
      fs.writeFileSync(args.outputFile, icalContent);
      console.log(`Fichier iCalendar exporté vers ${args.outputFile}`);
    } catch (error) {
      console.error('Erreur lors de l\'exportation iCalendar:', error.message);
      console.error(error.stack);
    }
  })

  // F6: Vérifier les conflits
  .command('check-conflicts', 'Vérifier les conflits de planning')
  .argument('<file>', 'Fichier d\'entrée à lire')
  .action
  (({ args }) => {
    try {
      const calendar = loadDataFromFile(args.file);
      const conflicts = getConflicts(calendar);
      
      if (conflicts.length > 0) {
        console.log('Conflits trouvés:');
        conflicts.forEach(conflict => {
          console.log(`Conflit entre ${conflict.slot1.courseType} et ${conflict.slot2.courseType} dans la salle ${conflict.slot1.roomName} à ${conflict.slot1.startTime}-${conflict.slot1.endTime}`);
        });
      } else {
        console.log('Aucun conflit trouvé.');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des conflits:', error.message);
      console.error(error.stack);
    }
  })
  
  // F7: Lister tous les créneaux
.command('list-timeslots', 'Lister tous les créneaux')
.argument('<file>', 'Fichier d\'entrée à lire')
.action(({ args }) => {
    const calendar = loadDataFromFile(args.file);
    console.log(`Total de créneaux chargés : ${calendar.timeslots.length}`);
    calendar.timeslots.forEach(ts => console.log(ts));
  });

// Lancement du programme
program.run();