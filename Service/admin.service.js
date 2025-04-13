import AdminRepository from '../Repository/admin.repository.js';

const AdminService = {
  getAllAdmins: async () => {
    return await AdminRepository.getAll();
  },

  getAllChefs: async () => {
    return await AdminRepository.getAllChef();
  },

  getAdminById: async (adminId) => {
    return await AdminRepository.getById(adminId);
  },

  createAdmin: async (data) => {
    const role = data.Role;
    const count = await AdminRepository.getCountByRole(role);
    const adminId = `${role}-${count + 1}`;

    const newAdmin = {
      'Admin Id': adminId,
      'Admin Name': data['Admin Name'],
      'Contact Number': data['Contact Number'],
      'Email': data.Email,
      'Password': data.Password,
      'Role': data.Role,
      'Images': JSON.stringify(data.Images || [])
    };

    await AdminRepository.create(newAdmin);
    return adminId;
  },

  updateAdmin: async (adminId, data) => {
    if (data.Images) {
      data.Images = JSON.stringify(data.Images);
    }
    return await AdminRepository.update(adminId, data);
  },

  deleteAdmin: async (adminId) => {
    return await AdminRepository.remove(adminId);
  },

  loginAdmin: async (email, password) => {
    const admin = await AdminRepository.findByEmail(email);
    if (!admin || admin.Password !== password) {
      return null;
    }
    return admin;
  }
};

export default AdminService;