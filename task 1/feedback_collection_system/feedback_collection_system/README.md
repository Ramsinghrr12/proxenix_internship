# Feedback Collection System

A comprehensive feedback collection platform built with React frontend and Node.js backend, featuring customizable forms, real-time analytics, and secure user authentication.

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with role-based access
- **Customizable Forms**: Create forms with multiple question types (text, textarea, radio, checkbox, rating, email, number)
- **Real-time Analytics**: Comprehensive analytics dashboard with response tracking
- **Response Management**: View, moderate, and export feedback responses
- **Notification System**: Automated notifications for form submissions and updates
- **Data Security**: Encrypted data storage with privacy controls

### Advanced Features
- **Form Builder**: Intuitive drag-and-drop form creation interface
- **Multi-channel Accessibility**: Responsive design for all devices
- **Export Functionality**: Export responses in CSV and JSON formats
- **Moderation Tools**: Content moderation and spam detection
- **Version Control**: Form versioning and history tracking
- **Integration Ready**: RESTful API for third-party integrations

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **React 19** with functional components and hooks
- **React Router** for navigation
- **Axios** for API communication
- **CSS3** with custom design system
- **Responsive Design** for mobile-first approach

## 📁 Project Structure

```
feedback_collection_system/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── FeedbackForm.js
│   │   ├── FeedbackResponse.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── forms.js
│   │   ├── responses.js
│   │   └── notifications.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── DashboardPage.js
│   │   │   └── CreateFormPage.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd feedback_collection_system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/feedback_system
   JWT_SECRET=your-secret-key-here
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the Application**
   
   **Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend:**
   ```bash
   cd frontend
   npm start
   ```

   The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Forms Endpoints
- `GET /api/forms` - Get user's forms
- `POST /api/forms` - Create new form
- `GET /api/forms/:id` - Get specific form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form
- `GET /api/forms/:id/analytics` - Get form analytics
- `POST /api/forms/:id/duplicate` - Duplicate form
- `GET /api/forms/public/:id` - Get public form

### Responses Endpoints
- `POST /api/responses` - Submit feedback response
- `GET /api/responses/form/:formId` - Get form responses
- `GET /api/responses/:id` - Get specific response
- `PATCH /api/responses/:id/status` - Update response status
- `DELETE /api/responses/:id` - Delete response
- `GET /api/responses/form/:formId/export` - Export responses
- `GET /api/responses/analytics/overview` - Get response analytics

### Notifications Endpoints
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count

## 🎯 Key Features Explained

### Form Builder
- **Question Types**: Support for 7 different question types
- **Dynamic Options**: Add/remove options for choice-based questions
- **Required Fields**: Mark questions as required
- **Form Settings**: Configure privacy, expiration, and response limits

### Analytics Dashboard
- **Real-time Stats**: Live response counts and trends
- **Sentiment Analysis**: Track response sentiment distribution
- **Performance Metrics**: Average completion times and engagement
- **Visual Charts**: Interactive charts for data visualization

### Response Management
- **Moderation Tools**: Review and approve/reject responses
- **Status Tracking**: Track response status through workflow
- **Export Options**: Export data in multiple formats
- **Search & Filter**: Advanced search and filtering capabilities

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for passwords
- **Role-based Access**: Admin and user role management
- **Data Validation**: Comprehensive input validation
- **CORS Protection**: Cross-origin request security

## 🎨 UI/UX Features

### Design System
- **Modern Interface**: Clean, professional design
- **Responsive Layout**: Works on all device sizes
- **Accessibility**: WCAG compliant design
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages

### User Experience
- **Intuitive Navigation**: Easy-to-use tabbed interface
- **Real-time Updates**: Live data updates without page refresh
- **Form Validation**: Client-side and server-side validation
- **Success Feedback**: Clear success messages and confirmations

## 🔧 Configuration Options

### Form Settings
- Public/Private forms
- Anonymous submissions
- Response limits
- Expiration dates
- Notification preferences

### Analytics Configuration
- Custom date ranges
- Filter by status/sentiment
- Export formats
- Chart customization

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB database
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, AWS, etc.)
4. Set up SSL certificate for HTTPS

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Configure environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Advanced Analytics**: Machine learning insights
- **Email Integration**: Automated email campaigns
- **Mobile App**: Native mobile applications
- **API Webhooks**: Real-time integrations
- **Multi-language Support**: Internationalization
- **Advanced Reporting**: Custom report builder
- **Team Collaboration**: Multi-user form editing
- **Template Library**: Pre-built form templates

---

**Built with ❤️ for better feedback collection and user experience** 