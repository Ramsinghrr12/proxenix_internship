import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getForms, 
  getResponseAnalytics, 
  logoutUser,
  createForm
} from '../services/api';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [forms, setForms] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formsLoading, setFormsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userInfo).user);
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [formsResponse, analyticsResponse] = await Promise.all([
        getForms({ limit: 5 }),
        getResponseAnalytics()
      ]);
      
      console.log('Forms response:', formsResponse);
      console.log('Analytics response:', analyticsResponse);
      
      setForms(formsResponse.data.forms || []);
      setAnalytics(analyticsResponse.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadFormsData = async () => {
    try {
      setFormsLoading(true);
      setError('');
      const response = await getForms({ limit: 20 });
      console.log('Forms tab response:', response);
      setForms(response.data.forms || []);
    } catch (err) {
      console.error('Forms load error:', err);
      setError('Failed to load forms: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormsLoading(false);
    }
  };

  const createSampleForm = async () => {
    try {
      setFormsLoading(true);
      setError('');
      
      const sampleForm = {
        title: "Sample Customer Feedback Form",
        description: "This is a sample feedback form to test the system functionality.",
        questions: [
          {
            questionText: "How satisfied are you with our service?",
            questionType: "rating",
            options: ["1", "2", "3", "4", "5"],
            required: true,
            order: 1
          },
          {
            questionText: "What aspects of our service could be improved?",
            questionType: "textarea",
            required: false,
            order: 2
          },
          {
            questionText: "How did you hear about us?",
            questionType: "radio",
            options: ["Social Media", "Friend Recommendation", "Advertisement", "Search Engine", "Other"],
            required: true,
            order: 3
          },
          {
            questionText: "Which features do you use most?",
            questionType: "checkbox",
            options: ["Feature A", "Feature B", "Feature C", "Feature D"],
            required: false,
            order: 4
          },
          {
            questionText: "Your email address",
            questionType: "email",
            required: false,
            order: 5
          }
        ],
        isPublic: true,
        allowAnonymous: true,
        settings: {
          enableNotifications: true,
          requireCaptcha: false,
          allowFileUpload: false
        }
      };

      const response = await createForm(sampleForm);
      console.log('Sample form created:', response);
      
      // Reload forms after creating sample form
      await loadFormsData();
      
      alert('Sample form created successfully!');
    } catch (err) {
      console.error('Create sample form error:', err);
      setError('Failed to create sample form: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'forms' && forms.length === 0) {
      loadFormsData();
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleCreateForm = () => {
    navigate('/create-form');
  };

  const handleViewForm = (formId) => {
    navigate(`/form/${formId}`);
  };

  const handleViewResponses = (formId) => {
    navigate(`/responses/${formId}`);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your feedback collection system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="feedback-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Feedback Collection System</h1>
            <p>Welcome, {user.name}!</p>
          </div>
          <div className="header-actions">
            <button onClick={handleCreateForm} className="btn btn-primary">
              Create New Form
            </button>
            <button onClick={handleLogout} className="btn btn-logout">
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-nav">
          <button 
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            Overview
          </button>
          <button 
            className={`nav-tab ${activeTab === 'forms' ? 'active' : ''}`}
            onClick={() => handleTabChange('forms')}
          >
            My Forms
          </button>
          <button 
            className={`nav-tab ${activeTab === 'responses' ? 'active' : ''}`}
            onClick={() => handleTabChange('responses')}
          >
            Responses
          </button>
          <button 
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => handleTabChange('analytics')}
          >
            Analytics
          </button>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
          {error && <div className="error-message">{error}</div>}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="welcome-card">
                <h2>About Our Feedback Collection System</h2>
                <p>
                  Our Feedback Collection System is a comprehensive platform designed to help organizations
                  gather, analyze, and act on valuable user feedback. We provide powerful tools to create
                  meaningful connections with your users and make data-driven decisions.
                </p>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <h4>Customizable Forms</h4>
                  <p>Create tailored feedback forms with various question types to gather specific insights.</p>
                </div>
                <div className="feature-card">
                  <h4>Real-time Analytics</h4>
                  <p>Get instant insights with our powerful analytics dashboard and reporting tools.</p>
                </div>
                <div className="feature-card">
                  <h4>Data Visualization</h4>
                  <p>Transform feedback data into clear, actionable insights with interactive charts.</p>
                </div>
                <div className="feature-card">
                  <h4>User Management</h4>
                  <p>Easily manage user access and permissions for your feedback collection team.</p>
                </div>
              </div>

              <div className="quick-stats">
                <div className="stat-card">
                  <h3>{forms.length}</h3>
                  <p>Active Forms</p>
                </div>
                <div className="stat-card">
                  <h3>{analytics?.totalResponses || 0}</h3>
                  <p>Total Responses</p>
                </div>
                <div className="stat-card">
                  <h3>{analytics?.recentResponses || 0}</h3>
                  <p>Recent Responses</p>
                </div>
                <div className="stat-card">
                  <h3>{analytics?.averageCompletionTime ? Math.round(analytics.averageCompletionTime) : 0}s</h3>
                  <p>Avg. Completion Time</p>
                </div>
              </div>

              <div className="getting-started">
                <h3>Getting Started</h3>
                <ol className="getting-started-list">
                  <li>Create your first feedback form using our intuitive form builder</li>
                  <li>Share the form with your target audience</li>
                  <li>Collect and analyze responses in real-time</li>
                  <li>Generate reports and take action based on insights</li>
                </ol>
              </div>

              <div className="benefits-section">
                <h3>Why Choose Us?</h3>
                <ul className="benefits-list">
                  <li>User-friendly interface for easy navigation</li>
                  <li>Secure data storage and privacy protection</li>
                  <li>Customizable reporting and analytics</li>
                  <li>24/7 customer support</li>
                  <li>Regular updates and new features</li>
                </ul>
              </div>
            </div>
          )}

          {/* Forms Tab */}
          {activeTab === 'forms' && (
            <div className="forms-section">
              <div className="section-header">
                <h2>My Feedback Forms</h2>
                <div className="header-buttons">
                  <button onClick={createSampleForm} className="btn btn-secondary" disabled={formsLoading}>
                    {formsLoading ? 'Creating...' : 'Create Sample Form'}
                  </button>
                  <button onClick={handleCreateForm} className="btn btn-primary">
                    Create New Form
                  </button>
                </div>
              </div>

              {formsLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading your forms...</p>
                </div>
              ) : forms.length === 0 ? (
                <div className="empty-state">
                  <h3>No forms created yet</h3>
                  <p>Start collecting feedback by creating your first form.</p>
                  <div className="empty-state-actions">
                    <button onClick={createSampleForm} className="btn btn-secondary">
                      Create Sample Form
                    </button>
                    <button onClick={handleCreateForm} className="btn btn-primary">
                      Create Your First Form
                    </button>
                  </div>
                </div>
              ) : (
                <div className="forms-grid">
                  {forms.map(form => (
                    <div key={form._id} className="form-card">
                      <div className="form-header">
                        <h3>{form.title}</h3>
                        <span className={`status-badge ${form.isActive ? 'active' : 'inactive'}`}>
                          {form.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="form-description">{form.description}</p>
                      <div className="form-stats">
                        <span>{form.analytics?.totalResponses || 0} responses</span>
                        <span>{form.questions?.length || 0} questions</span>
                      </div>
                      <div className="form-actions">
                        <button 
                          onClick={() => handleViewForm(form._id)}
                          className="btn btn-secondary"
                        >
                          View Form
                        </button>
                        <button 
                          onClick={() => handleViewResponses(form._id)}
                          className="btn btn-outline"
                        >
                          View Responses
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Responses Tab */}
          {activeTab === 'responses' && (
            <div className="responses-section">
              <h2>Recent Responses</h2>
              {analytics?.totalResponses === 0 ? (
                <div className="empty-state">
                  <h3>No responses yet</h3>
                  <p>Create and share forms to start collecting feedback.</p>
                  <button onClick={handleCreateForm} className="btn btn-primary">
                    Create a Form
                  </button>
                </div>
              ) : (
                <div className="responses-overview">
                  <div className="response-stats">
                    <div className="stat-item">
                      <h4>Total Responses</h4>
                      <p>{analytics?.totalResponses || 0}</p>
                    </div>
                    <div className="stat-item">
                      <h4>This Week</h4>
                      <p>{analytics?.recentResponses || 0}</p>
                    </div>
                    <div className="stat-item">
                      <h4>Avg. Completion</h4>
                      <p>{analytics?.averageCompletionTime ? Math.round(analytics.averageCompletionTime) : 0}s</p>
                    </div>
                  </div>
                  
                  <div className="sentiment-chart">
                    <h4>Response Sentiment</h4>
                    <div className="sentiment-bars">
                      {analytics?.sentimentDistribution && Object.entries(analytics.sentimentDistribution).map(([sentiment, count]) => (
                        <div key={sentiment} className="sentiment-bar">
                          <span className="sentiment-label">{sentiment}</span>
                          <div className="bar-container">
                            <div 
                              className="bar-fill"
                              style={{ 
                                width: `${(count / analytics.totalResponses) * 100}%`,
                                backgroundColor: sentiment === 'positive' ? '#2ecc71' : 
                                               sentiment === 'negative' ? '#e74c3c' : '#f39c12'
                              }}
                            ></div>
                          </div>
                          <span className="sentiment-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <h2>Analytics Overview</h2>
              {analytics ? (
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h3>Response Trends</h3>
                    <div className="trend-chart">
                      {analytics.dailyTrend && Object.entries(analytics.dailyTrend).map(([date, count]) => (
                        <div key={date} className="trend-bar">
                          <div 
                            className="trend-fill"
                            style={{ height: `${(count / Math.max(...Object.values(analytics.dailyTrend))) * 100}%` }}
                          ></div>
                          <span className="trend-label">{new Date(date).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h3>Status Distribution</h3>
                    <div className="status-chart">
                      {analytics.statusDistribution && Object.entries(analytics.statusDistribution).map(([status, count]) => (
                        <div key={status} className="status-item">
                          <span className="status-name">{status}</span>
                          <span className="status-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h3>Priority Levels</h3>
                    <div className="priority-chart">
                      {analytics.priorityDistribution && Object.entries(analytics.priorityDistribution).map(([priority, count]) => (
                        <div key={priority} className="priority-item">
                          <span className="priority-name">{priority}</span>
                          <span className="priority-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No analytics data available</h3>
                  <p>Start collecting responses to see analytics.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 