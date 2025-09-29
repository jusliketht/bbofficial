import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, Plus, Search, Filter, MessageSquare, Paperclip, 
  Clock, User, AlertCircle, CheckCircle, X, Edit, Trash2,
  Star, Flag, Calendar, Tag, Send, Download, Upload,
  Eye, EyeOff, RefreshCw, Archive, Bell
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userDashboardService from '../services/userDashboardService';
import { EnterpriseButton, EnterpriseCard, EnterpriseAlert, EnterpriseInput } from './DesignSystem/EnterpriseComponents';
import { SmartTooltip, InlineHelp } from './DesignSystem/SmartTooltip';

/**
 * Service Ticket Integration System
 * 
 * Features:
 * - Create and manage support tickets
 * - Real-time ticket updates
 * - File attachments
 * - Priority management
 * - Status tracking
 * - Agent assignment
 * - Ticket categories
 * - Search and filtering
 * - Ticket history
 * - Rating system
 */

const ServiceTicketSystem = ({ userId, className = '' }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showResolved, setShowResolved] = useState(false);

  const queryClient = useQueryClient();

  // Fetch tickets
  const { data: ticketsData, isLoading: isLoadingTickets } = useQuery({
    queryKey: ['serviceTickets', userId, filterStatus, filterPriority, filterCategory, showResolved],
    queryFn: () => userDashboardService.serviceTicketsService.getServiceTickets({
      status: filterStatus !== 'all' ? filterStatus : undefined,
      priority: filterPriority !== 'all' ? filterPriority : undefined,
      category: filterCategory !== 'all' ? filterCategory : undefined,
      include_resolved: showResolved,
      search: searchTerm
    }),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Fetch ticket details
  const { data: ticketDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['ticketDetails', selectedTicket?.id],
    queryFn: () => userDashboardService.serviceTicketsService.getTicketDetails(selectedTicket.id),
    enabled: !!selectedTicket?.id,
    staleTime: 10 * 1000, // 10 seconds
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: (ticketData) => userDashboardService.serviceTicketsService.createTicket(ticketData),
    onSuccess: () => {
      queryClient.invalidateQueries(['serviceTickets', userId]);
      setIsCreatingTicket(false);
    }
  });

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }) => userDashboardService.serviceTicketsService.updateTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['serviceTickets', userId]);
      queryClient.invalidateQueries(['ticketDetails', selectedTicket?.id]);
    }
  });

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: ({ ticketId, message, attachments }) => 
      userDashboardService.serviceTicketsService.addMessage(ticketId, { message, attachments }),
    onSuccess: () => {
      queryClient.invalidateQueries(['ticketDetails', selectedTicket?.id]);
      setNewMessage('');
      setAttachments([]);
    }
  });

  // Rate ticket mutation
  const rateTicketMutation = useMutation({
    mutationFn: ({ ticketId, rating, feedback }) => 
      userDashboardService.serviceTicketsService.rateTicket(ticketId, { rating, feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries(['ticketDetails', selectedTicket?.id]);
    }
  });

  // Update tickets when data changes
  useEffect(() => {
    if (ticketsData?.data) {
      setTickets(ticketsData.data);
    }
  }, [ticketsData]);

  // Handle create ticket
  const handleCreateTicket = useCallback(async (ticketData) => {
    await createTicketMutation.mutateAsync({
      ...ticketData,
      user_id: userId
    });
  }, [userId, createTicketMutation]);

  // Handle add message
  const handleAddMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    await addMessageMutation.mutateAsync({
      ticketId: selectedTicket.id,
      message: newMessage,
      attachments: attachments
    });
  }, [newMessage, selectedTicket, attachments, addMessageMutation]);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
  }, []);

  // Handle remove attachment
  const handleRemoveAttachment = useCallback((index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
      case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <Flag className="w-4 h-4" />;
      case 'normal': return <Ticket className="w-4 h-4" />;
      case 'low': return <Ticket className="w-4 h-4" />;
      default: return <Ticket className="w-4 h-4" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (searchTerm && !ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [tickets, searchTerm]);

  // Get ticket statistics
  const ticketStats = useMemo(() => {
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length
    };
    return stats;
  }, [tickets]);

  // Ticket categories
  const ticketCategories = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'filing', label: 'Filing Help' },
    { value: 'billing', label: 'Billing & Payment' },
    { value: 'account', label: 'Account Management' },
    { value: 'general', label: 'General Inquiry' }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  if (isLoadingTickets) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Ticket className="w-6 h-6 mr-2 text-blue-600" />
            Service Tickets
          </h2>
          <p className="text-gray-600 mt-1">
            Get help with your ITR filing and account issues
          </p>
        </div>
        
        <EnterpriseButton
          onClick={() => setIsCreatingTicket(true)}
          variant="primary"
          size="md"
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </EnterpriseButton>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <EnterpriseCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{ticketStats.total}</p>
            </div>
            <Ticket className="w-8 h-8 text-blue-600" />
          </div>
        </EnterpriseCard>

        <EnterpriseCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open</p>
              <p className="text-2xl font-bold text-blue-600">{ticketStats.open}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
        </EnterpriseCard>

        <EnterpriseCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{ticketStats.in_progress}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </EnterpriseCard>

        <EnterpriseCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{ticketStats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </EnterpriseCard>

        <EnterpriseCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-red-600">{ticketStats.urgent}</p>
            </div>
            <Flag className="w-8 h-8 text-red-600" />
          </div>
        </EnterpriseCard>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <EnterpriseInput
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {ticketCategories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setShowResolved(!showResolved)}
            className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
              showResolved 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            {showResolved ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-3">
          {filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedTicket(ticket)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                selectedTicket?.id === ticket.id
                  ? 'bg-blue-50 border-blue-200 shadow-md'
                  : 'bg-white border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getPriorityIcon(ticket.priority)}
                  <h3 className="font-semibold text-gray-900 text-sm">
                    #{ticket.ticket_number}
                  </h3>
                </div>
                
                <div className="flex items-center space-x-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                {ticket.subject}
              </h4>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {ticket.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatTimeAgo(ticket.created_at)}</span>
                <span className="capitalize">{ticket.category}</span>
              </div>
            </motion.div>
          ))}
          
          {filteredTickets.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tickets Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No tickets match your search criteria.' : 'You haven\'t created any tickets yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <TicketDetails
              ticket={selectedTicket}
              ticketDetails={ticketDetails}
              isLoadingDetails={isLoadingDetails}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              attachments={attachments}
              onAddMessage={handleAddMessage}
              onFileUpload={handleFileUpload}
              onRemoveAttachment={handleRemoveAttachment}
              onRateTicket={rateTicketMutation.mutate}
              formatTimeAgo={formatTimeAgo}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Ticket</h3>
              <p className="text-gray-600">Choose a ticket from the list to view details and messages.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {isCreatingTicket && (
          <CreateTicketModal
            categories={ticketCategories}
            priorities={priorityOptions}
            onCreateTicket={handleCreateTicket}
            onClose={() => setIsCreatingTicket(false)}
            isLoading={createTicketMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* Error Alerts */}
      {createTicketMutation.isError && (
        <EnterpriseAlert
          type="error"
          title="Failed to Create Ticket"
          message="Unable to create ticket. Please try again."
          onClose={() => createTicketMutation.reset()}
        />
      )}
    </div>
  );
};

// Ticket Details Component
const TicketDetails = ({
  ticket,
  ticketDetails,
  isLoadingDetails,
  newMessage,
  setNewMessage,
  attachments,
  onAddMessage,
  onFileUpload,
  onRemoveAttachment,
  onRateTicket,
  formatTimeAgo
}) => {
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleRateTicket = () => {
    onRateTicket({
      ticketId: ticket.id,
      rating,
      feedback
    });
    setShowRating(false);
    setRating(0);
    setFeedback('');
  };

  return (
    <EnterpriseCard className="p-6">
      {/* Ticket Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            #{ticket.ticket_number} - {ticket.subject}
          </h3>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <span>Created {formatTimeAgo(ticket.created_at)}</span>
            <span>•</span>
            <span className="capitalize">{ticket.category}</span>
            <span>•</span>
            <span className="capitalize">{ticket.priority} priority</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {ticket.status === 'resolved' && !ticket.rating && (
            <EnterpriseButton
              onClick={() => setShowRating(true)}
              variant="secondary"
              size="sm"
            >
              <Star className="w-4 h-4 mr-1" />
              Rate
            </EnterpriseButton>
          )}
        </div>
      </div>

      {/* Ticket Description */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
          {ticket.description}
        </p>
      </div>

      {/* Messages */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Messages</h4>
        
        {isLoadingDetails ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {ticketDetails?.messages?.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  message.is_from_user 
                    ? 'bg-blue-50 ml-8' 
                    : 'bg-gray-50 mr-8'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium text-sm">
                      {message.is_from_user ? 'You' : message.agent_name || 'Support Agent'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(message.created_at)}
                  </span>
                </div>
                <p className="text-gray-700">{message.message}</p>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-blue-600">
                        <Paperclip className="w-3 h-3" />
                        <span>{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Message */}
      {ticket.status !== 'closed' && (
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Add Message</h4>
          
          <div className="space-y-4">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
            
            {/* File Attachments */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  multiple
                  onChange={onFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  <Paperclip className="w-4 h-4 inline mr-1" />
                  Attach Files
                </label>
              </div>
              
              {attachments.length > 0 && (
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        onClick={() => onRemoveAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <EnterpriseButton
              onClick={onAddMessage}
              variant="primary"
              size="sm"
              disabled={!newMessage.trim()}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </EnterpriseButton>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <AnimatePresence>
        {showRating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Experience</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5 stars)
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`w-8 h-8 ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <Star className="w-full h-full fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback (Optional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3">
                  <EnterpriseButton
                    onClick={() => setShowRating(false)}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </EnterpriseButton>
                  
                  <EnterpriseButton
                    onClick={handleRateTicket}
                    variant="primary"
                    size="sm"
                    disabled={rating === 0}
                  >
                    Submit Rating
                  </EnterpriseButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </EnterpriseCard>
  );
};

// Create Ticket Modal Component
const CreateTicketModal = ({ categories, priorities, onCreateTicket, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'normal'
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      await onCreateTicket(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Create New Ticket</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <EnterpriseInput
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              error={errors.subject}
              placeholder="Brief description of your issue"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-600 text-sm mt-1">{errors.category}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide detailed information about your issue..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={6}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <EnterpriseButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </EnterpriseButton>
            
            <EnterpriseButton
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Ticket className="w-4 h-4" />
              )}
              <span>Create Ticket</span>
            </EnterpriseButton>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ServiceTicketSystem;
