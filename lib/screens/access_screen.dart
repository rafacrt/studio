import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // For HapticFeedback
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:alugo/utils/colors.dart'; // Assuming colors are defined here

enum AccessStatus { idle, scanning, unlocking, unlocked, failed }

class AccessScreen extends StatefulWidget {
  final String listingId;

  const AccessScreen({super.key, required this.listingId});

  @override
  State<AccessScreen> createState() => _AccessScreenState();
}

class _AccessScreenState extends State<AccessScreen> with TickerProviderStateMixin {
  AccessStatus _status = AccessStatus.idle;
  int _countdown = 3;
  Timer? _timer;
  AnimationController? _scanAnimationController;
  AnimationController? _unlockAnimationController;

  @override
  void initState() {
    super.initState();
    _scanAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);

    _unlockAnimationController = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 300));
    
    if (widget.listingId.isEmpty) {
      // Using WidgetsBinding to show SnackBar after build
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Nenhum quarto especificado para acesso."),
            backgroundColor: Colors.red,
          ),
        );
        setState(() {
          _status = AccessStatus.failed;
        });
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _scanAnimationController?.dispose();
    _unlockAnimationController?.dispose();
    super.dispose();
  }

  void _triggerHapticFeedback([HapticFeedbackType type = HapticFeedbackType.light]) {
    switch(type) {
      case HapticFeedbackType.light:
        HapticFeedback.lightImpact();
        break;
      case HapticFeedbackType.medium:
        HapticFeedback.mediumImpact();
        break;
      case HapticFeedbackType.heavy:
        HapticFeedback.heavyImpact();
        break;
      case HapticFeedbackType.selection:
        HapticFeedback.selectionClick();
        break;
    }
  }
  
  enum HapticFeedbackType { light, medium, heavy, selection }

  void _handleAccessAttempt() {
    if (widget.listingId.isEmpty) {
       ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Não é possível iniciar o acesso sem um ID de quarto."),
            backgroundColor: Colors.red,
          ),
        );
      return;
    }
    _triggerHapticFeedback(HapticFeedbackType.medium);
    setState(() {
      _status = AccessStatus.scanning;
    });

    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      setState(() {
        _status = AccessStatus.unlocking;
        _countdown = 3;
      });
      _startCountdown();
    });
  }

  void _startCountdown() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_countdown > 1) {
        setState(() {
          _countdown--;
        });
      } else {
        timer.cancel();
        setState(() {
          _status = AccessStatus.unlocked;
        });
        _triggerHapticFeedback(HapticFeedbackType.heavy);
        _unlockAnimationController?.forward(from:0.0);
      }
    });
  }

  Widget _getIcon() {
    switch (_status) {
      case AccessStatus.idle:
        return const Icon(LucideIcons.keyRound, size: 64, color: kLightPrimary);
      case AccessStatus.scanning:
        return AnimatedBuilder(
          animation: _scanAnimationController!,
          builder: (context, child) {
            return Opacity(
              opacity: _scanAnimationController!.value * 0.5 + 0.5, // 0.5 to 1.0 opacity
              child: const Icon(LucideIcons.scanLine, size: 64, color: kLightPrimary),
            );
          },
        );
      case AccessStatus.unlocking:
        return RotationTransition(
          turns: Tween(begin: 0.0, end: 1.0).animate(_scanAnimationController!), // Re-use for spin
          child: const Icon(LucideIcons.loader2, size: 64, color: kLightPrimary),
        );
      case AccessStatus.unlocked:
        return ScaleTransition(
          scale: Tween<double>(begin: 0.5, end: 1.0).animate(
            CurvedAnimation(parent: _unlockAnimationController!, curve: Curves.elasticOut)
          ),
          child: const Icon(LucideIcons.lockOpen, size: 64, color: kLightAccent)
        );
      case AccessStatus.failed:
        return const Icon(LucideIcons.xCircle, size: 64, color: kLightDestructive);
    }
  }

  String _getMainText() {
    switch (_status) {
      case AccessStatus.idle:
        return 'Pronto para Desbloquear';
      case AccessStatus.scanning:
        return 'Escaneando...';
      case AccessStatus.unlocking:
        return 'Desbloqueando... $_countdown';
      case AccessStatus.unlocked:
        return 'Porta Desbloqueada!';
      case AccessStatus.failed:
        return 'Falha no Acesso';
    }
  }
  
  String _getDescriptionText() {
     switch (_status) {
      case AccessStatus.idle:
        return 'Pressione o botão abaixo para simular o desbloqueio da porta para sua reserva${widget.listingId.isNotEmpty ? ' no quarto ${widget.listingId}' : ''}.';
      case AccessStatus.scanning:
        return 'Mantenha seu dispositivo próximo à porta. Estamos tentando conectar com segurança.';
      case AccessStatus.unlocking:
        return 'Conexão estabelecida. Verificando acesso e desbloqueando a porta.';
      case AccessStatus.unlocked:
        return 'Bem-vindo(a)! A porta está agora desbloqueada. Por favor, entre.';
      case AccessStatus.failed:
        return 'Não foi possível completar a solicitação de acesso. Verifique sua conexão ou detalhes da reserva e tente novamente.';
    }
  }

  Color _getButtonColor() {
    final theme = Theme.of(context);
    switch (_status) {
      case AccessStatus.idle:
        return theme.colorScheme.primary;
      case AccessStatus.scanning:
        return Colors.blue.shade500; // Specific color
      case AccessStatus.unlocking:
        return Colors.yellow.shade600; // Specific color
      case AccessStatus.unlocked:
        return theme.colorScheme.tertiary; // Accent green
      case AccessStatus.failed:
        return theme.colorScheme.error;
    }
  }

  IconData _getButtonIcon() {
     switch (_status) {
      case AccessStatus.idle:
        return LucideIcons.keyRound;
      case AccessStatus.scanning:
        return LucideIcons.scanLine;
      case AccessStatus.unlocking:
        return LucideIcons.loader2;
      case AccessStatus.unlocked:
        return LucideIcons.lockOpen;
      case AccessStatus.failed:
        return LucideIcons.refreshCw; // Changed to refresh for retry
    }
  }


  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    bool buttonDisabled = _status == AccessStatus.scanning || _status == AccessStatus.unlocking || _status == AccessStatus.unlocked || (widget.listingId.isEmpty && _status != AccessStatus.failed);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Acesso ao Quarto'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              SizedBox(height: 80, width: 80, child: _getIcon()),
              const SizedBox(height: 32),
              Text(
                _getMainText(),
                style: theme.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                _getDescriptionText(),
                style: theme.textTheme.bodyLarge?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.7)),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              ElevatedButton(
                onPressed: buttonDisabled ? null : _handleAccessAttempt,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _getButtonColor(),
                  foregroundColor: Colors.white, // Assuming white text for these button colors
                  shape: const CircleBorder(),
                  padding: const EdgeInsets.all(24), // Makes it larger
                  fixedSize: const Size(96, 96), // Ensure it's circular
                ),
                child: Icon(_getButtonIcon(), size: 36),
              ),
              if (widget.listingId.isNotEmpty && _status != AccessStatus.failed)
                Padding(
                  padding: const EdgeInsets.only(top: 24.0),
                  child: Text(
                    'Acessando Quarto ID: ${widget.listingId}',
                     style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.5)),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
