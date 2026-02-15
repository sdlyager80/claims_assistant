import { useState } from 'react';
import PropTypes from 'prop-types';
import './Sidebar.css';

/**
 * Modern Sidebar Component
 * Features:
 * - Collapsible design
 * - Icon support with Material Icons
 * - Grouped navigation items
 * - Badge notifications
 * - Smooth animations
 */
const Sidebar = ({ currentView, onNavigationClick, collapsed = false, onToggleCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggleCollapse?.(!isCollapsed);
  };

  const navigationGroups = [
    {
      title: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'dashboard',
          badge: null
        }
      ]
    },
    {
      title: 'Claims Management',
      items: [
        {
          id: 'intake',
          label: 'New Claim FNOL',
          icon: 'add_circle_outline',
          badge: null
        },
        {
          id: 'fnolWorkspace',
          label: 'FNOL Workspace',
          icon: 'work_outline',
          badge: null
        },
        {
          id: 'workbench',
          label: 'Claims Workbench',
          icon: 'assignment',
          badge: null
        }
      ]
    },
    {
      title: 'Review & Process',
      items: [
        {
          id: 'pendingReview',
          label: 'Pending Review',
          icon: 'pending_actions',
          badge: 5
        },
        {
          id: 'requirementsReceived',
          label: 'Requirements',
          icon: 'mail_outline',
          badge: 3
        }
      ]
    },
    {
      title: 'Reports',
      items: [
        {
          id: 'reports',
          label: 'Analytics',
          icon: 'analytics',
          badge: null
        },
        {
          id: 'queue',
          label: 'Queue Management',
          icon: 'view_list',
          badge: null
        }
      ]
    }
  ];

  return (
    <aside className={`modern-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          {!isCollapsed && (
            <>
              <div className="brand-icon">
                <img src="/Bloom_logo.jpg" alt="Bloom Insurance" />
              </div>
              <span className="brand-text">Bloom Claims</span>
            </>
          )}
          {isCollapsed && (
            <div className="brand-icon-collapsed">
              <img src="/Bloom_logo.jpg" alt="Bloom Insurance" />
            </div>
          )}
        </div>
        <button
          className="collapse-toggle"
          onClick={handleToggle}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-icons">
            {isCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="sidebar-nav">
        {navigationGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="nav-group">
            {!isCollapsed && (
              <div className="nav-group-title">{group.title}</div>
            )}
            {isCollapsed && groupIndex > 0 && (
              <div className="nav-divider"></div>
            )}
            <ul className="nav-items">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                    onClick={() => onNavigationClick(item.id)}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span className="nav-icon material-icons">{item.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span className="nav-label">{item.label}</span>
                        {item.badge !== null && item.badge > 0 && (
                          <span className="nav-badge">{item.badge}</span>
                        )}
                      </>
                    )}
                    {isCollapsed && item.badge !== null && item.badge > 0 && (
                      <span className="nav-badge-dot"></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button
          className="footer-item"
          onClick={() => onNavigationClick('settings')}
          title={isCollapsed ? 'Settings' : ''}
        >
          <span className="material-icons">settings</span>
          {!isCollapsed && <span>Settings</span>}
        </button>
        <button
          className="footer-item"
          onClick={() => onNavigationClick('help')}
          title={isCollapsed ? 'Help' : ''}
        >
          <span className="material-icons">help_outline</span>
          {!isCollapsed && <span>Help</span>}
        </button>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  currentView: PropTypes.string.isRequired,
  onNavigationClick: PropTypes.func.isRequired,
  collapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func
};

export default Sidebar;
