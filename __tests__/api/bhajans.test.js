import { GET, POST } from '@/app/api/bhajans/route';
import Bhajan from '@/models/Bhajan';

// Mock dependencies
jest.mock('@/lib/mongodb', () => jest.fn());
jest.mock('@/models/Bhajan');

describe('/api/bhajans', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns a list of bhajans excluding lyrics', async () => {
      const mockBhajans = [
        { _id: '1', title: 'Bhajan 1', title_guj: 'ભજન ૧' },
        { _id: '2', title: 'Bhajan 2', title_guj: 'ભજન ૨' }
      ];

      // Mock Mongoose chain
      const mockLimit = jest.fn().mockResolvedValue(mockBhajans);
      const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = jest.fn().mockReturnValue({ sort: mockSort });
      Bhajan.find.mockReturnValue({ select: mockSelect });

      const req = new Request('http://localhost/api/bhajans');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockBhajans);
      expect(Bhajan.find).toHaveBeenCalledWith({});
      expect(mockSelect).toHaveBeenCalledWith('-lyrics');
    });

    it('filters by query parameter', async () => {
      const req = new Request('http://localhost/api/bhajans?q=krishna');

      const mockLimit = jest.fn().mockResolvedValue([]);
      const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = jest.fn().mockReturnValue({ sort: mockSort });
      Bhajan.find.mockReturnValue({ select: mockSelect });

      await GET(req);

      expect(Bhajan.find).toHaveBeenCalledWith(expect.objectContaining({
        $or: expect.arrayContaining([
          { title: { $regex: 'krishna', $options: 'i' } }
        ])
      }));
    });
  });

  describe('POST', () => {
    it('creates a new bhajan with sanitized lyrics', async () => {
      const newBhajan = {
        title: 'New Bhajan',
        title_guj: 'નવું ભજન',
        lyrics: '<div>Some lyrics<br>with tags</div>',
        catId: 'user-added'
      };

      const expectedCreated = {
        ...newBhajan,
        _id: '123',
        lyrics: 'Some lyrics\nwith tags'
      };

      Bhajan.create.mockResolvedValue(expectedCreated);

      const req = new Request('http://localhost/api/bhajans', {
        method: 'POST',
        body: JSON.stringify(newBhajan)
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.lyrics).toBe('Some lyrics\nwith tags');
      expect(Bhajan.create).toHaveBeenCalledWith(expect.objectContaining({
        lyrics: 'Some lyrics\nwith tags'
      }));
    });

    it('returns 400 if required fields are missing', async () => {
      const req = new Request('http://localhost/api/bhajans', {
        method: 'POST',
        body: JSON.stringify({ title: 'Missing fields' })
      });

      const res = await POST(req);
      
      expect(res.status).toBe(400);
    });
  });
});
