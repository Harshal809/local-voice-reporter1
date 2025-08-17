import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Issue categories matching the original design
const issueCategories = [
  {
    id: "road",
    title: "Sadak ki Kharabi",
    icon: "🛣️",
    color: "bg-red-50 border-red-200"
  },
  {
    id: "lights",
    title: "Street Lights",
    icon: "💡",
    color: "bg-yellow-50 border-yellow-200"
  },
  {
    id: "cleanliness",
    title: "Safai Samasya",
    icon: "🗑️",
    color: "bg-green-50 border-green-200"
  },
  {
    id: "water",
    title: "Paani ki Samasya",
    icon: "💧",
    color: "bg-blue-50 border-blue-200"
  },
  {
    id: "electricity",
    title: "Electricity",
    icon: "⚡",
    color: "bg-purple-50 border-purple-200"
  },
  {
    id: "other",
    title: "Other Issues",
    icon: "📋",
    color: "bg-gray-50 border-gray-200"
  }
];

interface FormData {
  name: string;
  email: string;
  category: string;
  issueTitle: string;
  issueDescription: string;
  location: string;
  priority: string;
  file: File | null;
}

interface FormErrors {
  email?: string;
  category?: string;
  issueTitle?: string;
  issueDescription?: string;
  location?: string;
}

const ReportIssuePage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    category: '',
    issueTitle: '',
    issueDescription: '',
    location: '',
    priority: 'medium',
    file: null
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      file
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId
    }));
    
    if (errors.category) {
      setErrors(prev => ({
        ...prev,
        category: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email address zaroori hai';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email address daaliye';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Issue category select kariye';
    }

    // Issue title validation
    if (!formData.issueTitle.trim()) {
      newErrors.issueTitle = 'Issue title zaroori hai';
    } else if (formData.issueTitle.trim().length < 5) {
      newErrors.issueTitle = 'Issue title kam se kam 5 characters ka hona chahiye';
    }

    // Description validation
    if (!formData.issueDescription.trim()) {
      newErrors.issueDescription = 'Issue description zaroori hai';
    } else if (formData.issueDescription.trim().length < 20) {
      newErrors.issueDescription = 'Description kam se kam 20 characters ka hona chahiye';
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location zaroori hai';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          category: '',
          issueTitle: '',
          issueDescription: '',
          location: '',
          priority: 'medium',
          file: null
        });
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-white shadow-lg border-green-200">
              <CardContent className="p-12">
                <div className="text-6xl mb-6">✅</div>
                <h2 className="text-3xl font-bold text-green-600 mb-4">
                  Report Submit Ho Gaya!
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Aapki complaint successfully submit ho gayi hai. Hum jald hi action lenge aur aapko update denge.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-700">
                    <strong>Tracking ID:</strong> #CIV{Date.now().toString().slice(-6)}
                  </p>
                </div>
                <Button 
                  onClick={() => setSubmitSuccess(false)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Nayi Report Kariye
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
            Issue Report Kariye
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Apni samasya detail mein batayiye taki hum jaldi solution provide kar sake
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-800">
                  📋 Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Naam (Optional)
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Apna naam daaliye"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="example@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issue Category */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-800">
                  🗂️ Issue Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {issueCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`${category.color} p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
                        formData.category === category.id 
                          ? 'border-blue-500 bg-blue-100' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{category.icon}</div>
                        <h3 className="font-semibold text-gray-800">{category.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-2">{errors.category}</p>
                )}
              </CardContent>
            </Card>

            {/* Issue Details */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-800">
                  📝 Issue Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="issueTitle"
                    value={formData.issueTitle}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.issueTitle ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Issue ka short title daaliye"
                  />
                  {errors.issueTitle && (
                    <p className="text-red-500 text-sm mt-1">{errors.issueTitle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Area, landmark, ya exact address"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low - Jaldi nahi hai</option>
                    <option value="medium">Medium - Normal urgency</option>
                    <option value="high">High - Urgent hai</option>
                    <option value="critical">Critical - Turant action chahiye</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="issueDescription"
                    value={formData.issueDescription}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.issueDescription ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Issue ke baare mein detail mein bataiye - kya problem hai, kab se hai, kitna affect kar raha hai, etc."
                  />
                  {errors.issueDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.issueDescription}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Current: {formData.issueDescription.length} characters (minimum 20 required)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo/File Upload (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="text-4xl mb-2">📸</div>
                      <p className="text-gray-600">
                        {formData.file ? formData.file.name : 'Photo ya document upload kariye'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, PNG, PDF, DOC files supported
                      </p>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submit Ho Raha Hai...
                  </>
                ) : (
                  'Issue Report Kariye'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssuePage;