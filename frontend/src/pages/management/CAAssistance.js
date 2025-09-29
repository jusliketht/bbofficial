import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Phone,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  FileText,
  Calculator,
  Shield,
  Zap,
  Calendar,
  MapPin,
  Award,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  EnterpriseCard,
  EnterpriseButton,
  EnterpriseBadge,
  EnterpriseStatCard
} from '../../components/DesignSystem/EnterpriseComponents';

const CAAssistance = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Mock CA data - in real app, this would come from API
  const availableCAs = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      firm: 'Kumar & Associates',
      experience: '15+ years',
      rating: 4.9,
      reviews: 127,
      specialization: ['ITR Filing', 'Tax Planning', 'Business Returns'],
      languages: ['English', 'Hindi', 'Tamil'],
      location: 'Mumbai',
      availability: 'Available Now',
      price: '₹2,500',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      verified: true,
      responseTime: '< 2 hours'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      firm: 'Sharma Tax Solutions',
      experience: '12+ years',
      rating: 4.8,
      reviews: 89,
      specialization: ['Individual ITR', 'HUF Returns', 'NRI Filing'],
      languages: ['English', 'Hindi', 'Gujarati'],
      location: 'Delhi',
      availability: 'Available Tomorrow',
      price: '₹2,000',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      verified: true,
      responseTime: '< 4 hours'
    },
    {
      id: 3,
      name: 'Amit Patel',
      firm: 'Patel & Co.',
      experience: '18+ years',
      rating: 4.9,
      reviews: 203,
      specialization: ['Business Returns', 'Audit', 'Compliance'],
      languages: ['English', 'Hindi', 'Gujarati'],
      location: 'Ahmedabad',
      availability: 'Available Now',
      price: '₹3,000',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      verified: true,
      responseTime: '< 1 hour'
    }
  ];

  const assistanceTypes = [
    {
      id: 'consultation',
      title: 'Tax Consultation',
      description: 'Get expert advice on your tax situation',
      icon: MessageCircle,
      color: 'bg-blue-500',
      price: '₹1,500/hour',
      duration: '1 hour',
      features: ['Personalized advice', 'Tax optimization', 'Q&A session']
    },
    {
      id: 'filing',
      title: 'Complete Filing Service',
      description: 'Let CA handle your entire ITR filing',
      icon: FileText,
      color: 'bg-green-500',
      price: '₹2,500',
      duration: '2-3 days',
      features: ['Document review', 'Form preparation', 'E-filing', 'Acknowledgment']
    },
    {
      id: 'review',
      title: 'Filing Review',
      description: 'Get your self-filed return reviewed by expert',
      icon: CheckCircle,
      color: 'bg-purple-500',
      price: '₹1,000',
      duration: '1 day',
      features: ['Error checking', 'Optimization suggestions', 'Final review']
    },
    {
      id: 'planning',
      title: 'Tax Planning',
      description: 'Plan your taxes for next year',
      icon: Calculator,
      color: 'bg-orange-500',
      price: '₹2,000',
      duration: '2 hours',
      features: ['Future planning', 'Investment advice', 'Tax saving strategies']
    }
  ];

  const handleServiceSelection = (serviceId) => {
    setSelectedService(serviceId);
    toast.success('Service selected! Choose your CA to proceed.');
  };

  const handleCAContact = (caId, method) => {
    const ca = availableCAs.find(c => c.id === caId);
    if (method === 'chat') {
      setShowChatModal(true);
      toast.success(`Starting chat with ${ca.name}`);
    } else if (method === 'call') {
      toast.success(`Calling ${ca.name}...`);
    } else if (method === 'book') {
      setShowBookingModal(true);
      toast.success(`Booking consultation with ${ca.name}`);
    }
  };

  const handleQuickHelp = () => {
    navigate('/help-center');
  };

  const handleSelfFiling = () => {
    navigate('/itr-selection');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Get Professional CA Assistance
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with verified Chartered Accountants for expert tax filing assistance. 
            Get personalized help tailored to your needs.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={handleQuickHelp}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <HelpCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Help</h3>
                <p className="text-sm text-gray-600">Get instant answers</p>
              </div>
            </div>
            <div className="flex items-center text-blue-600 group-hover:text-blue-700">
              <span className="text-sm font-medium">Get Help Now</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>

          <div 
            onClick={handleSelfFiling}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Self Filing</h3>
                <p className="text-sm text-gray-600">File your own ITR</p>
              </div>
            </div>
            <div className="flex items-center text-green-600 group-hover:text-green-700">
              <span className="text-sm font-medium">Start Filing</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Verified CAs</h3>
                <p className="text-sm text-gray-600">All CAs are verified</p>
              </div>
            </div>
            <div className="flex items-center text-purple-600">
              <span className="text-sm font-medium">100% Trusted</span>
              <CheckCircle className="w-4 h-4 ml-2" />
            </div>
          </div>
        </div>

        {/* Service Types */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assistanceTypes.map((service) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelection(service.id)}
                  className={`${service.color} rounded-xl p-6 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden group ${
                    selectedService === service.id ? 'ring-4 ring-white ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="text-right">
                      <div className="text-lg font-bold">{service.price}</div>
                      <div className="text-sm opacity-80">{service.duration}</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm opacity-90 mb-4">{service.description}</p>
                  <div className="space-y-1">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm opacity-80">
                        <CheckCircle className="w-3 h-3 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available CAs */}
        {selectedService && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Chartered Accountants</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {availableCAs.map((ca) => (
                <div key={ca.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <img
                        src={ca.avatar}
                        alt={ca.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-900">{ca.name}</h3>
                          {ca.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{ca.firm}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900 ml-1">{ca.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({ca.reviews})</span>
                      </div>
                      <div className="text-sm text-gray-600">{ca.experience}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      {ca.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      {ca.availability}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Response time: {ca.responseTime}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Specialization</h4>
                    <div className="flex flex-wrap gap-2">
                      {ca.specialization.map((spec, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {ca.languages.map((lang, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-gray-900">{ca.price}</div>
                    <div className="text-sm text-gray-600">per service</div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCAContact(ca.id, 'chat')}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </button>
                    <button
                      onClick={() => handleCAContact(ca.id, 'call')}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </button>
                    <button
                      onClick={() => handleCAContact(ca.id, 'book')}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why Choose Our CAs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Our Chartered Accountants?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Professionals</h3>
              <p className="text-sm text-gray-600">All CAs are verified and have valid licenses</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Response</h3>
              <p className="text-sm text-gray-600">Get responses within 2-4 hours on average</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Confidential</h3>
              <p className="text-sm text-gray-600">Your financial data is completely secure</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Proven Track Record</h3>
              <p className="text-sm text-gray-600">Thousands of successful filings completed</p>
            </div>
          </div>
        </div>

        {/* Chat Modal */}
        {showChatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Start Chat</h3>
              <p className="text-sm text-gray-600 mb-4">
                You'll be connected to a CA for instant assistance. Chat is available 24/7.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowChatModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowChatModal(false);
                    navigate('/chat');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Consultation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Schedule a consultation with your chosen CA. You'll receive a confirmation email.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    navigate('/booking');
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CAAssistance;
