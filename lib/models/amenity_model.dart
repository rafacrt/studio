import 'package:flutter/material.dart';

class Amenity {
  final String id;
  final String name;
  final IconData iconData; // Changed from React.ElementType to IconData

  Amenity({
    required this.id,
    required this.name,
    required this.iconData,
  });
}
