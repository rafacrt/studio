import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart'; // For saving theme/language
import 'package:alugo/utils/colors.dart'; // For accent color

class AccountSettingsScreen extends StatefulWidget {
  const AccountSettingsScreen({super.key});

  @override
  State<AccountSettingsScreen> createState() => _AccountSettingsScreenState();
}

class _AccountSettingsScreenState extends State<AccountSettingsScreen> {
  bool _darkMode = false;
  String _language = "pt-br"; // Default language
  bool _emailNotifications = true;
  bool _pushNotifications = true;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _darkMode = prefs.getBool('darkMode') ?? (MediaQuery.of(context).platformBrightness == Brightness.dark);
      _language = prefs.getString('language') ?? 'pt-br';
      _emailNotifications = prefs.getBool('emailNotifications') ?? true;
      _pushNotifications = prefs.getBool('pushNotifications') ?? true;
    });
    // Note: Applying dark mode dynamically to the whole app is more complex
    // and usually handled by a ThemeProvider at the root.
    // Here, we're just managing the state of the switch.
  }

  Future<void> _setDarkMode(bool value) async {
    setState(() { _darkMode = value; });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('darkMode', value);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Modo ${value ? "Escuro" : "Claro"} ${value ? "Ativado" : "Desativado"}. A interface será atualizada globalmente (simulação).')),
    );
    // TODO: Integrate with a global theme provider to change app theme
  }

  Future<void> _setLanguage(String? value) async {
    if (value == null) return;
    setState(() { _language = value; });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language', value);
     ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Idioma definido para ${value == 'pt-br' ? 'Português (Brasil)' : 'Inglês'}.')),
    );
    // TODO: Integrate with localization solution
  }

  Future<void> _setEmailNotifications(bool value) async {
    setState(() { _emailNotifications = value; });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('emailNotifications', value);
  }

  Future<void> _setPushNotifications(bool value) async {
    setState(() { _pushNotifications = value; });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('pushNotifications', value);
  }
  
  void _handleSaveChanges() {
    // All preferences are saved individually on change, so this might just be for confirmation.
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Configurações salvas com sucesso!'),
        backgroundColor: Theme.of(context).colorScheme.tertiary,
      ),
    );
  }
  
  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Excluir Conta'),
          content: const Text('Tem certeza de que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.'),
          actions: <Widget>[
            TextButton(
              child: const Text('Cancelar'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: Text('Excluir', style: TextStyle(color: Theme.of(context).colorScheme.error)),
              onPressed: () {
                // TODO: Implement delete account logic
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Funcionalidade de exclusão de conta ainda não implementada.'),
                    backgroundColor: Theme.of(context).colorScheme.error,
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }


  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Configurações da Conta'),
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
            _buildSectionCard(
              context,
              title: 'Aparência',
              icon: LucideIcons.palette,
              children: [
                SwitchListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  secondary: Icon(_darkMode ? LucideIcons.moon : LucideIcons.sun, color: _darkMode ? Colors.yellow.shade600 : Colors.orange.shade600),
                  title: const Text('Modo Escuro'),
                  value: _darkMode,
                  onChanged: _setDarkMode,
                  activeColor: kLightAccent,
                ),
                const Divider(height: 1),
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  leading: Icon(LucideIcons.languages, color: theme.colorScheme.onSurface.withOpacity(0.7)),
                  title: const Text('Idioma'),
                  trailing: DropdownButton<String>(
                    value: _language,
                    underline: SizedBox(), // Hides default underline
                    items: const [
                      DropdownMenuItem(value: 'pt-br', child: Text('Português (Brasil)')),
                      DropdownMenuItem(value: 'en-us', child: Text('Inglês (EUA)')),
                    ],
                    onChanged: _setLanguage,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
             _buildSectionCard(
              context,
              title: 'Notificações',
              icon: LucideIcons.bell,
              children: [
                SwitchListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  title: const Text('Notificações por E-mail'),
                  value: _emailNotifications,
                  onChanged: _setEmailNotifications,
                   activeColor: kLightAccent,
                ),
                const Divider(height: 1),
                SwitchListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  title: const Text('Notificações Push'),
                  value: _pushNotifications,
                  onChanged: _setPushNotifications,
                   activeColor: kLightAccent,
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildSectionCard(
              context,
              title: 'Zona de Perigo',
              icon: LucideIcons.alertTriangle, // Changed from Trash2 to AlertTriangle
              iconColor: theme.colorScheme.error, // Make icon red
              children: [
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                  leading: Icon(LucideIcons.trash2, color: theme.colorScheme.error),
                  title: Text('Excluir Minha Conta', style: TextStyle(color: theme.colorScheme.error)),
                  onTap: _showDeleteAccountDialog,
                  subtitle: const Text('Esta ação é permanente e não pode ser desfeita.', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
             const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _handleSaveChanges,
              child: const Text('Salvar Alterações'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionCard(BuildContext context, {
    required String title,
    required IconData icon,
    Color? iconColor,
    required List<Widget> children,
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
                Icon(icon, color: iconColor ?? theme.colorScheme.primary, size: 22),
                const SizedBox(width: 12),
                Text(title, style: theme.textTheme.titleLarge),
              ],
            ),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }
}
