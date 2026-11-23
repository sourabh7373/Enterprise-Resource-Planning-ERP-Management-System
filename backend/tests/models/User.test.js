const User = require('../../models/User');
const { connectTestDB, closeTestDB, clearTestDB } = require('../setup');

beforeAll(async () => await connectTestDB(), 60000);
afterEach(async () => await clearTestDB(), 60000);
afterAll(async () => await closeTestDB(), 60000);

describe('User Model', () => {
  it('should create a user with hashed password', async () => {
    const user = new User({ email: 'test@example.com', password: 'password123' });
    await user.save();
    const savedUser = await User.findOne({ email: 'test@example.com' });
    expect(savedUser.password).not.toBe('password123');
    expect(await savedUser.comparePassword('password123')).toBe(true);
  });

  it('should fail to create user with duplicate email', async () => {
    await User.create({ email: 'test@example.com', password: 'password123' });
    await expect(User.create({ email: 'test@example.com', password: 'password456' })).rejects.toThrow();
  });
});
