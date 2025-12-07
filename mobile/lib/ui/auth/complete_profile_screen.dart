import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_constants.dart';
import '../../data/models/user_model.dart';
import '../../data/services/api_service.dart';
import '../home/home_screen.dart';

class CompleteProfileScreen extends StatefulWidget {
  final ApiService apiService;
  final UserModel user;

  const CompleteProfileScreen({
    super.key,
    required this.apiService,
    required this.user,
  });

  @override
  State<CompleteProfileScreen> createState() => _CompleteProfileScreenState();
}

class _CompleteProfileScreenState extends State<CompleteProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  // Form Fields
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _identityController = TextEditingController();
  final TextEditingController _heightController = TextEditingController();
  final TextEditingController _weightController = TextEditingController();
  final TextEditingController _birthdayController = TextEditingController();

  String? _selectedGender;
  String? _selectedBloodType;
  DateTime? _selectedDate;

  final List<String> _genders = ['MALE', 'FEMALE'];
  final List<String> _bloodTypes = ['A', 'B', 'AB', 'O'];

  @override
  void dispose() {
    _phoneController.dispose();
    _addressController.dispose();
    _identityController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    _birthdayController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().subtract(const Duration(days: 365 * 20)),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
        _birthdayController.text = DateFormat('yyyy-MM-dd').format(picked);
      });
    }
  }

  Future<void> _submitProfile() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedGender == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select gender')),
      );
      return;
    }
    if (_selectedBloodType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select blood type')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final profileData = {
        'address': _addressController.text.trim(),
        'phone': _phoneController.text.trim(),
        'birthday': _birthdayController.text,
        'gender': _selectedGender,
        'identityNumber': _identityController.text.trim(),
        'bloodType': _selectedBloodType,
        'heightCm': double.tryParse(_heightController.text) ?? 0,
        'weightKg': double.tryParse(_weightController.text) ?? 0,
        'occupation': '',
        'lifestyleNotes': '',
        'insuranceNumber': '',
        'consentForAIAnalysis': false,
      };

      final updatedUser = await widget.apiService.completeProfile(profileData);

      if (!mounted) return;
      
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => HomeScreen(
            user: updatedUser,
            apiService: widget.apiService,
          ),
        ),
      );

    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Complete Your Profile'),
        backgroundColor: AppConstants.primaryColor,
        foregroundColor: Colors.white,
      ),
      body: Container(
         decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppConstants.backgroundLight, AppConstants.backgroundDark],
          ),
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildHeader(),
                const SizedBox(height: 20),
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        _buildSectionTitle('Personal Information'),
                        _buildTextField(
                          controller: _identityController,
                          label: 'Identity Number / ID Card',
                          icon: Icons.badge,
                          validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                        ),
                        _buildTextField(
                          controller: _phoneController,
                          label: 'Phone Number',
                          icon: Icons.phone,
                          keyboardType: TextInputType.phone,
                          validator: (v) => (v == null || v.length < 9) ? 'Invalid phone' : null,
                        ),
                        _buildTextField(
                          controller: _addressController,
                          label: 'Address',
                          icon: Icons.location_on,
                          validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                        ),
                        GestureDetector(
                          onTap: () => _selectDate(context),
                          child: AbsorbPointer(
                            child: _buildTextField(
                              controller: _birthdayController,
                              label: 'Birthday (YYYY-MM-DD)',
                              icon: Icons.calendar_today,
                              validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                            ),
                          ),
                        ),
                        DropdownButtonFormField<String>(
                          value: _selectedGender,
                          decoration: _inputDecoration('Gender', Icons.person),
                          items: _genders.map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(),
                          onChanged: (v) => setState(() => _selectedGender = v),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                   elevation: 4,
                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                   child: Padding(
                     padding: const EdgeInsets.all(16.0),
                     child: Column(
                       children: [
                         _buildSectionTitle('Health Metrics'),
                          DropdownButtonFormField<String>(
                            value: _selectedBloodType,
                            decoration: _inputDecoration('Blood Type', Icons.bloodtype),
                            items: _bloodTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                            onChanged: (v) => setState(() => _selectedBloodType = v),
                          ),
                          Row(
                            children: [
                              Expanded(
                                child: _buildTextField(
                                  controller: _heightController,
                                  label: 'Height (cm)',
                                  icon: Icons.height,
                                  keyboardType: TextInputType.number,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildTextField(
                                  controller: _weightController,
                                  label: 'Weight (kg)',
                                  icon: Icons.monitor_weight,
                                  keyboardType: TextInputType.number,
                                ),
                              ),
                            ],
                          ),
                       ],
                     ),
                   ),
                ),
                const SizedBox(height: 24),
                if (_isLoading)
                  const Center(child: CircularProgressIndicator())
                else
                  ElevatedButton(
                    onPressed: _submitProfile,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppConstants.primaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Complete Profile & Generate Identity', style: TextStyle(fontSize: 18)),
                  ),
                  const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        const Text(
          'Complete Your Health Profile',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppConstants.textPrimary),
        ),
        const SizedBox(height: 8),
        Text(
          'We need a few more details to set up your secure Digital Medicine Card and ensure accurate vaccination records.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppConstants.secondaryColor,
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
    int maxLines = 1,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextFormField(
        controller: controller,
        decoration: _inputDecoration(label, icon),
        keyboardType: keyboardType,
        validator: validator,
        maxLines: maxLines,
      ),
    );
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon, color: AppConstants.primaryColor),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey[300]!),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey[300]!),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppConstants.primaryColor, width: 2),
      ),
      filled: true,
      fillColor: Colors.white,
    );
  }
}
