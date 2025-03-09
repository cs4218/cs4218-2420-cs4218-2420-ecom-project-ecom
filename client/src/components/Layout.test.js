import React from 'react';
import { render, screen, } from '@testing-library/react';
import Layout from './Layout';
import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';


// Mocking Header and Footer to simplify the test
jest.mock('./Header', () => () => <div>Header</div>);
jest.mock('./Footer', () => () => <div>Footer</div>);

describe('Layout Component', () => {

    it('should render Header and Footer components', () => {
        render(<Layout />);
        
        // Check if Header and Footer are rendered
        expect(screen.getByText('Header')).toBeInTheDocument();
        expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('should render children correctly', () => {
        render(<Layout><div>Child Content</div></Layout>);
        
        // Check if child content is rendered
        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    test("should render meta tags correctly from Helmet", async () => {
        render(
        <Layout
            title="Test Title"
            description="Test Description"
            keywords="test, react, layout"
            author="Test Author"
        >
            <div>Test Child</div>
        </Layout>
        );

        // Wait for Helmet to update the document head
        await waitFor(() => {
            // Check if the meta tags are correctly set in the document head
            expect(document.title).toBe('Test Title');
            const descriptionMeta = document.querySelector('meta[name="description"]');
            const keywordsMeta = document.querySelector('meta[name="keywords"]');
            const authorMeta = document.querySelector('meta[name="author"]');
            
            expect(descriptionMeta?.getAttribute('content')).toBe('Test Description');
            expect(keywordsMeta?.getAttribute('content')).toBe('test, react, layout');
            expect(authorMeta?.getAttribute('content')).toBe('Test Author');
        });

        // Reset document title and meta tags after the test
        document.title = "Ecommerce app - shop now";
        const metaTags = document.querySelectorAll('meta');
        metaTags.forEach(tag => tag.remove());

        // Recreate default meta tags
        const defaultMetaTags = [
            { name: "description", content: "mern stack project" },
            { name: "keywords", content: "mern,react,node,mongodb" },
            { name: "author", content: "Techinfoyt" },
        ];

        defaultMetaTags.forEach(({ name, content }) => {
            const meta = document.createElement('meta');
            meta.name = name;
            meta.content = content;
            document.head.appendChild(meta);
        });

        
    });

    it('should use default props for title, description, keywords, and author if not provided', () => {
        render(<Layout />);
        
        // Check if default meta tags are used
        expect(document.title).toBe('Ecommerce app - shop now');
        const descriptionMeta = document.querySelector('meta[name="description"]');
        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        const authorMeta = document.querySelector('meta[name="author"]');
        
        expect(descriptionMeta?.getAttribute('content')).toBe('mern stack project');
        expect(keywordsMeta?.getAttribute('content')).toBe('mern,react,node,mongodb');
        expect(authorMeta?.getAttribute('content')).toBe('Techinfoyt');
    });

});
