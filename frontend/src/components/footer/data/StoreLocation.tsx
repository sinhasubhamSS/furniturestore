import type { StoreLocation } from '../../../types/footer';

export const storeLocations: StoreLocation[] = [
  {
    id: 'store-001',
    name: 'Delhi Main Store',
    city: 'Delhi',
    address: '123 Connaught Place, New Delhi - 110001',
    phone: '+91 11-1234-5678',
    hours: '10:00 AM - 9:00 PM',
    coordinates: [28.6139, 77.2090]
  },
  {
    id: 'store-002',
    name: 'Mumbai Branch',
    city: 'Mumbai', 
    address: '456 Linking Road, Bandra West, Mumbai - 400050',
    phone: '+91 22-1234-5678',
    hours: '10:00 AM - 10:00 PM',
    coordinates: [19.0760, 72.8777]
  },
  {
    id: 'store-003',
    name: 'Bangalore Tech Hub',
    city: 'Bangalore',
    address: '789 MG Road, Bangalore - 560001',
    phone: '+91 80-1234-5678',
    hours: '9:00 AM - 9:00 PM',
    coordinates: [12.9716, 77.5946]
  },
  {
    id: 'store-004',
    name: 'Chennai Express',
    city: 'Chennai',
    address: '321 T. Nagar, Chennai - 600017',
    phone: '+91 44-1234-5678',
    hours: '10:00 AM - 8:00 PM',
    coordinates: [13.0827, 80.2707]
  }
];
