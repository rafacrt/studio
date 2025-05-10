import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // For HapticFeedback

class BottomNavigationItem {
  final IconData icon;
  final String label;

  const BottomNavigationItem({required this.icon, required this.label});
}

class CustomBottomNavigationBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<BottomNavigationItem> items;

  const CustomBottomNavigationBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bottomNavTheme = theme.bottomNavigationBarTheme;

    return Container(
      decoration: BoxDecoration(
        color: bottomNavTheme.backgroundColor ?? theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
        border: Border(
          top: BorderSide(color: theme.dividerColor, width: 0.5),
        ),
      ),
      child: SafeArea( // Handles notch and bottom system areas
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: items.map((item) {
              int index = items.indexOf(item);
              bool isSelected = index == currentIndex;
              Color itemColor = isSelected 
                  ? bottomNavTheme.selectedItemColor ?? theme.colorScheme.primary
                  : bottomNavTheme.unselectedItemColor ?? theme.colorScheme.onSurface.withOpacity(0.6);

              return Expanded(
                child: InkWell(
                  onTap: () {
                    HapticFeedback.lightImpact(); // Trigger haptic feedback
                    onTap(index);
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        Icon(
                          item.icon,
                          size: 24.0,
                          color: itemColor,
                          semanticLabel: item.label,
                        ),
                        const SizedBox(height: 4.0),
                        Text(
                          item.label,
                          style: (isSelected 
                                  ? bottomNavTheme.selectedLabelStyle
                                  : bottomNavTheme.unselectedLabelStyle)
                                ?.copyWith(color: itemColor, fontSize: 11),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
