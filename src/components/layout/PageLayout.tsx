
import React, { useState } from 'react';
import Navbar from './Navbar';
import FloatingChatbot from '../chatbot/FloatingChatbot';

interface PageLayoutProps {
  children: React.ReactNode;
  userRole?: "patient" | "doctor" | "admin" | null;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  userRole = null,
  className = ""
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleNavbarScroll = (scrolled: boolean) => {
    setIsScrolled(scrolled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 my-0">
      <Navbar userRole={userRole} onScrollChange={handleNavbarScroll} />
      <div className={`${isScrolled ? 'page-content-scrolled' : 'page-content'} ${className}`}>
        {children}
      </div>
      <FloatingChatbot />
    </div>
  );
};

export default PageLayout;
