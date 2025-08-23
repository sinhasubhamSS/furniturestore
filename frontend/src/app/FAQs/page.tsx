"use client";

import React, { useState } from "react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function InteractiveFAQ() {
  const [currentView, setCurrentView] = useState<'categories' | 'questions' | 'answer'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<FAQItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqData: FAQItem[] = [
    // Products Category
    {
      id: 1,
      question: "What types of sofas do you have?",
      answer: "We offer 2-seater, 3-seater, L-shaped sectionals, and recliners. Available in premium fabric and genuine leather with multiple color options. All sofas come with 5-year structural warranty.",
      category: "Products"
    },
    {
      id: 2,
      question: "What materials are used in furniture?",
      answer: "Our furniture uses premium fabrics, high-density foam for comfort, seasoned hardwood frames for durability, and eco-friendly materials wherever possible. All materials are tested for quality and safety standards.",
      category: "Products"
    },
    // Orders Category
    {
      id: 3,
      question: "What is your delivery timeline?",
      answer: "Ready stock items are delivered within 7-15 working days. Custom-made furniture takes 21-30 working days. We provide regular updates via SMS and email throughout the process.",
      category: "Orders"
    },
    {
      id: 4,
      question: "Do you provide assembly service?",
      answer: "We provide free professional assembly service within Delhi NCR. For other cities, assembly charges range from ₹500-2000 depending on location and furniture complexity.",
      category: "Orders"
    },
    // Payment Category
    {
      id: 5,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, UPI payments, net banking, and EMI options (3-24 months). Cash on Delivery is available within 150km of our warehouse locations.",
      category: "Payment"
    },
    {
      id: 6,
      question: "Do you offer EMI options?",
      answer: "We offer 0% EMI facility for 3, 6, 9, 12, 18, and 24 months on purchases above ₹10,000. Available with all major banks and credit card companies.",
      category: "Payment"
    },
    // General Category
    {
      id: 7,
      question: "What is your return policy?",
      answer: "We offer 7-day return policy for manufacturing defects or damage during delivery. Exchange requests must be made within 24 hours of delivery. Custom-made items are not returnable unless damaged.",
      category: "General"
    },
    {
      id: 8,
      question: "How can I contact customer support?",
      answer: "Contact us via phone (1800-123-4567) from 9 AM to 8 PM, email (support@homedecor.com), or WhatsApp chat. We also have live chat support on our website during business hours.",
      category: "General"
    }
  ];

  const categories = [...new Set(faqData.map(item => item.category))];
  
  const categoryIcons = {
    "Products": "🛋️",
    "Orders": "📦", 
    "Payment": "💳",
    "General": "❓"
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentView('questions');
  };

  const handleQuestionSelect = (question: FAQItem) => {
    setSelectedQuestion(question);
    setCurrentView('answer');
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory('');
  };

  const handleBackToQuestions = () => {
    setCurrentView('questions');
    setSelectedQuestion(null);
  };

  const filteredQuestions = faqData.filter(item => 
    item.category === selectedCategory &&
    item.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            How can I help you?
          </h1>
          <p className="text-gray-600">
            Find answers to your questions about our furniture and services
          </p>
        </div>

        {/* Categories View */}
        {currentView === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-3">
                    {categoryIcons[category as keyof typeof categoryIcons]}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category}
                  </h3>
                </div>
                <p className="text-gray-600 mb-3">
                  {category === 'Products' && 'Sofas, beds, materials, warranty'}
                  {category === 'Orders' && 'Delivery, assembly, tracking, modifications'}
                  {category === 'Payment' && 'Payment methods, EMI, security'}
                  {category === 'General' && 'Returns, contact, showrooms, support'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 text-sm font-medium">
                    {faqData.filter(item => item.category === category).length} questions
                  </span>
                  <span className="text-gray-400">→</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Questions View */}
        {currentView === 'questions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToCategories}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <span className="mr-2">←</span> Back to Categories
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {categoryIcons[selectedCategory as keyof typeof categoryIcons]} {selectedCategory}
              </h2>
            </div>

            {/* Search within category */}
            <div className="mb-6">
              <input
                type="text"
                placeholder={`Search ${selectedCategory} questions...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3">
              {filteredQuestions.map(question => (
                <button
                  key={question.id}
                  onClick={() => handleQuestionSelect(question)}
                  className="w-full bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 flex-1">
                      {question.question}
                    </h3>
                    <span className="text-gray-400 ml-4">→</span>
                  </div>
                </button>
              ))}
            </div>

            {filteredQuestions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No questions found in this category.</p>
              </div>
            )}
          </div>
        )}

        {/* Answer View */}
        {currentView === 'answer' && selectedQuestion && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToQuestions}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <span className="mr-2">←</span> Back to {selectedCategory}
              </button>
              <button
                onClick={handleBackToCategories}
                className="text-gray-600 hover:text-gray-700"
              >
                All Categories
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-3">
                  {selectedQuestion.category}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedQuestion.question}
                </h2>
              </div>
              
              <div className="prose prose-lg text-gray-700">
                <p>{selectedQuestion.answer}</p>
              </div>

              {/* Related Actions */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Need more help?</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => window.location.href = '/support/create-ticket'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Raise a Ticket
                  </button>
                  <button 
                    onClick={() => window.open('https://wa.me/8340100000', '_blank')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    WhatsApp Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
