// Represents a teaching timeslot
class TeachingTimeslot {
  constructor(courseType, capacity, date, startTime, endTime, subgroupIndex, roomName) {
    this.courseType = courseType;
    this.capacity = capacity;
    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;
    this.subgroupIndex = subgroupIndex;
    this.roomName = roomName;
  }

  static parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  conflictsWith(other) {
      const thisStart = TeachingTimeslot.parseTime(this.startTime);
      const thisEnd = TeachingTimeslot.parseTime(this.endTime);
      const otherStart = TeachingTimeslot.parseTime(other.startTime);
      const otherEnd = TeachingTimeslot.parseTime(other.endTime);

      return this.date === other.date &&
        this.roomName === other.roomName &&
        !(thisEnd <= otherStart || thisStart >= otherEnd);
    }

  // Equivalence operation
  equals(other) {
    return this.courseType === other.courseType &&
           this.capacity === other.capacity &&
           this.date === other.date &&
           this.startTime === other.startTime &&
           this.endTime === other.endTime &&
           this.subgroupIndex === other.subgroupIndex &&
           this.roomName === other.roomName;
  }

  // Temporal order operations
  isBefore(other) {
    if (this.date < other.date) return true;
    if (this.date === other.date && this.endTime <= other.startTime) return true;
    return false;
  }

  isAfter(other) {
    if (this.date > other.date) return true;
    if (this.date === other.date && this.startTime >= other.endTime) return true;
    return false;
  }
}

// Represents a calendar that manages teaching timeslots
class Calendar {
  constructor() {
    this.timeslots = [];
  }

  isEmpty() {
    return this.timeslots.length === 0;
  } 

  addTimeslot(timeslot) {
    this.timeslots.push(timeslot);
  }

  isInCalendar(timeslot) {
    return this.timeslots.some(item => item.equals(timeslot));
  }

  hasConflicts(timeslot) {
    return this.timeslots.some(item => item.roomName === timeslot.roomName && (item.isBefore(timeslot) || item.isAfter(timeslot)));
  }

  getTimeslotsByRoom(roomName) {
  if (this.isValidRoom(roomName)) {
    throw new Error(`Room ${roomName} does not exist`);
  }
    return this.timeslots.filter(timeslot => timeslot.roomName === roomName);
  }

  getFreeRoomsByDateAndTime(date, time) {
    const rooms = new Set();
    for (const room of this.getAllRoomNames()) {
      if (!this.timeslots.some(timeslot => timeslot.date === date && timeslot.startTime === time && timeslot.roomName === room)) {
        rooms.add(room);
      }
    }
    return rooms;
  }

  getAllRoomNames() {
    return [...new Set(this.timeslots.map(timeslot => timeslot.roomName))];
  }

  getAvailableRooms(date, time) {
    const availableRooms = new Set();
    for (const room of this.getAllRoomNames()) {
      const slots = this.getTimeslotsByRoom(room);
      const isOccupied = slots.some(slot => slot.date === date && time >= slot.startTime && time < slot.endTime);
      if (!isOccupied) {
        availableRooms.add(room);
      }
    }
    return availableRooms;
  }

  getOccupiedRooms(date, time) {
    const occupiedRooms = new Set();
    for (const room of this.getAllRoomNames()) {
      const slots = this.getTimeslotsByRoom(room);
      const isOccupied = slots.some(slot => slot.date === date && time >= slot.startTime && time < slot.endTime);
      if (isOccupied) {
        occupiedRooms.add(room);
      }
    }
    return occupiedRooms;
  }

  getRoomsByAvailability(date, time) {
    const availableRooms = this.getAvailableRooms(date, time);
    const occupiedRooms = this.getOccupiedRooms(date, time);
    return {
      available: [...availableRooms],
      occupied: [...occupiedRooms],
      all: [...this.getAllRoomNames()]
    };
  }
  isValidRoom(roomName) {
    let rooms = this.getAllRoomNames();

    for (let room of rooms) {
      if (room.length > 0 && room[0] === roomName) {
        return true;
      }
    }
    return false;
  }

}

module.exports = {
  TeachingTimeslot,
  Calendar
};