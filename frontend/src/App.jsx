import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import LiveMonitoringPage from './pages/LiveMonitoringPage';
import VibrationAnalysisPage from './pages/VibrationAnalysisPage';
import HistoricalDataPage from './pages/HistoricalDataPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import SensorConfigPage from './pages/SensorConfigPage';
import DeviceConnectionPage from './pages/DeviceConnectionPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'live':
        return <LiveMonitoringPage setActiveTab={setActiveTab} />;
      case 'analysis':
        return <VibrationAnalysisPage />;
      case 'history':
        return <HistoricalDataPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'sensor-config':
        return <SensorConfigPage />;
      case 'device':
        return <DeviceConnectionPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <DataProvider>
      <div className="flex min-h-screen bg-industrial-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
        {/* Fixed Left Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onOpenDeviceModal={() => setActiveTab('device')} />

          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            {renderActivePage()}
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
