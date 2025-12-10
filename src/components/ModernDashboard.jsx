import React, { useState } from "react";
import { useTheme } from "../store/ThemeContext";
import { useMusic } from "../store/MusicContext";
import { GlassPanel } from "./GlassCard";
import { EnhancedLibrary } from "./EnhancedLibrary";
import { SmartPlaylists } from "./SmartPlaylists";
import { DuplicateManager } from "./DuplicateManager";
import { ThemeSelector } from "./ThemeSelector";
import { OverviewView } from "./OverviewView";
import { MiniNowPlaying } from "./MiniNowPlaying";

export const ModernDashboard = () => {
  const { theme } = useTheme();
  const { tracks, onlineTracks, playlists, currentTrack } = useMusic();
  const allTracks = [...tracks, ...onlineTracks];
  const [activeView, setActiveView] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigationItems = [
    { id: 'overview', name: 'Overview', icon: 'home' },
    { id: 'library', name: 'Library', icon: 'music' },
    { id: 'playlists', name: 'Smart Playlists', icon: 'playlist' },
    { id: 'duplicates', name: 'Duplicates', icon: 'duplicate' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      home: (
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm5.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L10.586 10 8.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
      ),
      music: (
        <path fillRule="evenodd" d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v6a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z" clipRule="evenodd" />
      ),
      playlist: (
        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
      ),
      duplicate: (
        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h4v8H4V4zm8-2a2 2 0 00-2 2v8a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2h-4zm0 2h4v8h-4V4z" clipRule="evenodd" />
      ),
    };
    return icons[iconName] || icons.home;
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView />;
      case 'library':
        return <EnhancedLibrary />;
      case 'playlists':
        return <SmartPlaylists />;
      case 'duplicates':
        return <DuplicateManager />;
      default:
        return <OverviewView />;
    }
  };

  const getViewDescription = (view) => {
    const descriptions = {
      overview: 'Your music at a glance',
      library: 'Browse and manage your music collection',
      playlists: 'Automatically generated playlists based on your music',
      duplicates: 'Find and manage duplicate tracks in your library',
    };
    return descriptions[view] || '';
  };

  return (
    <div
      className="h-screen transition-colors duration-300 overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-main)' }}
    >
      {/* Draggable top bar - full width navbar region */}
      <div className="fixed top-0 left-0 right-0 h-12 z-40">
        <div className="draggable h-full w-full bg-transparent" />
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Mobile Overlay */}
        {!sidebarCollapsed && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        {/* Mobile Header */}
        <div
          className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b backdrop-blur-lg"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center justify-between h-full px-4">
            {/* Draggable area for mobile */}
            <div className="draggable flex-1 h-full flex items-center">
              <h1
                className="text-lg font-bold non-draggable"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Music Player
              </h1>
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg transition-all duration-200 hover:opacity-80 non-draggable clickable"
              style={{
                backgroundColor: 'var(--color-bg-hover)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`
          ${sidebarCollapsed ? 'w-16' : 'w-64'} 
          ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
          transition-all duration-300 
          flex-shrink-0 non-draggable
          fixed lg:relative
          top-16 lg:top-0
          left-0
          h-[calc(100vh-4rem)] lg:h-screen
          z-40 lg:z-auto
          ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        `}>
          <GlassPanel className={`
            h-full sticky top-0 
            ${sidebarCollapsed ? 'p-2' : 'p-4 lg:p-6'} 
            rounded-none lg:rounded-r-2xl non-draggable
            overflow-y-auto
          `}>
            {/* Header - Desktop Only */}
            <div className="hidden lg:flex items-center justify-between mb-8 pt-12">
              {!sidebarCollapsed && (
                <h1
                  className="text-xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Music Player
                </h1>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg transition-all duration-200 hover:opacity-80 non-draggable clickable"
                style={{
                  backgroundColor: 'var(--color-bg-hover)',
                  color: 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--color-text-secondary)';
                }}
              >
                <svg className={`w-5 h-5 transform transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden mb-6 pt-4">
              <div className="flex items-center justify-between">
                <h1
                  className="text-lg font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Menu
                </h1>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-2 rounded-lg transition-all duration-200 hover:opacity-80 non-draggable clickable"
                  style={{
                    backgroundColor: 'var(--color-bg-hover)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 mb-8">
              {navigationItems.map((item) => (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => setActiveView(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left non-draggable clickable relative overflow-hidden"
                    style={{
                      backgroundColor: activeView === item.id ? 'var(--color-primary-main)' : 'transparent',
                      color: activeView === item.id ? 'white' : 'var(--color-text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      if (activeView !== item.id) {
                        e.target.style.backgroundColor = 'var(--color-bg-hover)';
                        e.target.style.color = 'var(--color-text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeView !== item.id) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = 'var(--color-text-secondary)';
                      }
                    }}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    {/* Active indicator */}
                    {activeView === item.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                    )}

                    <svg className="w-5 h-5 flex-shrink-0 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                      {getIcon(item.icon)}
                    </svg>
                    {!sidebarCollapsed && (
                      <span className="font-medium relative z-10">{item.name}</span>
                    )}

                    {/* Glow effect for active item */}
                    {activeView === item.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-20" />
                    )}
                  </button>

                  {/* Side indicator for collapsed sidebar */}
                  {sidebarCollapsed && activeView === item.id && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              ))}
            </nav>

            {/* Theme Selector */}
            {!sidebarCollapsed && (
              <div className="mb-8">
                <h3
                  className="text-sm font-medium mb-3"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Theme
                </h3>
                <ThemeSelector />
              </div>
            )}

            {/* Stats */}
            {!sidebarCollapsed && (
              <div className="space-y-4">
                <h3
                  className="text-sm font-medium mb-3"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Library Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Tracks</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {allTracks.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Playlists</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {Object.keys(playlists.custom).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Favorites</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {playlists.favorites.length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </GlassPanel>
        </div>

        {/* Main Content */}
        <div className="flex-1 h-screen non-draggable overflow-y-auto lg:ml-0">
          <div className="p-4 lg:p-6 space-y-6 pt-20 lg:pt-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2
                  className="text-xl lg:text-2xl font-bold capitalize"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {activeView}
                </h2>
                <p
                  className="text-sm lg:text-base mt-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {getViewDescription(activeView)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(sidebarCollapsed || window.innerWidth < 1024) && (
                  <div className="non-draggable clickable">
                    <ThemeSelector />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="animate-fade-in">
              {renderActiveView()}
            </div>
          </div>
        </div>
      </div>

      {/* Now Playing Bar (Fixed at bottom) */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-2 lg:p-4">
          <MiniNowPlaying />
        </div>
      )}
    </div>
  );
};

export default ModernDashboard;