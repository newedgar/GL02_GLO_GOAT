const fs = require('fs');
const { TeachingTimeslot, Calendar } = require('./Classes.js');
const { loadDataFromFile } = require('./Fonction.js');

// Création d'un fichier de test
const createTestFile = () => {
  const testData = `+ME01
1,C1,P=30,H=L 8:00-10:00,G1,S=P202//
1,T1,P=15,H=MA 10:00-12:00,G2,S=P203//
+IN02
1,C1,P=45,H=ME 14:00-16:00,G1,S=P202//
1,T2,P=20,H=J 8:00-10:00,G2,S=P204//`;

  fs.writeFileSync('test_schedule.txt', testData);
  console.log('Fichier de test créé avec succès');
};

// Fonction principale de test
const runTest = () => {
  try {
    // Création du fichier de test
    createTestFile();

    // Chargement des données
    console.log('Chargement des données...');
    const calendar = loadDataFromFile('../src/SujetA_data/AB/edt.cru');

    // Tests de vérification
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
    console.error('Erreur lors du test:', error);
    console.error(error.stack); // Affiche la stack trace pour mieux déboguer
  } finally {
    // Nettoyage du fichier de test
    try {
      fs.unlinkSync('test_schedule.txt');
      console.log('\nFichier de test supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier de test:', error);
    }
  }
};

// Exécution du test
runTest();