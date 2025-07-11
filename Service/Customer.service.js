import customerRepository from '../Repository/Customer.repository.js';

class CustomerService {
    async getAllCustomers(restaurantId) {
        return await customerRepository.getAllCustomers(restaurantId);
    }

    async getCustomerById(restaurantId, customerId) {
        const customer = await customerRepository.getCustomerById(restaurantId, customerId);
        if (!customer) throw new Error('Customer not found');
        return customer;
    }

    async addCustomer(restaurantId, customerData) {
        if (!customerData.Email || !customerData.Password) {
            throw new Error('Email and password are required');
        }

        // Check if email already exists for this restaurant
        const existingCustomer = await customerRepository.getCustomerByEmail(restaurantId, customerData.Email);
        if (existingCustomer) {
            throw new Error('Email already in use');
        }

        return await customerRepository.addCustomer(restaurantId, customerData);
    }

    async updateCustomer(restaurantId, customerId, customerData) {
        await this.getCustomerById(restaurantId, customerId);
        return await customerRepository.updateCustomer(restaurantId, customerId, customerData);
    }

    async deleteCustomer(restaurantId, customerId) {
        await this.getCustomerById(restaurantId, customerId);
        return await customerRepository.deleteCustomer(restaurantId, customerId);
    }

    async login(restaurantId, email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const customer = await customerRepository.verifyCustomer(restaurantId, email, password);
        if (!customer) {
            throw new Error('Invalid email or password');
        }
        return customer;
    }
}

export default new CustomerService();
