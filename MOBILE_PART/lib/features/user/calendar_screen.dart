import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../core/constants/app_colors.dart';
import 'calendar_view_model.dart';
import '../../core/models/maintenance_request_model.dart';
import 'package:intl/intl.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  @override
  void initState() {
    super.initState();
    _selectedDay = _focusedDay;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CalendarViewModel>().loadRequests();
    });
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<CalendarViewModel>();
    final selectedEvents = viewModel.getEventsForDay(
      _selectedDay ?? _focusedDay,
    );

    return Scaffold(
      appBar: AppBar(title: const Text('Maintenance Calendar')),
      body: viewModel.isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                TableCalendar(
                  firstDay: DateTime.now().subtract(const Duration(days: 365)),
                  lastDay: DateTime.now().add(const Duration(days: 365)),
                  focusedDay: _focusedDay,
                  selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                  eventLoader: viewModel.getEventsForDay,
                  onDaySelected: (selectedDay, focusedDay) {
                    setState(() {
                      _selectedDay = selectedDay;
                      _focusedDay = focusedDay;
                    });
                  },
                  calendarStyle: const CalendarStyle(
                    markerDecoration: BoxDecoration(
                      color: AppColors.secondary,
                      shape: BoxShape.circle,
                    ),
                    todayDecoration: BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    selectedDecoration: BoxDecoration(
                      color: Colors.blueAccent,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                const Divider(),
                Expanded(
                  child: selectedEvents.isEmpty
                      ? const Center(
                          child: Text("No maintenance scheduled for this day"),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          itemCount: selectedEvents.length,
                          itemBuilder: (ctx, i) {
                            final req = selectedEvents[i];
                            return ListTile(
                              leading: CircleAvatar(
                                backgroundColor: _getStatusColor(req.status),
                                child: const Icon(
                                  Icons.build,
                                  size: 16,
                                  color: Colors.white,
                                ),
                              ),
                              title: Text(
                                req.equipmentName ?? 'Unknown Equipment',
                              ),
                              subtitle: Text(req.title),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    req.scheduledDate != null
                                        ? DateFormat(
                                            'hh:mm a',
                                          ).format(req.scheduledDate!)
                                        : 'N/A',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    req.status.name,
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }

  Color _getStatusColor(RequestStatus status) {
    switch (status) {
      case RequestStatus.completed:
        return Colors.green;
      case RequestStatus.inProgress:
        return Colors.orange;
      case RequestStatus.assigned:
        return Colors.blue;
      case RequestStatus.pending:
        return Colors.grey;
      case RequestStatus.cancelled:
        return Colors.red;
    }
  }
}
