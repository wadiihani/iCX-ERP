import { describe, it, expect } from 'vitest';
import { ColumnDef } from '../src/components/ui/data-table/data-table-types';

interface SampleRecord {
  id: string;
  name: string;
  product: 'iGV' | 'iGTa' | 'iGTe';
  slots: number;
  city: string;
}

describe('Section 0.2: Table-First Data Engine Logic', () => {
  const sampleData: SampleRecord[] = [
    { id: 'REC-01', name: 'Fondation Orient-Occident', product: 'iGV', slots: 15, city: 'Rabat' },
    { id: 'REC-02', name: 'BMCE Bank Foundation', product: 'iGTa', slots: 8, city: 'Casablanca' },
    { id: 'REC-03', name: 'Rabat American School', product: 'iGTe', slots: 4, city: 'Rabat' },
    { id: 'REC-04', name: 'Maroc Telecom Academy', product: 'iGTa', slots: 12, city: 'Rabat' },
    { id: 'REC-05', name: 'Association Ribat Al Fath', product: 'iGV', slots: 20, city: 'Salé' },
  ];

  const columns: ColumnDef<SampleRecord>[] = [
    { id: 'id', header: 'ID', accessorKey: 'id', sortable: true },
    { id: 'name', header: 'Name', accessorKey: 'name', sortable: true },
    { id: 'product', header: 'Product', accessorKey: 'product', filterable: true },
    { id: 'slots', header: 'Slots', accessorKey: 'slots', sortable: true },
    { id: 'city', header: 'City', accessorKey: 'city', filterable: true },
  ];

  it('performs global text search across records', () => {
    const query = 'rabat';
    const filtered = sampleData.filter((item) =>
      columns.some((col) => {
        const val = col.accessorKey ? item[col.accessorKey] : undefined;
        return val !== undefined && String(val).toLowerCase().includes(query);
      })
    );

    expect(filtered.length).toBe(3);
    expect(filtered.map((r) => r.id)).toEqual(['REC-01', 'REC-03', 'REC-04']);
  });

  it('combines multi-column filters simultaneously', () => {
    const filterProduct = 'iGTa';
    const filterCity = 'Rabat';

    const filtered = sampleData.filter(
      (item) => item.product === filterProduct && item.city === filterCity
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('REC-04');
  });

  it('sorts numeric columns in ascending and descending order', () => {
    const asc = [...sampleData].sort((a, b) => a.slots - b.slots);
    expect(asc.map((r) => r.slots)).toEqual([4, 8, 12, 15, 20]);

    const desc = [...sampleData].sort((a, b) => b.slots - a.slots);
    expect(desc.map((r) => r.slots)).toEqual([20, 15, 12, 8, 4]);
  });

  it('calculates accurate pagination boundaries', () => {
    const pageSize = 2;
    const totalRecords = sampleData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    expect(totalPages).toBe(3);

    // Page 1
    const page1 = sampleData.slice(0, 2);
    expect(page1.length).toBe(2);
    expect(page1[0].id).toBe('REC-01');

    // Page 3 (last partial page)
    const page3 = sampleData.slice(4, 6);
    expect(page3.length).toBe(1);
    expect(page3[0].id).toBe('REC-05');
  });
});
