import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuthStore } from '../../store/authStore';
import authService from '../../services/authService';
import OTPVerification from '../../components/Forms/OTPVerification';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Phone, 
  Building,
  Users,
  Shield,
  FileText,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const schema = yup.object({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  mobile: yup.string().matches(/^[6-9]\d{9}$/, 'Invalid mobile number').required('Mobile number is required'),
  userType: yup.string().required('Please select your user type'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
  agreeToTerms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
}).required();

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState('');
  const [showUserTypeDetails, setShowUserTypeDetails] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    resolver: yupResolver(schema),
  });

  const userTypes = [
    {
      id: 'user',
      title: 'Individual Taxpayer',
      description: 'Personal income tax filing',
      icon: User,
      features: ['ITR-1, ITR-2, ITR-3, ITR-4', 'Self-filing available', 'Salary, Business, Capital gains'],
      color: 'blue'
    },
    {
      id: 'huf',
      title: 'Hindu Undivided Family',
      description: 'HUF tax filing',
      icon: Users,
      features: ['ITR-1, ITR-2', 'HUF-specific fields', 'Member management'],
      color: 'green'
    },
    {
      id: 'nri',
      title: 'Non-Resident Indian',
      description: 'NRI tax filing',
      icon: User,
      features: ['ITR-2, ITR-3', 'NRI-specific schedules', 'Foreign income handling'],
      color: 'purple'
    },
    {
      id: 'entity',
      title: 'Generic Entity',
      description: 'Business entity filing',
      icon: Building,
      features: ['ITR-5, ITR-6, ITR-7', 'CA assistance required', 'Partner/Director management'],
      color: 'orange'
    },
    {
      id: 'partnership',
      title: 'Partnership Firm/LLP',
      description: 'Partnership tax filing',
      icon: Building,
      features: ['ITR-5', 'Partner management', 'CA assistance required'],
      color: 'red'
    },
    {
      id: 'company',
      title: 'Corporate Entity',
      description: 'Corporate tax filing',
      icon: Building,
      features: ['ITR-6', 'Director management', 'CA assistance required'],
      color: 'indigo'
    },
    {
      id: 'trust',
      title: 'Trust/Institution',
      description: 'Trust tax filing',
      icon: Shield,
      features: ['ITR-7', 'Trustee management', 'CA assistance required'],
      color: 'pink'
    },
    {
      id: 'CA',
      title: 'Chartered Accountant',
      description: 'Professional services',
      icon: FileText,
      features: ['All ITR Types', 'Client management', 'Professional tools'],
      color: 'teal'
    },
    {
      id: 'ca_firm_admin',
      title: 'CA Firm Administrator',
      description: 'Firm management',
      icon: Users,
      features: ['Staff management', 'Client portfolio', 'Firm analytics'],
      color: 'cyan'
    },
    {
      id: 'admin',
      title: 'Support/Help Desk',
      description: 'Platform support',
      icon: Shield,
      features: ['Ticket management', 'User support', 'System monitoring'],
      color: 'gray'
    }
  ];

  const handleUserTypeSelect = (userType) => {
    setSelectedUserType(userType.id);
    setValue('userType', userType.id);
    setShowUserTypeDetails(false);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Store registration data and send OTP
      setRegistrationData(data);
      
      // Send OTP to email
      await authService.sendOTP(data.email);
      
      // Show OTP verification screen
      setShowOTPVerification(true);
      
      toast.success('OTP sent to your email! Please check your inbox.');
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    setIsVerifyingOTP(true);
    try {
      // Verify OTP
      await authService.verifyOTP(registrationData.email, otp);
      
      // Complete registration with OTP
      await registerUser({
        ...registrationData,
        otp: otp
      });
      
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleOTPResend = async () => {
    try {
      await authService.sendOTP(registrationData.email);
      return Promise.resolve();
    } catch (error) {
      throw error;
    }
  };

  const handleBackToRegistration = () => {
    setShowOTPVerification(false);
    setRegistrationData(null);
  };

  const selectedType = userTypes.find(type => type.id === selectedUserType);

  // Show OTP verification screen
  if (showOTPVerification && registrationData) {
    return (
      <OTPVerification
        email={registrationData.email}
        onVerify={handleOTPVerify}
        onBack={handleBackToRegistration}
        onResend={handleOTPResend}
        isLoading={isVerifyingOTP}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <User className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Burnblack ITR filing platform
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your full name"
                      {...register('name')}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your email"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      autoComplete="tel"
                      required
                      className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your mobile number"
                      {...register('mobile')}
                    />
                  </div>
                  {errors.mobile && (
                    <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
                  )}
                </div>

              {/* PAN and Aadhaar fields removed - will be collected during ITR filing */}
              </div>
            </div>

            {/* User Type Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your User Type</h3>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserTypeDetails(!showUserTypeDetails)}
                  className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <div className="flex items-center">
                    {selectedType ? (
                      <>
                        <selectedType.icon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{selectedType.title}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Select your user type</span>
                    )}
                  </div>
                  {showUserTypeDetails ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {showUserTypeDetails && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {userTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleUserTypeSelect(type)}
                        className="w-full flex items-start p-4 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                      >
                        <div className={`p-2 rounded-lg mr-3 ${
                          type.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                          type.color === 'green' ? 'bg-green-50 text-green-600' :
                          type.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                          type.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                          type.color === 'red' ? 'bg-red-50 text-red-600' :
                          type.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                          type.color === 'pink' ? 'bg-pink-50 text-pink-600' :
                          type.color === 'teal' ? 'bg-teal-50 text-teal-600' :
                          type.color === 'cyan' ? 'bg-cyan-50 text-cyan-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          <type.icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900">{type.title}</h4>
                          <p className="text-sm text-gray-600">{type.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {type.features.map((feature, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.userType && (
                <p className="mt-1 text-sm text-red-600">{errors.userType.message}</p>
              )}
            </div>

            {/* Security */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your password"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Password Requirements */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    At least 8 characters long
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Contains uppercase letter
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Contains number
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Contains special character
                  </li>
                </ul>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...register('agreeToTerms')}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
