import { Model } from 'mongoose';
import { generateUniqueSlug } from './generate-unique-slug';

describe('generateUniqueSlug', () => {
  let modelMock: Model<any>;
  beforeEach(() => {
    modelMock = {
      exists: jest.fn().mockImplementation(() => Promise.resolve(false)),
    } as any;
  });
  it('should generate the correct slug', async () => {
    const input = 'Test Input';
    const expectedSlug = 'test-input';
    const existsSpy = jest.spyOn(modelMock, 'exists');
    const result = await generateUniqueSlug(modelMock, input);
    expect(existsSpy).toHaveBeenCalledWith({ slug: expectedSlug });
    expect(result).toEqual(expectedSlug);
  });
  it('should generate unique slug when slug already exists', async () => {
    modelMock.exists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    const input = 'Test Input';
    const existsSpy = jest.spyOn(modelMock, 'exists');
    const result = await generateUniqueSlug(modelMock, input);
    expect(existsSpy).toHaveBeenCalled();
    expect(result).not.toEqual('test-input');
    expect(result).toMatch(/test-input-[\w\d-]{36}/);
  });
});
