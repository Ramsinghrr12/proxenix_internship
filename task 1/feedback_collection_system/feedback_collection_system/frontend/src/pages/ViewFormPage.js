import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getForm, submitResponse } from '../services/api';

const ViewFormPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await getForm(formId);
        
        if (response.data.form) {
          setForm(response.data.form);
          const initialAnswers = {};
          response.data.form.questions.forEach(q => {
            initialAnswers[q._id] = q.questionType === 'checkbox' ? [] : '';
          });
          setAnswers(initialAnswers);
        } else {
          setError('Form not found.');
        }
      } catch (err) {
        console.error('Failed to fetch form:', err);
        setError(err.response?.data?.message || 'Failed to load form. It might not exist or you may not have permission.');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleInputChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };
  
  const handleCheckboxChange = (questionId, option, checked) => {
    const currentAnswers = answers[questionId] || [];
    const newAnswers = checked 
      ? [...currentAnswers, option]
      : currentAnswers.filter(item => item !== option);
    handleInputChange(questionId, newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const submissionAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer: Array.isArray(answer) ? answer.join(', ') : answer,
    }));
    
    let allRequiredAnswered = true;
    if(form && form.questions) {
        for(const q of form.questions) {
            if(q.required) {
                const answer = answers[q._id];
                if(!answer || answer.length === 0) {
                    allRequiredAnswered = false;
                    break;
                }
            }
        }
    }

    if(!allRequiredAnswered) {
        setError('Please answer all required questions.');
        setSubmitting(false);
        return;
    }

    try {
      await submitResponse({
        formId,
        answers: submissionAnswers,
      });
      alert('Your response has been submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to submit response:', err);
      setError(err.response?.data?.message || 'Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{marginTop: '1rem'}}>Go Back</button>
      </div>
    );
  }

  if (!form) {
    return <div className="container">Form not found.</div>;
  }
  
  const renderQuestion = (q) => {
      switch (q.questionType) {
        case 'text':
        case 'email':
        case 'date':
          return <input type={q.questionType} value={answers[q._id] || ''} onChange={(e) => handleInputChange(q._id, e.target.value)} required={q.required} className="form-control" />;
        case 'textarea':
          return <textarea value={answers[q._id] || ''} onChange={(e) => handleInputChange(q._id, e.target.value)} required={q.required} className="form-control"></textarea>;
        case 'rating':
          return (
            <div className="rating-options">
              {(q.options && q.options.length > 0 ? q.options : ['1', '2', '3', '4', '5']).map(option => (
                <label key={option} className="rating-label">
                  <input type="radio" name={q._id} value={option} checked={answers[q._id] === option} onChange={(e) => handleInputChange(q._id, e.target.value)} required={q.required} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          );
        case 'radio':
          return (
             <div className="radio-options">
               {q.options.map(option => (
                 <label key={option} className="radio-label">
                   <input type="radio" name={q._id} value={option} checked={answers[q._id] === option} onChange={(e) => handleInputChange(q._id, e.target.value)} required={q.required} />
                   <span>{option}</span>
                 </label>
               ))}
             </div>
          );
        case 'checkbox':
          return (
             <div className="checkbox-options">
               {q.options.map(option => (
                 <label key={option} className="checkbox-label">
                   <input type="checkbox" name={q._id} value={option} checked={(answers[q._id] || []).includes(option)} onChange={(e) => handleCheckboxChange(q._id, option, e.target.checked)} />
                   <span>{option}</span>
                 </label>
               ))}
             </div>
          );
        default:
          return <p>Unsupported question type.</p>;
      }
  }

  return (
    <div className="container">
      <div className="view-form-page">
        <header className="form-header-public">
          <h1>{form.title}</h1>
          {form.description && <p>{form.description}</p>}
        </header>
        <form onSubmit={handleSubmit} className="feedback-form-public" noValidate>
          {form.questions.sort((a, b) => a.order - b.order).map(q => (
            <div key={q._id} className="form-question">
              <label htmlFor={q._id}>{q.questionText} {q.required && <span className="required-asterisk">*</span>}</label>
              {renderQuestion(q)}
            </div>
          ))}
          
          {error && <div className="error-message" style={{marginTop: '1rem'}}>{error}</div>}

          <div className="form-actions-public">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViewFormPage; 