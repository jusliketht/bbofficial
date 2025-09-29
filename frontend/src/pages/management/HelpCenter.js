import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Calculator,
  Shield,
  Clock,
  ArrowRight,
  ChevronRight,
  Video,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  EnterpriseCard,
  EnterpriseButton,
  EnterpriseBadge,
  EnterpriseStatCard
} from '../../components/DesignSystem/EnterpriseComponents';

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showContactForm, setShowContactForm] = useState(false);

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'getting-started', name: 'Getting Started', icon: ArrowRight },
    { id: 'filing', name: 'ITR Filing', icon: FileText },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'payment', name: 'Payment', icon: Calculator },
    { id: 'account', name: 'Account', icon: Users },
    { id: 'technical', name: 'Technical Issues', icon: Shield }
  ];

  const helpArticles = [
    {
      id: 1,
      title: 'How to Start Your ITR Filing',
      category: 'getting-started',
      content: 'Learn how to begin your income tax return filing process step by step.',
      tags: ['beginner', 'filing', 'guide'],
      views: 1250,
      helpful: 89,
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      title: 'Which ITR Form Should I Use?',
      category: 'filing',
      content: 'Understand which ITR form is right for your income sources and situation.',
      tags: ['itr-1', 'itr-2', 'itr-3', 'itr-4'],
      views: 2100,
      helpful: 156,
      lastUpdated: '2024-01-20'
    },
    {
      id: 3,
      title: 'Required Documents for ITR Filing',
      category: 'documents',
      content: 'Complete list of documents you need to file your income tax return.',
      tags: ['form-16', 'bank-statements', 'documents'],
      views: 1800,
      helpful: 134,
      lastUpdated: '2024-01-18'
    },
    {
      id: 4,
      title: 'How to Upload Documents',
      category: 'documents',
      content: 'Step-by-step guide to uploading your tax documents securely.',
      tags: ['upload', 'pdf', 'security'],
      views: 950,
      helpful: 78,
      lastUpdated: '2024-01-12'
    },
    {
      id: 5,
      title: 'Payment Methods and Processing',
      category: 'payment',
      content: 'Learn about available payment options and processing times.',
      tags: ['payment', 'upi', 'netbanking', 'cards'],
      views: 1200,
      helpful: 92,
      lastUpdated: '2024-01-14'
    },
    {
      id: 6,
      title: 'Creating and Managing Your Account',
      category: 'account',
      content: 'How to create an account, update profile, and manage settings.',
      tags: ['account', 'profile', 'settings'],
      views: 800,
      helpful: 67,
      lastUpdated: '2024-01-10'
    },
    {
      id: 7,
      title: 'Troubleshooting Common Issues',
      category: 'technical',
      content: 'Solutions for common technical problems and error messages.',
      tags: ['errors', 'troubleshooting', 'support'],
      views: 1500,
      helpful: 112,
      lastUpdated: '2024-01-16'
    },
    {
      id: 8,
      title: 'Understanding Tax Calculations',
      category: 'filing',
      content: 'Learn how your tax liability is calculated and what affects it.',
      tags: ['tax-calculation', 'deductions', 'exemptions'],
      views: 1600,
      helpful: 125,
      lastUpdated: '2024-01-19'
    }
  ];

  const quickActions = [
    {
      title: 'Live Chat Support',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      color: 'bg-blue-500',
      action: () => navigate('/chat'),
      available: true
    },
    {
      title: 'Call Support',
      description: 'Speak directly with a tax expert',
      icon: Phone,
      color: 'bg-green-500',
      action: () => toast.success('Calling support...'),
      available: true
    },
    {
      title: 'Email Support',
      description: 'Send us your questions via email',
      icon: Mail,
      color: 'bg-purple-500',
      action: () => setShowContactForm(true),
      available: true
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: Video,
      color: 'bg-orange-500',
      action: () => navigate('/tutorials'),
      available: false
    }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleArticleClick = (articleId) => {
    navigate(`/help/article/${articleId}`);
  };

  const handleContactSupport = () => {
    navigate('/contact-support');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to your questions, get step-by-step guides, and connect with our support team.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles, guides, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div
                key={index}
                onClick={action.action}
                className={`${action.color} rounded-xl p-6 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden group ${
                  !action.available ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                  <IconComponent className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-4 flex items-center text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                  <span>{action.available ? 'Get Help' : 'Coming Soon'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
                {!action.available && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-white bg-opacity-20 text-xs rounded-full">Soon</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-3" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Help Articles */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedCategory === 'all' ? 'All Articles' : categories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {filteredArticles.length} articles
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredArticles.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search terms or browse different categories.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => handleArticleClick(article.id)}
                      className="px-6 py-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{article.content}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {article.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Updated {new Date(article.lastUpdated).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {article.views} views
                            </div>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {article.helpful} found helpful
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors ml-4 flex-shrink-0" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 overflow-hidden">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Still Need Help?</h3>
                  <p className="text-sm text-gray-600">Can't find what you're looking for? Our support team is here to help.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleContactSupport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => navigate('/ca-assistance')}
                  className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                  Get CA Help
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
              <p className="text-sm text-gray-600 mb-4">
                Send us your question and we'll get back to you within 24 hours.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your question or issue in detail..."
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowContactForm(false);
                    toast.success('Message sent! We\'ll get back to you soon.');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
