import connection from '../Connection/Connection.js';
import bcrypt from 'bcrypt';

class CustomerRepository {
    async getNextCustomerId() {
        try {
            const query = 'SELECT `Customer Id` FROM Customer ORDER BY `Customer Id` DESC LIMIT 1';
            const [rows] = await connection.promise().query(query);

            if (rows.length === 0) return 'CUSTOMER-1';

            const lastId = rows[0]['Customer Id'];
            const idParts = lastId.split('-');

            if (idParts.length !== 2) return 'CUSTOMER-1';

            const lastNum = parseInt(idParts[1], 10);
            if (isNaN(lastNum)) return 'CUSTOMER-1';

            return `CUSTOMER-${lastNum + 1}`;
        } catch (error) {
            console.error('Error generating customer ID:', error);
            return `CUSTOMER-${Date.now()}`;
        }
    }

    safeJsonParse(jsonString) {
        try {
            if (!jsonString || jsonString === 'null') return [];
            if (Array.isArray(jsonString)) return jsonString;
            const parsed = JSON.parse(jsonString);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (error) {
            if (typeof jsonString === 'string') {
                return jsonString.trim() ? [jsonString] : [];
            }
            return [];
        }
    }

    async getAllCustomers(restaurantId) {
        const query = 'SELECT * FROM Customer WHERE `Restaurant Id` = ?';
        const [rows] = await connection.promise().query(query, [restaurantId]);
        return rows.map(row => ({
            ...row,
            Images: this.safeJsonParse(row.Images)
        }));
    }

    async getCustomerById(restaurantId, customerId) {
        const query = 'SELECT * FROM Customer WHERE `Restaurant Id` = ? AND `Customer Id` = ?';
        const [rows] = await connection.promise().query(query, [restaurantId, customerId]);
        if (rows.length === 0) return null;
        return {
            ...rows[0],
            Images: this.safeJsonParse(rows[0].Images)
        };
    }

    async getCustomerByEmail(restaurantId, email) {
        const query = 'SELECT * FROM Customer WHERE `Restaurant Id` = ? AND Email = ?';
        const [rows] = await connection.promise().query(query, [restaurantId, email]);
        if (rows.length === 0) return null;
        return {
            ...rows[0],
            Images: this.safeJsonParse(rows[0].Images)
        };
    }

    async addCustomer(restaurantId, customerData) {
        const newCustomerId = await this.getNextCustomerId();
        const hashedPassword = await bcrypt.hash(customerData.Password, 10);

        const processedData = {
            ...customerData,
            'Customer Id': newCustomerId,
            'Restaurant Id': restaurantId,
            Password: hashedPassword,
            Images: JSON.stringify(customerData.Images || [])
        };

        const query = 'INSERT INTO Customer SET ?';
        const [result] = await connection.promise().query(query, [processedData]);
        return { ...customerData, 'Customer Id': newCustomerId, Password: undefined };
    }

    async updateCustomer(restaurantId, customerId, customerData) {
        if (customerData['Customer Id']) delete customerData['Customer Id'];

        const processedData = { ...customerData };
        if (customerData.Password) {
            processedData.Password = await bcrypt.hash(customerData.Password, 10);
        }
        if (customerData.Images) {
            processedData.Images = JSON.stringify(customerData.Images);
        }

        const query = 'UPDATE Customer SET ? WHERE `Restaurant Id` = ? AND `Customer Id` = ?';
        await connection.promise().query(query, [processedData, restaurantId, customerId]);
        return this.getCustomerById(restaurantId, customerId);
    }

    async deleteCustomer(restaurantId, customerId) {
        const query = 'DELETE FROM Customer WHERE `Restaurant Id` = ? AND `Customer Id` = ?';
        const [result] = await connection.promise().query(query, [restaurantId, customerId]);
        return result.affectedRows > 0;
    }

    async verifyCustomer(restaurantId, email, password) {
        const customer = await this.getCustomerByEmail(restaurantId, email);
        if (!customer) return null;

        const isValid = await bcrypt.compare(password, customer.Password);
        return isValid ? { ...customer, Password: undefined } : null;
    }
}

export default new CustomerRepository();
