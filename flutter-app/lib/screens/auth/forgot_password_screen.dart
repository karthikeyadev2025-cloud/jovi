import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../theme.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _email = TextEditingController();
  bool   _loading = false;
  bool   _sent    = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _email.text.trim();
    if (email.isEmpty) return;

    setState(() { _loading = true; _error = null; });

    try {
      await Supabase.instance.client.auth.resetPasswordForEmail(
        email,
        // Deep-link back into the dashboard; mobile users typically don't
        // run a reset-password page in-app, the web flow is simpler.
        redirectTo: 'https://jovio.in/reset-password',
      );
    } on AuthException catch (e) {
      // Only surface rate-limit errors. For everything else fall through
      // to the generic success message — prevents account enumeration.
      if (e.message.toLowerCase().contains('rate')) {
        setState(() { _loading = false; _error = 'Too many requests. Try again in a minute.'; });
        return;
      }
    } catch (_) {
      // network / unknown — still show generic success
    }

    setState(() { _loading = false; _sent = true; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: JovioColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: JovioColors.text),
          onPressed: () => context.go('/login'),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 16),
              const Text(
                'Reset your password',
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: JovioColors.text),
              ),
              const SizedBox(height: 8),
              Text(
                _sent
                  ? "If an account exists for that email, we've sent a reset link. Check your inbox — including spam."
                  : "Enter the email on your Jovio account and we'll send you a reset link.",
                style: const TextStyle(fontSize: 14, color: JovioColors.mid, height: 1.5),
              ),
              const SizedBox(height: 28),

              if (!_sent) ...[
                TextField(
                  controller:   _email,
                  keyboardType: TextInputType.emailAddress,
                  autocorrect:  false,
                  enableSuggestions: false,
                  style: const TextStyle(color: JovioColors.text),
                  decoration: InputDecoration(
                    labelText: 'Email',
                    labelStyle: const TextStyle(color: JovioColors.mid),
                    filled: true,
                    fillColor: JovioColors.high,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: JovioColors.border),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                if (_error != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: JovioColors.red.withOpacity(0.15),
                      border: Border.all(color: JovioColors.red),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(_error!, style: const TextStyle(color: JovioColors.red, fontSize: 13)),
                  ),

                SizedBox(
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: JovioColors.teal,
                      foregroundColor: JovioColors.bg,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: _loading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Send reset link', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                  ),
                ),
              ] else
                SizedBox(
                  height: 50,
                  child: OutlinedButton(
                    onPressed: () => context.go('/login'),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: JovioColors.border),
                      foregroundColor: JovioColors.text,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('← Back to login', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
