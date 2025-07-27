import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createForm } from '../services/api';

const CreateFormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [],
    isPublic: false,
    allowAnonymous: false,
    maxResponses: '',
    expiresAt: '',
    settings: {
      enableNotifications: true,
      requireCaptcha: false,
      allowFileUpload: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const questionTypes = [
    { value: 'text', label: 'Short Text', icon: '📝' },
    { value: 'textarea', label: 'Long Text', icon: '📄' },
    { value: 'radio', label: 'Single Choice', icon: '🔘' },
    { value: 'checkbox', label: 'Multiple Choice', icon: '☑️' },
    { value: 'rating', label: 'Rating', icon: '⭐' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'number', label: 'Number', icon: '🔢' }
  ];

  const addQuestion = () => {
    const newQuestion = {
      questionText: '',
      questionType: 'text',
      options: [],
      required: false,
      order: formData.questions.length + 1
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    // Reorder questions
    updatedQuestions.forEach((q, i) => {
      q.order = i + 1;
    });
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.push('');
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Form title is required');
      return;
    }

    if (formData.questions.length === 0) {
      setError('At least one question is required');
      return;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      if (!question.questionText.trim()) {
        setError(`Question ${i + 1} text is required`);
        return;
      }

      if ((question.questionType === 'radio' || question.questionType === 'checkbox') && question.options.length < 2) {
        setError(`Question ${i + 1} needs at least 2 options`);
        return;
      }
    }

    try {
      setLoading(true);
      setError('');

      const submitData = {
        ...formData,
        maxResponses: formData.maxResponses ? parseInt(formData.maxResponses) : null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
      };

      const response = await createForm(submitData);
      
      if (response.data) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create form');
      console.error('Create form error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionInput = (question, index) => {
    switch (question.questionType) {
      case 'radio':
      case 'checkbox':
        return (
          <div className="options-container">
            <label>Options:</label>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="option-input">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(index, optionIndex)}
                  className="btn-remove"
                  disabled={question.options.length <= 2}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addOption(index)}
              className="btn-add-option"
            >
              + Add Option
            </button>
          </div>
        );
      
      case 'rating':
        return (
          <div className="rating-settings">
            <label>Rating Scale:</label>
            <select
              value={question.options.length || 5}
              onChange={(e) => {
                const scale = parseInt(e.target.value);
                const options = Array.from({ length: scale }, (_, i) => `${i + 1}`);
                updateQuestion(index, 'options', options);
              }}
            >
              <option value="3">1-3</option>
              <option value="5">1-5</option>
              <option value="7">1-7</option>
              <option value="10">1-10</option>
            </select>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="form-builder">
        <div className="form-builder-header">
          <h1>Create Feedback Form</h1>
          <p>Build a custom feedback form with various question types</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Form Basic Info */}
          <div className="form-section">
            <h2>Form Information</h2>
            <div className="form-group">
              <label htmlFor="title">Form Title *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter form title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter form description"
                rows="3"
              />
            </div>
          </div>

          {/* Form Settings */}
          <div className="form-section">
            <h2>Form Settings</h2>
            <div className="settings-grid">
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  />
                  Make form public
                </label>
                <small>Allow anyone with the link to submit responses</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.allowAnonymous}
                    onChange={(e) => setFormData({ ...formData, allowAnonymous: e.target.checked })}
                  />
                  Allow anonymous submissions
                </label>
                <small>Users can submit without creating an account</small>
              </div>

              <div className="setting-item">
                <label htmlFor="maxResponses">Maximum Responses</label>
                <input
                  type="number"
                  id="maxResponses"
                  value={formData.maxResponses}
                  onChange={(e) => setFormData({ ...formData, maxResponses: e.target.value })}
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>

              <div className="setting-item">
                <label htmlFor="expiresAt">Expiration Date</label>
                <input
                  type="datetime-local"
                  id="expiresAt"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="form-section">
            <div className="section-header">
              <h2>Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="btn btn-primary"
              >
                + Add Question
              </button>
            </div>

            {formData.questions.length === 0 ? (
              <div className="empty-questions">
                <p>No questions added yet. Click "Add Question" to get started.</p>
              </div>
            ) : (
              <div className="questions-container">
                {formData.questions.map((question, index) => (
                  <div key={index} className="question-card">
                    <div className="question-header">
                      <span className="question-number">Q{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="btn-remove-question"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="question-content">
                      <div className="form-group">
                        <label>Question Text *</label>
                        <input
                          type="text"
                          value={question.questionText}
                          onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                          placeholder="Enter your question"
                          required
                        />
                      </div>

                      <div className="question-settings">
                        <div className="setting-row">
                          <div className="form-group">
                            <label>Question Type</label>
                            <select
                              value={question.questionType}
                              onChange={(e) => updateQuestion(index, 'questionType', e.target.value)}
                            >
                              {questionTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.icon} {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="form-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                              />
                              Required
                            </label>
                          </div>
                        </div>

                        {renderQuestionInput(question, index)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Form...' : 'Create Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFormPage; 