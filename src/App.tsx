import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Download, 
  Upload, 
  RefreshCw, 
  Award, 
  FileSpreadsheet,
  ChevronRight,
  ChevronLeft,
  Coffee,
  Sparkles,
  Copy,
  Check,
  Pencil,
  CalendarRange,
  Camera,
  Shield,
  Key,
  LogOut,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, DayAttendance, SLOTS, SlotId, WeeklyTimetable, UserAccount } from './types';
import { DEFAULT_SUBJECTS, INITIAL_STUDENTS } from './initialData';

export default function App() {
  // --- STATE ---
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('college_tracker_students_unified');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_STUDENTS;
  });

  const [subjects, setSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem('college_tracker_subjects_unified');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_SUBJECTS;
  });

  const [attendanceDb, setAttendanceDb] = useState<Record<string, DayAttendance>>(() => {
    const saved = localStorage.getItem('college_tracker_db_unified');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  // Active Date selection (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to today
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Active Slot tab
  const [activeSlot, setActiveSlot] = useState<SlotId>('slot1');

  // Sidebar controls
  const [sidebarTab, setSidebarTab] = useState<'analytics' | 'calendar' | 'roster' | 'subjects' | 'backup' | 'timetable'>('analytics');

  // Calendar month/year navigation
  const [calendarYear, setCalendarYear] = useState<number>(() => {
    const d = new Date();
    return d.getFullYear();
  });
  const [calendarMonth, setCalendarMonth] = useState<number>(() => {
    const d = new Date();
    return d.getMonth(); // 0 is Jan, 11 is Dec
  });

  // Holiday temporary inputs
  const [tempHolidayReason, setTempHolidayReason] = useState('');
  const [tempHolidayType, setTempHolidayType] = useState<'regular' | 'unexpected'>('regular');

  // Filters & Form inputs
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [rosterSearchQuery, setRosterSearchQuery] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentMobile, setNewStudentMobile] = useState('');
  const [editingSubjectIndex, setEditingSubjectIndex] = useState<number | null>(null);
  const [editingSubjectValue, setEditingSubjectValue] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  // Student editing & confirmation states
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingStudentName, setEditingStudentName] = useState('');
  const [editingStudentRoll, setEditingStudentRoll] = useState('');
  const [editingStudentMobile, setEditingStudentMobile] = useState('');
  const [studentError, setStudentError] = useState<string | null>(null);
  const [studentAddError, setStudentAddError] = useState<string | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [showDemoResetConfirm, setShowDemoResetConfirm] = useState(false);

  // Weekly timetable configuration state
  const [weeklyTimetable, setWeeklyTimetable] = useState<WeeklyTimetable>(() => {
    const saved = localStorage.getItem('college_tracker_timetable_unified');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      1: { slot1: { subject: 'Mathematics I', noLecture: false }, slot2: { subject: 'Physics Lab', noLecture: false } },
      2: { slot1: { subject: 'Computer Programming', noLecture: false }, slot2: { subject: 'Digital Electronics', noLecture: false } },
      3: { slot1: { subject: 'Technical Writing', noLecture: false }, slot2: { subject: 'Mathematics I', noLecture: false } },
      4: { slot1: { subject: 'Physics Lab', noLecture: false }, slot2: { subject: 'Computer Programming', noLecture: false } },
      5: { slot1: { subject: 'Digital Electronics', noLecture: false }, slot2: { subject: 'Technical Writing', noLecture: false } },
      6: { slot1: { subject: '', noLecture: true }, slot2: { subject: '', noLecture: true } },
      0: { slot1: { subject: '', noLecture: true }, slot2: { subject: '', noLecture: true } }
    };
  });

  // Roster Title customization state
  const [rosterTitle, setRosterTitle] = useState<string>(() => {
    const saved = localStorage.getItem('college_tracker_roster_title_unified');
    return saved ? saved : 'College Student Database';
  });
  const [isEditingRosterTitle, setIsEditingRosterTitle] = useState(false);
  const [tempRosterTitle, setTempRosterTitle] = useState('');

  // Selected student for detail modal/drilldown
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [reportCardViewMode, setReportCardViewMode] = useState<'overall' | 'subject'>('subject');
  const [showSubjectWiseClasses, setShowSubjectWiseClasses] = useState<boolean>(true);
  const [selectedAnalyticsSubject, setSelectedAnalyticsSubject] = useState<string | null>(null);

  // Home Page custom interactive roster modal
  const [homeRosterOpen, setHomeRosterOpen] = useState(false);

  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportActiveSlot, setExportActiveSlot] = useState<SlotId | 'both'>('slot1');
  const [copiedState, setCopiedState] = useState(false);

  // College Name customization states
  const [collegeName, setCollegeName] = useState<string>(() => {
    const saved = localStorage.getItem('college_tracker_name_unified');
    return saved ? saved : 'CampusAttend Hub';
  });
  const [isEditingCollegeName, setIsEditingCollegeName] = useState(false);
  const [tempCollegeName, setTempCollegeName] = useState('');

  useEffect(() => {
    if (exportModalOpen) {
      setExportActiveSlot(activeSlot);
    }
  }, [exportModalOpen, activeSlot]);

  const [isLoadedFromServer, setIsLoadedFromServer] = useState(false);

  // Offline mode
  useEffect(() => {
    setIsLoadedFromServer(true);
  }, []);

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    if (!isLoadedFromServer) return;

    localStorage.setItem('college_tracker_students_unified', JSON.stringify(students));
    localStorage.setItem('college_tracker_subjects_unified', JSON.stringify(subjects));
    localStorage.setItem('college_tracker_db_unified', JSON.stringify(attendanceDb));
    localStorage.setItem('college_tracker_timetable_unified', JSON.stringify(weeklyTimetable));
    localStorage.setItem('college_tracker_roster_title_unified', rosterTitle);
    localStorage.setItem('college_tracker_name_unified', collegeName);

    // Offline mode - data is already saved in localStorage.
}, [students, subjects, attendanceDb, weeklyTimetable, rosterTitle, collegeName, isLoadedFromServer]);

  // --- HELPERS ---
  const getDayOfWeek = (dateStr: string): number => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day).getDay(); // 0 is Sunday, 1 is Monday, ...
    }
    return new Date(dateStr).getDay();
  };

  const renderStudentAvatar = (name: string, photo?: string, sizeClass = "w-8 h-8 text-xs") => {
    if (photo) {
      return (
        <img 
          src={photo} 
          alt={name} 
          className={`${sizeClass.split(' ')[0]} ${sizeClass.split(' ')[1]} object-cover border border-slate-300 shadow-xs shrink-0`}
          referrerPolicy="no-referrer"
        />
      );
    }
    const initials = name
      .trim()
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';
    
    const colors = [
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-amber-100 text-amber-800 border-amber-200',
      'bg-rose-100 text-rose-800 border-rose-200',
      'bg-sky-100 text-sky-800 border-sky-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorClass = colors[Math.abs(hash) % colors.length];

    return (
      <div className={`${sizeClass} rounded-none border flex items-center justify-center font-black shrink-0 ${colorClass}`}>
        {initials}
      </div>
    );
  };

  // --- CURRENT DAY STATE LOGIC ---
  // Ensure we have a DayAttendance record for the currently selected date.
  // If not, we dynamically fetch/instantiate a default placeholder structure.
  const currentDayData = useMemo<DayAttendance>(() => {
    if (attendanceDb[selectedDate]) {
      return attendanceDb[selectedDate];
    }
    const dayOfWeek = getDayOfWeek(selectedDate);
    const template = weeklyTimetable[dayOfWeek] || {
      slot1: { subject: subjects[0] || 'No Subject Defined', noLecture: false },
      slot2: { subject: subjects[1] || subjects[0] || 'No Subject Defined', noLecture: false }
    };

    return {
      date: selectedDate,
      slot1Subject: template.slot1?.subject || subjects[0] || 'No Subject Defined',
      slot2Subject: template.slot2?.subject || subjects[1] || subjects[0] || 'No Subject Defined',
      slot1NoLecture: template.slot1?.noLecture ?? false,
      slot2NoLecture: template.slot2?.noLecture ?? false,
      slot1Taken: false,
      slot2Taken: false,
      slot1Present: {},
      slot2Present: {},
    };
  }, [selectedDate, attendanceDb, subjects, weeklyTimetable]);

  // Helper helper to update current day record in the state database
  const updateCurrentDay = (updated: Partial<DayAttendance>) => {
    setAttendanceDb(prev => {
      const existing = prev[selectedDate] || {
        date: selectedDate,
        slot1Subject: currentDayData.slot1Subject,
        slot2Subject: currentDayData.slot2Subject,
        slot1NoLecture: currentDayData.slot1NoLecture,
        slot2NoLecture: currentDayData.slot2NoLecture,
        slot1Taken: false,
        slot2Taken: false,
        slot1Present: {},
        slot2Present: {},
      };
      return {
        ...prev,
        [selectedDate]: {
          ...existing,
          ...updated,
        }
      };
    });
  };

  // Keep holiday temp inputs in sync with the current day's saved holiday state
  useEffect(() => {
    setTempHolidayReason(currentDayData?.holidayReason || '');
    setTempHolidayType(currentDayData?.holidayType || 'regular');
  }, [selectedDate, currentDayData]);

  // Automatically navigate calendar view to selected date's month and year
  useEffect(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1; // 0-indexed month
        if (!isNaN(y) && !isNaN(m)) {
          setCalendarYear(y);
          setCalendarMonth(m);
        }
      }
    }
  }, [selectedDate]);

  // --- HANDLERS ---
  const handleToggleStudent = (studentId: string, slot: SlotId) => {
    const isTakenKey = slot === 'slot1' ? 'slot1Taken' : 'slot2Taken';
    const presentKey = slot === 'slot1' ? 'slot1Present' : 'slot2Present';
    
    const currentPresentRecord = currentDayData[presentKey];
    const wasPresent = !!currentPresentRecord[studentId];
    
    updateCurrentDay({
      [isTakenKey]: true,
      [presentKey]: {
        ...currentPresentRecord,
        [studentId]: !wasPresent
      }
    });
  };

  const handleMarkAll = (status: boolean, slot: SlotId) => {
    const isTakenKey = slot === 'slot1' ? 'slot1Taken' : 'slot2Taken';
    const presentKey = slot === 'slot1' ? 'slot1Present' : 'slot2Present';

    const newAttendance: Record<string, boolean> = {};
    students.forEach(st => {
      newAttendance[st.id] = status;
    });

    updateCurrentDay({
      [isTakenKey]: true,
      [presentKey]: newAttendance
    });
  };

  const handleResetSession = (slot: SlotId) => {
    const isTakenKey = slot === 'slot1' ? 'slot1Taken' : 'slot2Taken';
    const presentKey = slot === 'slot1' ? 'slot1Present' : 'slot2Present';

    updateCurrentDay({
      [isTakenKey]: false,
      [presentKey]: {}
    });
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentAddError(null);
    if (!newStudentName.trim() || !newStudentRoll.trim()) return;

    // Check if roll number already exists
    if (students.some(s => s.rollNo.toUpperCase() === newStudentRoll.trim().toUpperCase())) {
      setStudentAddError("A student with this Roll Number already exists!");
      return;
    }

    const newStudent: Student = {
      id: 'st_' + Date.now(),
      rollNo: newStudentRoll.trim().toUpperCase(),
      name: newStudentName.trim(),
      joinedDate: new Date().toISOString().split('T')[0],
      mobileNo: newStudentMobile.trim() || undefined
    };

    setStudents(prev => [...prev, newStudent]);
    setNewStudentName('');
    setNewStudentRoll('');
    setNewStudentMobile('');
    setStudentAddError(null);
  };

  const handleSaveStudentEdit = (id: string) => {
    setStudentError(null);
    const trimmedRoll = editingStudentRoll.trim().toUpperCase();
    const trimmedName = editingStudentName.trim();

    if (!trimmedRoll || !trimmedName) {
      setStudentError("Roll Number and Name are required.");
      return;
    }

    if (students.some(s => s.id !== id && s.rollNo.toUpperCase() === trimmedRoll)) {
      setStudentError("A student with this Roll Number already exists!");
      return;
    }

    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          rollNo: trimmedRoll,
          name: trimmedName,
          mobileNo: editingStudentMobile.trim() || undefined
        };
      }
      return s;
    }));

    setEditingStudentId(null);
    setEditingStudentMobile('');
    setStudentError(null);
  };

  const handleRemoveStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    if (selectedStudentDetail?.id === id) {
      setSelectedStudentDetail(null);
    }
    setDeletingStudentId(null);
  };

  const [subjectError, setSubjectError] = useState<string | null>(null);

  const handleUpdateSubject = (index: number) => {
    setSubjectError(null);
    if (!editingSubjectValue.trim()) return;
    
    // Check duplicates
    if (subjects.some((sub, i) => i !== index && sub.toLowerCase() === editingSubjectValue.trim().toLowerCase())) {
      setSubjectError("Subject name already exists!");
      return;
    }

    const updated = [...subjects];
    updated[index] = editingSubjectValue.trim();
    setSubjects(updated);
    setEditingSubjectIndex(null);
    setEditingSubjectValue('');
    setSubjectError(null);
  };

  // --- STATS COMPUTATION ---
  // Count overall stats across all historical records
  const overallStats = useMemo(() => {
    let totalClassesRegistered = 0;
    let totalStudentPresents = 0;
    
    // Subject wise count
    const subjectStats: Record<string, { totalClasses: number; presents: number }> = {};
    subjects.forEach(sub => {
      subjectStats[sub] = { totalClasses: 0, presents: 0 };
    });

    // Student wise count
    const studentStats: Record<string, { totalClasses: number; presents: number }> = {};
    const studentSubjectStats: Record<string, Record<string, { totalClasses: number; presents: number }>> = {};
    students.forEach(st => {
      studentStats[st.id] = { totalClasses: 0, presents: 0 };
      studentSubjectStats[st.id] = {};
      subjects.forEach(sub => {
        studentSubjectStats[st.id][sub] = { totalClasses: 0, presents: 0 };
      });
    });

    (Object.values(attendanceDb) as DayAttendance[]).forEach(day => {
      // Ignore holiday days
      if (day.isHoliday) {
        return;
      }

      // Slot 1
      if (!day.slot1NoLecture && day.slot1Taken && day.slot1Subject) {
        const sub = day.slot1Subject;
        if (!subjectStats[sub]) {
          subjectStats[sub] = { totalClasses: 0, presents: 0 };
        }
        subjectStats[sub].totalClasses++;
        totalClassesRegistered += students.length;

        students.forEach(st => {
          if (!studentStats[st.id]) {
            studentStats[st.id] = { totalClasses: 0, presents: 0 };
          }
          studentStats[st.id].totalClasses++;

          if (!studentSubjectStats[st.id]) {
            studentSubjectStats[st.id] = {};
          }
          if (!studentSubjectStats[st.id][sub]) {
            studentSubjectStats[st.id][sub] = { totalClasses: 0, presents: 0 };
          }
          studentSubjectStats[st.id][sub].totalClasses++;
          
          const isPresent = !!day.slot1Present[st.id];
          if (isPresent) {
            totalStudentPresents++;
            subjectStats[sub].presents++;
            studentStats[st.id].presents++;
            studentSubjectStats[st.id][sub].presents++;
          }
        });
      }

      // Slot 2
      if (!day.slot2NoLecture && day.slot2Taken && day.slot2Subject) {
        const sub = day.slot2Subject;
        if (!subjectStats[sub]) {
          subjectStats[sub] = { totalClasses: 0, presents: 0 };
        }
        subjectStats[sub].totalClasses++;
        totalClassesRegistered += students.length;

        students.forEach(st => {
          if (!studentStats[st.id]) {
            studentStats[st.id] = { totalClasses: 0, presents: 0 };
          }
          studentStats[st.id].totalClasses++;

          if (!studentSubjectStats[st.id]) {
            studentSubjectStats[st.id] = {};
          }
          if (!studentSubjectStats[st.id][sub]) {
            studentSubjectStats[st.id][sub] = { totalClasses: 0, presents: 0 };
          }
          studentSubjectStats[st.id][sub].totalClasses++;

          const isPresent = !!day.slot2Present[st.id];
          if (isPresent) {
            totalStudentPresents++;
            subjectStats[sub].presents++;
            studentStats[st.id].presents++;
            studentSubjectStats[st.id][sub].presents++;
          }
        });
      }
    });

    const averageRate = totalClassesRegistered > 0 
      ? Math.round((totalStudentPresents / totalClassesRegistered) * 1000) / 10 
      : 100;

    return {
      averageRate,
      totalClassesRegistered,
      totalStudentPresents,
      subjectStats,
      studentStats,
      studentSubjectStats
    };
  }, [attendanceDb, students, subjects]);

  // Filter students active list
  const filteredStudentsForAttendance = useMemo(() => {
    return students
      .filter(s => 
        s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
        s.rollNo.toLowerCase().includes(studentSearchQuery.toLowerCase())
      )
      .sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true, sensitivity: 'base' }));
  }, [students, studentSearchQuery]);

  const filteredStudentsForRoster = useMemo(() => {
    return students
      .filter(s => 
        s.name.toLowerCase().includes(rosterSearchQuery.toLowerCase()) || 
        s.rollNo.toLowerCase().includes(rosterSearchQuery.toLowerCase())
      )
      .sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true, sensitivity: 'base' }));
  }, [students, rosterSearchQuery]);

  // Current session calculations
  const currentSlotPresentCount = useMemo(() => {
    const presentRecord = activeSlot === 'slot1' ? currentDayData.slot1Present : currentDayData.slot2Present;
    return students.filter(st => !!presentRecord[st.id]).length;
  }, [activeSlot, currentDayData, students]);

  const currentSlotAbsentCount = useMemo(() => {
    const presentRecord = activeSlot === 'slot1' ? currentDayData.slot1Present : currentDayData.slot2Present;
    return students.filter(st => !presentRecord[st.id]).length;
  }, [activeSlot, currentDayData, students]);

  const currentSlotTaken = activeSlot === 'slot1' ? currentDayData.slot1Taken : currentDayData.slot2Taken;
  const currentSlotSubject = activeSlot === 'slot1' ? currentDayData.slot1Subject : currentDayData.slot2Subject;

  // Eligibility: Students below 75% attendance
  const lowAttendanceStudentsCount = useMemo(() => {
    let count = 0;
    students.forEach(st => {
      const stats = overallStats.studentStats[st.id];
      if (stats && stats.totalClasses > 0) {
        const rate = (stats.presents / stats.totalClasses) * 100;
        if (rate < 75) {
          count++;
        }
      }
    });
    return count;
  }, [students, overallStats]);

  // --- PRESENT STUDENTS REPORT EXPORT ---
  const formatDateStr = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // Convert YYYY-MM-DD to DD/MM/YYYY
    }
    return dateStr;
  };

  const getFormattedPresentTextForSlot = (slot: SlotId) => {
    const isTaken = slot === 'slot1' ? currentDayData.slot1Taken : currentDayData.slot2Taken;
    const subject = slot === 'slot1' ? currentDayData.slot1Subject : currentDayData.slot2Subject;
    const presentRecord = slot === 'slot1' ? currentDayData.slot1Present : currentDayData.slot2Present;

    // Filter students marked present and sort by roll number
    const presentStudents = students
      .filter(st => !!presentRecord[st.id])
      .sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true, sensitivity: 'base' }));

    const formattedDate = formatDateStr(selectedDate);
    let text = `${formattedDate} Attendance ${subject}\n`;
    if (!isTaken) {
      text += "(Session attendance not yet initialized/saved)";
    } else if (presentStudents.length === 0) {
      text += "(No students marked present for this session)";
    } else {
      text += presentStudents.map((st, idx) => `${idx + 1}. ${st.name}`).join('\n');
    }
    return text;
  };

  const getCombinedExportText = () => {
    const textSlot1 = getFormattedPresentTextForSlot('slot1');
    const textSlot2 = getFormattedPresentTextForSlot('slot2');
    return `${textSlot1}\n\n========================================\n\n${textSlot2}`;
  };

  const getActiveExportText = () => {
    if (exportActiveSlot === 'both') {
      return getCombinedExportText();
    }
    return getFormattedPresentTextForSlot(exportActiveSlot);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    }).catch(err => {
      // Fallback if navigator.clipboard is unavailable or restricted in iframe
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Prevent scrolling
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
      } catch (e) {
        console.error("Failed to copy", e);
      }
      document.body.removeChild(textArea);
    });
  };

  const handleDownloadTxt = (text: string) => {
    const formattedDate = formatDateStr(selectedDate).replace(/\//g, '_');
    const slotSuffix = exportActiveSlot === 'both' ? 'combined' : exportActiveSlot;
    const filename = `attendance_${formattedDate}_${slotSuffix}.txt`;
    
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- BACKUP & RESTORE ---
  const handleExportData = () => {
    const exportObj = {
      collegeName,
      students,
      subjects,
      attendanceDb,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `college_attendance_backup_${selectedDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.students && parsed.subjects && parsed.attendanceDb) {
          setStudents(parsed.students);
          setSubjects(parsed.subjects);
          setAttendanceDb(parsed.attendanceDb);
          if (parsed.collegeName) {
            setCollegeName(parsed.collegeName);
          }
          setImportSuccess(true);
          setTimeout(() => setImportSuccess(false), 3000);
        } else {
          setImportError("Invalid data format. File must contain students, subjects, and attendance database.");
        }
      } catch (err) {
        setImportError("Failed to parse JSON. Please check if the file is a valid JSON.");
      }
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col pb-12" id="app_root">
      {/* HEADER SECTION */}
      <header className="bg-indigo-900 border-b-4 border-indigo-500 sticky top-0 z-30 shadow-md" id="app_header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500 rounded-none text-white shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              {isEditingCollegeName ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (tempCollegeName.trim()) {
                      setCollegeName(tempCollegeName.trim());
                    }
                    setIsEditingCollegeName(false);
                  }}
                  className="flex items-center gap-2"
                  id="rename_college_form"
                >
                  <input
                    type="text"
                    value={tempCollegeName}
                    onChange={(e) => setTempCollegeName(e.target.value)}
                    className="bg-white/10 text-white font-black uppercase text-sm px-2.5 py-1 border border-indigo-400 focus:outline-hidden focus:border-white rounded-none max-w-[180px] sm:max-w-xs placeholder-indigo-300"
                    autoFocus
                    placeholder="Enter College Name"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-none uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingCollegeName(false)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-[10px] px-2.5 py-1.5 rounded-none uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <h1 className="text-xl font-black tracking-widest uppercase text-white flex flex-wrap items-center gap-2 group">
                  <span className="cursor-pointer hover:text-indigo-200 transition-colors" onClick={() => {
                    setTempCollegeName(collegeName);
                    setIsEditingCollegeName(true);
                  }}>
                    {collegeName}
                  </span>
                  <button
                    onClick={() => {
                      setTempCollegeName(collegeName);
                      setIsEditingCollegeName(true);
                    }}
                    className="opacity-50 group-hover:opacity-100 hover:opacity-100 hover:text-indigo-200 transition-all p-1 cursor-pointer"
                    title="Rename college/campus"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] bg-indigo-700 text-indigo-100 font-bold px-2 py-0.5 rounded-none border border-indigo-600 tracking-wider">
                    DUAL-SLOT
                  </span>
                </h1>
              )}
              <p className="text-xs text-indigo-200 font-medium tracking-wide mt-0.5">LECTURE CYCLES: 10:00 AM - 1:00 PM & 2:00 PM - 5:00 PM</p>
            </div>
          </div>

          {/* DATE & GLOBAL PREFERENCE SELECTOR */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-indigo-950 p-2.5 border border-indigo-700 rounded-none">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-200 uppercase tracking-wider px-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Target Day:</span>
              </div>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-indigo-900 border border-indigo-600 text-white text-sm rounded-none px-3 py-1.5 font-mono uppercase tracking-widest outline-hidden focus:border-indigo-400 cursor-pointer"
                id="global_date_picker"
              />
            </div>
          </div>
        </div>
      </header>

      {/* QUICK KPI STATS DECK */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi_deck">
        
        {/* KPI 1: Active Student Count (Clickable to view detailed student roster list) */}
        <div 
          onClick={() => setHomeRosterOpen(true)}
          className="bg-white p-5 rounded-none border-t-4 border-indigo-600 shadow-sm flex items-center gap-4 transition-all hover:-translate-y-0.5 duration-200 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/20 group" 
          id="kpi_total_students"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-none group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors flex items-center gap-1">
              Student Roster <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5 flex items-baseline gap-1.5">
              {students.length} 
              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 uppercase tracking-wider group-hover:bg-indigo-100/50 transition-colors">
                View List
              </span>
            </h3>
          </div>
        </div>

        {/* KPI 2: Overall Attendance Rate */}
        <div className="bg-white p-5 rounded-none border-t-4 border-emerald-600 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-0.5 duration-200" id="kpi_avg_attendance">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-none">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Attendance</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {overallStats.averageRate}%
            </h3>
          </div>
        </div>

        {/* KPI 3: Exam Eligibility Alert */}
        <div className="bg-white p-5 rounded-none border-t-4 border-amber-500 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-0.5 duration-200" id="kpi_eligibility_status">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-none">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exam Defaulters</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {lowAttendanceStudentsCount} <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 border border-red-100 rounded-none ml-1 uppercase tracking-wider">&lt; 75%</span>
            </h3>
          </div>
        </div>

        {/* KPI 4: Active Day Lectures State */}
        <div className="bg-slate-900 text-white p-5 rounded-none border-t-4 border-indigo-500 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-0.5 duration-200" id="kpi_active_day_lectures">
          <div className="p-3 bg-indigo-950 text-indigo-400 rounded-none">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Today's Lectures</p>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1.5" title={currentDayData.slot1NoLecture ? "No Lecture Scheduled" : currentDayData.slot1Taken ? "Attendance Logged" : "Not yet initialized"}>
                <span className={`w-2 h-2 rounded-none ${
                  currentDayData.slot1NoLecture ? 'bg-emerald-500' :
                  currentDayData.slot1Taken ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`} />
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${currentDayData.slot1NoLecture ? 'text-slate-400' : ''}`}>10-1 PM {currentDayData.slot1NoLecture && "(No Class)"}</span>
              </div>
              <div className="flex items-center gap-1.5" title={currentDayData.slot2NoLecture ? "No Lecture Scheduled" : currentDayData.slot2Taken ? "Attendance Logged" : "Not yet initialized"}>
                <span className={`w-2 h-2 rounded-none ${
                  currentDayData.slot2NoLecture ? 'bg-emerald-500' :
                  currentDayData.slot2Taken ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`} />
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${currentDayData.slot2NoLecture ? 'text-slate-400' : ''}`}>2-5 PM {currentDayData.slot2NoLecture && "(No Class)"}</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* MAIN CONTAINER: TWO COLUMNS */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1" id="main_dashboard_layout">
        
        {/* LEFT COMPONENT (7 COLS): ACTIVE ATTENDANCE WORKSPACE */}
        <div className="lg:col-span-7 bg-white rounded-none border border-slate-200 shadow-md overflow-hidden flex flex-col" id="attendance_workspace">
          
          {/* SLOTS TAB HEADER */}
          <div className="border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-stretch justify-between" id="slot_tabs_wrapper">
            <div className="flex border-b md:border-b-0 md:border-r border-slate-200 flex-1" id="slot_tabs">
              <button
                id="tab_slot1"
                onClick={() => setActiveSlot('slot1')}
                className={`flex-1 py-3 px-4 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                  activeSlot === 'slot1'
                    ? 'bg-white border-b-4 md:border-b-0 md:border-r-4 border-indigo-600 font-bold text-indigo-900'
                    : 'bg-slate-50 text-slate-500 font-medium hover:bg-slate-100'
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">LECTURE SLOT 1</span>
                <span className="text-xs sm:text-sm font-extrabold font-mono tracking-wider">10:00 AM — 01:00 PM</span>
              </button>
              <button
                id="tab_slot2"
                onClick={() => setActiveSlot('slot2')}
                className={`flex-1 py-3 px-4 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                  activeSlot === 'slot2'
                    ? 'bg-white border-b-4 md:border-b-0 md:border-r-4 border-indigo-600 font-bold text-indigo-900'
                    : 'bg-slate-50 text-slate-500 font-medium hover:bg-slate-100'
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">LECTURE SLOT 2</span>
                <span className="text-xs sm:text-sm font-extrabold font-mono tracking-wider">02:00 PM — 05:00 PM</span>
              </button>
            </div>

            {/* SUBJECT SELECTION FOR THE TARGET DATE & ACTIVE SLOT */}
            <div className="flex items-center gap-3 p-4 justify-between md:justify-end bg-slate-50 border-t md:border-t-0 border-slate-200">
              <div className="flex items-center gap-1.5 shrink-0 bg-white border border-rose-200 px-2.5 py-1.5">
                <input
                  type="checkbox"
                  id="no_lecture_toggle"
                  checked={!!(activeSlot === 'slot1' ? currentDayData.slot1NoLecture : currentDayData.slot2NoLecture)}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    updateCurrentDay({
                      [activeSlot === 'slot1' ? 'slot1NoLecture' : 'slot2NoLecture']: isChecked
                    });
                  }}
                  className="w-3.5 h-3.5 text-rose-600 border-rose-300 focus:ring-rose-500 rounded-none cursor-pointer"
                />
                <label htmlFor="no_lecture_toggle" className="text-[9px] font-black uppercase tracking-wider text-rose-700 cursor-pointer select-none">
                  No Lecture Today
                </label>
              </div>

              {!(activeSlot === 'slot1' ? currentDayData.slot1NoLecture : currentDayData.slot2NoLecture) && (
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">SUBJECT:</label>
                  <select
                    id="subject_selector"
                    value={currentSlotSubject}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (activeSlot === 'slot1') {
                        updateCurrentDay({ slot1Subject: val });
                      } else {
                        updateCurrentDay({ slot2Subject: val });
                      }
                    }}
                    className="bg-white border border-slate-300 text-slate-800 text-xs rounded-none px-3 py-1.5 font-bold uppercase tracking-wider outline-hidden focus:border-indigo-600 cursor-pointer max-w-[150px] sm:max-w-xs truncate shadow-xs"
                  >
                    {subjects.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE WORKSPACE AREA */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col">
            {currentDayData.isHoliday ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 border border-slate-200" id="holiday_notice_card">
                <div className={`p-5 rounded-none border ${
                  currentDayData.holidayType === 'unexpected'
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-rose-50 text-rose-600 border-rose-200'
                } mb-4`}>
                  <Coffee className="w-10 h-10 animate-pulse" />
                </div>
                
                <h3 className={`text-lg font-black uppercase tracking-widest ${
                  currentDayData.holidayType === 'unexpected' ? 'text-amber-800 font-black' : 'text-rose-800 font-black'
                }`}>
                  {currentDayData.holidayType === 'unexpected' ? '⚠️ UNEXPECTED HOLIDAY ACTIVE' : '🎉 HOLIDAY SCHEDULED'}
                </h3>
                
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-mono font-bold">
                  {formatDateStr(selectedDate)}
                </p>

                {currentDayData.holidayReason ? (
                  <p className="text-xs font-extrabold text-slate-700 bg-white border border-slate-200 px-6 py-4 max-w-md shadow-xs mt-4 uppercase tracking-wider leading-relaxed">
                    " {currentDayData.holidayReason} "
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-2">
                    No holiday reason specified.
                  </p>
                )}

                <p className="text-xs text-slate-400 max-w-sm mt-6 leading-relaxed">
                  Session attendance and registers are locked because this day has been declared a Holiday. To take attendance, remove the holiday flag in the Calendar tab.
                </p>

                <button
                  onClick={() => {
                    updateCurrentDay({
                      isHoliday: false,
                      holidayType: undefined,
                      holidayReason: undefined
                    });
                  }}
                  className={`mt-6 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors border shadow-sm ${
                    currentDayData.holidayType === 'unexpected'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                      : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
                  }`}
                >
                  Resume Attendance (Set as Working Day)
                </button>
              </div>
            ) : (activeSlot === 'slot1' ? currentDayData.slot1NoLecture : currentDayData.slot2NoLecture) ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 border border-slate-200" id="no_lecture_notice_card">
                <div className="p-5 rounded-none border bg-slate-100 text-slate-500 border-slate-300 mb-4">
                  <CalendarRange className="w-10 h-10 text-slate-400" />
                </div>
                
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-700">
                  🚫 NO LECTURE FOR {activeSlot === 'slot1' ? '10-1 PM' : '2-5 PM'} SLOT TODAY
                </h3>
                
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-mono font-bold">
                  {formatDateStr(selectedDate)}
                </p>

                <p className="text-xs text-slate-500 max-w-sm mt-4 leading-relaxed">
                  This class slot is marked as having no scheduled lecture today. This facilitates custom 1-lecture days (e.g. only Morning 10-1 PM or only Afternoon 2-5 PM). No attendance defaults or statistics will be penalized for this session.
                </p>

                <button
                  onClick={() => {
                    updateCurrentDay({
                      [activeSlot === 'slot1' ? 'slot1NoLecture' : 'slot2NoLecture']: false
                    });
                  }}
                  className="mt-6 px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white border border-slate-900 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors shadow-sm"
                >
                  Schedule Lecture (Take Attendance)
                </button>
              </div>
            ) : (
              <>
                {/* SESSION STATUS CONTROL UNIT */}
                <div className="bg-slate-50 border-l-4 border-slate-400 p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-none" style={{ borderLeftColor: currentSlotTaken ? '#059669' : '#d97706' }}>
                  <div>
                    <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-none border ${
                      currentSlotTaken 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {currentSlotTaken ? '✓ ATTENDANCE ACTIVE' : '⚠ NOT YET PROCESSED'}
                    </span>
                    <p className="text-xs text-slate-500 mt-2.5">
                      Subject Name: <span className="font-extrabold text-slate-900 uppercase tracking-tight">{currentSlotSubject}</span>
                    </p>
                    {currentSlotTaken && (
                      <p className="text-[11px] text-indigo-700 font-bold mt-1 uppercase tracking-wider">
                        {currentSlotPresentCount} of {students.length} present ({Math.round((currentSlotPresentCount / (students.length || 1)) * 100)}%)
                      </p>
                    )}
                  </div>

                  {/* QUICK INITIALIZATION & MASS ACTIONS */}
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {!currentSlotTaken ? (
                      <button
                        id="btn_start_attendance"
                        onClick={() => handleMarkAll(true, activeSlot)}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-none transition-colors flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        Start Session (All Present)
                      </button>
                    ) : (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleMarkAll(true, activeSlot)}
                          className="flex-1 sm:flex-initial px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs rounded-none transition-colors uppercase tracking-wider cursor-pointer"
                          title="Mark entire class present"
                        >
                          All Present
                        </button>
                        <button
                          onClick={() => handleMarkAll(false, activeSlot)}
                          className="flex-1 sm:flex-initial px-3 py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 border border-slate-300 font-bold text-xs rounded-none transition-colors uppercase tracking-wider cursor-pointer"
                          title="Mark entire class absent"
                        >
                          All Absent
                        </button>
                        <button
                          onClick={() => handleResetSession(activeSlot)}
                          className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-300 font-bold text-xs rounded-none transition-colors uppercase tracking-wider cursor-pointer"
                          title="Clear active sheet status"
                        >
                          Reset Sheet
                        </button>
                        <button
                          onClick={() => setExportModalOpen(true)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-none transition-colors uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          title="Export list of present students"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export List</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTIVE SHEET ATTENDANCE STATS BAR */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-3.5 mb-4 rounded-none">
                  <div className="text-center p-2 bg-white border border-slate-200 shadow-2xs">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Headcount</span>
                    <span className="block text-base font-mono font-black text-slate-900 mt-1">{students.length}</span>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 border border-emerald-100 shadow-2xs">
                    <span className="block text-[9px] font-black text-emerald-600 uppercase tracking-wider">Present Count</span>
                    <span className="block text-base font-mono font-black text-emerald-700 mt-1">
                      {currentSlotTaken ? currentSlotPresentCount : 0}
                    </span>
                  </div>
                  <div className="text-center p-2 bg-rose-50 border border-rose-100 shadow-2xs">
                    <span className="block text-[9px] font-black text-rose-600 uppercase tracking-wider">Absent Count</span>
                    <span className="block text-base font-mono font-black text-rose-700 mt-1">
                      {currentSlotTaken ? currentSlotAbsentCount : students.length}
                    </span>
                  </div>
                </div>

                {/* SEARCH & FILTER FOR ACTIVE SHEET */}
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter students in sheet by Name or Roll Number..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-none text-sm outline-hidden focus:border-indigo-600 bg-white"
                    id="search_student_attendance"
                  />
                  {studentSearchQuery && (
                    <button 
                      onClick={() => setStudentSearchQuery('')} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 uppercase tracking-widest font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* STUDENT ROSTER LIST GRID FOR ATTENDANCE */}
                <div className="border border-slate-200 rounded-none overflow-hidden flex-1 flex flex-col bg-white">
                  <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 hidden sm:grid grid-cols-12 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span className="col-span-3">Roll No</span>
                    <span className="col-span-5">Student Name</span>
                    <span className="col-span-4 text-right pr-4">Attendance Status</span>
                  </div>

                  {/* LIST CONTAINER */}
                  <div className="divide-y divide-slate-100 overflow-y-auto max-h-[420px]" id="attendance_students_list">
                    {filteredStudentsForAttendance.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 px-4">
                        <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-bold uppercase tracking-wider">No students match search criteria.</p>
                        {students.length === 0 && (
                          <p className="text-xs text-slate-400 mt-1">Go to the "Roster" tab to add students.</p>
                        )}
                      </div>
                    ) : (
                      filteredStudentsForAttendance.map((st) => {
                        const isPresent = !!(activeSlot === 'slot1' 
                          ? currentDayData.slot1Present[st.id] 
                          : currentDayData.slot2Present[st.id]);
                        const sessionTaken = activeSlot === 'slot1' ? currentDayData.slot1Taken : currentDayData.slot2Taken;

                        return (
                          <div 
                            key={st.id} 
                            className={`px-3 py-2.5 sm:px-4 sm:py-3 flex flex-row items-center justify-between gap-3 sm:grid sm:grid-cols-12 transition-colors border-l-4 ${
                              !sessionTaken 
                                ? 'bg-white opacity-85 hover:bg-slate-50/50 border-l-slate-300' 
                                : isPresent 
                                  ? 'bg-emerald-50/20 hover:bg-emerald-50/40 border-l-emerald-600' 
                                  : 'bg-rose-50/20 hover:bg-rose-50/40 border-l-rose-500'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:col-span-8 sm:grid sm:grid-cols-8 sm:items-center">
                              {/* ON MOBILE: STACK NAME AND ROLL NUMBER */}
                              <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:hidden">
                                {renderStudentAvatar(st.name, st.photo, "w-8 h-8 text-[11px] shrink-0")}
                                <div className="flex flex-col min-w-0">
                                  <button
                                    onClick={() => setSelectedStudentDetail(st)}
                                    className="text-xs font-extrabold text-slate-900 hover:text-indigo-600 transition-colors text-left font-sans block truncate focus:outline-hidden uppercase tracking-tight"
                                    title="Click to view detailed calendar"
                                  >
                                    {st.name}
                                  </button>
                                  <span className="text-[10px] font-mono font-bold text-slate-500">
                                    {st.rollNo}
                                  </span>
                                </div>
                              </div>

                              {/* ON DESKTOP: SIDE-BY-SIDE GRID */}
                              {/* ROLL NUMBER */}
                              <span className="hidden sm:inline text-xs font-mono font-black text-slate-600 sm:col-span-3 shrink-0">
                                {st.rollNo}
                              </span>

                              {/* NAME */}
                              <div className="hidden sm:flex items-center gap-2 min-w-0 sm:col-span-5 flex-1">
                                {renderStudentAvatar(st.name, st.photo, "w-7 h-7 text-[10px] shrink-0")}
                                <button
                                  onClick={() => setSelectedStudentDetail(st)}
                                  className="text-sm font-extrabold text-slate-900 hover:text-indigo-600 transition-colors text-left font-sans block truncate focus:outline-hidden uppercase tracking-tight"
                                  title="Click to view detailed calendar"
                                >
                                  {st.name}
                                </button>
                              </div>
                            </div>

                            {/* TOGGLE OPTIONS */}
                            <div className="flex justify-end gap-1 shrink-0 sm:col-span-4 sm:gap-1.5 sm:pr-2">
                              <button
                                onClick={() => handleToggleStudent(st.id, activeSlot)}
                                className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-none text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider border ${
                                  isPresent && sessionTaken
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 border-slate-200'
                                }`}
                                id={`attendance_btn_${st.id}_present`}
                              >
                                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Present</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  // If untaken, initializing with toggle will flip it to absent (false)
                                  if (!sessionTaken) {
                                    // First establish session with all present, then set this to false
                                    const newAttendance: Record<string, boolean> = {};
                                    students.forEach(s => {
                                      newAttendance[s.id] = s.id !== st.id;
                                    });
                                    updateCurrentDay({
                                      [activeSlot === 'slot1' ? 'slot1Taken' : 'slot2Taken']: true,
                                      [activeSlot === 'slot1' ? 'slot1Present' : 'slot2Present']: newAttendance
                                    });
                                  } else {
                                    // Set present to false
                                    updateCurrentDay({
                                      [activeSlot === 'slot1' ? 'slot1Present' : 'slot2Present']: {
                                        ...currentDayData[activeSlot === 'slot1' ? 'slot1Present' : 'slot2Present'],
                                        [st.id]: false
                                      }
                                    });
                                  }
                                }}
                                className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-none text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider border ${
                                  !isPresent && sessionTaken
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                    : 'bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-slate-200 border-slate-200'
                                }`}
                                id={`attendance_btn_${st.id}_absent`}
                              >
                                <XCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Absent</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-3 uppercase tracking-wider gap-2">
                  <p className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse"></span>
                    Instant Auto-Save Enabled
                  </p>
                  {currentSlotTaken && (
                    <button
                      onClick={() => setExportModalOpen(true)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-none transition-colors cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-widest text-[9px] font-black"
                      title="Export present students list"
                    >
                      <Download className="w-3 h-3 text-emerald-600" />
                      <span>Export Present List</span>
                    </button>
                  )}
                  <p>
                    Roster headcount: <span className="font-extrabold text-slate-700">{students.length}</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT (5 COLS): ROSTER, ANALYTICS, SUBJECTS & SETTINGS */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="dashboard_sidebar_workspace">
          
          {/* TAB HEADERS FOR SIDEBAR CONTROL */}
          <div className="bg-slate-100 p-0 border border-slate-200 shadow-xs flex justify-between gap-0 rounded-none overflow-hidden" id="sidebar_tabs">
            {[
              { id: 'analytics', label: 'Analytics', icon: FileSpreadsheet },
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'timetable', label: 'Timetable', icon: CalendarRange },
              { id: 'roster', label: 'Roster', icon: Users },
              { id: 'subjects', label: 'Subjects', icon: BookOpen },
              { id: 'backup', label: 'Data', icon: Download }
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`tab_sidebar_${tab.id}`}
                  onClick={() => setSidebarTab(tab.id as any)}
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-1 sm:px-2 text-xs font-bold transition-all cursor-pointer rounded-none border-r border-slate-200 last:border-r-0 ${
                    sidebarTab === tab.id
                      ? 'bg-indigo-900 text-white border-indigo-900'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span className="hidden sm:inline uppercase tracking-wider text-[10px]">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE SIDEBAR WORKSPACE CARD */}
          <div className="bg-white rounded-none border border-slate-200 shadow-md p-5 flex-1 flex flex-col min-h-[460px]">
            
            {/* TAB 1: ANALYTICS & REPORTS */}
            {sidebarTab === 'analytics' && (
              <div className="flex flex-col gap-5 flex-1" id="sidebar_analytics_panel">
                <div>
                  <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2 uppercase tracking-wide">
                    📊 Subject Attendance Metrics
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Average presence percentage computed from all logged classes</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 max-h-[340px] pr-1">
                  {subjects.map((sub, index) => {
                    const stats = overallStats.subjectStats[sub];
                    const rate = stats && stats.totalClasses > 0
                      ? Math.round((stats.presents / (stats.totalClasses * students.length)) * 100)
                      : null;

                    return (
                      <div 
                        key={index} 
                        onClick={() => setSelectedAnalyticsSubject(sub)}
                        className="bg-slate-50 p-4 rounded-none border-l-4 border border-slate-200 hover:border-indigo-400/80 cursor-pointer hover:bg-slate-100/60 transition-colors group relative" 
                        style={{ borderLeftColor: rate === null ? '#cbd5e1' : rate >= 75 ? '#059669' : rate >= 50 ? '#d97706' : '#dc2626' }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-slate-800 truncate uppercase tracking-wide group-hover:text-indigo-600 transition-colors" title={sub}>
                            📚 {sub}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-none border border-indigo-150">
                              {rate !== null ? `${rate}%` : 'N/A'}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                          </div>
                        </div>
                        {/* Custom styled progress meter */}
                        <div className="w-full bg-slate-200 h-2.5 rounded-none overflow-hidden mt-1.5">
                          <div 
                            className={`h-full rounded-none transition-all duration-500 ${
                              rate === null ? 'w-0 bg-slate-300' :
                              rate >= 75 ? 'bg-emerald-500' :
                              rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: rate !== null ? `${rate}%` : '0%' }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">
                          <span>Classes held: {stats?.totalClasses || 0}</span>
                          <span className="text-[9px] font-black text-indigo-500 group-hover:underline uppercase tracking-widest">
                            Click to view log
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* LOW ATTENDANCE ALERT TRACKER (DEFAULTERS) */}
                <div className="bg-amber-50/40 border-l-4 border-amber-500 p-4 mt-auto rounded-none">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Examination Qualification Threshold</h5>
                      <p className="text-[11px] text-amber-700 mt-1">
                        Students require at least <strong>75%</strong> attendance to qualify for examinations. View eligibility status by clicking on student roster details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1.5: CALENDAR & HOLIDAYS */}
            {sidebarTab === 'calendar' && (
              <div className="flex flex-col gap-4 flex-1 font-sans" id="sidebar_calendar_panel">
                <div>
                  <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2 uppercase tracking-wide">
                    📅 Attendance Calendar & Holidays
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    View active academic sessions, schedule regular holidays, or report unexpected holidays.
                  </p>
                </div>

                {/* MONTH NAVIGATION */}
                <div className="bg-slate-100 p-2 border border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (calendarMonth === 0) {
                        setCalendarMonth(11);
                        setCalendarYear(prev => prev - 1);
                      } else {
                        setCalendarMonth(prev => prev - 1);
                      }
                    }}
                    className="p-1 hover:bg-white border border-transparent hover:border-slate-300 rounded-none cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-700" />
                  </button>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][calendarMonth]} {calendarYear}
                  </span>
                  <button
                    onClick={() => {
                      if (calendarMonth === 11) {
                        setCalendarMonth(0);
                        setCalendarYear(prev => prev + 1);
                      } else {
                        setCalendarMonth(prev => prev + 1);
                      }
                    }}
                    className="p-1 hover:bg-white border border-transparent hover:border-slate-300 rounded-none cursor-pointer transition-all"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-700" />
                  </button>
                </div>

                {/* CALENDAR GRID */}
                <div className="border border-slate-200 p-2 bg-slate-50" id="monthly_grid">
                  {/* WEEKDAY LABELS */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-400 mb-2 uppercase tracking-wider">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>

                  {/* DAYS GRID */}
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                      const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sun
                      
                      const cells = [];
                      // Empty cells for alignment
                      for (let i = 0; i < firstDayIndex; i++) {
                        cells.push(<div key={`empty-${i}`} className="h-12 bg-transparent" />);
                      }

                      // Active days
                      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
                        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        const isSelected = dateStr === selectedDate;
                        
                        // Check day summary from attendance database
                        const dayData = attendanceDb[dateStr];
                        const isHoliday = dayData?.isHoliday;
                        const holidayType = dayData?.holidayType;
                        const isWorking = !isHoliday && (dayData?.slot1Taken || dayData?.slot2Taken || dayData?.slot1NoLecture || dayData?.slot2NoLecture);

                        let cellClass = "bg-white text-slate-700 border-slate-200 hover:bg-slate-100";
                        if (isHoliday) {
                          if (holidayType === 'unexpected') {
                            cellClass = "bg-amber-100 text-amber-800 border-amber-300 font-extrabold hover:bg-amber-200";
                          } else {
                            cellClass = "bg-rose-100 text-rose-800 border-rose-300 font-extrabold hover:bg-rose-200";
                          }
                        } else if (isWorking) {
                          cellClass = "bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold hover:bg-emerald-200";
                        }

                        if (isSelected) {
                          cellClass += " ring-2 ring-indigo-600 ring-offset-1 z-10 border-indigo-600";
                        }

                        cells.push(
                          <button
                            key={`day-${dayNum}`}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`h-12 border text-xs font-mono font-bold flex flex-col items-center justify-between p-1 transition-all rounded-none cursor-pointer relative ${cellClass}`}
                            title={`${dateStr}${isHoliday ? ` (${holidayType === 'unexpected' ? 'Unexpected' : 'Regular'} Holiday: ${dayData.holidayReason || 'Holiday'})` : isWorking ? ' (Attendance Logged / Processed)' : ''}`}
                          >
                            <span>{dayNum}</span>
                               {/* MINI INDICATORS / LECTURE SCHEDULING DOTS */}
                            <div className="flex gap-1 justify-center items-center w-full mt-0.5">
                              {(() => {
                                const dayOfWeek = getDayOfWeek(dateStr);
                                const template = weeklyTimetable[dayOfWeek];
                                
                                const hasSlot1 = isHoliday 
                                  ? false 
                                  : (dayData ? !dayData.slot1NoLecture : (template?.slot1 ? (!template.slot1.noLecture && !!template.slot1.subject) : true));
                                  
                                const hasSlot2 = isHoliday 
                                  ? false 
                                  : (dayData ? !dayData.slot2NoLecture : (template?.slot2 ? (!template.slot2.noLecture && !!template.slot2.subject) : true));
                                  
                                return (
                                  <>
                                    <span 
                                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border shadow-xs ${
                                        hasSlot1 
                                          ? 'bg-green-500 border-green-600' 
                                          : 'bg-red-500 border-red-600'
                                      }`} 
                                      title={`1st Half (10-1 PM): ${hasSlot1 ? 'Class Scheduled' : 'No Class'}`}
                                    />
                                    <span 
                                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border shadow-xs ${
                                        hasSlot2 
                                          ? 'bg-green-500 border-green-600' 
                                          : 'bg-red-500 border-red-600'
                                      }`} 
                                      title={`2nd Half (2-5 PM): ${hasSlot2 ? 'Class Scheduled' : 'No Class'}`}
                                    />
                                  </>
                                );
                              })()}
                            </div>
                          </button>
                        );
                      }
                      return cells;
                    })()}
                  </div>
                </div>

                {/* LEGEND */}
                <div className="flex flex-wrap items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-white p-2 border border-slate-200 gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-slate-100 border border-slate-300 inline-block rounded-none" />
                    <span>Working Day</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-rose-100 border border-rose-300 inline-block rounded-none" />
                    <span>Holiday</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-amber-100 border border-amber-300 inline-block rounded-none" />
                    <span>Unexpected Holiday</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5 items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full border border-green-600 inline-block" />
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full border border-green-600 inline-block" />
                    </div>
                    <span>Class (Green)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5 items-center">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full border border-red-600 inline-block" />
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full border border-red-600 inline-block" />
                    </div>
                    <span>No Class (Red)</span>
                  </div>
                </div>

                {/* SELECTED DATE STATUS EDITOR */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-none space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Status for {formatDateStr(selectedDate)}
                    </h5>
                    {currentDayData.isHoliday ? (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-none uppercase tracking-wider ${
                        currentDayData.holidayType === 'unexpected' 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {currentDayData.holidayType === 'unexpected' ? '⚠ Unexpected' : '★ Holiday'}
                      </span>
                    ) : (currentDayData.slot1Taken || currentDayData.slot2Taken) ? (
                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-none uppercase tracking-wider">
                        ✓ Working Day
                      </span>
                    ) : (
                      <span className="text-[9px] font-black bg-slate-200 text-slate-700 border border-slate-300 px-1.5 py-0.5 rounded-none uppercase tracking-wider">
                        Ordinary Day
                      </span>
                    )}
                  </div>

                  {currentDayData.isHoliday && (
                    <div className="p-3 bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed rounded-none shadow-xs space-y-1">
                      <p className="font-extrabold uppercase tracking-tight text-slate-800">
                        {currentDayData.holidayType === 'unexpected' ? 'Unexpected Holiday' : 'Regular/Scheduled Holiday'} Active
                      </p>
                      {currentDayData.holidayReason && (
                        <p className="text-slate-500 italic">
                          "Reason: {currentDayData.holidayReason}"
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-3 pt-1 border-t border-slate-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Configure Holiday
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTempHolidayType('regular')}
                        className={`py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer border ${
                          tempHolidayType === 'regular'
                            ? 'bg-rose-50 border-rose-400 text-rose-800'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        Scheduled Holiday
                      </button>
                      <button
                        onClick={() => setTempHolidayType('unexpected')}
                        className={`py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer border ${
                          tempHolidayType === 'unexpected'
                            ? 'bg-amber-50 border-amber-400 text-amber-800'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        Unexpected Holiday
                      </button>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Holiday Name or Reason
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Republic Day, Heavy Rain"
                        value={tempHolidayReason}
                        onChange={(e) => setTempHolidayReason(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none outline-hidden focus:border-indigo-600"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          updateCurrentDay({
                            isHoliday: true,
                            holidayType: tempHolidayType,
                            holidayReason: tempHolidayReason.trim() || 'Holiday'
                          });
                        }}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs uppercase tracking-widest rounded-none cursor-pointer transition-all border border-slate-900 shadow-sm"
                      >
                        Declare Holiday
                      </button>
                      
                      {currentDayData.isHoliday && (
                        <button
                          onClick={() => {
                            updateCurrentDay({
                              isHoliday: false,
                              holidayType: undefined,
                              holidayReason: undefined
                            });
                          }}
                          className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-300 font-bold text-xs uppercase tracking-wider rounded-none cursor-pointer transition-colors"
                          title="Remove holiday status"
                        >
                          Clear Holiday
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STUDENT ROSTER MANAGEMENT */}
            {sidebarTab === 'roster' && (
              <div className="flex flex-col gap-4 flex-1" id="sidebar_roster_panel">
                <div>
                  {isEditingRosterTitle ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <input
                        type="text"
                        value={tempRosterTitle}
                        onChange={(e) => setTempRosterTitle(e.target.value)}
                        className="text-xs font-black uppercase tracking-wide border border-indigo-600 px-2 py-1 outline-hidden flex-1 bg-white"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (tempRosterTitle.trim()) {
                              setRosterTitle(tempRosterTitle.trim());
                            }
                            setIsEditingRosterTitle(false);
                          } else if (e.key === 'Escape') {
                            setIsEditingRosterTitle(false);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (tempRosterTitle.trim()) {
                            setRosterTitle(tempRosterTitle.trim());
                          }
                          setIsEditingRosterTitle(false);
                        }}
                        className="p-1 bg-indigo-900 text-white hover:bg-indigo-950 rounded-none cursor-pointer"
                        title="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <h4 
                      onClick={() => {
                        setTempRosterTitle(rosterTitle);
                        setIsEditingRosterTitle(true);
                      }}
                      className="text-sm font-bold text-slate-950 flex items-center gap-2 uppercase tracking-wide group cursor-pointer hover:text-indigo-600 transition-colors"
                      title="Click to edit title"
                    >
                      👥 {rosterTitle}
                      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                    </h4>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">Add or remove enrolled students from the primary cohort roster</p>
                </div>

                {/* ADD STUDENT FORM */}
                <form onSubmit={handleAddStudent} className="bg-slate-50 border border-slate-200 p-4 rounded-none space-y-3.5">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Enroll New Student</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Roll Number</label>
                      <input
                        type="text"
                        placeholder="e.g. CSE-2026-11"
                        value={newStudentRoll}
                        onChange={(e) => setNewStudentRoll(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none outline-hidden focus:border-indigo-600 font-mono"
                        required
                        id="input_new_student_roll"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Kabir Roy"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none outline-hidden focus:border-indigo-600"
                        required
                        id="input_new_student_name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={newStudentMobile}
                      onChange={(e) => setNewStudentMobile(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none outline-hidden focus:border-indigo-600 font-mono"
                      id="input_new_student_mobile"
                    />
                  </div>

                  {studentAddError && (
                    <div className="text-[10px] font-bold uppercase tracking-wide text-rose-600 bg-rose-50 border border-rose-100 p-2 text-center rounded-none">
                      ⚠️ {studentAddError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-none transition-all flex items-center justify-center gap-2 shadow-md uppercase tracking-widest cursor-pointer"
                    id="btn_add_student_submit"
                  >
                    <Plus className="w-4 h-4" />
                    Enroll Into Roster
                  </button>
                </form>

                {/* ROSTER SEARCH */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student database..."
                    value={rosterSearchQuery}
                    onChange={(e) => setRosterSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-none text-xs outline-hidden focus:border-indigo-600 bg-white"
                    id="search_roster_input"
                  />
                </div>

                {/* ROSTER LIST */}
                <div className="flex-1 overflow-y-auto max-h-[220px] divide-y divide-slate-150 border border-slate-200 rounded-none pr-1" id="roster_database_list">
                  {filteredStudentsForRoster.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs uppercase tracking-wider font-bold">
                      No matching students found in cohort.
                    </div>
                  ) : (
                    filteredStudentsForRoster.map((st) => {
                      const stats = overallStats.studentStats[st.id];
                      const rate = stats && stats.totalClasses > 0 
                        ? Math.round((stats.presents / stats.totalClasses) * 100) 
                        : null;

                      if (editingStudentId === st.id) {
                        return (
                          <div key={st.id} className="p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded-none space-y-2">
                            <div>
                              <label className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Roll Number</label>
                              <input
                                type="text"
                                value={editingStudentRoll}
                                onChange={(e) => setEditingStudentRoll(e.target.value)}
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-none font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Full Name</label>
                              <input
                                type="text"
                                value={editingStudentName}
                                onChange={(e) => setEditingStudentName(e.target.value)}
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-none font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Mobile Number (Optional)</label>
                              <input
                                type="text"
                                value={editingStudentMobile}
                                onChange={(e) => setEditingStudentMobile(e.target.value)}
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-none font-mono font-bold"
                              />
                            </div>
                            {studentError && (
                              <p className="text-[9px] text-rose-600 font-bold uppercase tracking-wide bg-rose-50 p-1.5 border border-rose-100">{studentError}</p>
                            )}
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleSaveStudentEdit(st.id)}
                                className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-none uppercase tracking-wider cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingStudentId(null);
                                  setStudentError(null);
                                }}
                                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] rounded-none uppercase tracking-wider cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        );
                      }

                      if (deletingStudentId === st.id) {
                        return (
                          <div key={st.id} className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded-none text-center space-y-2">
                            <p className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider">Delete student "{st.name}"?</p>
                            <p className="text-[9px] text-rose-500 uppercase tracking-widest leading-relaxed">This will remove them from the cohort.</p>
                            <div className="flex gap-1.5 justify-center">
                              <button
                                onClick={() => handleRemoveStudent(st.id)}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-none cursor-pointer"
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={() => setDeletingStudentId(null)}
                                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-none cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={st.id} className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors border-l-4" style={{ borderLeftColor: rate !== null && rate < 75 ? '#ef4444' : '#cbd5e1' }}>
                          <div className="min-w-0 flex items-center gap-2.5">
                            {renderStudentAvatar(st.name, st.photo, "w-8 h-8 text-xs")}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 truncate max-w-[120px] uppercase tracking-tight">{st.name}</span>
                                <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-none border border-slate-200">{st.rollNo}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                  {rate !== null 
                                    ? `Attendance: ${rate}% (${stats.presents}/${stats.totalClasses})` 
                                    : 'No classes logged yet'}
                                </p>
                                {st.mobileNo && (
                                  <span className="text-[10px] text-indigo-600 font-mono font-black" id={`roster_mobile_${st.id}`}>
                                    📞 {st.mobileNo}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedStudentDetail(st)}
                              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors rounded-none hover:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer"
                              title="View detail report card"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingStudentId(st.id);
                                setEditingStudentName(st.name);
                                setEditingStudentRoll(st.rollNo);
                                setEditingStudentMobile(st.mobileNo || '');
                                setStudentError(null);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-600 transition-colors rounded-none hover:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer"
                              title="Edit student details"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingStudentId(st.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded-none hover:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer"
                              title="Delete from roster"
                              id={`btn_delete_student_${st.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: SUBJECT MANAGEMENT */}
            {sidebarTab === 'subjects' && (
              <div className="flex flex-col gap-4 flex-1" id="sidebar_subjects_panel">
                <div>
                  <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2 uppercase tracking-wide">
                    📚 Configure Course Subjects
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Edit names for your 7 predefined academic college subjects</p>
                </div>

                <div className="bg-indigo-50/30 border-l-4 border-indigo-600 rounded-none p-3.5 text-xs text-indigo-950">
                  You have <strong>7 subjects</strong> registered for class slot rotations. One day contains exactly two subject lectures (Morning 10-1 PM & Afternoon 2-5 PM).
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[320px] pr-1" id="subjects_database_list">
                  {subjects.map((sub, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-none border border-slate-150 border-l-4 border-l-slate-400 flex items-center justify-between gap-3 hover:bg-slate-100/50 transition-colors">
                      {editingSubjectIndex === idx ? (
                        <div className="flex gap-1.5 w-full">
                          <input
                            type="text"
                            value={editingSubjectValue}
                            onChange={(e) => setEditingSubjectValue(e.target.value)}
                            className="flex-1 text-xs p-1.5 bg-white border border-slate-300 rounded-none outline-hidden focus:border-indigo-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateSubject(idx)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-3 py-1 rounded-none font-bold transition-colors uppercase tracking-wider"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingSubjectIndex(null);
                              setEditingSubjectValue('');
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] px-3 py-1 rounded-none transition-colors uppercase tracking-wider"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-none bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center border border-slate-300">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate max-w-[200px] uppercase tracking-wide" title={sub}>
                              {sub}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => {
                              setEditingSubjectIndex(idx);
                              setEditingSubjectValue(sub);
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors px-2 py-1 hover:bg-white border border-slate-200 rounded-none uppercase tracking-wider text-[10px]"
                            id={`btn_edit_subject_${idx}`}
                          >
                            Rename
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: WEEKLY RECURRING TIMETABLE */}
            {sidebarTab === 'timetable' && (
              <div className="flex flex-col gap-4 flex-1" id="sidebar_timetable_panel">
                <div>
                  <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2 uppercase tracking-wide">
                    🗓️ Weekly Timetable Template
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure weekly recurring lecture slots. New attendance sheets will inherit these subjects automatically!
                  </p>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                  {[
                    { val: 1, label: 'Monday' },
                    { val: 2, label: 'Tuesday' },
                    { val: 3, label: 'Wednesday' },
                    { val: 4, label: 'Thursday' },
                    { val: 5, label: 'Friday' },
                    { val: 6, label: 'Saturday' },
                    { val: 0, label: 'Sunday' }
                  ].map((day) => {
                    const template = weeklyTimetable[day.val] || {
                      slot1: { subject: '', noLecture: true },
                      slot2: { subject: '', noLecture: true }
                    };

                    return (
                      <div key={day.val} className="p-3 bg-slate-50 border border-slate-200 rounded-none space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-800">{day.label}</span>
                          <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 border border-indigo-100 uppercase">
                            Weekly Template
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                          {/* SLOT 1 */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Slot 1 (10-1 PM)</span>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={template.slot1?.noLecture ?? false}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setWeeklyTimetable(prev => ({
                                      ...prev,
                                      [day.val]: {
                                        ...prev[day.val],
                                        slot1: {
                                          subject: checked ? '' : (prev[day.val]?.slot1?.subject || subjects[0] || ''),
                                          noLecture: checked
                                        }
                                      }
                                    }));
                                  }}
                                  className="w-3 h-3 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded-none"
                                />
                                <span className="text-[9px] font-black uppercase text-slate-400 select-none">No class</span>
                              </label>
                            </div>

                            {!template.slot1?.noLecture ? (
                              <select
                                value={template.slot1?.subject || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setWeeklyTimetable(prev => ({
                                    ...prev,
                                    [day.val]: {
                                      ...prev[day.val],
                                      slot1: {
                                        subject: val,
                                        noLecture: false
                                      }
                                    }
                                  }));
                                }}
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-none outline-hidden focus:border-indigo-600 font-bold"
                              >
                                <option value="">Select Subject</option>
                                {subjects.map((sub, sIdx) => (
                                  <option key={sIdx} value={sub}>{sub}</option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 py-1.5 px-2 text-center select-none">
                                🚫 NO CLASS TODAY
                              </div>
                            )}
                          </div>

                          {/* SLOT 2 */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Slot 2 (2-5 PM)</span>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={template.slot2?.noLecture ?? false}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setWeeklyTimetable(prev => ({
                                      ...prev,
                                      [day.val]: {
                                        ...prev[day.val],
                                        slot2: {
                                          subject: checked ? '' : (prev[day.val]?.slot2?.subject || subjects[1] || subjects[0] || ''),
                                          noLecture: checked
                                        }
                                      }
                                    }));
                                  }}
                                  className="w-3 h-3 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded-none"
                                />
                                <span className="text-[9px] font-black uppercase text-slate-400 select-none">No class</span>
                              </label>
                            </div>

                            {!template.slot2?.noLecture ? (
                              <select
                                value={template.slot2?.subject || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setWeeklyTimetable(prev => ({
                                    ...prev,
                                    [day.val]: {
                                      ...prev[day.val],
                                      slot2: {
                                        subject: val,
                                        noLecture: false
                                      }
                                    }
                                  }));
                                }}
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-none outline-hidden focus:border-indigo-600 font-bold"
                              >
                                <option value="">Select Subject</option>
                                {subjects.map((sub, sIdx) => (
                                  <option key={sIdx} value={sub}>{sub}</option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 py-1.5 px-2 text-center select-none">
                                🚫 NO CLASS TODAY
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: BACKUP & EXPORT/IMPORT OPTIONS */}
            {/* TAB 5: ADMIN POWER CONTROL DASHBOARD */}


            {sidebarTab === 'backup' && (
              <div className="flex flex-col gap-5 flex-1" id="sidebar_backup_panel">
                <div>
                  <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2 uppercase tracking-wide">
                    ⚙️ Database Management
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Backup, restore, and maintain consistency of college data files</p>
                </div>

                <div className="space-y-4">
                  
                  {/* College Name Customization Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-none p-4 space-y-2.5" id="college_rename_sidebar_card">
                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      Campus & College Branding
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Update the header and dashboard titles with your custom college or university brand.
                    </p>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Institution / College Name</label>
                      <input
                        type="text"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-none focus:outline-hidden focus:border-indigo-500 text-slate-800 font-bold uppercase tracking-wider"
                        placeholder="e.g. CAMPUSATTEND HUB"
                      />
                    </div>
                  </div>

                  {/* Backup Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-none p-4 space-y-2.5">
                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <Download className="w-4 h-4 text-indigo-600" />
                      Download Data Backup
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Save a JSON snapshot of the students database, subjects names, and full attendance logs directly to your local file system.
                    </p>
                    <button
                      onClick={handleExportData}
                      className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-none transition-all flex items-center justify-center gap-2 shadow-md uppercase tracking-widest cursor-pointer"
                      id="btn_export_data"
                    >
                      Export Backup (JSON)
                    </button>
                  </div>

                  {/* Restore Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-none p-4 space-y-2.5">
                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      Restore From JSON
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Overwrites the current browser database with a previous snapshot JSON.
                    </p>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-slate-300 border-dashed rounded-none cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-3 pb-3">
                          <Upload className="w-5 h-5 text-slate-400 mb-1" />
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Click to select backup file</p>
                        </div>
                        <input 
                          type="file" 
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden" 
                        />
                      </label>
                    </div>

                    {importError && (
                      <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-none font-bold border border-rose-100 uppercase tracking-wide">{importError}</p>
                    )}
                    {importSuccess && (
                      <p className="text-[11px] text-emerald-600 bg-emerald-50 p-2 rounded-none font-bold border border-emerald-100 uppercase tracking-wide">✔ Database imported successfully!</p>
                    )}
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-slate-900 text-white rounded-none p-4 space-y-2.5 border-t-4 border-rose-600">
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                      <RefreshCw className="w-4 h-4 text-rose-500 animate-spin-slow" />
                      Danger Zone
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Reset your session. This will purge all attendance histories and reset the cohort list to default settings.
                    </p>
                    {showDemoResetConfirm ? (
                      <div className="space-y-2 p-3 bg-rose-950 border border-rose-800 rounded-none">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Are you absolutely sure?</p>
                        <p className="text-[9px] text-slate-300 uppercase tracking-widest leading-relaxed">This will purge all active data and reset to demo records.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setStudents(INITIAL_STUDENTS);
                              setSubjects(DEFAULT_SUBJECTS);
                              setAttendanceDb({});
                              setCollegeName('CampusAttend Hub');
                              localStorage.removeItem('college_tracker_students');
                              localStorage.removeItem('college_tracker_subjects');
                              localStorage.removeItem('college_tracker_db');
                              localStorage.removeItem('college_tracker_name');
                              setShowDemoResetConfirm(false);
                            }}
                            className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-none cursor-pointer"
                          >
                            Yes, Reset Now
                          </button>
                          <button
                            onClick={() => setShowDemoResetConfirm(false)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-wider rounded-none cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDemoResetConfirm(true)}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-none transition-colors cursor-pointer uppercase tracking-wider"
                        id="btn_reset_database"
                      >
                        Clear Database & Reset Demo Data
                      </button>
                    )}
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* FOOTER METRICS INFO */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12 text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
        <p>© 2026 College Attendance Tracker System. All rights reserved.</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Designed with desk-first precision for administrative college registers. Persistent cache bound via browser local storage.
        </p>
      </footer>

      {/* DRILLDOWN MODAL: DETAILED CALENDAR / ATTENDANCE REPORT FOR A SINGLE STUDENT */}
      <AnimatePresence>
        {selectedStudentDetail && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="detail_modal_container">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-none border-2 border-indigo-900 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
              id="student_detail_card"
            >
              
               {/* MODAL HEADER */}
              <div className="bg-indigo-900 text-white px-6 py-5 flex items-center justify-between border-b-4 border-indigo-600">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {renderStudentAvatar(selectedStudentDetail.name, selectedStudentDetail.photo, "w-12 h-12 text-sm")}
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wide">{selectedStudentDetail.name}</h3>
                    <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 items-center mt-0.5">
                      <p className="text-[10px] text-indigo-200 font-mono font-black uppercase tracking-wider">Roll Ref: {selectedStudentDetail.rollNo}</p>
                      {selectedStudentDetail.mobileNo && (
                        <p className="text-[10px] text-indigo-300 font-mono font-black uppercase tracking-wider bg-indigo-950 px-1.5 py-0.5 border border-indigo-700/50">
                          📞 {selectedStudentDetail.mobileNo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedStudentDetail(null)}
                  className="p-1.5 rounded-none hover:bg-white/10 transition-colors text-indigo-200 hover:text-white"
                  title="Close modal"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* MODAL CONTENT */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
                
                {/* SUBJECT-WISE REPORT OPTION TOGGLE */}
                <div className="bg-indigo-50 border border-indigo-150 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-none">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="toggle_subject_wise_classes"
                      checked={showSubjectWiseClasses}
                      onChange={(e) => setShowSubjectWiseClasses(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 rounded-none cursor-pointer"
                    />
                    <label htmlFor="toggle_subject_wise_classes" className="text-xs font-black text-slate-800 uppercase tracking-wider cursor-pointer select-none">
                      Show classes subject-wise (instead of total aggregate)
                    </label>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-bold uppercase font-mono">
                    {showSubjectWiseClasses ? "Subject-wise Active" : "Aggregate Total Active"}
                  </span>
                </div>

                {/* ATTENDANCE SUMMARY METER CARD */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Status Indicator Meter */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-none flex flex-col justify-between border-l-4 border-l-indigo-600">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exam Eligibility</span>
                    <div className="mt-3">
                      {(() => {
                        if (showSubjectWiseClasses) {
                          const subjectBreakdowns = subjects.map(sub => {
                            const sStats = overallStats.studentSubjectStats[selectedStudentDetail.id]?.[sub] || { totalClasses: 0, presents: 0 };
                            const sRate = sStats.totalClasses > 0 ? (sStats.presents / sStats.totalClasses) * 100 : null;
                            return { sub, rate: sRate };
                          });
                          const barredSubjects = subjectBreakdowns.filter(b => b.rate !== null && b.rate < 75);
                          const loggedCount = subjectBreakdowns.filter(b => b.rate !== null).length;

                          if (loggedCount === 0) {
                            return (
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">No logs</span>
                            );
                          } else if (barredSubjects.length > 0) {
                            return (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-800 bg-rose-50 border border-rose-150 px-2 py-1 rounded-none uppercase tracking-wider">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                Barred ({barredSubjects.length} Subj)
                              </span>
                            );
                          } else {
                            return (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-none uppercase tracking-wider">
                                <Award className="w-3.5 h-3.5 shrink-0" />
                                Eligible (All ≥75%)
                              </span>
                            );
                          }
                        } else {
                          const stats = overallStats.studentStats[selectedStudentDetail.id];
                          const rate = stats && stats.totalClasses > 0 ? (stats.presents / stats.totalClasses) * 100 : null;
                          
                          if (rate === null) {
                            return (
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">No logs</span>
                            );
                          } else if (rate >= 75) {
                            return (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-none uppercase tracking-wider">
                                <Award className="w-3.5 h-3.5" />
                                Eligible (≥75%)
                              </span>
                            );
                          } else {
                            return (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-800 bg-rose-50 border border-rose-150 px-2 py-1 rounded-none uppercase tracking-wider">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Barred (&lt;75%)
                              </span>
                            );
                          }
                        }
                      })()}
                    </div>
                  </div>

                  {/* Overall Percentage / Subject-wise Percentages */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-none flex flex-col justify-between border-l-4 border-l-indigo-600">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {showSubjectWiseClasses ? "Subject Percentages" : "Attendance"}
                    </span>
                    <div className="mt-2">
                      {showSubjectWiseClasses ? (
                        <div className="space-y-1.5 text-[11px] font-mono font-bold text-slate-700 max-h-[120px] overflow-y-auto pr-1">
                          {subjects.map(sub => {
                            const sStats = overallStats.studentSubjectStats[selectedStudentDetail.id]?.[sub] || { totalClasses: 0, presents: 0 };
                            const sRate = sStats.totalClasses > 0 ? Math.round((sStats.presents / sStats.totalClasses) * 100) : null;
                            return (
                              <div key={sub} className="flex justify-between gap-2 border-b border-slate-100 pb-0.5 last:border-0 last:pb-0">
                                <span className="text-slate-500 font-sans truncate max-w-[110px]" title={sub}>{sub}</span>
                                <span className={sRate !== null && sRate < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                                  {sRate !== null ? `${sRate}%` : 'N/A'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-mono font-black text-slate-900">
                            {(() => {
                              const stats = overallStats.studentStats[selectedStudentDetail.id];
                              return stats && stats.totalClasses > 0 
                                ? `${Math.round((stats.presents / stats.totalClasses) * 100)}%`
                                : 'N/A';
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attendance Fraction / Subject-wise Fraction */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-none flex flex-col justify-between border-l-4 border-l-indigo-600">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {showSubjectWiseClasses ? "Subject Classes Held" : "Lectures logged"}
                    </span>
                    <div className="mt-2">
                      {showSubjectWiseClasses ? (
                        <div className="space-y-1.5 text-[11px] font-mono font-bold text-slate-700 max-h-[120px] overflow-y-auto pr-1">
                          {subjects.map(sub => {
                            const sStats = overallStats.studentSubjectStats[selectedStudentDetail.id]?.[sub] || { totalClasses: 0, presents: 0 };
                            return (
                              <div key={sub} className="flex justify-between gap-2 border-b border-slate-100 pb-0.5 last:border-0 last:pb-0">
                                <span className="text-slate-500 font-sans truncate max-w-[110px]" title={sub}>{sub}</span>
                                <span>{sStats.presents} / {sStats.totalClasses}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-800 font-bold uppercase tracking-wide">
                          {(() => {
                            const stats = overallStats.studentStats[selectedStudentDetail.id];
                            return stats 
                              ? `${stats.presents} / ${stats.totalClasses} classes`
                              : '0 / 0 classes';
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* DISPLAY OPTIONS TOGGLE */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 pt-1">
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Report Display</span>
                  <div className="flex border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setReportCardViewMode('subject')}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer rounded-none ${
                        reportCardViewMode === 'subject' 
                          ? 'bg-indigo-900 text-white' 
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      📚 Subject-wise
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportCardViewMode('overall')}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer rounded-none ${
                        reportCardViewMode === 'overall' 
                          ? 'bg-indigo-900 text-white' 
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      🗓️ Overall Timeline
                    </button>
                  </div>
                </div>

                {reportCardViewMode === 'subject' ? (
                  <div className="space-y-3.5">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Subject-Wise Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subjects.map((sub, sIdx) => {
                        const stats = overallStats.studentSubjectStats[selectedStudentDetail.id]?.[sub] || { totalClasses: 0, presents: 0 };
                        const rate = stats.totalClasses > 0 ? Math.round((stats.presents / stats.totalClasses) * 100) : null;
                        const isBelow = rate !== null && rate < 75;

                        return (
                          <div 
                            key={sIdx} 
                            className={`p-4 border bg-slate-50 relative flex flex-col justify-between rounded-none transition-all ${
                              isBelow ? 'border-l-4 border-l-rose-500 border-rose-200' : 'border-l-4 border-l-emerald-500 border-slate-200'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-black uppercase tracking-tight text-slate-900 block truncate max-w-[180px]" title={sub}>
                                  {sub}
                                </span>
                                {rate !== null ? (
                                  <span className={`text-xs font-mono font-black ${isBelow ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {rate}%
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                                    No classes
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-extrabold">
                                {stats.presents} Present / {stats.totalClasses} Classes
                              </p>
                            </div>

                            {rate !== null && (
                              <div className="mt-3.5">
                                <div className="w-full bg-slate-200 h-1.5 rounded-none overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 ${isBelow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                    Min Required: 75%
                                  </span>
                                  <span className={`text-[9px] font-black uppercase tracking-wider ${isBelow ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {isBelow ? '⚠️ Shortage' : '✓ OK'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* DETAILED HISTORY LOG OF THIS STUDENT */
                  <div>
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-3">Historical Attendance Log</h4>
                    <div className="border border-slate-200 rounded-none overflow-hidden bg-white max-h-[220px] overflow-y-auto shadow-xs">
                      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 grid grid-cols-12 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        <span className="col-span-3">Date</span>
                        <span className="col-span-4">Slot 1 (10-1 PM)</span>
                        <span className="col-span-5">Slot 2 (2-5 PM)</span>
                      </div>
                      
                      {/* Log list */}
                      <div className="divide-y divide-slate-100">
                        {Object.keys(attendanceDb).length === 0 ? (
                          <div className="text-center py-8 text-xs text-slate-400 uppercase tracking-widest font-bold">
                            No historical classes recorded yet.
                          </div>
                        ) : (
                          Object.keys(attendanceDb).sort((a,b) => b.localeCompare(a)).map((dateStr) => {
                            const day = attendanceDb[dateStr];
                            const slot1Pres = !!day.slot1Present[selectedStudentDetail.id];
                            const slot2Pres = !!day.slot2Present[selectedStudentDetail.id];

                            return (
                              <div key={dateStr} className="px-4 py-3 grid grid-cols-12 items-center text-xs font-mono font-bold">
                                <span className="col-span-3 text-slate-600 font-mono font-bold">{dateStr}</span>
                                
                                {/* Slot 1 cell */}
                                <div className="col-span-4 flex items-center gap-1.5">
                                  {day.slot1Taken ? (
                                    <>
                                      <span className={`w-2.5 h-2.5 rounded-none ${slot1Pres ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                      <span className="truncate max-w-[110px] uppercase font-sans font-extrabold text-slate-800" title={day.slot1Subject}>{day.slot1Subject}</span>
                                      <span className={`text-[9px] font-black ${slot1Pres ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        ({slot1Pres ? 'P' : 'A'})
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-slate-400 uppercase tracking-widest text-[9px]">No class</span>
                                  )}
                                </div>

                                {/* Slot 2 cell */}
                                <div className="col-span-5 flex items-center gap-1.5">
                                  {day.slot2Taken ? (
                                    <>
                                      <span className={`w-2.5 h-2.5 rounded-none ${slot2Pres ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                      <span className="truncate max-w-[125px] uppercase font-sans font-extrabold text-slate-800" title={day.slot2Subject}>{day.slot2Subject}</span>
                                      <span className={`text-[9px] font-black ${slot2Pres ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        ({slot2Pres ? 'P' : 'A'})
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-slate-400 uppercase tracking-widest text-[9px]">No class</span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* CLOSING TIPS */}
                <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">
                  Students below 75% are automatically flagged in the Analytics dashboard tab.
                </div>

              </div>

              {/* MODAL FOOTER */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedStudentDetail(null)}
                  className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-none transition-all cursor-pointer uppercase tracking-widest border border-indigo-950 shadow-md"
                >
                  Close Report Card
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRILLDOWN MODAL: DETAILED CALENDAR / ATTENDANCE REPORT FOR A SINGLE SUBJECT */}
      <AnimatePresence>
        {selectedAnalyticsSubject && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="subject_detail_modal_container">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-none border-2 border-indigo-900 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]"
              id="subject_detail_modal_card"
            >
              {/* MODAL HEADER */}
              <div className="bg-indigo-900 text-white px-6 py-5 flex items-center justify-between border-b-4 border-indigo-600">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-950 text-white border border-indigo-500/50 rounded-none">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wide">{selectedAnalyticsSubject}</h3>
                    <p className="text-[10px] text-indigo-200 font-mono font-black mt-0.5 uppercase tracking-wider">
                      Subject-Wise Class Attendance History Log
                    </p>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedAnalyticsSubject(null)}
                  className="p-1.5 rounded-none hover:bg-white/10 transition-colors text-indigo-200 hover:text-white"
                  title="Close modal"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* MODAL CONTENT */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-white">
                {(() => {
                  // Find all historical sessions for this subject
                  const sessions: Array<{
                    date: string;
                    slot: string;
                    presentIds: string[];
                    absentIds: string[];
                  }> = [];

                  (Object.entries(attendanceDb) as [string, DayAttendance][]).forEach(([dateStr, day]) => {
                    if (day.isHoliday) return;

                    // Check Slot 1
                    if (day.slot1Taken && day.slot1Subject === selectedAnalyticsSubject) {
                      const presents: string[] = [];
                      const absents: string[] = [];
                      students.forEach(st => {
                        if (day.slot1Present[st.id]) {
                          presents.push(st.id);
                        } else {
                          absents.push(st.id);
                        }
                      });
                      sessions.push({
                        date: dateStr,
                        slot: 'Slot 1 (10:00 AM - 01:00 PM)',
                        presentIds: presents,
                        absentIds: absents
                      });
                    }

                    // Check Slot 2
                    if (day.slot2Taken && day.slot2Subject === selectedAnalyticsSubject) {
                      const presents: string[] = [];
                      const absents: string[] = [];
                      students.forEach(st => {
                        if (day.slot2Present[st.id]) {
                          presents.push(st.id);
                        } else {
                          absents.push(st.id);
                        }
                      });
                      sessions.push({
                        date: dateStr,
                        slot: 'Slot 2 (02:00 PM - 05:00 PM)',
                        presentIds: presents,
                        absentIds: absents
                      });
                    }
                  });

                  // Sort by date descending
                  sessions.sort((a, b) => b.date.localeCompare(a.date));

                  if (sessions.length === 0) {
                    return (
                      <div className="text-center py-12 bg-slate-50 border border-slate-200 p-8 rounded-none">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-slate-700 uppercase">No sessions recorded yet</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Attendance records for {selectedAnalyticsSubject} will automatically compile here once you log active lectures.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between text-xs bg-indigo-50 border border-indigo-100 p-3 rounded-none">
                        <span className="font-extrabold text-indigo-900 uppercase tracking-wider">
                          Total Classes Conducted:
                        </span>
                        <span className="font-black font-mono text-indigo-800 bg-white px-2 py-0.5 border border-indigo-200">
                          {sessions.length}
                        </span>
                      </div>

                      <div className="space-y-5">
                        {sessions.map((session, sIdx) => {
                          return (
                            <div key={sIdx} className="border border-slate-200 bg-white shadow-xs rounded-none overflow-hidden">
                              {/* Session Header */}
                              <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                                  <span className="font-mono text-xs font-black text-slate-800">{session.date}</span>
                                  <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-50 border border-indigo-100 px-1.5 py-0.5">
                                    {session.slot}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 font-bold">
                                    Present: {session.presentIds.length}
                                  </span>
                                  <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 border border-rose-100 font-bold">
                                    Absent: {session.absentIds.length}
                                  </span>
                                </div>
                              </div>

                              {/* Session Details: Present & Absent Lists */}
                              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                
                                {/* Present Column */}
                                <div className="space-y-2 pb-3 md:pb-0">
                                  <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Attended ({session.presentIds.length})
                                  </div>
                                  {session.presentIds.length === 0 ? (
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-3 py-1">
                                      No students attended.
                                    </p>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5 pl-3">
                                      {session.presentIds.map(stId => {
                                        const st = students.find(s => s.id === stId);
                                        if (!st) return null;
                                        return (
                                          <span 
                                            key={stId}
                                            className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-none"
                                          >
                                            {st.name} <span className="text-[8px] font-mono opacity-60">({st.rollNo})</span>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Absent Column */}
                                <div className="space-y-2 pt-3 md:pt-0 md:pl-4">
                                  <div className="flex items-center gap-1.5 text-rose-700 font-extrabold text-[10px] uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    Did Not Attend ({session.absentIds.length})
                                  </div>
                                  {session.absentIds.length === 0 ? (
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-3 py-1">
                                      Everyone attended!
                                    </p>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5 pl-3">
                                      {session.absentIds.map(stId => {
                                        const st = students.find(s => s.id === stId);
                                        if (!st) return null;
                                        return (
                                          <span 
                                            key={stId}
                                            className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-100 px-2 py-0.5 rounded-none"
                                          >
                                            {st.name} <span className="text-[8px] font-mono opacity-60">({st.rollNo})</span>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* MODAL FOOTER */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedAnalyticsSubject(null)}
                  className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-none transition-all cursor-pointer uppercase tracking-widest border border-indigo-950 shadow-md"
                >
                  Close Logs
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPORT PRESENT STUDENTS MODAL */}
      <AnimatePresence>
        {exportModalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="export_modal_container">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-none border-2 border-emerald-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
              id="export_modal_card"
            >
              {/* MODAL HEADER */}
              <div className="bg-emerald-800 text-white px-6 py-5 flex items-center justify-between border-b-4 border-emerald-600">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-950 text-white border border-emerald-500/50 rounded-none">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wide">Export Today's Attendance</h3>
                    <p className="text-[10px] text-emerald-200 font-mono font-black mt-0.5 uppercase tracking-wider">Date: {formatDateStr(selectedDate)}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setExportModalOpen(false)}
                  className="p-1.5 rounded-none hover:bg-white/10 transition-colors text-emerald-200 hover:text-white cursor-pointer animate-none"
                  title="Close modal"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* MODAL CONTENT */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-white">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Select Export Scope</label>
                  <div className="flex border border-slate-200 rounded-none overflow-hidden bg-slate-100" id="export_slot_tabs">
                    <button
                      onClick={() => setExportActiveSlot('slot1')}
                      className={`flex-1 py-2 text-xs font-bold transition-all uppercase tracking-wider cursor-pointer border-r border-slate-200 ${
                        exportActiveSlot === 'slot1'
                          ? 'bg-emerald-800 text-white'
                          : 'text-slate-600 hover:bg-slate-250'
                      }`}
                    >
                      Slot 1 (10-1 PM)
                    </button>
                    <button
                      onClick={() => setExportActiveSlot('slot2')}
                      className={`flex-1 py-2 text-xs font-bold transition-all uppercase tracking-wider cursor-pointer border-r border-slate-200 ${
                        exportActiveSlot === 'slot2'
                          ? 'bg-emerald-800 text-white'
                          : 'text-slate-600 hover:bg-slate-250'
                      }`}
                    >
                      Slot 2 (2-5 PM)
                    </button>
                    <button
                      onClick={() => setExportActiveSlot('both')}
                      className={`flex-1 py-2 text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                        exportActiveSlot === 'both'
                          ? 'bg-emerald-800 text-white'
                          : 'text-slate-600 hover:bg-slate-250'
                      }`}
                    >
                      Both Slots
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Formatted Copy Preview</label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 uppercase tracking-wide border border-emerald-100">
                      Standard text output
                    </span>
                  </div>
                  <textarea
                    readOnly
                    value={getActiveExportText()}
                    className="w-full h-64 p-4 font-mono text-xs bg-slate-900 text-slate-100 rounded-none border border-slate-800 resize-none focus:outline-hidden leading-relaxed shadow-inner"
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCopyToClipboard(getActiveExportText())}
                    className={`py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 border shadow-md ${
                      copiedState 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                        : 'bg-emerald-800 hover:bg-emerald-900 text-white border-emerald-900'
                    }`}
                  >
                    {copiedState ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy To Clipboard</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDownloadTxt(getActiveExportText())}
                    className="py-3 px-4 bg-slate-900 hover:bg-slate-950 text-white border border-slate-900 font-bold text-xs uppercase tracking-wider rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .txt</span>
                  </button>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setExportModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 font-bold text-xs rounded-none transition-colors uppercase tracking-widest cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HOME PAGE DETAILED ROSTER LIST MODAL */}
      <AnimatePresence>
        {homeRosterOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="home_roster_modal_container">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-none border-2 border-indigo-900 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]"
              id="home_roster_modal_card"
            >
              {/* HEADER */}
              <div className="bg-indigo-900 text-white px-6 py-5 flex items-center justify-between border-b-4 border-indigo-600">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-950 text-white border border-indigo-500/50 rounded-none">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wide">Cohort Student Directory</h3>
                    <p className="text-[10px] text-indigo-200 font-mono font-black mt-0.5 uppercase tracking-wider">Total Enrolled: {students.length}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setHomeRosterOpen(false)}
                  className="p-1.5 rounded-none hover:bg-white/10 transition-colors text-indigo-200 hover:text-white cursor-pointer"
                  title="Close directory"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* SEARCH FILTER */}
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search students by name or roll number..."
                    value={rosterSearchQuery}
                    onChange={(e) => setRosterSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-none focus:outline-hidden focus:border-indigo-600 font-medium"
                    id="home_roster_search_input"
                  />
                </div>
              </div>

              {/* DIRECTORY LIST */}
              <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-white">
                {(() => {
                  const query = rosterSearchQuery.trim().toLowerCase();
                  const filtered = students.filter(st => 
                    st.name.toLowerCase().includes(query) || 
                    st.rollNo.toLowerCase().includes(query)
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 bg-slate-50 border border-slate-200 p-8 rounded-none">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-slate-700 uppercase">No students matched</h4>
                        <p className="text-xs text-slate-400 mt-1">Try refining your search terms.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="home_roster_grid">
                      {filtered.map(st => {
                        const stats = overallStats.studentStats[st.id];
                        const rate = stats && stats.totalClasses > 0 
                          ? Math.round((stats.presents / stats.totalClasses) * 100) 
                          : null;

                        return (
                          <div 
                            key={st.id} 
                            onClick={() => {
                              setSelectedStudentDetail(st);
                            }}
                            className="p-3 border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/20 hover:border-indigo-300 cursor-pointer transition-all flex items-center gap-3 rounded-none group"
                          >
                            {renderStudentAvatar(st.name, st.photo, "w-10 h-10 text-xs shadow-sm border border-slate-200 group-hover:border-indigo-300 transition-colors")}
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate group-hover:text-indigo-900 transition-colors">{st.name}</h4>
                              <p className="text-[10px] font-mono text-slate-500 font-bold bg-slate-100 px-1 py-0.2 border border-slate-200 inline-block mt-0.5">{st.rollNo}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                  {rate !== null ? `${rate}% Attend` : 'No data'}
                                </span>
                                {st.mobileNo && (
                                  <span className="text-[9px] text-indigo-600 font-mono font-black">
                                    📞 {st.mobileNo}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* FOOTER */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setHomeRosterOpen(false)}
                  className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-none transition-all cursor-pointer uppercase tracking-widest border border-indigo-950 shadow-md"
                >
                  Close Directory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
