import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Shield, ChevronDown } from 'lucide-react';
import '../styles/Navbar.css';

export default function Navbar({ user, onLogout, currentPage }) {
  const navigate = useNavigate();

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="navbar-content">
        <div
          className="navbar-brand"
          onClick={() => navigate('/dashboard')}
          data-testid="navbar-brand"
        >
          <Shield size={32} className="brand-icon" />
          <span className="brand-text">HealthGuard AI</span>
        </div>
        
        <div className="navbar-links">
          <button
            className={`nav-link ${currentPage === 'reports' ? 'active' : ''}`}
            onClick={() => navigate('/reports')}
            data-testid="nav-my-reports"
          >
            My Reports
          </button>
          <button
            className={`nav-link ${currentPage === 'family' ? 'active' : ''}`}
            onClick={() => navigate('/family')}
            data-testid="nav-family"
          >
            Family
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="user-dropdown" data-testid="user-dropdown">
              <span>{user?.username}</span>
              <ChevronDown size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent data-testid="dropdown-menu">
              <DropdownMenuItem
                onClick={onLogout}
                data-testid="logout-btn"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
