import React from 'react';
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect information you provide directly to us when you create an account, use our services, or communicate with us.</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to provide, maintain, and improve our services, as well as to communicate with you.</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">3. Information Sharing and Disclosure</h2>
          <p className="mb-4">We do not share your personal information with third parties except as described in this policy.</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">4. Data Security</h2>
          <p className="mb-4">We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">5. Changes to This Policy</h2>
          <p className="mb-4">We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.</p>
          
          <div className="mt-8">
            <Link to="/" className="text-caribbean-green hover:underline">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;