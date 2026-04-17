/**
 * Shared test wrapper & navigation mock used by all screen tests.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthContext } from '../src/context/AuthContext';

/** Default mock auth values – override per test as needed */
export const mockAuthValue = {
  user: { email: 'testuser' },
  loading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
};

/** Minimal navigation prop mock */
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn(),
};

/** Renders a component wrapped in AuthContext with mocked values */
export function renderWithAuth(ui, { authValue = mockAuthValue } = {}) {
  return render(
    <AuthContext.Provider value={authValue}>{ui}</AuthContext.Provider>
  );
}
