import AdminRepository from '../Repository/admin.repository.js';

const AdminService = {
  getAdminsByRestaurant: async (restaurantId) => {
    return await AdminRepository.getAllByRestaurant(restaurantId);
  },
  
  getChefsByRestaurant: async (restaurantId) => {
    return await AdminRepository.getAllChefsByRestaurant(restaurantId);
  },
  
  getAdminById: async (restaurantId, adminId) => {
    return await AdminRepository.getById(restaurantId, adminId);
  },
  
  createAdmin: async (restaurantId, data) => {
    const role = data.Role;
    const count = await AdminRepository.getCountByRole(restaurantId, role);
    const adminId = `${role}-${count + 1}`;
  
    const newAdmin = {
      'Admin Id': adminId,
      'Admin Name': data['Admin Name'],
      'Contact Number': data['Contact Number'],
      'Email': data.Email,
      'Password': data.Password,
      'Role': data.Role,
      'Images': JSON.stringify(data.Images || []),
      'Restaurant Id': restaurantId
    };
  
    await AdminRepository.create(newAdmin);
    return adminId;
  },
  
  updateAdmin: async (restaurantId, adminId, data) => {
    if (data.Images) {
      data.Images = JSON.stringify(data.Images);
    }
    return await AdminRepository.update(restaurantId, adminId, data);
  },
  
  deleteAdmin: async (restaurantId, adminId) => {
    return await AdminRepository.remove(restaurantId, adminId);
  },
  
  loginAdmin: async (restaurantId, email, password) => {
    const admin = await AdminRepository.findByEmailAndRestaurant(restaurantId, email);
    if (!admin || admin.Password !== password) {
      return null;
    }
    return admin;
  }  
};

export default AdminService;