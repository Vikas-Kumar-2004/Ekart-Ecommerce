import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';

const ErrorPage = () => {
    const error = useRouteError();
    console.error("Router Error Caught:", error);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Oops! Something went wrong.</h1>
                <p className="text-lg text-gray-600 mb-8">
                    {error?.statusText || error?.message || "An unexpected error occurred."}
                </p>
                <div className="flex gap-4">
                    <Button asChild>
                        <Link to="/">Return to Home</Link>
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Refresh Page
                    </Button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ErrorPage;
