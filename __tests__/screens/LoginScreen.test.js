import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import { renderWithAuth, mockNavigation } from '../test-utils';

describe('LoginScreen', () => {
  it('renders the welcome heading', () => {
    const { getByText } = renderWithAuth(
      <LoginScreen navigation={mockNavigation} />
    );
    expect(getByText('WELCOME BACK')).toBeTruthy();
  });

  it('renders email and password inputs', () => {
    const { getByPlaceholderText } = renderWithAuth(
      <LoginScreen navigation={mockNavigation} />
    );
    expect(getByPlaceholderText('nexus@grid.com')).toBeTruthy();
    expect(getByPlaceholderText('••••••••')).toBeTruthy();
  });

  it('renders the login button', () => {
    const { getByText } = renderWithAuth(
      <LoginScreen navigation={mockNavigation} />
    );
    expect(getByText('ENTER THE GRID')).toBeTruthy();
  });

  it('calls signIn when login button is pressed with a non-empty email', () => {
    const signIn = jest.fn();
    const { getByPlaceholderText, getByText } = renderWithAuth(
      <LoginScreen navigation={mockNavigation} />,
      { authValue: { user: null, loading: false, signIn, signOut: jest.fn() } }
    );
    fireEvent.changeText(getByPlaceholderText('nexus@grid.com'), 'test@example.com');
    fireEvent.press(getByText('ENTER THE GRID'));
    expect(signIn).toHaveBeenCalledWith('test@example.com');
  });

  it('does not call signIn when email is empty', () => {
    const signIn = jest.fn();
    const { getByText } = renderWithAuth(
      <LoginScreen navigation={mockNavigation} />,
      { authValue: { user: null, loading: false, signIn, signOut: jest.fn() } }
    );
    fireEvent.press(getByText('ENTER THE GRID'));
    expect(signIn).not.toHaveBeenCalled();
  });

  it('renders social login options', () => {
    const { getByText } = renderWithAuth(
      <LoginScreen navigation={mockNavigation} />
    );
    expect(getByText('GOOGLE')).toBeTruthy();
    expect(getByText('APPLE')).toBeTruthy();
  });
});
