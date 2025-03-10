import React from 'react';
import Footer from "./Footer";
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

describe('Footer component', () => {
    it('should render the content in the Footer', () => {
        render(
            <Router>
                <Footer />
            </Router>
        );

        expect(screen.getByText('All Rights Reserved © TestingComp')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
        expect(screen.getByText('About')).toHaveAttribute('href', '/about');
        expect(screen.getByText('Contact')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toHaveAttribute('href', '/contact');
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
        expect(screen.getByText('Privacy Policy')).toHaveAttribute('href', '/policy');
    });
});