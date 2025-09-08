// src/components/AdminSidebar.js
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import RoleBasedRender from './RoleBasedRender';

function AdminSidebar() {
  const location = useLocation();
  
  return (
    <div className="sidebar">
      <Nav className="flex-column">
        <RoleBasedRender allowedRoles={['Admin']}>
          <Nav.Link 
            as={Link} 
            to="/admin/dashboard" 
            active={location.pathname === '/admin/dashboard'}
          >
            Dashboard
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/admin/users" 
            active={location.pathname === '/admin/users'}
          >
            Manage Users
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/admin/all-products" 
            active={location.pathname === '/admin/all-products'}
          >
            Manage Products
          </Nav.Link>
        </RoleBasedRender>
        
        <RoleBasedRender allowedRoles={['User', 'Admin']}>
          <Nav.Link 
            as={Link} 
            to="/dashboard" 
            active={location.pathname === '/dashboard'}
          >
            My Dashboard
          </Nav.Link>
        </RoleBasedRender>
      </Nav>
    </div>
  );
}

export default AdminSidebar;