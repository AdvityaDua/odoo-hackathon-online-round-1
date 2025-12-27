const STATIC_DATA = {
  "companies": [
    {
      "id": 1,
      "name": "GearGuard Industries",
      "location": "Ahmedabad Plant"
    },
    {
      "id": 2,
      "name": "GearGuard R&D",
      "location": "Pune"
    }
  ],

  "departments": [
    { "id": 1, "name": "Production" },
    { "id": 2, "name": "Maintenance" },
    { "id": 3, "name": "IT" }
  ],

  "users": [
    {
      "id": 1,
      "email": "admin@gearguard.com",
      "roles": ["admin"],
      "company": 1,
      "department": 2
    },
    {
      "id": 2,
      "email": "user1@gearguard.com",
      "roles": ["user"],
      "company": 1,
      "department": 1
    },
    {
      "id": 3,
      "email": "user2@gearguard.com",
      "roles": ["user"],
      "company": 1,
      "department": 1
    },
    {
      "id": 4,
      "email": "tech1@gearguard.com",
      "roles": ["technician"],
      "company": 1,
      "department": 2
    },
    {
      "id": 5,
      "email": "tech2@gearguard.com",
      "roles": ["technician"],
      "company": 1,
      "department": 2
    },
    {
      "id": 6,
      "email": "tech3@gearguard.com",
      "roles": ["technician"],
      "company": 2,
      "department": 2
    }
  ],

  "maintenance_teams": [
    {
      "id": 1,
      "name": "Mechanical Team",
      "company": 1,
      "members": [4, 5]
    },
    {
      "id": 2,
      "name": "Electrical Team",
      "company": 1,
      "members": [5]
    }
  ],

  "equipment_categories": [
    {
      "id": 1,
      "name": "CNC Machines"
    },
    {
      "id": 2,
      "name": "Hydraulic Equipment"
    }
  ],

  "equipment": [
    {
      "id": 1,
      "name": "CNC Machine #12",
      "serial_number": "CNC-12-XYZ",
      "company": 1,
      "category": 1,
      "employee": 2,
      "department": 1
    },
    {
      "id": 2,
      "name": "Hydraulic Press #3",
      "serial_number": "HP-3-AAA",
      "company": 1,
      "category": 2,
      "employee": 3,
      "department": 1
    },
    {
      "id": 3,
      "name": "Lathe Machine #7",
      "serial_number": "LAT-7-BBB",
      "company": 1,
      "category": 1,
      "employee": null,
      "department": 1
    },
    {
      "id": 4,
      "name": "Conveyor Belt #2",
      "serial_number": "CONV-2-CCC",
      "company": 1,
      "category": 2,
      "employee": null,
      "department": 1
    }
  ],

  "work_centers": [
    {
      "id": 1,
      "name": "Assembly Line A",
      "code": "ASM-A",
      "company": 1,
      "cost_per_hour": 450,
      "capacity": 3,
      "time_efficiency": 85,
      "oee_target": 90
    },
    {
      "id": 2,
      "name": "Press Section",
      "code": "PRS-1",
      "company": 1,
      "cost_per_hour": 500,
      "capacity": 2,
      "time_efficiency": 80,
      "oee_target": 88
    },
    {
      "id": 3,
      "name": "Packaging Section",
      "code": "PKG-1",
      "company": 1,
      "cost_per_hour": 300,
      "capacity": 4,
      "time_efficiency": 90,
      "oee_target": 92
    }
  ],

  "maintenance_requests": [
    {
      "id": 1,
      "title": "Routine Maintenance #1",
      "description": "Auto-generated demo maintenance",
      "maintenance_type": "preventive",
      "priority": "medium",
      "status": "scheduled",
      "equipment": 1,
      "work_center": 1,
      "assigned_team": 1,
      "assigned_technician": 4,
      "scheduled_start": "2025-12-28T10:00:00",
      "duration_hours": 2
    },
    {
      "id": 2,
      "title": "Motor Overheating",
      "description": "Temperature spikes after 2 hours",
      "maintenance_type": "corrective",
      "priority": "critical",
      "status": "in_progress",
      "equipment": 2,
      "work_center": 2,
      "assigned_team": 2,
      "assigned_technician": 5,
      "scheduled_start": "2025-12-27T14:00:00",
      "duration_hours": 3
    },
    {
      "id": 3,
      "title": "Bearing Replacement",
      "description": "Unusual vibration detected",
      "maintenance_type": "corrective",
      "priority": "high",
      "status": "completed",
      "equipment": 3,
      "work_center": 1,
      "assigned_team": 1,
      "assigned_technician": 4,
      "scheduled_start": "2025-12-26T09:00:00",
      "duration_hours": 1
    }
  ],

  "work_logs": [
    {
      "id": 1,
      "maintenance_id": 2,
      "technician": 5,
      "note": "Inspection started",
      "status": "in_progress",
      "created_at": "2025-12-27T14:30:00"
    },
    {
      "id": 2,
      "maintenance_id": 2,
      "technician": 5,
      "note": "Replaced motor fan",
      "status": "completed",
      "created_at": "2025-12-27T16:45:00"
    }
  ]
};

export default STATIC_DATA;

