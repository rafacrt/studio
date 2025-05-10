import 'package:flutter/material.dart';
import 'package:lucide_flutter/lucide_flutter.dart';

class FAQItem {
  final String question;
  final String answer;

  FAQItem({required this.question, required this.answer});
}

final List<FAQItem> faqItems = [
  FAQItem(
    question: "Como funciona o processo de aluguel de um quarto?",
    answer: "Para alugar um quarto, navegue pela seção 'Explorar', encontre um quarto que goste, verifique os detalhes e clique em 'Alugar Quarto'. Você precisará estar logado. O processo é simplificado para universitários.",
  ),
  FAQItem(
    question: "Quais são os métodos de pagamento aceitos?",
    answer: "Aceitamos cartões de crédito (Visa, MasterCard, Amex) e débito. Você pode gerenciar seus métodos de pagamento na seção 'Perfil > Pagamentos'.",
  ),
  FAQItem(
    question: "Como entro em contato com o suporte?",
    answer: "Você pode nos contatar através do formulário nesta página, pelo chat online (clicando no ícone de chat) ou pelo telefone listado na seção 'Fale Conosco'.",
  ),
  FAQItem(
    question: "Posso cancelar uma reserva?",
    answer: "Sim, a política de cancelamento varia de acordo com o anúncio. Verifique os termos específicos no momento da reserva. Geralmente, cancelamentos com antecedência são mais flexíveis.",
  ),
  FAQItem(
    question: "Como funciona o acesso ao quarto alugado?",
    answer: "Após a confirmação do aluguel, você poderá acessar o quarto digitalmente através do nosso aplicativo. Na seção 'Minhas Reservas', para reservas ativas, haverá um botão 'Acessar Quarto' que simula o destrancamento da porta.",
  ),
];

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  final _searchController = TextEditingController();
  final _emailController = TextEditingController();
  final _messageController = TextEditingController();

  List<FAQItem> _filteredFaqItems = faqItems;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_filterFAQs);
  }

  void _filterFAQs() {
    final query = _searchController.text.toLowerCase();
    if (query.isEmpty) {
      setState(() {
        _filteredFaqItems = faqItems;
      });
    } else {
      setState(() {
        _filteredFaqItems = faqItems.where((item) {
          return item.question.toLowerCase().contains(query) || item.answer.toLowerCase().contains(query);
        }).toList();
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _emailController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Central de Ajuda'),
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
            _buildSearchCard(context),
            const SizedBox(height: 24),
            _buildFAQSection(context),
            const SizedBox(height: 24),
            _buildContactUsSection(context),
            const SizedBox(height: 24),
            Text(
              'Horário de atendimento do suporte: Segunda a Sexta, das 9h às 18h.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.6)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchCard(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Como podemos ajudar?', style: theme.textTheme.titleLarge),
            const SizedBox(height: 4),
            Text('Procure por tópicos ou navegue pelas perguntas frequentes.', style: theme.textTheme.bodyMedium),
            const SizedBox(height: 16),
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Digite sua dúvida aqui...',
                prefixIcon: const Icon(LucideIcons.search, size: 20),
                filled: true,
                fillColor: theme.colorScheme.surfaceVariant.withOpacity(0.5),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10.0),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFAQSection(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16.0), // Horizontal padding handled by ExpansionTile
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text('Perguntas Frequentes (FAQ)', style: theme.textTheme.titleLarge),
            ),
            const SizedBox(height: 8),
            if (_filteredFaqItems.isEmpty)
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Center(child: Text('Nenhuma pergunta encontrada.')),
              )
            else
              Theme( // Override ExpansionTile default divider color
                data: theme.copyWith(dividerColor: Colors.transparent),
                child: Column(
                  children: _filteredFaqItems.map((item) {
                    return ExpansionTile(
                      tilePadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
                      childrenPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0).copyWith(top:0),
                      title: Text(item.question, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w500)),
                      children: <Widget>[
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Text(item.answer, style: theme.textTheme.bodyMedium)
                        ),
                      ],
                    );
                  }).toList(),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactUsSection(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Fale Conosco', style: theme.textTheme.titleLarge),
            const SizedBox(height: 4),
            Text('Não encontrou o que precisava? Entre em contato.', style: theme.textTheme.bodyMedium),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(LucideIcons.messageSquare, size: 18),
                    label: const Text('Chat Online'),
                    onPressed: () { /* Chat action */ },
                    style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 12)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(LucideIcons.phone, size: 18),
                    label: const Text('Ligar'),
                    onPressed: () { /* Call action */ },
                     style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 12)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Center(child: Text('Ou envie-nos uma mensagem:', style: theme.textTheme.bodyMedium)),
            const SizedBox(height: 12),
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(hintText: 'Seu endereço de e-mail'),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _messageController,
              decoration: const InputDecoration(hintText: 'Descreva seu problema ou dúvida...'),
              maxLines: 4,
              keyboardType: TextInputType.multiline,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              child: const Text('Enviar Mensagem'),
              onPressed: () { /* Send message action */ },
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 44), // Full width
              ),
            ),
          ],
        ),
      ),
    );
  }
}
