import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:alugo/providers/auth_provider.dart';
import 'package:alugo/models/user_model.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:image_picker/image_picker.dart'; // Needs image_picker in pubspec.yaml
import 'package:cached_network_image/cached_network_image.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;

  String? _avatarPreviewPath; // For local image file path
  String? _initialAvatarUrl; // To store initial network URL

  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final user = Provider.of<AuthProvider>(context, listen: false).user;
    _nameController = TextEditingController(text: user?.name ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _phoneController = TextEditingController(text: ''); // Assuming phone is not in current User model, add if needed
    _initialAvatarUrl = user?.avatarUrl;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      setState(() {
        _avatarPreviewPath = image.path;
      });
    }
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    _formKey.currentState!.save();
    setState(() { _isSubmitting = true; });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUser = authProvider.user;

    if (currentUser == null) {
       if(mounted) setState(() { _isSubmitting = false; });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erro: Usuário não encontrado.'), backgroundColor: Colors.red),
      );
      return;
    }

    // Simulate API call
    await Future.delayed(const Duration(seconds: 1));

    // In a real app, if email changes, you might need re-verification
    if (currentUser.email != _emailController.text) {
       ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Para alterar o e-mail, contate o suporte.')),
      );
    }

    // For this mock, we'll update the user in AuthProvider
    // A real app would send to backend and get updated user or token
    // If _avatarPreviewPath is set, it means user picked a new image.
    // Uploading image and getting URL is out of scope for this mock.
    // We'll just pretend it's updated or use the existing one.
    
    User updatedUser = currentUser.copyWith(
      name: _nameController.text,
      email: _emailController.text, // Or handle email change separately
      // avatarUrl: _avatarPreviewPath != null ? "new_uploaded_url_placeholder" : _initialAvatarUrl,
    );
    // For demo, if local image picked, don't change avatarURL, just show preview
    // In real app: upload _avatarPreviewPath, get new URL, set it in updatedUser.

    await authProvider.updateUser(updatedUser);

    if(mounted) {
      setState(() { _isSubmitting = false; });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Perfil atualizado com sucesso!'),
          backgroundColor: Theme.of(context).colorScheme.tertiary,
        ),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final user = Provider.of<AuthProvider>(context, listen: false).user;

    Widget avatarWidget;
    if (_avatarPreviewPath != null) {
      avatarWidget = CircleAvatar(
        radius: 60,
        backgroundImage: FileImage(File(_avatarPreviewPath!)),
      );
    } else if (_initialAvatarUrl != null && _initialAvatarUrl!.isNotEmpty) {
      avatarWidget = CircleAvatar(
        radius: 60,
        backgroundImage: CachedNetworkImageProvider(_initialAvatarUrl!),
      );
    } else {
      avatarWidget = CircleAvatar(
        radius: 60,
        backgroundColor: theme.colorScheme.secondaryContainer,
        child: Text(user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : 'A', style: const TextStyle(fontSize: 40)),
      );
    }


    return Scaffold(
      appBar: AppBar(
        title: const Text('Informações Pessoais'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Card(
          elevation: 2,
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  Center(
                    child: Stack(
                      children: [
                        avatarWidget,
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Material(
                            color: theme.colorScheme.primary,
                            borderRadius: BorderRadius.circular(20),
                            child: InkWell(
                              onTap: _pickImage,
                              borderRadius: BorderRadius.circular(20),
                              child: const Padding(
                                padding: EdgeInsets.all(8.0),
                                child: Icon(LucideIcons.camera, color: Colors.white, size: 20),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Divider(),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'Nome Completo',
                      prefixIcon: Icon(LucideIcons.user),
                    ),
                    validator: (value) {
                      if (value == null || value.trim().length < 3) {
                        return 'O nome deve ter pelo menos 3 caracteres.';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                      labelText: 'Endereço de E-mail',
                      prefixIcon: Icon(LucideIcons.mail),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || !value.contains('@')) {
                        return 'Endereço de e-mail inválido.';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _phoneController,
                    decoration: const InputDecoration(
                      labelText: 'Telefone (Opcional)',
                       prefixIcon: Icon(LucideIcons.phone),
                    ),
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(),
                        child: const Text('Cancelar'),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton.icon(
                        icon: _isSubmitting 
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Colors.white)))
                            : const Icon(LucideIcons.save, size: 18),
                        label: const Text('Salvar Alterações'),
                        onPressed: _isSubmitting ? null : _submitForm,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
