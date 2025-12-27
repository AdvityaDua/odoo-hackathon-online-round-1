import 'package:flutter_test/flutter_test.dart';
import 'package:gearguard/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const GearGuardApp());

    // Verify that login screen is displayed
    expect(find.text('GearGuard'), findsOneWidget);
    expect(find.text('Maintenance Management System'), findsOneWidget);
  });
}
