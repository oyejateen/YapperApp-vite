import React from 'react';
import { Link } from 'react-router-dom';

function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">By accessing or using YapperApp, you agree to be bound by these Terms of Service.</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">2. User Accounts</h2>
          <p className="mb-4">You are responsible for maintaining the confidentiality of your account and password.</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">3. User Content</h2>
          <p className="mb-4">You retain ownership of the content you post on YapperApp, but grant us a license to use, store, and share your content.</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">4. Prohibited Conduct</h2>
          <p className="mb-4">You agree not to engage in any unlawful or harmful activities while using YapperApp.</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">5. Termination</h2>
          <p className="mb-4">We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service.</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">6. Changes to Terms</h2>
          <p className="mb-4">We may revise these Terms of Service from time to time. The most current version will always be posted on this page.</p>
          
          <div className="mt-8">
            <Link to="/" className="text-caribbean-green hover:underline">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;