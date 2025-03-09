import React from "react";
import Pagenotfound from './Pagenotfound';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';

jest.mock("./../components/Layout", () => ({ children, title }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
));


describe('Pagenotfound component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('should render the content in Pagenotfound page', () => {
        render(
            <Router>
                <Pagenotfound />
            </Router>
        )

        expect(screen.getByText('go back- page not found')).toBeInTheDocument();
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText('Oops ! Page Not Found')).toBeInTheDocument();
        expect(screen.getByText('Go Back')).toHaveAttribute('href', '/');
    });
});