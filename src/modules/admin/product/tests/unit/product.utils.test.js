import { generateSKU, generateSlug } from '../utils/product.utils.js';

describe('Product Utils', () => {
  describe('generateSKU', () => {
    it('should generate a valid SKU format based on the brand', () => {
      const sku = generateSKU('Dell');
      expect(sku).toMatch(/^LAP-DELL-[A-F0-9]{6}$/);
    });

    it('should handle short brand names', () => {
      const sku = generateSKU('HP');
      expect(sku).toMatch(/^LAP-HP-[A-F0-9]{6}$/);
    });
  });

  describe('generateSlug', () => {
    it('should generate a URL friendly slug with a random suffix', () => {
      const slug = generateSlug('Dell Latitude 7490');
      expect(slug).toMatch(/^dell-latitude-7490-[a-f0-9]{4}$/);
    });

    it('should strip special characters', () => {
      const slug = generateSlug('MacBook Pro 15" (2019)!!');
      expect(slug).toMatch(/^macbook-pro-15-2019-[a-f0-9]{4}$/);
    });
  });
});
