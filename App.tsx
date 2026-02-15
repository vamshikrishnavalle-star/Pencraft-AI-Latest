import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { Features } from './components/Features';
import { Pricing } from './components/Pricing';
import { About } from './components/About';
import { NewsletterGenerator } from './components/NewsletterGenerator';
import { PresentationStudio } from './components/PresentationStudio';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');

  const navigateToDashboard = () => setCurrentView('dashboard');
  const navigateToNewsletter = () => setCurrentView('newsletter');
  const navigateToPresentation = () => setCurrentView('presentation');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Hero onStart={navigateToDashboard} onNewsletter={navigateToNewsletter} onPresentation={navigateToPresentation} />;
      case 'features':
        return <Features onStart={navigateToDashboard} />;
      case 'pricing':
        return <Pricing onStart={navigateToDashboard} />;
      case 'about':
        return <About onStart={navigateToDashboard} />;
      case 'dashboard':
        return <Dashboard />;
      case 'newsletter':
        return <NewsletterGenerator />;
      case 'presentation':
        return <PresentationStudio />;
      default:
        return <Hero onStart={navigateToDashboard} onNewsletter={navigateToNewsletter} onPresentation={navigateToPresentation} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;