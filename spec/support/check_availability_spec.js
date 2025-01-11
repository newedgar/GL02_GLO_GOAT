const fs = require('fs');
const { loadDataFromFile } = require('../../code/Fonction.js');

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
}

describe('Test list-rooms functionality', () => {
    const testFile = 'test-data.txt';
    let calendar;

    beforeAll(() => {
        createTestFile(testFile);
        calendar = loadDataFromFile(testFile);
    });

    afterAll(() => {
        try {
            fs.unlinkSync(testFile);
        } catch (error) {
            console.error('Erreur lors de la suppression du fichier de test:', error);
        }
    });

    it('should retrieve all room names correctly', () => {
        const rooms = calendar.getAllRoomNames();
        const expectedRooms = new Set(['P202', 'P203', 'P204']);

        expect([...rooms].sort()).toEqual([...expectedRooms].sort());
    });

    it('should correctly check room availability at a specific time', () => {
        const date = 'L';
        const time = '8:00';

        const p202Slots = calendar.getTimeslotsByRoom('P202');
        const p202Occupied = p202Slots.some(slot =>
            slot.date === date &&
            slot.startTime === time
        );
        expect(p202Occupied).toBeTrue();

        // Vérification de P203 (devrait être libre)
        const p203Slots = calendar.getTimeslotsByRoom('P203');
        const p203Free = !p203Slots.some(slot =>
            slot.date === date &&
            slot.startTime === time
        );
        expect(p203Free).toBeTrue();
    });

    it('should return the correct days of occupation for a room', () => {
        const room = 'P202';
        const slots = calendar.getTimeslotsByRoom(room);

        const days = new Set(slots.map(slot => slot.date));
        const expectedDays = new Set(['L', 'ME', 'V']);

        expect([...days].sort()).toEqual([...expectedDays].sort());
    });

    it('should filter rooms correctly by availability and occupancy', () => {
        const date = 'L';
        const time = '8:00';

        // Mock des données
        const rooms = ['P202', 'P203', 'P204'];
        const mockTimeslots = {
            P202: [
                { date: 'L', startTime: '7:00', endTime: '9:00' }
            ],
            P203: [
                { date: 'M', startTime: '8:00', endTime: '10:00' }
            ],
            P204: []
        };

        const calendar = {
            getAllRoomNames: () => rooms,
            getTimeslotsByRoom: (room) => mockTimeslots[room] || []
        };

        const occupiedRooms = new Set();
        const availableRooms = new Set();

        for (const room of calendar.getAllRoomNames()) {
            const slots = calendar.getTimeslotsByRoom(room);
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

        const expectedOccupied = new Set(['P202']);
        const expectedAvailable = new Set(['P203', 'P204']);

        expect(occupiedRooms).toEqual(expectedOccupied);
        expect(availableRooms).toEqual(expectedAvailable);
    });

});
