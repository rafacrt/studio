import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:alugo/providers/auth_provider.dart';
import 'package:alugo/models/user_model.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:alugo/screens/profile/edit_profile_screen.dart';
import 'package:alugo/screens/profile/settings_screen.dart';
import 'package:alugo/screens/profile/security_screen.dart';
import 'package:alugo/screens/profile/payments_screen.dart';
import 'package:alugo/screens/profile/notifications_screen.dart';
import 'package:alugo/screens/support_screen.dart';


class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final User? user = authProvider.user;

    if (user == null) {
      return const Scaffold(
        body: Center(child: Text('Usuário não encontrado.')),
      );
    }

    final List<ProfileMenuItem> menuOptions = [
      ProfileMenuItem(label: 'Informações Pessoais', icon: LucideIcons.edit3, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const EditProfileScreen()))),
      ProfileMenuItem(label: 'Configurações da Conta', icon: LucideIcons.settings, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AccountSettingsScreen()))),
      ProfileMenuItem(label: 'Login e Segurança', icon: LucideIcons.shield, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SecurityScreen()))),
      ProfileMenuItem(label: 'Pagamentos', icon: LucideIcons.creditCard, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentsScreen()))),
      ProfileMenuItem(label: 'Notificações', icon: LucideIcons.bell, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()))),
      ProfileMenuItem(label: 'Ajuda', icon: LucideIcons.helpCircle, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SupportScreen()))),
    ];


    return Scaffold(
      appBar: AppBar(
        title: const Text('Perfil'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            _buildProfileHeader(context, user),
            const SizedBox(height: 24),
            _buildMenuList(context, menuOptions),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              icon: const Icon(LucideIcons.logOut),
              label: const Text('Sair'),
              onPressed: () {
                // Implement haptic feedback if desired
                // HapticFeedback.mediumImpact();
                authProvider.logout();
                // Navigation will be handled by AuthProvider listener in main.dart
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.errorContainer,
                foregroundColor: Theme.of(context).colorScheme.onErrorContainer,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Versão 1.0.0 (Build 202407)', // Example version
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6)
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, User user) {
    return Card(
      elevation: 4,
      margin: const EdgeInsets.symmetric(horizontal: 8),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Row(
          children: [
            CircleAvatar(
              radius: 40,
              backgroundImage: CachedNetworkImageProvider(user.avatarUrl),
              backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
              child: user.avatarUrl.isEmpty 
                  ? Text(user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U', style: const TextStyle(fontSize: 30)) 
                  : null,
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user.name,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w600),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user.email,
                    style: Theme.of(context).textTheme.bodyMedium,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                     onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const EditProfileScreen())),
                    child: const Text('Editar perfil'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuList(BuildContext context, List<ProfileMenuItem> items) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          return ListTile(
            leading: Icon(item.icon, color: Theme.of(context).colorScheme.primary),
            title: Text(item.label, style: Theme.of(context).textTheme.titleMedium),
            trailing: const Icon(LucideIcons.chevronRight, size: 20),
            onTap: item.onTap,
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          );
        },
        separatorBuilder: (context, index) => const Divider(height: 0, indent: 20, endIndent: 20),
      ),
    );
  }
}

class ProfileMenuItem {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  ProfileMenuItem({required this.label, required this.icon, required this.onTap});
}
