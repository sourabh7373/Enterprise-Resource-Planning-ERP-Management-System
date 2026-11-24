const Employee = require('../../models/Employee');
const Department = require('../../models/Department');
const { connectTestDB, closeTestDB, clearTestDB } = require('../setup');

beforeAll(async () => await connectTestDB(), 60000);
afterEach(async () => await clearTestDB(), 60000);
afterAll(async () => await closeTestDB(), 60000);

describe('Employee Model', () => {
  it('should create an employee', async () => {
    const dept = await Department.create({ name: 'Engineering', code: 'ENG' });
    const emp = new Employee({ 
      employeeId: 'EMP1001', 
      fullName: 'John Doe', 
      email: 'john@example.com',
      phone: '1234567890',
      department: dept._id,
      designation: 'Engineer'
    });
    await emp.save();
    const savedEmp = await Employee.findOne({ employeeId: 'EMP1001' });
    expect(savedEmp.fullName).toBe('John Doe');
    expect(savedEmp.designation).toBe('Engineer');
  });

  it('should fail to create employee with duplicate email', async () => {
    const dept = await Department.create({ name: 'Engineering', code: 'ENG' });
    await Employee.create({ 
      employeeId: 'EMP1001', 
      fullName: 'John Doe', 
      email: 'john@example.com',
      phone: '1234567890',
      department: dept._id,
      designation: 'Engineer'
    });
    await expect(Employee.create({ 
      employeeId: 'EMP1002', 
      fullName: 'Jane Doe', 
      email: 'john@example.com',
      phone: '0987654321',
      department: dept._id,
      designation: 'Manager'
    })).rejects.toThrow();
  });
});
