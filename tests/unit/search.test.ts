import { describe, it, expect } from 'vitest';
import { MenuItem } from '../../src/types';

describe('Search & Filter Engine', () => {
  const dummyCatalog: MenuItem[] = [
    {
      id: 'pizza-1',
      slug: 'classic-margherita',
      name: 'Classic Neapolitan Margherita',
      description: 'Slow-fermented dough, San Marzano tomato sauce, fresh buffalo mozzarella, and basil.',
      price: 395,
      category: 'neapolitan-pizzas',
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isSpicy: false,
      isSignature: true,
      displayPriority: 1,
      addOns: [{ id: 'addon-cheese', name: 'Fresh Buffalo Mozzarella', price: 65 }],
    },
    {
      id: 'frites-1',
      slug: 'truffle-parmesan-frites',
      name: 'Truffle Parmesan Hand-Cut Frites',
      description: 'Crisp golden double-fried frites tossed in white truffle oil and aged vegetarian parmesan.',
      price: 245,
      category: 'frites',
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isSpicy: false,
      isSignature: true,
      displayPriority: 2,
    },
    {
      id: 'brew-1',
      slug: 'classic-steeped-cold-brew',
      name: 'Classic Steeped Cold Brew',
      description: 'Slow 18-hour cold steeped single-origin Arabica over ice.',
      price: 220,
      category: 'coffee-pairings-bakery',
      isAvailable: true,
      isVegetarian: true,
      isVegan: true,
      isSpicy: false,
      isSignature: false,
      displayPriority: 3,
    },
    {
      id: 'pizza-2',
      slug: 'diavola-piccante',
      name: 'Diavola Piccante Pizza',
      description: 'Spicy chili oil, charred jalapeños, and bell peppers.',
      price: 445,
      category: 'neapolitan-pizzas',
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isSpicy: true,
      isSignature: false,
      displayPriority: 4,
    },
  ];

  it('matches items by name substring (case-insensitive)', () => {
    const q = 'margherita';
    const matches = dummyCatalog.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));
    expect(matches.length).toBe(1);
    expect(matches[0].name).toContain('Margherita');
  });

  it('matches items by description text', () => {
    const q = 'truffle';
    const matches = dummyCatalog.filter((i) =>
      i.description.toLowerCase().includes(q.toLowerCase())
    );
    expect(matches.length).toBe(1);
    expect(matches[0].slug).toBe('truffle-parmesan-frites');
  });

  it('matches items by add-on names', () => {
    const q = 'buffalo mozzarella';
    const matches = dummyCatalog.filter((i) =>
      (i.addOns || []).some((a) => a.name.toLowerCase().includes(q.toLowerCase()))
    );
    expect(matches.length).toBe(1);
    expect(matches[0].slug).toBe('classic-margherita');
  });

  it('filters by category slug', () => {
    const pizzaCategory = dummyCatalog.filter((i) => i.category === 'neapolitan-pizzas');
    expect(pizzaCategory.length).toBe(2);
  });

  it('filters by dietary flags (vegan, spicy, signature)', () => {
    const vegans = dummyCatalog.filter((i) => i.isVegan);
    expect(vegans.length).toBe(1);
    expect(vegans[0].slug).toBe('classic-steeped-cold-brew');

    const spicies = dummyCatalog.filter((i) => i.isSpicy);
    expect(spicies.length).toBe(1);
    expect(spicies[0].slug).toBe('diavola-piccante');

    const signatures = dummyCatalog.filter((i) => i.isSignature);
    expect(signatures.length).toBe(2);
  });

  it('sorts correctly by price', () => {
    const asc = [...dummyCatalog].sort((a, b) => a.price - b.price);
    expect(asc[0].price).toBe(220); // brew-1
    expect(asc[asc.length - 1].price).toBe(445); // pizza-2

    const desc = [...dummyCatalog].sort((a, b) => b.price - a.price);
    expect(desc[0].price).toBe(445);
    expect(desc[desc.length - 1].price).toBe(220);
  });
});
