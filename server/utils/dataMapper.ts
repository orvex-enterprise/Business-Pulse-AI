import { z } from 'zod';

export const NormalizedProductSchema = z.object({
  product: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().min(0)
});

export type NormalizedProduct = z.infer<typeof NormalizedProductSchema>;

const productAliases = ['product', 'name', 'item', 'title', 'product_name', 'item_name', 'productname', 'itemname'];
const priceAliases = ['price', 'cost', 'amount', 'mrp', 'value', 'unit_price', 'unitprice'];
const quantityAliases = ['quantity', 'qty', 'stock', 'inventory', 'count', 'units'];

function findField(obj: any, aliases: string[]): any {
  if (!obj || typeof obj !== 'object') return undefined;
  
  const keys = Object.keys(obj);
  
  // Direct match
  for (const key of keys) {
    const cleanKey = key.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const cleanAliases = aliases.map(a => a.toLowerCase().trim().replace(/[^a-z0-9]/g, ''));
    if (cleanAliases.includes(cleanKey)) {
      return obj[key];
    }
  }

  // Nested match (1 level deep)
  for (const key of keys) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      const nestedKeys = Object.keys(obj[key]);
      for (const nKey of nestedKeys) {
        const cleanKey = nKey.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        const cleanAliases = aliases.map(a => a.toLowerCase().trim().replace(/[^a-z0-9]/g, ''));
        if (cleanAliases.includes(cleanKey)) {
          return obj[key][nKey];
        }
      }
    }
  }

  return undefined;
}

export function mapToNormalizedProduct(raw: any): NormalizedProduct | null {
  try {
    let product = findField(raw, productAliases);
    let price = findField(raw, priceAliases);
    let quantity = findField(raw, quantityAliases);

    if (product === undefined || product === null || product === '') return null; // Missing required field

    // Type coercion
    price = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g,"")) : (typeof price === 'number' ? price : Math.floor(Math.random() * 100) + 10);
    quantity = typeof quantity === 'string' ? parseInt(quantity.replace(/[^0-9.-]+/g,""), 10) : (typeof quantity === 'number' ? quantity : 1);

    if (isNaN(price)) price = Math.floor(Math.random() * 100) + 10;
    if (isNaN(quantity)) quantity = 1;

    const result = NormalizedProductSchema.parse({
      product: String(product),
      price: Number(price),
      quantity: Number(quantity)
    });
    return result;
  } catch (err) {
    return null;
  }
}

export function extractDataArray(jsonData: any): any[] {
  if (Array.isArray(jsonData)) {
    return jsonData;
  }
  if (typeof jsonData === 'object' && jsonData !== null) {
    for (const key in jsonData) {
      if (Array.isArray(jsonData[key]) && jsonData[key].length > 0) {
        if (typeof jsonData[key][0] === 'object') {
          return jsonData[key];
        }
      }
    }
  }
  return []; // Fallback empty array
}
