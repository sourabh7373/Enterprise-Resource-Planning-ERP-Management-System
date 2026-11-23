const Employee = require('../../models/Employee');
const { connectTestDB, closeTestDB, clearTestDB } = require('../setup');

beforeAll(async () => await connectTestDB(), 60000);
afterEach(async () => await clearTestDB(), 60000);
afterAll(async () => await closeTestDB(), 60000);

describe('Employee Model', () => {
  it('should create an employee', async () => {
    const emp = new Employee({ 
      employeeId: 'E001', 
      firstName: 'John', 
      lastName: 'Doe', 
      email: 'john@example.com' 
    });
    await emp.save();
    const savedEmp = await Employee.findOne({ employeeId: 'E001' });
    expect(savedEmp.firstName).toBe('John');
  });

  it('should fail to create employee with duplicate email', async () => {
    await Employee.create({ employeeId: 'E001', firstName: 'John', lastName: 'Doe', email: 'john@example.com' });
    await expect(Employee.create({ employeeId: 'E002', firstName: 'Jane', lastName: 'Doe', email: 'john@example.com' })).rejects.toThrow();
  });
});
