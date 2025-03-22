
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Users, PlusCircle } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="h-4 w-4 mr-2" /> },
    { name: 'New Lead', path: '/capture', icon: <PlusCircle className="h-4 w-4 mr-2" /> },
    { name: 'Leads', path: '/leads', icon: <Users className="h-4 w-4 mr-2" /> },
  ];

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4',
        scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="container-custom flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2"
        >
          <div className="relative w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="absolute w-5 h-5 bg-primary rounded-md transform rotate-45" />
          </div>
          <span className="font-semibold text-lg tracking-tight">RealLeads</span>
        </Link>
        
        <nav className="hidden md:flex">
          <ul className="flex items-center space-x-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={cn(
                    'px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors',
                    location.pathname === link.path 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-secondary text-foreground/80 hover:text-foreground'
                  )}
                >
                  {link.icon}
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="md:hidden">
          {/* Mobile menu button - simplified for this version */}
          <button className="p-2 rounded-md hover:bg-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
