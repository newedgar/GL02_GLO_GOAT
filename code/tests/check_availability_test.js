// test-list-rooms.js
const fs = require('fs');
const { TeachingTimeslot, Calendar } = require('../Classes.js');
const { loadDataFromFile } = require('../Fonction.js');

function createTestFile(filename) {
  const testData = `+ME01
1,C1,P=30,H=L 8:00-10:00,G1,S=P202//
1,T1,P=15,H=MA 10:00-12:00,G2,S=P203//
+IN02
1,C1,P=45,H=ME 14:00-16:00,G1,S=P202//
1,T2,P=20,H=J 8:00-10:00,G2,S=P204//
+GL02
1,C1,P=35,H=V 10:00-12:00,G1,S=P202//
1,T1,P=25,H=L 14:00-16:00,G2,S=P203//`;

  fs.writeFileSync(filename, testData);
  console.log(`Fichier ${filename} créé avec succès.\n`);
}

class TestRunner {
  constructor() {
    this.testFile = 'test-data.txt';
    this.calendar = null;
  }

  async runAllTests() {
    console.log('=== Début des tests de list-rooms ===\n');
    
    try {
      await this.setup();
      await this.testGetAllRooms();
      await this.testRoomAvailabilitySpecificTime();
      await this.testRoomAvailabilityByDay();
      await this.testRoomFiltering();
    } catch (error) {
      console.error('Erreur pendant les tests:', error);
    } finally {
      await this.cleanup();
    }
    
    console.log('\n=== Fin des tests ===');
  }

  async setup() {
    createTestFile(this.testFile);
    this.calendar = loadDataFromFile(this.testFile);
  }

  async cleanup() {
    try {
      fs.unlinkSync(this.testFile);
      console.log('\nFichier de test supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier de test:', error);
    }
  }

  async testGetAllRooms() {
    console.log('Test 1: Récupération de toutes les salles');
    const rooms = this.calendar.getAllRoomNames();
    const expectedRooms = new Set(['P202', 'P203', 'P204']);
    
    if (JSON.stringify([...rooms].sort()) === JSON.stringify([...expectedRooms].sort())) {
      console.log('✓ Liste complète des salles correcte');
    } else {
      console.log(`✗ Liste des salles incorrecte (attendu: ${[...expectedRooms]}, obtenu: ${[...rooms]})`);
    }
  }

  async testRoomAvailabilitySpecificTime() {
    console.log('\nTest 2: Disponibilité des salles à un moment spécifique');
    const date = 'L';
    const time = '8:00';
    
    // Vérification de P202 (devrait être occupé)
    const p202Slots = this.calendar.getTimeslotsByRoom('P202');
    const p202Occupied = p202Slots.some(slot => 
      slot.date === date && 
      slot.startTime === time
    );
    console.log(`P202 le Lundi à 8h - Occupé: ${p202Occupied ? '✓' : '✗'}`);

    // Vérification de P203 (devrait être libre)
    const p203Slots = this.calendar.getTimeslotsByRoom('P203');
    const p203Free = !p203Slots.some(slot => 
      slot.date === date && 
      slot.startTime === time
    );
    console.log(`P203 le Lundi à 8h - Libre: ${p203Free ? '✓' : '✗'}`);
  }

  async testRoomAvailabilityByDay() {
    console.log('\nTest 3: Disponibilité des salles par jour');
    const room = 'P202';
    const slots = this.calendar.getTimeslotsByRoom(room);
    
    // P202 devrait avoir des cours L, ME et V
    const days = new Set(slots.map(slot => slot.date));
    const expectedDays = new Set(['L', 'ME', 'V']);
    
    if (JSON.stringify([...days].sort()) === JSON.stringify([...expectedDays].sort())) {
      console.log(`✓ Jours d'occupation de ${room} corrects`);
    } else {
      console.log(`✗ Jours d'occupation incorrects (attendu: ${[...expectedDays]}, obtenu: ${[...days]})`);
    }
  }

  async testRoomFiltering() {
    console.log('\nTest 4: Filtrage des salles disponibles/occupées');
    const date = 'L';
    const time = '8:00';
    
    // Salles occupées à ce moment
    const occupiedRooms = new Set();
    // Salles libres à ce moment
    const availableRooms = new Set();
    
    for (const room of this.calendar.getAllRoomNames()) {
      const slots = this.calendar.getTimeslotsByRoom(room);
      const isOccupied = slots.some(slot => 
        slot.date === date && 
        time >= slot.startTime && 
        time < slot.endTime
      );
      
      if (isOccupied) {
        occupiedRooms.add(room);
      } else {
        availableRooms.add(room);
      }
    }
    
    console.log('Salles occupées:', [...occupiedRooms]);
    console.log('Salles disponibles:', [...availableRooms]);
    
    const expectedOccupied = new Set(['P202']);
    const expectedAvailable = new Set(['P203', 'P204']);
    
    const occupiedCorrect = JSON.stringify([...occupiedRooms].sort()) === JSON.stringify([...expectedOccupied].sort());
    const availableCorrect = JSON.stringify([...availableRooms].sort()) === JSON.stringify([...expectedAvailable].sort());
    
    console.log(`Résultat du filtrage : ${occupiedCorrect && availableCorrect ? '✓' : '✗'}`);
  }
}

// Exécution des tests
const testRunner = new TestRunner();
testRunner.runAllTests();