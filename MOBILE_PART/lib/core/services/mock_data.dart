import '../models/equipment_model.dart';
import '../models/maintenance_request_model.dart';
import '../models/work_center_model.dart';

class MockData {
  static final List<WorkCenter> workCenters = [
    WorkCenter(
      id: 'wc1',
      name: 'Main Assembly Line',
      locationId: 'loc1',
      description: 'Primary assembly line for heavy machinery.',
      latitude: 12.9716,
      longitude: 77.5946,
    ),
    WorkCenter(
      id: 'wc2',
      name: 'Paint Shop',
      locationId: 'loc2',
      description: 'Automated painting booth.',
      latitude: 12.9719,
      longitude: 77.5950,
    ),
    WorkCenter(
      id: 'wc3',
      name: 'Generator Room',
      locationId: 'loc1',
      description: 'Power backup and electrical controls.',
      latitude: 12.9710,
      longitude: 77.5940,
    ),
  ];

  static final List<Equipment> equipment = [
    Equipment(
      id: 'eq1',
      name: 'Hydraulic Press X200',
      serialNumber: 'HP-2024-001',
      categoryId: 'cat_heavy',
      locationId: 'loc1',
      assignedUserId: 'user1',
      status: EquipmentStatus.operational,
      description: '200-ton hydraulic press',
      imageUrl:
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60',
    ),
    Equipment(
      id: 'eq2',
      name: 'Robotic Arm Kuka',
      serialNumber: 'RA-2024-055',
      categoryId: 'cat_robotics',
      locationId: 'loc1',
      status: EquipmentStatus.maintenanceRequired,
      description: 'High precision welding arm',
      imageUrl:
          'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&auto=format&fit=crop&q=60',
    ),
    Equipment(
      id: 'eq3',
      name: 'Diesel Generator 500kVA',
      serialNumber: 'DG-500-09',
      categoryId: 'cat_power',
      locationId: 'loc1',
      status: EquipmentStatus.down,
      description: 'Emergency power backup',
      imageUrl:
          'https://images.unsplash.com/photo-1590486803833-ffc9cf613c54?w=500&auto=format&fit=crop&q=60',
    ),
  ];

  static final List<MaintenanceRequest> requests = [
    MaintenanceRequest(
      id: 'req1',
      title: 'Press Leaking Oil',
      description: 'Hydraulic fluid leaking from main seal.',
      equipmentId: 'eq1',
      requestedByUserId: 'user1',
      priority: Priority.high,
      status: RequestStatus.pending,
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      scheduledDate: DateTime.now().add(const Duration(days: 1)),
      workCenterId: 'wc1',
      equipmentName: 'Hydraulic Press X200',
      requestedByName: 'Dev User',
    ),
    MaintenanceRequest(
      id: 'req2',
      title: 'Routine Service',
      description: 'Monthly inspection and oil change.',
      equipmentId: 'eq1',
      requestedByUserId: 'user1',
      priority: Priority.low,
      status: RequestStatus.completed,
      createdAt: DateTime.now().subtract(const Duration(days: 30)),
      workCenterId: 'wc1',
      equipmentName: 'Hydraulic Press X200',
    ),
    MaintenanceRequest(
      id: 'req3',
      title: 'Generator Overheating',
      description: 'Temperature gauge shows red after 10 mins.',
      equipmentId: 'eq3',
      requestedByUserId: 'other_user',
      assignedTechnicianId: 'dev_user_1',
      priority: Priority.critical,
      status: RequestStatus.inProgress,
      createdAt: DateTime.now().subtract(const Duration(hours: 4)),
      workCenterId: 'wc3',
      equipmentName: 'Diesel Generator 500kVA',
    ),
  ];
}
