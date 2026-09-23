const fs = require('fs');

let seedContent = fs.readFileSync('d:/antigravity/TrueGear/prisma/seed.ts', 'utf8');

const moreCars = `
    // 49. Mercedes-Benz GLE 350 2022 - Fair Deal
    {
      sellerId: dealer1.id,
      make: 'Mercedes-Benz',
      model: 'GLE 350',
      year: 2022,
      trim: '4MATIC SUV',
      bodyType: 'SUV',
      mileage: 26000,
      price: 48900,
      vin: '4JGFF4KB8NA192038',
      description: 'Sophisticated luxury with 4MATIC All-Wheel Drive, dual 12.3-inch widescreen displays, Burmester surround sound, ambient 64-color lighting, panoramic sunroof, and MB-Tex upholstery.',
      city: 'Dallas',
      state: 'TX',
      zip: '75201',
      lat: 32.7767,
      lng: -96.797,
      fuelType: 'Gasoline',
      transmission: 'Automatic',
      drivetrain: 'AWD',
      exteriorColor: 'Polar White',
      interiorColor: 'Macchiato Beige MB-Tex',
      condition: 'Certified Pre-Owned',
      engine: '2.0L Turbo 255hp',
      features: JSON.stringify(['4MATIC AWD', 'Burmester Surround', 'Dual 12.3-inch Screens', 'Panoramic Roof', 'Parktronic']),
      accidents: 0,
      previousOwners: 1,
      serviceHistory: 5,
      images: [
        'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80',
      ],
    },
    // 50. Audi Q5 2022 - Great Deal
    {
      sellerId: dealer2.id,
      make: 'Audi',
      model: 'Q5',
      year: 2022,
      trim: '45 S line Premium Plus',
      bodyType: 'SUV',
      mileage: 21000,
      price: 34500,
      vin: 'WA1BNAFY7N2019483',
      description: 'Pristine Audi Q5 45 TFSI S line with quattro AWD. Virtual Cockpit Plus, Bang & Olufsen 3D sound, panoramic sunroof, top-view 360 camera, and Audi pre sense safety tech.',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      lat: 37.7749,
      lng: -122.4194,
      fuelType: 'Gasoline',
      transmission: 'Automatic',
      drivetrain: 'AWD',
      exteriorColor: 'Glacier White Metallic',
      interiorColor: 'Black Leather with Rock Gray Stitching',
      condition: 'Certified Pre-Owned',
      engine: '2.0L Turbo 261hp',
      features: JSON.stringify(['quattro AWD', 'Virtual Cockpit', 'Bang & Olufsen 3D', '360 Camera', 'S Line Exterior']),
      accidents: 0,
      previousOwners: 1,
      serviceHistory: 4,
      images: [
        'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1200&auto=format&fit=crop&q=80',
      ],
    },
    // 51. Kia EV6 2023 - Great Deal
    {
      sellerId: dealer3.id,
      make: 'Kia',
      model: 'EV6',
      year: 2023,
      trim: 'Wind AWD Electric',
      bodyType: 'SUV',
      mileage: 15200,
      price: 33900,
      vin: 'KNDCE3LG6P5102948',
      description: 'Electrifying performance with 320 HP dual-motor AWD. 800V fast-charging architecture, Meridian 14-speaker audio, dual 12.3-inch curved panoramic displays, and smart power tailgate.',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      lat: 41.8781,
      lng: -87.6298,
      fuelType: 'Electric',
      transmission: 'Automatic',
      drivetrain: 'AWD',
      exteriorColor: 'Steel Matte Gray',
      interiorColor: 'Black SynTex Suede',
      condition: 'Used',
      engine: 'Dual-Motor Electric 320hp',
      features: JSON.stringify(['800V Ultra-Fast Charging', 'Dual Motor AWD', 'Meridian Sound', 'Dual 12.3 Curved Screens', 'Heat Pump']),
      accidents: 0,
      previousOwners: 1,
      serviceHistory: 3,
      images: [
        'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=1200&auto=format&fit=crop&q=80',
      ],
    },
`;

const targetIdx = seedContent.indexOf('];\n\n  for (const car of listingsData)');
if (targetIdx !== -1) {
  const updatedSeed = seedContent.slice(0, targetIdx) + moreCars + seedContent.slice(targetIdx);
  fs.writeFileSync('d:/antigravity/TrueGear/prisma/seed.ts', updatedSeed, 'utf8');
  console.log('Appended 3 more cars to seed.ts!');
}
