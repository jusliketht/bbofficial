// Basic chatbot service for MVP
export const chatbotService = {
  // Predefined responses for MVP
  responses: {
    general: {
      greeting: "👋 Hi! I'm your tax filing assistant. How can I help you today?",
      help: "I can help you with PAN verification, ITR selection, document uploads, and general tax filing questions.",
      pan: "Your PAN (Permanent Account Number) is a 10-digit alphanumeric code in format AAAAA0000A.",
      itr: "ITR forms depend on your income type and amount. ITR-1 is for salaried individuals under ₹50 lakhs.",
      deadline: "The tax filing deadline is usually July 31st. File early to avoid rush!",
      documents: "Upload Form 16, bank statements, and investment proofs. We support PDF and images."
    },

    pan_validation: {
      help: "Enter your 10-digit PAN in AAAAA0000A format. We'll verify it with the Income Tax Department.",
      error: "Please check your PAN format. It should be 10 characters: 5 letters, 4 numbers, 1 letter.",
      verifying: "🔄 Verifying your PAN with ITD... Please wait.",
      success: "✅ PAN verified! You're eligible to file. Let's continue with your income details."
    },

    income_entry: {
      salary: "💰 Enter your total annual salary from Form 16. Include HRA, conveyance, and LTA.",
      business: "🏢 Enter your net business profit after deducting expenses.",
      property: "🏠 Enter rental income minus municipal taxes and standard deduction.",
      help: "Select all income sources that apply to you. Be accurate - this determines your ITR form."
    },

    itr_selection: {
      recommendation: "🎯 Based on your income, ITR-1 (Sahaj) is recommended for salaried individuals.",
      change: "You can change forms later if needed. This is just our recommendation.",
      help: "ITR-1: Salaried < ₹50L | ITR-2: Capital gains | ITR-3: Business | ITR-4: Presumptive business"
    },

    document_upload: {
      form16: "📄 Upload your Form 16 (salary certificate) from your employer.",
      bank: "🏦 Upload bank statements showing interest income or refunds.",
      pan: "🆔 Upload a clear photo/copy of your PAN card.",
      help: "Drop files here or click to browse. We support PDF and image formats up to 10MB."
    }
  },

  // Get response based on message and context
  getResponse: (message, context = 'general') => {
    const userMessage = message.toLowerCase();
    const contextResponses = chatbotService.responses[context] || chatbotService.responses.general;

    // Keyword matching for smart responses
    if (userMessage.includes('pan') || userMessage.includes('permanent')) {
      return contextResponses.pan || chatbotService.responses.general.pan;
    }

    if (userMessage.includes('itr') || userMessage.includes('form')) {
      return contextResponses.itr || chatbotService.responses.general.itr;
    }

    if (userMessage.includes('document') || userMessage.includes('upload')) {
      return contextResponses.documents || chatbotService.responses.general.documents;
    }

    if (userMessage.includes('help') || userMessage.includes('what')) {
      return contextResponses.help || chatbotService.responses.general.help;
    }

    if (userMessage.includes('deadline') || userMessage.includes('due')) {
      return chatbotService.responses.general.deadline;
    }

    if (userMessage.includes('salary') || userMessage.includes('income')) {
      return contextResponses.salary || chatbotService.responses.income_entry.salary;
    }

    // Default fallback responses
    const defaults = [
      "I'm here to help with your tax filing! What specific question do you have?",
      "Feel free to ask about PAN, ITR forms, documents, or any tax filing step.",
      "How can I assist you with your tax return today?"
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
  },

  // Get contextual help messages
  getContextHelp: (context) => {
    const helps = {
      pan_validation: "💡 Tip: Your PAN helps us verify eligibility and pre-fill information.",
      income_entry: "💡 Tip: Include all income sources for accurate ITR selection.",
      itr_selection: "💡 Tip: The right ITR form ensures compliance and maximizes refunds.",
      document_upload: "💡 Tip: Clear documents help us process faster and avoid errors."
    };

    return helps[context] || "💡 Tip: I'm here to help at every step!";
  },

  // Quick action suggestions based on context
  getQuickActions: (context) => {
    const actions = {
      pan_validation: [
        { label: "PAN Format Help", action: "pan_format" },
        { label: "Why PAN First?", action: "pan_importance" }
      ],
      income_entry: [
        { label: "Form 16 Guide", action: "form16_help" },
        { label: "Income Types", action: "income_types" }
      ],
      itr_selection: [
        { label: "Compare ITR Forms", action: "itr_comparison" },
        { label: "Filing Deadline", action: "deadline_info" }
      ],
      document_upload: [
        { label: "Document Checklist", action: "doc_checklist" },
        { label: "File Size Limits", action: "file_limits" }
      ]
    };

    return actions[context] || [];
  }
};

export default chatbotService;
