import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/apiService';
import AdminHeader from '../components/admin/AdminHeader';
import AdminTabs from '../components/admin/AdminTabs';
import AdminStats from '../components/admin/AdminStats';
import RecentOrders from '../components/admin/RecentOrders';
import AdminUsers from '../components/admin/AdminUsers';
import AdminVendors from '../components/admin/AdminVendors';
import AdminRestaurants from '../components/admin/AdminRestaurants';
import AdminOrders from '../components/admin/AdminOrders';
import AdminManagers from '../components/admin/AdminManagers';
import UserModal from '../components/admin/UserModal';
import VendorModal from '../components/admin/VendorModal';
import RestaurantModal from '../components/admin/RestaurantModal';
import ManagerModal from '../components/admin/ManagerModal';
import AlertBox from '../components/admin/AlertBox';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalOrders: 0,
    totalRestaurants: 0,
    revenue: 0,
    recentOrders: [],
  });
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [managers, setManagers] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const statsResponse = await adminService.getStats();
      setStats(statsResponse.data);

      const usersResponse = await adminService.getUsers();
      setUsers(usersResponse.data);

      const vendorsResponse = await adminService.getVendors();
      setVendors(vendorsResponse.data);

      const ordersResponse = await adminService.getOrders();
      setOrders(ordersResponse.data);

      const restaurantsResponse = await adminService.getRestaurants();
      setRestaurants(restaurantsResponse.data);

      const managersResponse = await adminService.getManagers();
      setManagers(managersResponse.data.managers || []);

      setError('');
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      navigate('/login');
    } else {
      loadAdminData();
    }
  }, [user, navigate, loadAdminData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // User Management Functions
  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await adminService.deactivateUser(userId);
      loadAdminData();
      setShowUserModal(false);
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      setError('Failed to deactivate user');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminService.activateUser(userId);
      loadAdminData();
      setShowUserModal(false);
    } catch (error) {
      console.error('Failed to activate user:', error);
      setError('Failed to activate user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminService.deleteUser(userId);
      loadAdminData();
      setShowUserModal(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
      setError('Failed to delete user');
    }
  };

  // Vendor Management Functions
  const handleSuspendVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to suspend this vendor?')) return;
    try {
      await adminService.suspendVendor(vendorId);
      loadAdminData();
      setShowVendorModal(false);
    } catch (error) {
      console.error('Failed to suspend vendor:', error);
      setError('Failed to suspend vendor');
    }
  };

  const handleApproveVendor = async (vendorId) => {
    try {
      await adminService.approveVendor(vendorId);
      loadAdminData();
      setShowVendorModal(false);
    } catch (error) {
      console.error('Failed to approve vendor:', error);
      setError('Failed to approve vendor');
    }
  };

  const handleRejectVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to reject this vendor?')) return;
    try {
      await adminService.rejectVendor(vendorId);
      loadAdminData();
      setShowVendorModal(false);
    } catch (error) {
      console.error('Failed to reject vendor:', error);
      setError('Failed to reject vendor');
    }
  };

  // Restaurant Management Functions
  const handleApproveRestaurant = async (restaurantId) => {
    try {
      await adminService.approveRestaurant(restaurantId);
      loadAdminData();
      setShowRestaurantModal(false);
    } catch (error) {
      console.error('Failed to approve restaurant:', error);
      setError('Failed to approve restaurant');
    }
  };

  const handleRejectRestaurant = async (restaurantId) => {
    if (!window.confirm('Are you sure you want to reject this restaurant?')) return;
    try {
      await adminService.rejectRestaurant(restaurantId);
      loadAdminData();
      setShowRestaurantModal(false);
    } catch (error) {
      console.error('Failed to reject restaurant:', error);
      setError('Failed to reject restaurant');
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      await adminService.deleteRestaurant(restaurantId);
      loadAdminData();
      setShowRestaurantModal(false);
    } catch (error) {
      console.error('Failed to delete restaurant:', error);
      setError('Failed to delete restaurant');
    }
  };

  // Order Management Functions
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await adminService.cancelOrder(orderId);
      loadAdminData();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      setError('Failed to cancel order');
    }
  };

  // Filtered and Sorted Data Functions
  const getFilteredUsers = () => {
    let filtered = users;
    if (searchQuery) {
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(u => 
        filterStatus === 'active' ? u.isActive : !u.isActive
      );
    }
    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'email') return a.email.localeCompare(b.email);
      return 0;
    });
  };

  const getFilteredVendors = () => {
    let filtered = vendors;
    if (searchQuery) {
      filtered = filtered.filter(v => 
        v.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(v => 
        filterStatus === 'active' ? v.isActive : !v.isActive
      );
    }
    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  };

  const getFilteredRestaurants = () => {
    let filtered = restaurants;
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => 
        filterStatus === 'approved' ? r.isActive : !r.isActive
      );
    }
    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    if (searchQuery) {
      filtered = filtered.filter(o => 
        o._id?.includes(searchQuery) ||
        o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.orderStatus === filterStatus);
    }
    return filtered;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto p-6">
        <AlertBox error={error} onClose={() => setError('')} />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        )}

        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} userRole={user?.role} />

        {/* Stats Tab */}
        {activeTab === 'stats' && !loading && (
          <div>
            <AdminStats stats={stats} />
            <RecentOrders orders={stats.recentOrders} />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && !loading && (
          <AdminUsers
            users={getFilteredUsers()}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onManageClick={(usr) => {
              setSelectedUser(usr);
              setShowUserModal(true);
            }}
          />
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && !loading && (
          <AdminVendors
            vendors={getFilteredVendors()}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onViewClick={(vendor) => {
              setSelectedVendor(vendor);
              setShowVendorModal(true);
            }}
            onActionClick={(vendorId) => {
              const vendor = vendors.find(v => v._id === vendorId);
              if (vendor?.isActive) {
                handleSuspendVendor(vendorId);
              } else {
                handleApproveVendor(vendorId);
              }
            }}
          />
        )}

        {/* Restaurants Tab */}
        {activeTab === 'restaurants' && !loading && (
          <AdminRestaurants
            restaurants={getFilteredRestaurants()}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onViewClick={(restaurant) => {
              setSelectedVendor(restaurant);
              setShowRestaurantModal(true);
            }}
            onApprove={handleApproveRestaurant}
            onReject={handleRejectRestaurant}
            onDelete={handleDeleteRestaurant}
          />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && !loading && (
          <AdminOrders
            orders={getFilteredOrders()}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            onCancelClick={handleCancelOrder}
          />
        )}

        {activeTab === 'managers' && !loading && (
          <AdminManagers
            onOpenModal={(manager) => {
              setSelectedManager(manager);
              setShowManagerModal(true);
            }}
            managers={managers}
            setManagers={setManagers}
            loading={loading}
          />
        )}
      </main>

      {/* Modals */}
      <UserModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onDeactivate={handleDeactivateUser}
        onActivate={handleActivateUser}
        onDelete={handleDeleteUser}
      />
      <VendorModal
        vendor={selectedVendor}
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        onSuspend={handleSuspendVendor}
        onActivate={handleApproveVendor}
        onReject={handleRejectVendor}
      />
      <RestaurantModal
        restaurant={selectedVendor}
        isOpen={showRestaurantModal}
        onClose={() => setShowRestaurantModal(false)}
      />
      <ManagerModal
        manager={selectedManager}
        isOpen={showManagerModal}
        onClose={() => {
          setShowManagerModal(false);
          setSelectedManager(null);
        }}
        onSave={(manager) => {
          if (selectedManager) {
            setManagers(managers.map((m) => (m._id === manager._id ? manager : m)));
          } else {
            setManagers([...managers, manager]);
          }
          setShowManagerModal(false);
          setSelectedManager(null);
        }}
      />
    </div>
  );
}
