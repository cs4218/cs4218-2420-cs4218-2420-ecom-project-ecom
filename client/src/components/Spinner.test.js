import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Spinner from './Spinner';
import '@testing-library/jest-dom/extend-expect';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/mock-path' }),
}));

const advanceTimers = (ms) => {
    act(() => jest.advanceTimersByTime(ms))
};

describe('Spinner Component', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('should render spinner and redirect to login after 3s', () => {
        render(<Spinner/>);

        expect(screen.getByText('redirecting to you in 3 second')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        advanceTimers(1000);

        expect(screen.getByText('redirecting to you in 2 second')).toBeInTheDocument();
        advanceTimers(1000);

        expect(screen.getByText('redirecting to you in 1 second')).toBeInTheDocument();
        advanceTimers(1000);

        expect(screen.getByText('redirecting to you in 0 second')).toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/login', {state: '/mock-path'});
    })
});