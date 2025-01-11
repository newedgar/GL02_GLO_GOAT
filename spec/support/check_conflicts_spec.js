const fs = require('fs');
const { loadDataFromFile, getConflicts } = require('../../code/Fonction.js')
describe('TestRunner', () => {
  let testFile = 'test-conflicts-data.txt';
  let calendar = null;

  beforeAll(() => {
    const testData = `+UVUV
Seance 1 S=1 / Seance 2 S=3
Seance 1 S=2 / Seance2 S=4
+CL02
1,C1,P=39,H=J 14:00-16:00,F1,S=A001//
1,D1,P=24,H=ME 16:00-18:00,F1,S=S104//
1,D2,P=24,H=J 16:00-18:00,F1,S=S203//
1,T1,P=24,H=V 8:00-10:00,F2,S=A207//
1,T2,P=24,H=ME 10:00-12:00,F2,S=A207//
+CL07
1,C1,P=25,H=L 8:00-10:00,F1,S=S103//
1,D1,P=25,H=MA 14:00-16:00,F1,S=P103//
1,D2,P=0,H=MA 14:00-16:00,F1,S=S104//
1,D3,P=25,H=L 10:00-12:00,F1,S=P103//
1,D4,P=0,H=L 10:00-12:00,F1,S=S103//
+CL10
1,C1,P=26,H=J 8:00-10:00,F1,S=B207//
1,D1,P=25,H=ME 14:00-16:00,F1,S=A105//
1,D2,P=25,H=J 10:00-12:00,F1,S=S204//
1,T1,P=50,H=L 16:00-19:00,F2,S=A203//
+CLE1
1,C1,P=3,H=J 8:00-10:00,F1,S=B207//
1,D1,P=3,H=J 10:00-12:00,F1,S=S204//
+CLE2
1,C1,P=4,H=J 14:00-16:00,F1,S=A001//
1,D1,P=4,H=J 16:00-18:00,F1,S=S203//
+CM02
1,C1,P=52,H=ME 8:00-10:00,F1,S=A001//
1,D1,P=27,H=J 10:00-12:00,F1,S=B210//
1,D2,P=26,H=V 16:00-18:00,F1,S=B210//
1,T1,P=26,H=L 8:00-12:00,F2,S=B001//
1,T2,P=26,H=ME 14:00-18:00,F2,S=B001//
1,T3,P=26,H=L 14:00-18:00,F2,S=B001//`; // Conflit intentionnel

    fs.writeFileSync(testFile, testData);
    console.log(`Fichier ${testFile} créé avec succès.\n`);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(testFile);
      console.log('Fichier de test supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier de test:', error);
    }
  });

  it('should detect conflicts', () => {
    console.log('Test 1: Vérification des conflits');
    try {
      calendar = loadDataFromFile(testFile);
      const conflicts = getConflicts(calendar);

      if (conflicts.length > 0) {
        console.log('Conflits trouvés:');
        conflicts.forEach(conflict => {
          console.log(`Conflit entre ${conflict.slot1.courseType} et ${conflict.slot2.courseType} dans la salle ${conflict.slot1.roomName} à ${conflict.slot1.startTime}-${conflict.slot1.endTime}`);
        });
        expect(conflicts.length).toBeGreaterThan(0);
        console.log('✓ Conflits détectés correctement');
      } else {
        console.log('✗ Aucun conflit détecté alors qu\'il devrait y en avoir');
        fail('Aucun conflit détecté alors qu\'il devrait y en avoir');
      }
    } catch (error) {
      console.log('✗ Erreur lors de la vérification des conflits:', error);
      fail('Erreur lors de la vérification des conflits');
    }
  });
});