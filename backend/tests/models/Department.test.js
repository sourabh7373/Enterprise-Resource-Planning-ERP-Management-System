const Department = require('../../models/Department');
const { connectTestDB, closeTestDB, clearTestDB } = require('../setup');

beforeAll(async () => await connectTestDB(), 60000);
afterEach(async () => await clearTestDB(), 60000);
afterAll(async () => await closeTestDB(), 60000);

describe('Department Model', () => {
  it('should create a department', async () => {
    const dept = new Department({ name: 'Engineering', code: 'ENG' });
    await dept.save();
    const savedDept = await Department.findOne({ name: 'Engineering' });
    expect(savedDept.name).toBe('Engineering');
    expect(savedDept.code).toBe('ENG');
  });

  it('should fail to create department with duplicate name', async () => {
    await Department.create({ name: 'Engineering', code: 'ENG' });
    await expect(Department.create({ name: 'Engineering', code: 'ENG2' })).rejects.toThrow();
  });
});
