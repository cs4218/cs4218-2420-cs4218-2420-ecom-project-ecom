import React from 'react';
import { useAuth, AuthProvider } from "../context/auth";
import axios from 'axios';
import { render } from '@testing-library/react';

jest.mock('axios');

let consoleSpy;

// Mock auth context child component
const AuthContextChild = () => {
    const [auth, setAuth] = useAuth();
    
    console.log(auth);

    return <div>Test Child</div>;
}

describe('AuthProvider Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        Object.defineProperty(window, 'localStorage', {
            value: {
                setItem: jest.fn(),
                getItem: jest.fn(),
                removeItem: jest.fn(),
            },
            writable: true,
        });

        axios.defaults.headers.common = {};
    });


    afterEach(() => {
        localStorage.getItem.mockReset();
        consoleSpy.mockRestore();
    });

    it('should retrieve auth state from localStorage if valid auth information in localStorage', () => {
        localStorage.getItem.mockImplementation(() =>
            '{"user": {"_id": 1, "name": "John Doe", "email": "test@example.com", "phone": "1234567890", "address": "123 Street", "role": 0}, "token": "12345"}');
    
        render(
            <AuthProvider>
                <AuthContextChild/>
            </AuthProvider>
        );

        expect(axios.defaults.headers.common['Authorization']).toBe("12345");
        expect(localStorage.getItem).toHaveBeenCalledWith("auth");
        expect(consoleSpy).toHaveBeenCalledWith({
            user: {
                _id: 1,
                name: "John Doe",
                email: "test@example.com",
                phone: "1234567890",
                address: "123 Street",
                role: 0
            },
            token: "12345"
        });
    });

});


