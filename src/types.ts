export interface Student {
  id: string;
  rollNo: string;
  name: string;
  joinedDate: string;
  photo?: string; // Base64 or Data URL of the student photo
  mobileNo?: string;
}

export interface UserAccount {
  id: string; // Unique username/ID
  passwordHash: string; // Password stored securely (or plain for simple client state)
  isAdmin?: boolean;
  students?: Student[];
  subjects?: string[];
  attendanceDb?: Record<string, DayAttendance>;
  weeklyTimetable?: WeeklyTimetable;
}

export type SlotId = 'slot1' | 'slot2';

export interface SlotConfig {
  id: SlotId;
  name: string;
  time: string;
}

export const SLOTS: SlotConfig[] = [
  { id: 'slot1', name: 'Morning Lecture', time: '10:00 AM - 1:00 PM' },
  { id: 'slot2', name: 'Afternoon Lecture', time: '2:00 PM - 5:00 PM' },
];

export interface WeeklySlotTemplate {
  subject: string;
  noLecture: boolean;
}

export interface DayScheduleTemplate {
  slot1: WeeklySlotTemplate;
  slot2: WeeklySlotTemplate;
}

export type WeeklyTimetable = Record<number, DayScheduleTemplate>; // Key is 0 (Sunday) to 6 (Saturday)

export interface DayAttendance {
  date: string; // YYYY-MM-DD
  slot1Subject: string;
  slot2Subject: string;
  slot1Taken: boolean;
  slot2Taken: boolean;
  slot1Present: Record<string, boolean>; // student.id -> boolean
  slot2Present: Record<string, boolean>; // student.id -> boolean
  isHoliday?: boolean;
  holidayType?: 'regular' | 'unexpected';
  holidayReason?: string;
  slot1NoLecture?: boolean;
  slot2NoLecture?: boolean;
}
