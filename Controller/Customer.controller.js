import customerService from '../Service/Customer.service.js';

class CustomerController {
    async getAllCustomers(req, res) {
        try {
            const customers = await customerService.getAllCustomers();
            res.json(customers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getCustomerById(req, res) {
        try {
            const customer = await customerService.getCustomerById(req.params.id);
            res.json(customer);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async addCustomer(req, res) {
        try {
            const newCustomer = await customerService.addCustomer(req.body);
            res.status(201).json(newCustomer);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateCustomer(req, res) {
        try {
            const updatedCustomer = await customerService.updateCustomer(req.params.id, req.body);
            res.json(updatedCustomer);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteCustomer(req, res) {
        try {
            const success = await customerService.deleteCustomer(req.params.id);
            if (success) {
                res.json({ message: 'Customer deleted successfully' });
            } else {
                res.status(404).json({ message: 'Customer not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            // First validate the request body exists
            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({ message: 'Invalid request body' });
            }

            const { email, password } = req.body;
            
            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const customer = await customerService.login(email, password);
            res.json(customer);
        } catch (error) {
            // Handle specific JSON parse errors
            if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
                return res.status(400).json({ message: 'Invalid JSON format in request body' });
            }
            res.status(401).json({ message: error.message });
        }
    }
}

export default new CustomerController();