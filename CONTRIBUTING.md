# Contributing Guide

Thank you for your interest in contributing to AstroNova! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Report issues privately
- Respect intellectual property
- Help maintain code quality

## How to Contribute

### 1. Report Bugs

**Before reporting**, check if the issue already exists.

**Report template:**
```
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. ...

## Expected Behavior
What should happen?

## Actual Behavior
What actually happened?

## Environment
- OS: 
- Node version:
- Browser:
- .env keys configured: yes/no
```

### 2. Request Features

**Feature template:**
```
## Feature Description
What feature would you like?

## Use Case
Why would this feature be useful?

## Proposed Solution
How could this be implemented?

## Alternatives
Any alternative approaches?
```

### 3. Submit Code Changes

1. **Fork the repository**
```bash
git clone https://github.com/yourusername/AstroNova.git
cd AstroNova
```

2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
   - Follow code style (see below)
   - Add comments for complex logic
   - Update relevant documentation

4. **Test your changes**
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run dev
```

5. **Commit with clear messages**
```bash
git add .
git commit -m "feat: add amazing feature

- Describe what you added
- Explain why this is needed
- Reference any related issues #123"
```

6. **Push to your fork**
```bash
git push origin feature/amazing-feature
```

7. **Open a Pull Request**
   - Link related issues
   - Describe changes clearly
   - Request review from maintainers

## Code Style

### JavaScript/React

```javascript
// Use camelCase for variables and functions
const getUserLocation = () => {
  // ...
};

// Use PascalCase for components
const MyComponent = () => {
  // ...
};

// Use UPPER_SNAKE_CASE for constants
const API_URL = 'http://localhost:5000/api';

// Use descriptive names
const calculateSatellitePosition = () => {
  // Good: clear intent
};

const calc() {
  // Bad: unclear
};

// Use arrow functions
const handleClick = () => {};

// Use const by default
const x = 1; // Good
let x = 1; // Only if needed
var x = 1; // Avoid

// Comment complex logic
const distance = Math.sqrt(
  Math.pow(lat1 - lat2, 2) +
  Math.pow(lng1 - lng2, 2)
);

// Use meaningful comments
// Calculate great-circle distance between two coordinates
// Using Haversine formula
```

### React Components

```javascript
// Functional components only
export const MyComponent = ({ prop1, prop2 }) => {
  // State at top
  const [state, setState] = useState(null);
  
  // Effects after state
  useEffect(() => {
    // ...
  }, []);
  
  // Handlers in middle
  const handleClick = () => {};
  
  // JSX at bottom
  return (
    <div>
      {/* Content */}
    </div>
  );
};

export default MyComponent;
```

### CSS/Tailwind

```css
/* Use Tailwind classes */
<div className="flex items-center gap-4 p-4 rounded-lg bg-space-800">
  Content
</div>

/* Use custom CSS for complex animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 300ms ease-in;
}
```

## Project Structure

```
AstroNova/
├── frontend/           # React + Vite frontend
├── backend/            # Express.js backend
├── docs/               # Documentation
├── .github/            # GitHub workflows
└── README.md          # Main documentation
```

### Adding Features

**Backend Feature:**
1. Create service in `backend/src/services/`
2. Create controller in `backend/src/controllers/`
3. Add route in `backend/src/routes/`
4. Add documentation

**Frontend Feature:**
1. Create component in `frontend/src/components/`
2. Add service if needed in `frontend/src/services/`
3. Update store in `frontend/src/context/store.js`
4. Add custom hook if needed in `frontend/src/hooks/`
5. Update documentation

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (no logic change)
- `refactor` - Code restructure
- `test` - Tests
- `chore` - Build, dependencies

**Examples:**
```
feat(satellites): add real-time ISS tracking
fix(api): handle N2YO API errors correctly
docs: update deployment guide
refactor(globe): optimize Cesium rendering
```

## Testing

### Manual Testing

1. **Frontend**
```bash
cd frontend
npm run dev
# Test all features manually
```

2. **Backend**
```bash
cd backend
npm run dev
# Test endpoints with cURL or Postman
```

3. **API Testing**
```bash
# Test with curl
curl http://localhost:5000/api/health

# Or use Postman collection (coming soon)
```

### Code Coverage

We aim for 80%+ coverage. Add tests:

```javascript
// Example test structure (future)
describe('SatelliteService', () => {
  it('should get satellite positions', async () => {
    const result = await SatelliteService.getPositions(25544, 0, 0);
    expect(result).toBeDefined();
    expect(result.data.satname).toBe('ISS (ZARYA)');
  });
});
```

## Documentation

- Update README.md for new features
- Add API docs to API.md
- Comment complex code
- Include examples
- Update QUICKSTART.md if relevant

## Performance Guidelines

- Lazy load components
- Optimize API calls (cache when possible)
- Use Zustand for state (minimal re-renders)
- Compress assets
- Monitor bundle size

```bash
# Check bundle size
cd frontend
npm run build
# Check the dist folder
```

## Security

- Never commit API keys
- Use environment variables
- Validate all inputs
- Sanitize user data
- Use HTTPS in production
- Keep dependencies updated

```bash
# Check for vulnerabilities
npm audit
npm audit fix
```

## Pull Request Process

1. **Update documentation**
   - README.md if relevant
   - API.md for API changes
   - Add inline comments

2. **Test thoroughly**
   - Test on multiple browsers
   - Test error cases
   - Test with real API data

3. **Request review**
   - At least one approval required
   - Address feedback
   - Re-request review

4. **Merge carefully**
   - Squash commits if many small changes
   - Delete branch after merge
   - Verify deployment

## Release Process

1. **Version Bump**
```
Major.Minor.Patch (semver)
v1.2.3
```

2. **Update CHANGELOG**
```
## [1.2.3] - 2024-01-15

### Added
- New feature description

### Fixed
- Bug fix description

### Changed
- Change description
```

3. **Create Release**
```bash
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3
```

## Development Setup

```bash
# Clone and setup
git clone https://github.com/yourusername/AstroNova.git
cd AstroNova

# Backend
cd backend
npm install
cp .env.example .env
# Add API keys
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Useful Commands

```bash
# Format code
npm run format

# Run linter
npm run lint

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## Getting Help

- **Questions?** Open a Discussion
- **Issues?** Report with reproduction steps
- **Ideas?** Open a Feature Request
- **Chat?** Join our Discord (coming soon)

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- GitHub commit history
- Release notes

## License

By contributing, you agree your code will be under MIT License.

---

## Contributor License Agreement

By submitting code, you represent that you have the right to submit the work under the MIT License.

**Thank you for contributing to AstroNova! 🚀**
