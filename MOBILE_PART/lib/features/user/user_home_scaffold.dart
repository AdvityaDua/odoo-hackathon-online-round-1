import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'user_dashboard_screen.dart';
import 'work_centers_screen.dart';
import 'work_centers_view_model.dart';
import 'calendar_screen.dart';

class UserHomeScaffold extends StatefulWidget {
  const UserHomeScaffold({super.key});

  @override
  State<UserHomeScaffold> createState() => _UserHomeScaffoldState();
}

class _UserHomeScaffoldState extends State<UserHomeScaffold> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const UserDashboardScreen(),
    ChangeNotifierProvider(
      create: (_) => WorkCentersViewModel(),
      child: const WorkCentersScreen(),
    ),
    const CalendarScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() => _currentIndex = index);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.business_outlined),
            selectedIcon: Icon(Icons.business),
            label: 'Work Centers',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            selectedIcon: Icon(Icons.calendar_month),
            label: 'Calendar',
          ),
        ],
      ),
    );
  }
}
