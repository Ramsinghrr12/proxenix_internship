const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const FeedbackForm = require('../models/FeedbackForm');
const FeedbackResponse = require('../models/FeedbackResponse');
const Notification = require('../models/Notification');

// Create a new feedback form
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, questions, settings, isPublic, allowAnonymous, maxResponses, expiresAt } = req.body;

    // Validate required fields
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Title and at least one question are required' });
    }

    // Validate questions structure
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.questionText || !question.questionType) {
        return res.status(400).json({ message: `Question ${i + 1} is missing required fields` });
      }
      
      // Add order if not provided
      if (!question.order) {
        question.order = i + 1;
      }
    }

    const form = new FeedbackForm({
      title,
      description,
      questions,
      createdBy: req.user._id,
      settings: settings || {},
      isPublic: isPublic || false,
      allowAnonymous: allowAnonymous || false,
      maxResponses: maxResponses || null,
      expiresAt: expiresAt || null
    });

    const savedForm = await form.save();

    // Create notification for form creation
    const notification = new Notification({
      recipient: req.user._id,
      type: 'form_created',
      title: 'Form Created Successfully',
      message: `Your feedback form "${title}" has been created and is ready to collect responses.`,
      data: {
        formId: savedForm._id,
        actionUrl: `/forms/${savedForm._id}`
      }
    });
    await notification.save();

    res.status(201).json({
      message: 'Feedback form created successfully',
      form: savedForm
    });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ message: 'Error creating feedback form', error: error.message });
  }
});

// Get all forms for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Get forms request from user:', req.user._id);
    console.log('Query params:', req.query);
    
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { createdBy: req.user._id };
    
    if (status) {
      query.isActive = status === 'active';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    const forms = await FeedbackForm.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await FeedbackForm.countDocuments(query);

    console.log(`Found ${forms.length} forms out of ${total} total`);

    res.json({
      forms,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalForms: total
      }
    });
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({ message: 'Error fetching forms', error: error.message });
  }
});

// Get a specific form by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const form = await FeedbackForm.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user has access to this form
    if (form.createdBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ form });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ message: 'Error fetching form', error: error.message });
  }
});

// Update a form
router.put('/:id', auth, async (req, res) => {
  try {
    const form = await FeedbackForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user has access to this form
    if (form.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment version number
    req.body.version = form.version + 1;

    const updatedForm = await FeedbackForm.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      message: 'Form updated successfully',
      form: updatedForm
    });
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({ message: 'Error updating form', error: error.message });
  }
});

// Delete a form
router.delete('/:id', auth, async (req, res) => {
  try {
    const form = await FeedbackForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user has access to this form
    if (form.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if form has responses
    const responseCount = await FeedbackResponse.countDocuments({ formId: req.params.id });
    if (responseCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete form with existing responses. Consider deactivating instead.' 
      });
    }

    await FeedbackForm.findByIdAndDelete(req.params.id);

    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({ message: 'Error deleting form', error: error.message });
  }
});

// Get form analytics
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const form = await FeedbackForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user has access to this form
    if (form.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const responses = await FeedbackResponse.find({ formId: req.params.id });
    
    // Calculate analytics
    const totalResponses = responses.length;
    const recentResponses = responses.filter(r => 
      new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const averageCompletionTime = responses.length > 0 
      ? responses.reduce((sum, r) => sum + (r.submissionTime.duration || 0), 0) / responses.length 
      : 0;

    const sentimentDistribution = responses.reduce((acc, r) => {
      acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = responses.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    // Question-wise analytics
    const questionAnalytics = form.questions.map(question => {
      const questionResponses = responses.filter(r => 
        r.answers.some(a => a.questionId.toString() === question._id.toString())
      );
      
      return {
        questionId: question._id,
        questionText: question.questionText,
        questionType: question.questionType,
        responseCount: questionResponses.length,
        answers: questionResponses.map(r => {
          const answer = r.answers.find(a => a.questionId.toString() === question._id.toString());
          return answer ? answer.answer : null;
        }).filter(a => a !== null)
      };
    });

    res.json({
      formId: req.params.id,
      totalResponses,
      recentResponses,
      averageCompletionTime,
      sentimentDistribution,
      statusDistribution,
      questionAnalytics,
      lastResponseAt: form.analytics.lastResponseAt
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Duplicate a form
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalForm = await FeedbackForm.findById(req.params.id);

    if (!originalForm) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user has access to this form
    if (originalForm.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const duplicatedForm = new FeedbackForm({
      ...originalForm.toObject(),
      _id: undefined,
      title: `${originalForm.title} (Copy)`,
      createdBy: req.user._id,
      analytics: {
        totalResponses: 0,
        averageCompletionTime: 0,
        lastResponseAt: null
      }
    });

    const savedForm = await duplicatedForm.save();

    res.status(201).json({
      message: 'Form duplicated successfully',
      form: savedForm
    });
  } catch (error) {
    console.error('Duplicate form error:', error);
    res.status(500).json({ message: 'Error duplicating form', error: error.message });
  }
});

// Get public forms (for form submission)
router.get('/public/:id', async (req, res) => {
  try {
    const form = await FeedbackForm.findOne({
      _id: req.params.id,
      isActive: true,
      isPublic: true
    }).populate('createdBy', 'name');

    if (!form) {
      return res.status(404).json({ message: 'Form not found or not accessible' });
    }

    // Check if form has expired
    if (form.expiresAt && new Date() > form.expiresAt) {
      return res.status(410).json({ message: 'This form has expired' });
    }

    // Check if max responses reached
    if (form.maxResponses && form.analytics.totalResponses >= form.maxResponses) {
      return res.status(410).json({ message: 'This form has reached maximum responses' });
    }

    res.json({ form });
  } catch (error) {
    console.error('Get public form error:', error);
    res.status(500).json({ message: 'Error fetching form', error: error.message });
  }
});

module.exports = router; 