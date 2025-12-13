import { ClassScheduleItem } from '../types/gym';

export const MOCK_CLASS_SCHEDULE: ClassScheduleItem[] = [
  {
    id: "cls_551",
    name: "Morning HIIT",
    dateTime: new Date(new Date().setHours(7, 0, 0, 0)),
    durationMinutes: 45,
    capacity: 20,
    bookedCount: 18,
    instructorName: "Sarah Connor",
    status: "active"
  },
  {
    id: "cls_552",
    name: "Yoga Flow",
    dateTime: new Date(new Date().setHours(12, 0, 0, 0)),
    durationMinutes: 60,
    capacity: 15,
    bookedCount: 15,
    instructorName: "Jessica Pearson",
    status: "active"
  },
  {
    id: "cls_553",
    name: "Powerlifting Basics",
    dateTime: new Date(new Date().setHours(18, 30, 0, 0)),
    durationMinutes: 90,
    capacity: 10,
    bookedCount: 4,
    instructorName: "Alex Johnson",
    status: "active"
  },
  {
    id: "cls_554",
    name: "Spin Cycle",
    dateTime: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
    durationMinutes: 45,
    capacity: 25,
    bookedCount: 12,
    instructorName: "Mike Ross",
    status: "cancelled"
  }
];