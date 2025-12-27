import React from 'react';

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

const MaintenanceKanban = () => {
  const columns = [
    { id: 'new', title: 'New', status: 'new', bgColor: 'bg-gray-100' },
    { id: 'scheduled', title: 'Scheduled', status: 'scheduled', bgColor: 'bg-blue-100' },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress', bgColor: 'bg-yellow-100' },
    { id: 'completed', title: 'Completed', status: 'completed', bgColor: 'bg-green-100' },
  ];

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

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Maintenance Kanban Board</h2>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 overflow-x-auto h-[calc(100vh-200px)]">
        {columns.map((column) => (
           <div key={column.id} className={`flex-shrink-0 w-full md:w-1/4 ${column.bgColor} rounded-lg p-4 shadow-sm flex flex-col`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{column.title}</h3>
            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-grow">
              {STATIC_MAINTENANCE_DATA.maintenance_requests
                .filter((request) => request.status === column.status)
                .map((request) => (
                  <div key={request.id} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-1">{request.title}</h4>
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-semibold">Equipment:</span> {request.equipment.name}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-semibold">Work Center:</span> {request.work_center.name}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Technician:</span> {request.assigned_technician.email}
                    </p>
                    <div className="flex items-center mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${getPriorityColor(
                          request.priority
                        )}`}
                      >
                        {request.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Scheduled:</span> {formatDateTime(request.scheduled_start)} ({request.duration_hours}h)
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceKanban;
