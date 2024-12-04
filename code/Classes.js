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

  conflictsWith(other) {
    return this.day === other.day &&
           this.roomName === other.roomName &&
           ((this.startTime >= other.startTime && this.startTime < other.endTime) ||
            (other.startTime >= this.startTime && other.startTime < this.endTime));
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
    return this.timeslots.some(t => t.equals(timeslot));
  }

  hasConflicts(timeslot) {
    return this.timeslots.some(t => t.roomName === timeslot.roomName && (t.isBefore(timeslot) || t.isAfter(timeslot)));
  }

  getTimeslotsByRoom(roomName) {
    return this.timeslots.filter(t => t.roomName === roomName);
  }

  getFreeRoomsByDateAndTime(date, time) {
    const rooms = new Set();
    for (const room of this.getAllRoomNames()) {
      if (!this.timeslots.some(t => t.date === date && t.startTime === time && t.roomName === room)) {
        rooms.add(room);
      }
    }
    return rooms;
  }

  getAllRoomNames() {
    return [...new Set(this.timeslots.map(t => t.roomName))];
  }
}

module.exports = {
  TeachingTimeslot,
  Calendar
};