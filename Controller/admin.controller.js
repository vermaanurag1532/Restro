import AdminService from '../Service/admin.service.js';

const AdminController = {
  getAdminsByRestaurant: async (req, res) => {
    try {
      const admins = await AdminService.getAdminsByRestaurant(req.params.restaurantId);
      res.json(admins);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
  getChefsByRestaurant: async (req, res) => {
    try {
      const chefs = await AdminService.getChefsByRestaurant(req.params.restaurantId);
      res.json(chefs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
  getAdminById: async (req, res) => {
    try {
      const admin = await AdminService.getAdminById(req.params.restaurantId, req.params.adminId);
      if (!admin) return res.status(404).json({ message: 'Admin not found' });
      res.json(admin);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
  createAdmin: async (req, res) => {
    try {
      const adminId = await AdminService.createAdmin(req.params.restaurantId, req.body);
      res.status(201).json({ message: 'Admin created', adminId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
  updateAdmin: async (req, res) => {
    try {
      await AdminService.updateAdmin(req.params.restaurantId, req.params.adminId, req.body);
      res.json({ message: 'Admin updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
  deleteAdmin: async (req, res) => {
    try {
      await AdminService.deleteAdmin(req.params.restaurantId, req.params.adminId);
      res.json({ message: 'Admin deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
  loginAdmin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const restaurantId = req.params.restaurantId;
  
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
  
      const admin = await AdminService.loginAdmin(restaurantId, email, password);
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      res.json({
        message: 'Login successful',
        admin: {
          'Admin Id': admin['Admin Id'],
          'Admin Name': admin['Admin Name'],
          'Role': admin.Role
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }  
};

export default AdminController;