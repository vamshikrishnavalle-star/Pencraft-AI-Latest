import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: View) => void;
  currentView: View;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, currentView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll Observer for Reveal Animations & Navbar state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { 
      threshold: 0.1, 
      rootMargin: '0px 0px -50px 0px' 
    });

    // Observe elements after a brief delay to ensure DOM is ready
    const timeout = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [currentView]);

  const handleNav = (view: View) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const NavLink = ({ view, label }: { view: View; label: string }) => (
    <button 
      onClick={() => handleNav(view)}
      className={`group relative py-1 text-base font-semibold tracking-wide transition-colors duration-500 ease-out ${
        currentView === view ? 'text-primary' : 'text-secondary hover:text-primary'
      }`}
    >
      {label}
      <span className={`absolute bottom-0 left-0 h-px bg-primary transition-all duration-500 ease-out-quart ${
        currentView === view ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-50'
      }`} />
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col font-serif bg-cream text-primary selection:bg-primary selection:text-white">
      {/* Header */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-700 ease-out-quart border-b ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-md border-gray-100/50 py-3 shadow-sm' 
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 md:h-14">
            {/* Logo - Click to go Home */}
            <button onClick={() => handleNav('home')} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ease-out group-hover:shadow-md bg-black border-gray-800 group-hover:scale-[1.02]">
                <span className="font-serif font-bold text-xl translate-y-[1px] bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-100 to-amber-500">P</span>
              </div>
              <span className={`font-serif font-bold text-xl tracking-tight transition-colors duration-300 ${scrolled ? 'text-primary' : 'text-primary'}`}>
                PenCraft AI
              </span>
            </button>
            
            <nav className="hidden md:flex items-center gap-8">
              <NavLink view="home" label="Home" />
              <NavLink view="features" label="Features" />
              <NavLink view="pricing" label="Pricing" />
              <NavLink view="newsletter" label="Your Newsletter Agent" />
              <NavLink view="presentation" label="Presentation Studio" />
              {/* Get Started Button */}
              <button 
                onClick={() => handleNav('dashboard')}
                className="ml-2 bg-primary text-white px-6 py-2.5 rounded-full text-base font-bold hover:bg-gray-800 transition-all duration-300 hover:scale-[1.05] active:scale-[0.98] shadow-md"
              >
                Get Started
              </button>
            </nav>

            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-primary">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl animate-fade-in">
            <div className="px-4 py-8 flex flex-col items-center gap-6">
              <NavLink view="home" label="Home" />
              <NavLink view="features" label="Features" />
              <NavLink view="pricing" label="Pricing" />
              <NavLink view="newsletter" label="Your Newsletter Agent" />
              <NavLink view="presentation" label="Presentation Studio" />
              <button 
                onClick={() => {
                  handleNav('dashboard');
                }}
                className="bg-primary text-white px-8 py-3 rounded-full text-lg font-bold hover:bg-gray-800 transition-all duration-300 hover:scale-[1.05] active:scale-[0.98] shadow-md w-full"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
               <button onClick={() => handleNav('home')} className="flex items-center gap-2 mb-6 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black text-white group-hover:scale-105 transition-transform">
                  <span className="font-serif font-bold text-lg translate-y-[1px]">P</span>
                </div>
                <span className="font-serif font-bold text-lg tracking-tight">PenCraft AI</span>
              </button>
              <p className="text-secondary text-base leading-relaxed mb-6">
                Your personal AI agent that thinks, writes, and speaks like you.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg text-primary mb-6">Product</h4>
              <ul className="space-y-4 text-base text-secondary">
                <li><button onClick={() => handleNav('features')} className="hover:text-primary transition-colors">Features</button></li>
                <li><button onClick={() => handleNav('pricing')} className="hover:text-primary transition-colors">Pricing</button></li>
                <li><button onClick={() => handleNav('dashboard')} className="hover:text-primary transition-colors">PenCraft Agent</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg text-primary mb-6">Company</h4>
              <ul className="space-y-4 text-base text-secondary">
                <li><button onClick={() => handleNav('about')} className="hover:text-primary transition-colors">About Us</button></li>
                <li><button className="hover:text-primary transition-colors">Careers</button></li>
                <li><button className="hover:text-primary transition-colors">Blog</button></li>
                <li><button className="hover:text-primary transition-colors">Contact</button></li>
              </ul>
            </div>

             <div>
              <h4 className="font-bold text-lg text-primary mb-6">Legal</h4>
              <ul className="space-y-4 text-base text-secondary">
                <li><button className="hover:text-primary transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-primary transition-colors">Terms of Service</button></li>
                <li><button className="hover:text-primary transition-colors">Cookie Policy</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} PenCraft AI. All rights reserved.</p>
            <p>Designed for creators, by creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};