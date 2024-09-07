import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

function About() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
        <h1 className="text-3xl font-bold mb-6 text-caribbean-green">About YapperApp</h1>
        <p className="mb-4">
          YapperApp is a community engagement platform designed to connect people with shared interests and foster meaningful discussions.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">Our Mission</h2>
        <p className="mb-4">
          Our mission is to provide a safe and inclusive space for users to express themselves, share ideas, and build communities around topics they're passionate about.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">Key Features</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Create and join communities</li>
          <li>Engage in discussions through posts and comments</li>
          <li>Option for anonymous posting</li>
          <li>User-friendly interface</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-6 mb-4">Get Started</h2>
        <p className="mb-4">
          Ready to join the conversation? Sign up now and start exploring communities that match your interests!
        </p>
        <Link to="/signup" className="bg-caribbean-green text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition duration-300">
          Sign Up Now
        </Link>
      </div>
    </div>
  );
}

export default About;