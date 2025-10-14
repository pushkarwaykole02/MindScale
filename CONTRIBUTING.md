# Contributing to World Happiness Analysis Dashboard

Thank you for your interest in contributing to the World Happiness Analysis Dashboard! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### 1. Fork the Repository
- Fork the repository on GitHub
- Clone your fork locally
- Set up the development environment

### 2. Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/world-happiness-dashboard.git
cd world-happiness-dashboard

# Install dependencies
npm run install-all

# Set up environment variables
cp env.example .env
# Edit .env with your Supabase credentials

# Start development servers
npm run dev
```

### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 4. Make Changes
- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation if needed

### 5. Test Your Changes
- Test all functionality locally
- Ensure no breaking changes
- Check for TypeScript errors
- Verify responsive design

### 6. Commit and Push
```bash
git add .
git commit -m "feat: add new feature description"
git push origin feature/your-feature-name
```

### 7. Create a Pull Request
- Go to the original repository
- Click "New Pull Request"
- Fill out the PR template
- Request review from maintainers

## 📝 Code Style Guidelines

### JavaScript/React
- Use functional components with hooks
- Follow ESLint configuration
- Use meaningful variable names
- Add PropTypes or TypeScript types
- Use const/let instead of var

### CSS/Styling
- Use Tailwind CSS classes
- Follow mobile-first approach
- Use semantic class names
- Maintain consistent spacing

### File Organization
```
src/
├── components/          # Reusable components
│   ├── Charts/         # Chart components
│   ├── Forms/          # Form components
│   └── UI/             # UI components
├── pages/              # Page components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── utils/              # Utility functions
└── lib/                # External library configs
```

## 🧪 Testing Guidelines

### Frontend Testing
- Test component rendering
- Test user interactions
- Test responsive design
- Test accessibility

### Backend Testing
- Test API endpoints
- Test error handling
- Test data validation
- Test authentication

### Manual Testing Checklist
- [ ] User authentication works
- [ ] All pages load correctly
- [ ] Charts render properly
- [ ] Forms submit successfully
- [ ] Responsive design works
- [ ] Dark/light theme toggle works
- [ ] No console errors

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, device
6. **Screenshots**: If applicable
7. **Console Logs**: Any error messages

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Device: [e.g. Desktop, Mobile]

## Additional Context
Any other context about the problem
```

## ✨ Feature Requests

When requesting features, please include:

1. **Feature Description**: Clear description of the feature
2. **Use Case**: Why this feature is needed
3. **Proposed Solution**: How you think it should work
4. **Alternatives**: Other solutions you've considered
5. **Additional Context**: Any other relevant information

### Feature Request Template
```markdown
## Feature Description
Brief description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives
What other solutions have you considered?

## Additional Context
Any other context or screenshots
```

## 📋 Pull Request Guidelines

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] No console errors

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### PR Requirements
- [ ] Code is properly formatted
- [ ] No TypeScript errors
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Screenshots included (if UI changes)
- [ ] Breaking changes documented

## 🏗️ Architecture Guidelines

### Frontend Architecture
- Use React functional components
- Implement proper state management
- Use React Router for navigation
- Follow component composition patterns

### Backend Architecture
- Use Express.js middleware
- Implement proper error handling
- Use async/await for async operations
- Follow RESTful API design

### Database Design
- Use Supabase for data storage
- Implement proper indexing
- Use Row Level Security (RLS)
- Follow normalization principles

## 🔒 Security Guidelines

### Authentication
- Use Supabase authentication
- Implement proper session management
- Use HTTPS in production
- Validate all inputs

### Data Protection
- Sanitize user inputs
- Use parameterized queries
- Implement rate limiting
- Follow OWASP guidelines

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Include usage examples
- Update README when needed

### API Documentation
- Document all endpoints
- Include request/response examples
- Document error codes
- Keep documentation up to date

## 🎯 Development Priorities

### High Priority
- Bug fixes
- Security improvements
- Performance optimizations
- Accessibility improvements

### Medium Priority
- New features
- UI/UX improvements
- Code refactoring
- Documentation updates

### Low Priority
- Nice-to-have features
- Code style improvements
- Additional tests
- Performance monitoring

## 🤔 Questions?

If you have questions about contributing:

1. Check existing issues and PRs
2. Read the documentation
3. Ask in discussions
4. Contact maintainers

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to the World Happiness Analysis Dashboard! 🚀
