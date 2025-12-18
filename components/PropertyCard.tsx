import React from 'react';
import { Property } from '../types';
import { MapPin, Bed, Bath, Layout } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer border border-slate-100" onClick={() => onSelect(property)}>
      <div className="relative h-64 overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
          {property.price}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">{property.title}</h3>
        <div className="flex items-center text-slate-500 mb-4 text-sm">
          <MapPin size={16} className="mr-1" />
          {property.location}
        </div>
        
        <div className="flex justify-between items-center border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1 text-slate-600">
            <Bed size={18} />
            <span className="text-sm font-medium">{property.beds}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <Bath size={18} />
            <span className="text-sm font-medium">{property.baths}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <Layout size={18} />
            <span className="text-sm font-medium">{property.sqft} m²</span>
          </div>
        </div>
      </div>
    </div>
  );
};