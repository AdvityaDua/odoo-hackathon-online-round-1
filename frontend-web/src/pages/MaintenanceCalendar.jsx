import React, { useState, useEffect } from 'react';

const STATIC_MAINTENANCE_DATA = {
  "maintenance_requests": [
    {
      "id": 1,
      "title": "Routine Maintenance #1",
      "description": "Auto-generated demo maintenance",
      "maintenance_type": "preventive",
      "priority": "medium",
      "status": "scheduled",
      "equipment": {
        "id": 1,
        "name": "CNC Machine #12",
        "serial_number": "CNC-12-XYZ"
      },
      "work_center": {
        "id": 1,
        "name": "Assembly Line A"
      },
      "assigned_team": {
        "id": 1,
        "name": "Mechanical Team"
      },
      "assigned_technician": {
        "id": 5,
        "email": "tech1@gearguard.com"
      },
      "scheduled_start": "2025-12-28T10:00:00",
      "duration_hours": 2,
      "created_at": "2025-12-27T09:30:00"
    },
    {
      "id": 2,
      "title": "Motor Overheating",
      "description": "Temperature spikes after 2 hours",
      "maintenance_type": "corrective",
      "priority": "critical",
      "status": "in_progress",
      "equipment": {
        "id": 2,
        "name": "Hydraulic Press #3",
        "serial_number": "HP-3-AAA"
      },
      "work_center": {
        "id": 2,
        "name": "Press Section"
      },
      "assigned_team": {
        "id": 2,
        "name": "Electrical Team"
      },
      "assigned_technician": {
        "id": 6,
        "email": "tech2@gearguard.com"
      },
      "scheduled_start": "2025-12-27T14:00:00",
      "duration_hours": 3,
      "created_at": "2025-12-27T11:00:00"
    },
    {
      "id": 3,
      "title": "Bearing Replacement",
      "description": "Unusual vibration detected",
      "maintenance_type": "corrective",
      "priority": "high",
      "status": "completed",
      "equipment": {
        "id": 3,
        "name": "Lathe Machine #7",
        "serial_number": "LAT-7-BBB"
      },
      "work_center": {
        "id": 1,
        "name": "Assembly Line A"
      },
      "assigned_team": {
        "id": 1,
        "name": "Mechanical Team"
      },
      "assigned_technician": {
        "id": 5,
        "email": "tech1@gearguard.com"
      },
      "scheduled_start": "2025-12-26T09:00:00",
      "duration_hours": 1,
      "created_at": "2025-12-26T08:30:00"
    },
    {
      "id": 4,
      "title": "Lubrication Check",
      "description": "Monthly lubrication inspection",
      "maintenance_type": "preventive",
      "priority": "low",
      "status": "new",
      "equipment": {
        "id": 4,
        "name": "Conveyor Belt #2",
        "serial_number": "CONV-2-CCC"
      },
      "work_center": {
        "id": 3,
        "name": "Packaging Section"
      },
      "assigned_team": {
        "id": 1,
        "name": "Mechanical Team"
      },
      "assigned_technician": {
        "id": 7,
        "email": "tech3@gearguard.com"
      },
      "scheduled_start": "2025-12-29T11:00:00",
      "duration_hours": 1,
      "created_at": "2025-12-27T12:00:00"
    }
  ]
};

const MaintenanceCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday, etc.
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-500';
      case 'medium':
        return 'bg-blue-500';
      case 'high':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getMaintenanceForDay = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const targetDate = new Date(year, month, day);

    return STATIC_MAINTENANCE_DATA.maintenance_requests.filter(request => {
      const scheduledDate = new Date(request.scheduled_start);
      return (
        scheduledDate.getFullYear() === targetDate.getFullYear() &&
        scheduledDate.getMonth() === targetDate.getMonth() &&
        scheduledDate.getDate() === targetDate.getDate()
      );
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Maintenance Calendar</h2>

      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousMonth} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Previous</button>
        <h3 className="text-xl font-semibold">{currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={goToNextMonth} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Next</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-700 mb-2">
        {daysOfWeek.map(day => (<div key={day} className="p-2">{day}</div>))}
      </div>

      <div className="grid grid-cols-7 gap-1 h-[calc(100vh-350px)] overflow-y-auto">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="p-2 border rounded-md bg-gray-50"></div>
        ))}
        {calendarDays.map((day) => (
          <div key={day} className="p-2 border rounded-md bg-gray-100 flex flex-col items-start min-h-[100px]">
            <div className="font-bold text-lg mb-2 text-gray-800">{day}</div>
            <div className="space-y-1 w-full">
              {getMaintenanceForDay(day).map(request => (
                <div key={request.id} className="bg-white p-2 rounded-md shadow-sm border border-gray-200 text-left">
                  <p className="font-semibold text-sm text-gray-900">{request.title}</p>
                  <p className="text-xs text-gray-700">Equipment: {request.equipment.name}</p>
                  <p className="text-xs text-gray-700">Technician: {request.assigned_technician.email}</p>
                  <div className="flex items-center mt-1">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-xs font-semibold text-white ${getPriorityColor(
                        request.priority
                      )}`}
                    >
                      {request.priority}
                    </span>
                    <span className="ml-2 text-xs text-gray-600">{formatTime(request.scheduled_start)} ({request.duration_hours}h)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceCalendar;
