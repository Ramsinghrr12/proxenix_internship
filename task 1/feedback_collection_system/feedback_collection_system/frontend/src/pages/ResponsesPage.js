import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getForm, getFormResponses, deleteResponse } from '../services/api';

const ResponsesPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [formRes, responsesRes] = await Promise.all([
          getForm(formId),
          getFormResponses(formId)
        ]);
        
        setForm(formRes.data.form);
        setResponses(responsesRes.data.responses);

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.response?.data?.message || 'Failed to load responses. You may not have permission.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId]);

  const handleDeleteResponse = async (responseId) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      try {
        await deleteResponse(responseId);
        setResponses(prev => prev.filter(res => res._id !== responseId));
        alert('Response deleted successfully.');
      } catch (err) {
        console.error('Failed to delete response:', err);
        setError(err.response?.data?.message || 'Failed to delete response.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading responses...</p>
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
  
  return (
    <div className="container">
      <div className="responses-page">
        <header className="responses-header">
          <h1>Responses for: {form?.title || 'Form'}</h1>
          <p>
            {responses.length} response{responses.length !== 1 && 's'} collected
          </p>
           <button onClick={() => navigate('/dashboard')} className="btn btn-outline">Back to Dashboard</button>
        </header>

        {responses.length === 0 ? (
          <div className="empty-state">
            <h3>No responses yet</h3>
            <p>Share your form to start collecting feedback.</p>
          </div>
        ) : (
          <div className="responses-table-container">
            <table className="responses-table">
              <thead>
                <tr>
                  {form?.questions.slice(0, 4).map(q => <th key={q._id}>{q.questionText}</th>)}
                  <th>Submitted At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {responses.map(res => (
                  <tr key={res._id}>
                    {form?.questions.slice(0, 4).map(q => {
                      const answer = res.answers.find(a => a.questionId === q._id);
                      return <td key={q._id}>{answer ? answer.answer : '-'}</td>;
                    })}
                    <td>{new Date(res.createdAt).toLocaleString()}</td>
                    <td>
                      <button onClick={() => handleDeleteResponse(res._id)} className="btn btn-danger-outline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsesPage; 