import React from 'react';
import { Card } from "../common/ui/card";
import { Button } from "../common/ui/button";
import { Badge } from "../common/ui/badge";
import { Pill, ArrowRight } from "lucide-react";
import { PageView } from "../common/types";

interface MedicineSectionProps {
  onNavigate: (view: PageView) => void;
}

export function MedicineSection({ onNavigate }: MedicineSectionProps) {
  const medicines = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      price: 45,
      mrp: 60,
      image: "💊",
      discount: 25,
      category: "Fever & Pain",
      inStock: true
    },
    {
      id: 2,
      name: "Cetrizine 10mg",
      price: 25,
      mrp: 35,
      image: "💊",
      discount: 29,
      category: "Allergy",
      inStock: true
    },
    {
      id: 3,
      name: "Vitamin D3 60K",
      price: 85,
      mrp: 100,
      image: "💊",
      discount: 15,
      category: "Vitamins",
      inStock: true
    },
    {
      id: 4,
      name: "Omeprazole 20mg",
      price: 65,
      mrp: 80,
      image: "💊",
      discount: 19,
      category: "Digestive",
      inStock: true
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-pink-900/10 to-purple-900/10 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl mb-2 text-foreground font-bold">Popular Medicines</h2>
            <p className="text-foreground/80 font-medium">Order medicines online with fast delivery</p>
          </div>
          <Button variant="outline" onClick={() => onNavigate("medicine")}>
            View All Medicines
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {medicines.map((medicine) => (
            <Card key={medicine.id} className="p-6 hover:shadow-xl transition-all bg-card border-border">
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{medicine.image}</div>
                <Badge variant="secondary" className="mb-2">{medicine.category}</Badge>
                <h3 className="text-lg mb-2 text-foreground font-semibold">{medicine.name}</h3>
                {medicine.inStock && (
                  <Badge className="bg-green-500 mb-2">In Stock</Badge>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl text-pink-600 font-semibold">₹{medicine.price}</span>
                  <span className="text-sm text-foreground/60 line-through">₹{medicine.mrp}</span>
                </div>
                <Badge className="bg-green-500">{medicine.discount}% OFF</Badge>
                <Button className="w-full" onClick={() => onNavigate("medicine")}>
                  <Pill className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button size="lg" onClick={() => onNavigate("medicine")}>
            <Pill className="w-5 h-5 mr-2" />
            Browse All Medicines
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
