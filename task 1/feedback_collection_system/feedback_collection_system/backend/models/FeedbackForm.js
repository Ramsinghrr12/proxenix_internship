const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  questionType: {
    type: String,
    enum: ['text', 'textarea', 'radio', 'checkbox', 'rating', 'email', 'number'],
    required: [true, 'Question type is required']
  },
  options: [{
    type: String,
    trim: true
  }],
  required: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  }
});

const feedbackFormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Form title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  allowAnonymous: {
    type: Boolean,
    default: false
  },
  maxResponses: {
    type: Number,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  version: {
    type: Number,
    default: 1
  },
  settings: {
    enableNotifications: {
      type: Boolean,
      default: true
    },
    requireCaptcha: {
      type: Boolean,
      default: false
    },
    allowFileUpload: {
      type: Boolean,
      default: false
    }
  },
  analytics: {
    totalResponses: {
      type: Number,
      default: 0
    },
    averageCompletionTime: {
      type: Number,
      default: 0
    },
    lastResponseAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
feedbackFormSchema.index({ createdBy: 1, isActive: 1 });
feedbackFormSchema.index({ isPublic: 1, isActive: 1 });

const FeedbackForm = mongoose.model('FeedbackForm', feedbackFormSchema);

module.exports = FeedbackForm; 