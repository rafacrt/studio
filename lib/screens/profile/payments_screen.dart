import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:intl/intl.dart';

// Mock data (replace with actual data fetching)
class PaymentMethod {
  final String id;
  final String type;
  final String details;
  final String expiry;
  final bool isDefault;

  PaymentMethod({
    required this.id,
    required this.type,
    required this.details,
    required this.expiry,
    this.isDefault = false,
  });
}

class PaymentHistoryItem {
  final String id;
  final DateTime date;
  final String description;
  final double amount;
  final String status; // e.g., "Pago", "Pendente"

  PaymentHistoryItem({
    required this.id,
    required this.date,
    required this.description,
    required this.amount,
    required this.status,
  });
}

final List<PaymentMethod> _mockPaymentMethods = [
  PaymentMethod(id: "pm1", type: "Cartão de Crédito", details: "**** **** **** 1234", expiry: "12/25", isDefault: true),
  PaymentMethod(id: "pm2", type: "Cartão de Débito", details: "**** **** **** 5678", expiry: "08/26"),
];

final List<PaymentHistoryItem> _mockPaymentHistory = [
  PaymentHistoryItem(id: "ph1", date: DateTime(2024, 7, 15), description: "Aluguel - Quarto Próximo USP", amount: 950.00, status: "Pago"),
  PaymentHistoryItem(id: "ph2", date: DateTime(2024, 6, 15), description: "Aluguel - Quarto Próximo USP", amount: 950.00, status: "Pago"),
  PaymentHistoryItem(id: "ph3", date: DateTime(2024, 6, 1), description: "Taxa de Serviço", amount: 50.00, status: "Pago"),
];


class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key});

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  // In a real app, these would be fetched from a service
  List<PaymentMethod> _paymentMethods = _mockPaymentMethods;
  List<PaymentHistoryItem> _paymentHistory = _mockPaymentHistory;

  final DateFormat _dateFormatter = DateFormat('dd/MM/yyyy', 'pt_BR');
  final NumberFormat _currencyFormatter = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$', decimalDigits: 2);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pagamentos'),
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
            _buildPaymentMethodsSection(context),
            const SizedBox(height: 24),
            _buildPaymentHistorySection(context),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodsSection(BuildContext context) {
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
                Icon(LucideIcons.creditCard, color: theme.colorScheme.primary, size: 22),
                const SizedBox(width: 12),
                Text('Métodos de Pagamento', style: theme.textTheme.titleLarge),
              ],
            ),
            const SizedBox(height: 4),
            Text('Gerencie seus cartões e outras formas de pagamento.', style: theme.textTheme.bodyMedium),
            const SizedBox(height: 16),
            if (_paymentMethods.isEmpty)
              const Center(child: Padding(padding: EdgeInsets.symmetric(vertical: 16.0), child: Text('Nenhum método de pagamento adicionado.')))
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _paymentMethods.length,
                itemBuilder: (context, index) {
                  final method = _paymentMethods[index];
                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(
                      method.type.contains("Crédito") ? LucideIcons.creditCard : LucideIcons.banknote,
                      color: theme.colorScheme.onSurface.withOpacity(0.7),
                    ),
                    title: Text(method.type + (method.isDefault ? ' (Padrão)' : ''), style: theme.textTheme.titleMedium),
                    subtitle: Text('${method.details} - Expira em: ${method.expiry}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(icon: const Icon(LucideIcons.edit2, size: 20), onPressed: () { /* Edit action */ }),
                        if (!method.isDefault)
                          IconButton(icon: Icon(LucideIcons.trash2, size: 20, color: theme.colorScheme.error), onPressed: () { /* Delete action */ }),
                      ],
                    ),
                  );
                },
                separatorBuilder: (context, index) => const Divider(),
              ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              icon: const Icon(LucideIcons.plusCircle, size: 18),
              label: const Text('Adicionar Novo Método de Pagamento'),
              onPressed: () { /* Add new method action */ },
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 44), // Full width
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentHistorySection(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Histórico de Transações', style: theme.textTheme.titleLarge),
            const SizedBox(height: 4),
            Text('Veja seus pagamentos e recibos anteriores.', style: theme.textTheme.bodyMedium),
            const SizedBox(height: 16),
            if (_paymentHistory.isEmpty)
              const Center(child: Padding(padding: EdgeInsets.symmetric(vertical: 16.0), child: Text('Nenhuma transação encontrada.')))
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _paymentHistory.length,
                itemBuilder: (context, index) {
                  final item = _paymentHistory[index];
                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(item.description, style: theme.textTheme.titleMedium),
                    subtitle: Text(_dateFormatter.format(item.date)),
                    trailing: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(_currencyFormatter.format(item.amount), style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
                        Text(
                          item.status,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: item.status == 'Pago' ? Colors.green.shade700 : Colors.orange.shade700,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  );
                },
                separatorBuilder: (context, index) => const Divider(),
              ),
            if (_paymentHistory.isNotEmpty) ...[
              const SizedBox(height: 16),
              TextButton(
                child: const Text('Ver todas as transações'),
                onPressed: () { /* View all transactions */ },
              ),
            ]
          ],
        ),
      ),
    );
  }
}
