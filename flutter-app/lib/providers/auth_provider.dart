import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../services/fcm_service.dart';

final supabaseProvider = Provider<SupabaseClient>((ref) => Supabase.instance.client);

/// Streams the current authenticated user. Side-effect: registers/unregisters
/// the FCM token in Supabase whenever the auth state flips so push
/// notifications correctly target the active session.
final authStateProvider = StreamProvider<User?>((ref) {
  final sb = ref.watch(supabaseProvider);
  String? lastUserId;

  return sb.auth.onAuthStateChange.asyncMap((event) async {
    final user = event.session?.user;
    final currId = user?.id;

    // Sign-in / token refresh → register the device with this user
    if (currId != null && currId != lastUserId) {
      try {
        await FcmService.instance.registerWithSupabase();
      } catch (e) {
        debugPrint('[auth] FCM register failed: $e');
      }
    }

    // Sign-out → drop the device token so we stop pushing to this device
    if (currId == null && lastUserId != null) {
      try {
        await FcmService.instance.unregisterFromSupabase(lastUserId!);
      } catch (e) {
        debugPrint('[auth] FCM unregister failed: $e');
      }
    }

    lastUserId = currId;
    return user;
  });
});

final tenantProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final user = ref.watch(authStateProvider).valueOrNull;
  if (user == null) return null;
  final sb = ref.watch(supabaseProvider);
  final tu = await sb.from('tenant_users').select('tenant_id').eq('user_id', user.id).single();
  return await sb.from('tenants').select('*').eq('id', tu['tenant_id']).single();
});
