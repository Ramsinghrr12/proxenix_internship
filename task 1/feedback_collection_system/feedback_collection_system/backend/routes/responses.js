const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const FeedbackResponse = require('../models/FeedbackResponse');
const FeedbackForm = require('../models/FeedbackForm');
const Notification = require('../models/Notification');

// Submit a feedback response
router.post('/', async (req, res) => {
  try {
    const { formId, answers, isAnonymous, metadata } = req.body;

    // Validate required fields
    if (!formId || !answers || answers.length === 0) {
      return res.status(400).json({ message: 'Form ID and answers are required' });
    }

    // Get the form
    const form = await FeedbackForm.findById(formId);
    if (!form || !form.isActive || !form.isPublic) {
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

    // Validate answers against form questions
    const formQuestions = form.questions;
    const validatedAnswers = [];

    for (const answer of answers) {
      const question = formQuestions.find(q => q._id.toString() === answer.questionId);
      if (!question) {
        return res.status(400).json({ message: 'Invalid question ID' });
      }

      // Validate required questions
      if (question.required && (!answer.answer || answer.answer === '')) {
        return res.status(400).json({ 
          message: `Question "${question.questionText}" is required` 
        });
      }

      validatedAnswers.push({
        questionId: answer.questionId,
        questionText: question.questionText,
        questionType: question.questionType,
        answer: answer.answer
      });
    }

    // Create response
    const response = new FeedbackResponse({
      formId,
      submittedBy: isAnonymous ? null : req.user?._id,
      answers: validatedAnswers,
      metadata: metadata || {},
      isAnonymous: isAnonymous || false,
      submissionTime: {
        startTime: req.body.startTime || new Date(),
        endTime: new Date(),
        duration: req.body.duration || 0
      }
    });

    const savedResponse = await response.save();

    // Update form analytics
    await FeedbackForm.findByIdAndUpdate(formId, {
      $inc: { 'analytics.totalResponses': 1 },
      $set: { 'analytics.lastResponseAt': new Date() }
    });

    // Create notification for form creator
    if (form.settings.enableNotifications) {
      const notification = new Notification({
        recipient: form.createdBy,
        type: 'feedback_submitted',
        title: 'New Feedback Received',
        message: `A new response has been submitted for your form "${form.title}".`,
        data: {
          formId: form._id,
          responseId: savedResponse._id,
          actionUrl: `/responses/${savedResponse._id}`
        }
      });
      await notification.save();
    }

    res.status(201).json({
      message: 'Feedback submitted successfully',
      responseId: savedResponse._id
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
});

// Get responses for a form (form creator only)
router.get('/form/:formId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    // Check if user has access to this form
    const form = await FeedbackForm.findById(req.params.formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { formId: req.params.formId };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { 'answers.answer': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const responses = await FeedbackResponse.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('submittedBy', 'name email');

    const total = await FeedbackResponse.countDocuments(query);

    res.json({
      responses,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalResponses: total
      }
    });
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ message: 'Error fetching responses', error: error.message });
  }
});

// Get a specific response
router.get('/:id', auth, async (req, res) => {
  try {
    const response = await FeedbackResponse.findById(req.params.id)
      .populate('formId')
      .populate('submittedBy', 'name email')
      .populate('moderatedBy', 'name email');

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Check if user has access to this response
    const form = await FeedbackForm.findById(response.formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ response });
  } catch (error) {
    console.error('Get response error:', error);
    res.status(500).json({ message: 'Error fetching response', error: error.message });
  }
});

// Update response status (moderation)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, moderationNotes, tags, sentiment, priority } = req.body;

    const response = await FeedbackResponse.findById(req.params.id);
    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Check if user has access to this response
    const form = await FeedbackForm.findById(response.formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {
      status: status || response.status,
      moderationNotes: moderationNotes || response.moderationNotes,
      moderatedBy: req.user._id,
      moderatedAt: new Date()
    };

    if (tags) updateData.tags = tags;
    if (sentiment) updateData.sentiment = sentiment;
    if (priority) updateData.priority = priority;

    const updatedResponse = await FeedbackResponse.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('submittedBy', 'name email');

    res.json({
      message: 'Response updated successfully',
      response: updatedResponse
    });
  } catch (error) {
    console.error('Update response error:', error);
    res.status(500).json({ message: 'Error updating response', error: error.message });
  }
});

// Delete a response
router.delete('/:id', auth, async (req, res) => {
  try {
    const response = await FeedbackResponse.findById(req.params.id);
    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Check if user has access to this response
    const form = await FeedbackForm.findById(response.formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await FeedbackResponse.findByIdAndDelete(req.params.id);

    // Update form analytics
    await FeedbackForm.findByIdAndUpdate(form._id, {
      $inc: { 'analytics.totalResponses': -1 }
    });

    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    console.error('Delete response error:', error);
    res.status(500).json({ message: 'Error deleting response', error: error.message });
  }
});

// Export responses as CSV
router.get('/form/:formId/export', auth, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

    // Check if user has access to this form
    const form = await FeedbackForm.findById(req.params.formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const responses = await FeedbackResponse.find({ formId: req.params.formId })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV
      let csv = 'Response ID,Submitted By,Submitted At,Status,Sentiment,Priority\n';
      
      responses.forEach(response => {
        const submittedBy = response.submittedBy ? response.submittedBy.name : 'Anonymous';
        const submittedAt = new Date(response.createdAt).toISOString();
        
        csv += `${response._id},${submittedBy},${submittedAt},${response.status},${response.sentiment},${response.priority}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=responses-${form.title}-${Date.now()}.csv`);
      res.send(csv);
    } else {
      // Return JSON
      res.json({ responses });
    }
  } catch (error) {
    console.error('Export responses error:', error);
    res.status(500).json({ message: 'Error exporting responses', error: error.message });
  }
});

// Get response analytics
router.get('/analytics/overview', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Get forms created by user
    const userForms = await FeedbackForm.find({ createdBy: req.user._id });
    const formIds = userForms.map(form => form._id);

    const responses = await FeedbackResponse.find({
      formId: { $in: formIds },
      ...dateFilter
    });

    // Calculate analytics
    const totalResponses = responses.length;
    const recentResponses = responses.filter(r => 
      new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const sentimentDistribution = responses.reduce((acc, r) => {
      acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = responses.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const priorityDistribution = responses.reduce((acc, r) => {
      acc[r.priority] = (acc[r.priority] || 0) + 1;
      return acc;
    }, {});

    // Daily response trend
    const dailyTrend = {};
    responses.forEach(response => {
      const date = new Date(response.createdAt).toDateString();
      dailyTrend[date] = (dailyTrend[date] || 0) + 1;
    });

    res.json({
      totalResponses,
      recentResponses,
      sentimentDistribution,
      statusDistribution,
      priorityDistribution,
      dailyTrend,
      averageCompletionTime: responses.length > 0 
        ? responses.reduce((sum, r) => sum + (r.submissionTime.duration || 0), 0) / responses.length 
        : 0
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

module.exports = router; 