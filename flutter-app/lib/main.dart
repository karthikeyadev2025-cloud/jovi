// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'screens/onboarding/onboarding_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/signup_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/calls/calls_screen.dart';
import 'screens/analytics/analytics_screen.dart';
import 'screens/setup/setup_screen.dart';
import 'screens/billing/billing_screen.dart';
import 'screens/settings/settings_screen.dart';
import 'providers/auth_provider.dart';

// ── CONSTANTS ─────────────────────────────────────────────
const kSupabaseUrl  = String.fromEnvironment('SUPABASE_URL',  defaultValue: 'https://YOUR.supabase.co');
const kSupabaseAnon = String.fromEnvironment('SUPABASE_ANON', defaultValue: 'your_anon_key');
const kApiUrl       = String.fromEnvironment('API_URL',       defaultValue: 'https://api.jovio.in');

// ── ROUTER ────────────────────────────────────────────────
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/onboarding',
    redirect: (context, state) {
      final isAuthed  = authState.valueOrNull != null;
      final isAuthPage = state.matchedLocation == '/login' ||
                         state.matchedLocation == '/signup' ||
                         state.matchedLocation == '/onboarding';

      if (!isAuthed && !isAuthPage) return '/login';
      if (isAuthed && isAuthPage)   return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
      GoRoute(path: '/login',      builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/signup',     builder: (_, __) => const SignupScreen()),
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child, location: state.matchedLocation),
        routes: [
          GoRoute(path: '/home',      builder: (_, __) => const HomeScreen()),
          GoRoute(path: '/calls',     builder: (_, __) => const CallsScreen()),
          GoRoute(path: '/analytics', builder: (_, __) => const AnalyticsScreen()),
          GoRoute(path: '/setup',     builder: (_, __) => const SetupScreen()),
          GoRoute(path: '/billing',   builder: (_, __) => const BillingScreen()),
          GoRoute(path: '/settings',  builder: (_, __) => const SettingsScreen()),
        ],
      ),
    ],
  );
});

// ── MAIN ──────────────────────────────────────────────────
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp, DeviceOrientation.portraitDown,
  ]);

  // Status bar style
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor:            Colors.transparent,
    statusBarIconBrightness:   Brightness.light,
    statusBarBrightness:       Brightness.dark,
  ));

  // Supabase
  await Supabase.initialize(url: kSupabaseUrl, anonKey: kSupabaseAnon);

  // Firebase (for push notifications)
  try {
    await Firebase.initializeApp();
    await FirebaseMessaging.instance.requestPermission();
    final fcmToken = await FirebaseMessaging.instance.getToken();
    debugPrint('FCM Token: $fcmToken');
  } catch (e) {
    debugPrint('Firebase init failed (ok in debug): $e');
  }

  runApp(const ProviderScope(child: K2VobApp()));
}

class K2VobApp extends ConsumerWidget {
  const K2VobApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Jovio',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3:    true,
        brightness:      Brightness.dark,
        colorScheme:     ColorScheme.fromSeed(
          seedColor:  const Color(0xFF8B5CF6),
          brightness: Brightness.dark,
          surface:    const Color(0xFF0F0F1A),
        ),
        scaffoldBackgroundColor: const Color(0xFF07070D),
        fontFamily: 'SF Pro Display',
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F0F1A),
          foregroundColor: Color(0xFFEEEEFF),
          elevation:       0,
          centerTitle:     false,
          titleTextStyle:  TextStyle(
            fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFFEEEEFF),
          ),
        ),
      ),
      routerConfig: router,
    );
  }
}

// ── APP SHELL (Bottom Nav) ────────────────────────────────
class AppShell extends StatelessWidget {
  final Widget child;
  final String location;
  const AppShell({super.key, required this.child, required this.location});

  static const _navItems = [
    _NavItem('/home',      Icons.radio_button_checked_rounded, 'Reception'),
    _NavItem('/calls',     Icons.call_rounded,                 'Calls'),
    _NavItem('/analytics', Icons.bar_chart_rounded,            'Analytics'),
    _NavItem('/setup',     Icons.settings_rounded,             'Setup'),
    _NavItem('/billing',   Icons.credit_card_rounded,          'Billing'),
  ];

  @override
  Widget build(BuildContext context) {
    final idx = _navItems.indexWhere((n) => location.startsWith(n.path));

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0F0F1A),
          border: Border(top: BorderSide(color: const Color(0xFF1E1E35))),
        ),
        child: SafeArea(
          child: SizedBox(
            height: 56,
            child: Row(
              children: _navItems.asMap().entries.map((e) {
                final active = e.key == idx;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => context.go(e.value.path),
                    behavior: HitTestBehavior.opaque,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(e.value.icon, size: 22,
                          color: active ? const Color(0xFF8B5CF6) : const Color(0xFF44445A)),
                        const SizedBox(height: 3),
                        Text(e.value.label,
                          style: TextStyle(
                            fontSize: 9, fontWeight: FontWeight.w600,
                            color: active ? const Color(0xFF8B5CF6) : const Color(0xFF44445A),
                          )),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final String path, label;
  final IconData icon;
  const _NavItem(this.path, this.icon, this.label);
}
