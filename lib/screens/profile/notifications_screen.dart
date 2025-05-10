import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:alugo/utils/colors.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  // Mock notification settings states
  Map<String, bool> _emailNotifications = {
    'newBookings': true,
    'bookingUpdates': true,
    'promotions': false,
    'platformUpdates': true,
  };

  Map<String, bool> _pushNotifications = {
    'newBookings': true,
    'messages': true,
    'reminders': true,
  };

  void _handleEmailToggle(String key) {
    setState(() {
      _emailNotifications[key] = !_emailNotifications[key]!;
    });
  }

  void _handlePushToggle(String key) {
    setState(() {
      _pushNotifications[key] = !_pushNotifications[key]!;
    });
  }

  void _handleSaveChanges() {
    // Simulate saving notification preferences
    print("Email Preferences: $_emailNotifications");
    print("Push Preferences: $_pushNotifications");
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Preferências salvas com sucesso!'),
        backgroundColor: Theme.of(context).colorScheme.tertiary, // Accent color
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificações'),
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
            _buildNotificationSection(
              context,
              title: 'Notificações por E-mail',
              description: 'Escolha quais e-mails você deseja receber.',
              icon: LucideIcons.mail,
              settings: _emailNotifications,
              onToggle: _handleEmailToggle,
              itemDetails: [
                {'key': 'newBookings', 'label': 'Novas Reservas e Solicitações', 'icon': LucideIcons.tag},
                {'key': 'bookingUpdates', 'label': 'Atualizações de Reservas', 'icon': LucideIcons.settings2},
                {'key': 'promotions', 'label': 'Promoções e Ofertas Especiais', 'icon': LucideIcons.megaphone}, // Used Megaphone as placeholder
                {'key': 'platformUpdates', 'label': 'Atualizações da Plataforma e Notícias', 'icon': LucideIcons.newspaper}, // Used Newspaper
              ],
            ),
            const SizedBox(height: 24),
            _buildNotificationSection(
              context,
              title: 'Notificações Push (App)',
              description: 'Gerencie as notificações que aparecem no seu dispositivo.',
              icon: LucideIcons.smartphone,
              settings: _pushNotifications,
              onToggle: _handlePushToggle,
              itemDetails: [
                {'key': 'newBookings', 'label': 'Novas Reservas e Solicitações', 'icon': LucideIcons.tag},
                {'key': 'messages', 'label': 'Novas Mensagens', 'icon': LucideIcons.messageSquare},
                {'key': 'reminders', 'label': 'Lembretes Importantes', 'icon': LucideIcons.bellRing}, // Used BellRing
              ],
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _handleSaveChanges,
              child: const Text('Salvar Preferências'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationSection(
    BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    required Map<String, bool> settings,
    required Function(String) onToggle,
    required List<Map<String, dynamic>> itemDetails,
  }) {
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
                Icon(icon, color: theme.colorScheme.primary, size: 22),
                const SizedBox(width: 12),
                Text(title, style: theme.textTheme.titleLarge),
              ],
            ),
            const SizedBox(height: 4),
            Text(description, style: theme.textTheme.bodyMedium),
            const SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: itemDetails.length,
              itemBuilder: (context, index) {
                final item = itemDetails[index];
                return SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  secondary: Icon(item['icon'] as IconData, color: theme.colorScheme.onSurface.withOpacity(0.7)),
                  title: Text(item['label'] as String, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.normal)),
                  value: settings[item['key'] as String]!,
                  onChanged: (bool value) {
                    onToggle(item['key'] as String);
                  },
                  activeColor: kLightAccent, // Use Accent color for switch
                );
              },
              separatorBuilder: (context, index) => const Divider(height: 1),
            ),
          ],
        ),
      ),
    );
  }
}
