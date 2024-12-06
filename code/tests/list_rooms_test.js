// test-list-rooms.js
const fs = require('fs');
const { TeachingTimeslot, Calendar } = require('../Classes.js');
const { loadDataFromFile } = require('../Fonction.js');

class TestRunner {
    constructor() {
        this.testFile = 'test-data.txt';
        this.calendar = null;
    }

    createTestFile() {
        const testData = `+ME01
1,C1,P=30,H=L 8:00-10:00,G1,S=P202//
1,T1,P=15,H=MA 10:00-12:00,G2,S=P203//
+IN02
1,C1,P=45,H=ME 14:00-16:00,G1,S=P202//
1,T2,P=20,H=J 8:00-10:00,G2,S=P204//`;

        fs.writeFileSync(this.testFile, testData);
        console.log(`Fichier ${this.testFile} créé avec succès.\n`);
    }

    cleanup() {
        try {
            fs.unlinkSync(this.testFile);
            console.log('Fichier de test supprimé');
        } catch (error) {
            console.error('Erreur lors de la suppression du fichier de test:', error);
        }
    }

    testRoomListFromFile() {
        console.log('Test 1: Lecture des données depuis le fichier');
        try {
            this.calendar = loadDataFromFile(this.testFile);
            console.log('✓ Données chargées avec succès');
        } catch (error) {
            console.log('✗ Erreur lors du chargement des données:', error);
            return false;
        }
        return true;
    }

    testGetAllRooms() {
        console.log('\nTest 2: Récupération de toutes les salles');
        const rooms = this.calendar.getAllRoomNames();
        const expectedRooms = new Set(['P202', 'P203', 'P204']);
        
        const isEqual = JSON.stringify([...rooms].sort()) === JSON.stringify([...expectedRooms].sort());
        if (isEqual) {
            console.log('✓ Liste des salles correcte');
        } else {
            console.log(`✗ Liste des salles incorrecte (attendu: ${[...expectedRooms]}, obtenu: ${[...rooms]})`);
        }
        return isEqual;
    }

    testRoomAvailability() {
        console.log('\nTest 3: Vérification de la disponibilité des salles');
        const date = 'L';
        const time = '8:00';
        let allTestsPassed = true;

        // Test P202 (doit être occupé)
        const p202Slots = this.calendar.getTimeslotsByRoom('P202');
        const p202Occupied = p202Slots.some(slot => 
            slot.date === date && 
            slot.startTime === time
        );
        
        if (p202Occupied) {
            console.log('✓ P202 est correctement marquée comme occupée');
        } else {
            console.log('✗ P202 devrait être occupée');
            allTestsPassed = false;
        }

        // Test P203 (doit être libre)
        const p203Slots = this.calendar.getTimeslotsByRoom('P203');
        const p203Free = !p203Slots.some(slot => 
            slot.date === date && 
            slot.startTime === time
        );

        if (p203Free) {
            console.log('✓ P203 est correctement marquée comme libre');
        } else {
            console.log('✗ P203 devrait être libre');
            allTestsPassed = false;
        }

        return allTestsPassed;
    }

    runAllTests() {
        console.log('=== Début des tests de list-rooms ===\n');
        
        try {
            this.createTestFile();

            let allPassed = true;
            allPassed = this.testRoomListFromFile() && allPassed;
            allPassed = this.testGetAllRooms() && allPassed;
            allPassed = this.testRoomAvailability() && allPassed;

            console.log('\n=== Résumé des tests ===');
            console.log(allPassed ? 
                '✓ Tous les tests ont réussi' : 
                '✗ Certains tests ont échoué');

        } catch (error) {
            console.error('\nErreur pendant les tests:', error);
        } finally {
            this.cleanup();
            console.log('\n=== Fin des tests ===');
        }
    }
}

// Exécution des tests
const testRunner = new TestRunner();
testRunner.runAllTests();