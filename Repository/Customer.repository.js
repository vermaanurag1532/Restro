import connection from '../Connection/Connection.js';
import bcrypt from 'bcrypt';

class CustomerRepository {
    async getNextCustomerId() {
        const query = 'SELECT MAX(CAST(SUBSTRING(`Customer Id`, 9) AS UNSIGNED)) as maxId FROM Customer';
        const [rows] = await connection.promise().query(query);
        const maxId = rows[0].maxId || 0;
        return `CUSTOMER-${maxId + 1}`;
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

    async getAllCustomers() {
        const query = 'SELECT * FROM Customer';
        const [rows] = await connection.promise().query(query);
        return rows.map(row => ({
            ...row,
            Images: this.safeJsonParse(row.Images)
        }));
    }
    
    async getCustomerById(customerId) {
        const query = 'SELECT * FROM Customer WHERE `Customer Id` = ?';
        const [rows] = await connection.promise().query(query, [customerId]);
        if (rows.length === 0) return null;
        return {
            ...rows[0],
            Images: this.safeJsonParse(rows[0].Images)
        };
    }

    async getCustomerByEmail(email) {
        const query = 'SELECT * FROM Customer WHERE Email = ?';
        const [rows] = await connection.promise().query(query, [email]);
        if (rows.length === 0) return null;
        return {
            ...rows[0],
            Images: this.safeJsonParse(rows[0].Images)
        };
    }

    async addCustomer(customerData) {
        const newCustomerId = await this.getNextCustomerId();
        const hashedPassword = await bcrypt.hash(customerData.Password, 10);
        
        const processedData = {
            ...customerData,
            'Customer Id': newCustomerId,
            Password: hashedPassword,
            Images: JSON.stringify(customerData.Images || [])
        };
        
        const query = 'INSERT INTO Customer SET ?';
        const [result] = await connection.promise().query(query, [processedData]);
        return { ...customerData, 'Customer Id': newCustomerId, Password: undefined };
    }

    async updateCustomer(customerId, customerData) {
        if (customerData['Customer Id']) delete customerData['Customer Id'];
        
        const processedData = { ...customerData };
        if (customerData.Password) {
            processedData.Password = await bcrypt.hash(customerData.Password, 10);
        }
        if (customerData.Images) {
            processedData.Images = JSON.stringify(customerData.Images);
        }
        
        const query = 'UPDATE Customer SET ? WHERE `Customer Id` = ?';
        await connection.promise().query(query, [processedData, customerId]);
        return this.getCustomerById(customerId);
    }

    async deleteCustomer(customerId) {
        const query = 'DELETE FROM Customer WHERE `Customer Id` = ?';
        const [result] = await connection.promise().query(query, [customerId]);
        return result.affectedRows > 0;
    }

    async verifyCustomer(email, password) {
        const customer = await this.getCustomerByEmail(email);
        if (!customer) return null;
        
        const isValid = await bcrypt.compare(password, customer.Password);
        return isValid ? { ...customer, Password: undefined } : null;
    }
}

export default new CustomerRepository();