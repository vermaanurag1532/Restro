import customerService from '../Service/Customer.service.js';

class CustomerController {
    async getAllCustomers(req, res) {
        try {
            const { restaurantId } = req.params;
            const customers = await customerService.getAllCustomers(restaurantId);
            res.json(customers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getCustomerById(req, res) {
        try {
            const { restaurantId, id } = req.params;
            const customer = await customerService.getCustomerById(restaurantId, id);
            res.json(customer);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async addCustomer(req, res) {
        try {
            const { restaurantId } = req.params;
            const newCustomer = await customerService.addCustomer(restaurantId, req.body);
            res.status(201).json(newCustomer);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateCustomer(req, res) {
        try {
            const { restaurantId, id } = req.params;
            const updatedCustomer = await customerService.updateCustomer(restaurantId, id, req.body);
            res.json(updatedCustomer);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteCustomer(req, res) {
        try {
            const { restaurantId, id } = req.params;
            const success = await customerService.deleteCustomer(restaurantId, id);
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
            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({ message: 'Invalid request body' });
            }

            const { restaurantId } = req.params;
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const customer = await customerService.login(restaurantId, email, password);
            res.json(customer);
        } catch (error) {
            if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
                return res.status(400).json({ message: 'Invalid JSON format in request body' });
            }
            res.status(401).json({ message: error.message });
        }
    }
}

export default new CustomerController();
