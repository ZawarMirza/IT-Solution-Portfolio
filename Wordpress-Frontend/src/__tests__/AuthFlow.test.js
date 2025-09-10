import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from "../context";
import App from '../App';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Create mock axios instance
const mockAxios = new MockAdapter(axios);

// Helper function to render the app with router and auth context
const renderWithProviders = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: ({ children }) => (
    <AuthProvider>
      <Router>{children}</Router>
    </AuthProvider>
  )});
};

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockAxios.reset();
    
    // Mock successful responses
    mockAxios
      .onPost('http://localhost:5119/api/auth/register')
      .reply(200, {
        token: 'test-jwt-token',
        refreshToken: 'test-refresh-token',
        user: { id: 1, email: 'test@example.com', role: 'User' }
      });
      
    mockAxios
      .onPost('http://localhost:5119/api/auth/login')
      .reply(200, {
        token: 'test-jwt-token',
        refreshToken: 'test-refresh-token',
        user: { id: 1, email: 'test@example.com', role: 'User' }
      });
      
    mockAxios
      .onPost('http://localhost:5119/api/auth/refresh-token')
      .reply(200, {
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
        user: { id: 1, email: 'test@example.com', role: 'User' }
      });
  });

  test('successful user registration', async () => {
    renderWithProviders(<App />, { route: '/register' });
    
    // Fill out the registration form
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123!' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    // Check if the API was called with the right data
    await waitFor(() => {
      expect(mockAxios.history.post[0].data).toContain('john.doe@example.com');
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-jwt-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'test-refresh-token');
    });
    
    // Should redirect to dashboard after successful registration
    expect(window.location.pathname).toBe('/dashboard');
  });

  test('successful user login', async () => {
    renderWithProviders(<App />, { route: '/login' });
    
    // Fill out the login form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if the API was called with the right data
    await waitFor(() => {
      expect(mockAxios.history.post[0].data).toContain('john.doe@example.com');
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-jwt-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'test-refresh-token');
    });
    
    // Should redirect to dashboard after successful login
    expect(window.location.pathname).toBe('/dashboard');
  });

  test('token refresh on 401 response', async () => {
    // Initial request that will return 401
    mockAxios.onGet('/protected-route').replyOnce(401);
    
    // Mock the token refresh
    mockAxios.onPost('http://localhost:5119/api/auth/refresh-token').replyOnce(200, {
      token: 'new-jwt-token',
      refreshToken: 'new-refresh-token',
      user: { id: 1, email: 'test@example.com', role: 'User' }
    });
    
    // Mock the retry request that should succeed with the new token
    mockAxios.onGet('/protected-route').replyOnce(200, { data: 'protected data' });
    
    // Set initial auth state
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'expired-token';
      if (key === 'refreshToken') return 'test-refresh-token';
      if (key === 'user') return JSON.stringify({ id: 1, email: 'test@example.com', role: 'User' });
      return null;
    });
    
    renderWithProviders(<App />, { route: '/dashboard' });
    
    // The app should automatically try to refresh the token and retry the request
    await waitFor(() => {
      expect(mockAxios.history.post).toHaveLength(1);
      expect(mockAxios.history.post[0].url).toBe('http://localhost:5119/api/auth/refresh-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-jwt-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
    });
  });

  test('logout clears auth state', async () => {
    // Set initial auth state
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'test-jwt-token';
      if (key === 'refreshToken') return 'test-refresh-token';
      if (key === 'user') return JSON.stringify({ id: 1, email: 'test@example.com', role: 'User' });
      return null;
    });
    
    renderWithProviders(<App />, { route: '/dashboard' });
    
    // Click logout button (you'll need to add a logout button to your UI)
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    
    // Check if auth state was cleared
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    
    // Should redirect to login page
    expect(window.location.pathname).toBe('/login');
  });
});
