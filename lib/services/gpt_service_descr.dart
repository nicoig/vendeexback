import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class GPTServiceDescr {
  static final String _baseUrl = dotenv.env['NETLIFY_BACKEND_URL'] ?? 'https://your-netlify-app.netlify.app';

  static Future<String> analyzeImages(List<String> base64Images, String additionalInfo, String socialMedia) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/analyze'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'images': base64Images,
          'additionalInfo': additionalInfo,
          'socialMedia': socialMedia,
        }),
      );

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(utf8.decode(response.bodyBytes));
        return jsonResponse['analysis'] ?? 'No content found';
      } else {
        throw Exception('Failed to analyze images: ${response.body}');
      }
    } catch (e) {
      print('Error in analyzeImages: $e');
      return 'Error al analizar las imágenes: $e';
    }
  }
}