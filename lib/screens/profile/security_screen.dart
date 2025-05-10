import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';

class SecurityScreen extends StatefulWidget {
  const SecurityScreen({super.key});

  @override
  State<SecurityScreen> createState() => _SecurityScreenState();
}

class _SecurityScreenState extends State<SecurityScreen> {
  final _passwordFormKey = GlobalKey<FormState>();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _showCurrentPassword = false;
  bool _showNewPassword = false;
  bool _showConfirmPassword = false;
  bool _isTwoFactorEnabled = false;
  bool _isSubmittingPassword = false;

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _changePassword() async {
    if (!_passwordFormKey.currentState!.validate()) return;
    
    setState(() { _isSubmittingPassword = true; });
    // Simulate API call
    await Future.delayed(const Duration(seconds: 1));

    // Mock success/failure
    if (_currentPasswordController.text == "oldpassword") { // Example check
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: const Text('Senha alterada com sucesso!'), backgroundColor: Theme.of(context).colorScheme.tertiary),
      );
      _passwordFormKey.currentState!.reset();
      _currentPasswordController.clear();
      _newPasswordController.clear();
      _confirmPasswordController.clear();

    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: const Text('A senha atual está incorreta.'), backgroundColor: Theme.of(context).colorScheme.error),
      );
    }
    if (mounted) setState(() { _isSubmittingPassword = false; });
  }

  void _toggleTwoFactor() {
    setState(() {
      _isTwoFactorEnabled = !_isTwoFactorEnabled;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Autenticação de Dois Fatores ${_isTwoFactorEnabled ? "Ativada" : "Desativada"}.'),
        backgroundColor: Theme.of(context).colorScheme.tertiary,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Login e Segurança'),
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildPasswordChangeSection(context),
            const SizedBox(height: 24),
            _buildTwoFactorAuthSection(context),
            const SizedBox(height: 24),
            _buildConnectedDevicesSection(context),
          ],
        ),
      ),
    );
  }

  Widget _buildPasswordChangeSection(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _passwordFormKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(LucideIcons.keyRound, color: theme.colorScheme.primary, size: 22),
                  const SizedBox(width: 12),
                  Text('Alterar Senha', style: theme.textTheme.titleLarge),
                ],
              ),
              const SizedBox(height: 4),
              Text('Escolha uma senha forte que você não usa em outro lugar.', style: theme.textTheme.bodyMedium),
              const SizedBox(height: 16),
              _buildPasswordTextField(
                controller: _currentPasswordController,
                labelText: 'Senha Atual',
                obscureText: !_showCurrentPassword,
                toggleObscure: () => setState(() => _showCurrentPassword = !_showCurrentPassword),
              ),
              const SizedBox(height: 12),
               _buildPasswordTextField(
                controller: _newPasswordController,
                labelText: 'Nova Senha',
                obscureText: !_showNewPassword,
                toggleObscure: () => setState(() => _showNewPassword = !_showNewPassword),
                validator: (value) {
                  if (value == null || value.length < 6) {
                    return 'Nova senha deve ter pelo menos 6 caracteres.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              _buildPasswordTextField(
                controller: _confirmPasswordController,
                labelText: 'Confirmar Nova Senha',
                obscureText: !_showConfirmPassword,
                toggleObscure: () => setState(() => _showConfirmPassword = !_showConfirmPassword),
                validator: (value) {
                  if (value != _newPasswordController.text) {
                    return 'As senhas não coincidem.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),
              Align(
                alignment: Alignment.centerRight,
                child: ElevatedButton(
                  onPressed: _isSubmittingPassword ? null : _changePassword,
                  child: _isSubmittingPassword 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Colors.white)))
                      : const Text('Salvar Nova Senha'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPasswordTextField({
    required TextEditingController controller,
    required String labelText,
    required bool obscureText,
    required VoidCallback toggleObscure,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: labelText,
        suffixIcon: IconButton(
          icon: Icon(obscureText ? LucideIcons.eyeOff : LucideIcons.eye, size: 20),
          onPressed: toggleObscure,
        ),
      ),
      obscureText: obscureText,
      validator: validator ?? (value) {
        if (value == null || value.isEmpty) {
          return '$labelText é obrigatória.';
        }
        return null;
      },
    );
  }

  Widget _buildTwoFactorAuthSection(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(LucideIcons.smartphone, color: theme.colorScheme.primary, size: 22),
                const SizedBox(width: 12),
                Text('Autenticação de Dois Fatores (2FA)', style: theme.textTheme.titleLarge),
              ],
            ),
            const SizedBox(height: 4),
            Text('Adicione uma camada extra de segurança à sua conta.', style: theme.textTheme.bodyMedium),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _isTwoFactorEnabled ? Colors.green.shade50 : theme.colorScheme.surfaceVariant.withOpacity(0.3),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: _isTwoFactorEnabled ? Colors.green.shade200 : theme.dividerColor)
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Status: ${_isTwoFactorEnabled ? "Ativado" : "Desativado"}',
                        style: TextStyle(fontWeight: FontWeight.w500, color: _isTwoFactorEnabled ? Colors.green.shade800 : theme.colorScheme.onSurface),
                      ),
                      Text(
                        _isTwoFactorEnabled ? "Sua conta está protegida com 2FA." : "Ative para aumentar a segurança.",
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                  ElevatedButton(
                    onPressed: _toggleTwoFactor,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _isTwoFactorEnabled ? null : theme.colorScheme.primary,
                      foregroundColor: _isTwoFactorEnabled ? theme.colorScheme.primary : theme.colorScheme.onPrimary,
                      side: _isTwoFactorEnabled ? BorderSide(color: Colors.green.shade600) : null,
                      textStyle: const TextStyle(fontSize: 12),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    child: Text(_isTwoFactorEnabled ? 'Desativar 2FA' : 'Ativar 2FA'),
                  ),
                ],
              ),
            ),
            if (_isTwoFactorEnabled)
              Padding(
                padding: const EdgeInsets.only(top:12.0),
                child: Container(
                  padding: const EdgeInsets.all(10),
                   decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.blue.shade200)
                  ),
                  child: Row(
                    children: [
                      Icon(LucideIcons.alertTriangle, size: 18, color: Colors.blue.shade700),
                      const SizedBox(width: 8),
                      Expanded(child: Text('Em uma aplicação real, aqui você configuraria seu método 2FA.', style: theme.textTheme.bodySmall?.copyWith(color: Colors.blue.shade800))),
                    ],
                  ),
                ),
              )
          ],
        ),
      ),
    );
  }

  Widget _buildConnectedDevicesSection(BuildContext context) {
    final theme = Theme.of(context);
    // Mocked devices
    final devices = [
      {'name': 'Navegador Chrome - Desktop', 'location': 'São Paulo, Brasil - Sessão atual'},
      {'name': 'App Alugo - iPhone 15', 'location': 'Rio de Janeiro, Brasil - 2 dias atrás'},
    ];

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(LucideIcons.shieldCheck, color: theme.colorScheme.primary, size: 22),
                const SizedBox(width: 12),
                Text('Dispositivos Conectados', style: theme.textTheme.titleLarge),
              ],
            ),
            const SizedBox(height: 4),
            Text('Gerencie os dispositivos que têm acesso à sua conta.', style: theme.textTheme.bodyMedium),
            const SizedBox(height: 16),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: devices.length,
              itemBuilder: (context, index) {
                final device = devices[index];
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(device['name']!.contains("App") ? LucideIcons.smartphone : LucideIcons.monitor, color: theme.colorScheme.onSurface.withOpacity(0.7)),
                  title: Text(device['name']!, style: theme.textTheme.titleMedium),
                  subtitle: Text(device['location']!, style: theme.textTheme.bodySmall),
                  trailing: TextButton(
                    child: Text('Desconectar', style: TextStyle(color: theme.colorScheme.error, fontSize: 12)),
                    onPressed: () { /* Disconnect action */ },
                  ),
                );
              },
              separatorBuilder: (context, index) => const Divider(),
            ),
             const SizedBox(height: 16),
            OutlinedButton(
              child: const Text('Desconectar de todos os outros dispositivos'),
              onPressed: () { /* Disconnect all action */ },
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 44), // Full width
              ),
            ),
          ],
        ),
      ),
    );
  }
}
