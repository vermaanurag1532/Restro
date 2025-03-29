import customerRepository from '../Repository/Customer.repository.js';

class CustomerService {
    async getAllCustomers() {
        return await customerRepository.getAllCustomers();
    }

    async getCustomerById(customerId) {
        const customer = await customerRepository.getCustomerById(customerId);
        if (!customer) throw new Error('Customer not found');
        return customer;
    }

    async addCustomer(customerData) {
        // Validate required fields
        if (!customerData.Email || !customerData.Password) {
            throw new Error('Email and password are required');
        }

        // Check if email already exists
        const existingCustomer = await customerRepository.getCustomerByEmail(customerData.Email);
        if (existingCustomer) {
            throw new Error('Email already in use');
        }

        return await customerRepository.addCustomer(customerData);
    }

    async updateCustomer(customerId, customerData) {
        await this.getCustomerById(customerId); // Verify customer exists
        return await customerRepository.updateCustomer(customerId, customerData);
    }

    async deleteCustomer(customerId) {
        await this.getCustomerById(customerId); // Verify customer exists
        return await customerRepository.deleteCustomer(customerId);
    }

    async login(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
        
        const customer = await customerRepository.verifyCustomer(email, password);
        if (!customer) {
            throw new Error('Invalid email or password');
        }
        
        return customer;
    }
}

export default new CustomerService();