import React, { useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Search, Video, MessageCircle, ShoppingCart, FileImage, Bell, HeartPulse, ArrowRight, CheckCircle } from "lucide-react";
const ServicesPage = () => {
  useTitle("Our Services - Medical Universe");
  const services = [{
    icon: Search,
    title: "Find Specialists",
    description: "Search for doctors by specialization, location, or rating. Book appointments with just a few clicks.",
    color: "from-blue-400 to-blue-600",
    delay: 0
  }, {
    icon: Calendar,
    title: "Easy Scheduling",
    description: "Book appointments, get reminders, and manage your health visits all in one place.",
    color: "from-teal-400 to-teal-600",
    delay: 0.1
  }, {
    icon: FileText,
    title: "Digital Prescriptions",
    description: "View and manage your prescriptions digitally. Get AI-powered summaries of your medical documents.",
    color: "from-purple-400 to-purple-600",
    delay: 0.2
  }, {
    icon: FileImage,
    title: "Health Records",
    description: "Store and access your medical records securely. Share them with doctors when needed.",
    color: "from-amber-400 to-amber-600",
    delay: 0.3
  }, {
    icon: MessageCircle,
    title: "AI Health Assistant",
    description: "Get instant answers to health questions from our intelligent AI assistant. Available 24/7.",
    color: "from-medical-aqua to-medical-cyan",
    delay: 0.4
  }, {
    icon: Video,
    title: "Yoga & Wellness",
    description: "Follow guided yoga sessions with AI posture analysis and personalized recommendations.",
    color: "from-emerald-400 to-emerald-600",
    delay: 0.5
  }, {
    icon: ShoppingCart,
    title: "Medicine Delivery",
    description: "Order medicines based on your prescriptions and get them delivered to your doorstep.",
    color: "from-rose-400 to-rose-600",
    delay: 0.6
  }, {
    icon: Bell,
    title: "Emergency SOS",
    description: "Send alerts to emergency contacts with your location information in case of emergencies.",
    color: "from-red-400 to-red-600",
    delay: 0.7
  }];
  const features = ["24/7 Online Consultation", "AI-Powered Diagnostics", "Secure Data Encryption", "Medical Records Management", "Smart Appointment Booking", "Prescription Delivery", "Health Monitoring", "Video Consultations"];
  return <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-overlay">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Comprehensive Healthcare Features</h1>
            <p className="text-xl text-gray-600 mb-8">
              Medical Universe provides an all-in-one intelligent healthcare platform that makes managing
              your health easier than ever before.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="rounded-full bg-gradient-med hover:shadow-lg hover:scale-105 transition-all">
                Explore Services
              </Button>
              <Button variant="outline" size="lg" className="rounded-full hover:bg-gradient-med hover:text-white hover:border-transparent bg-emerald-300 hover:bg-emerald-200">
                Book Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
            const Icon = service.icon;
            return <div key={index} className="opacity-0 animate-slide-up" style={{
              animationDelay: `${service.delay}s`
            }}>
                  <Card className="h-full border-0 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                    <CardContent className="p-6 bg-slate-300">
                      <div className={`rounded-full w-14 h-14 bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 text-white group-hover:animate-pulse-glow`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                      <p className="mb-4 text-gray-950">{service.description}</p>
                      <div className="mt-auto pt-4 flex items-center text-medical-aqua opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="mr-2 font-medium">Learn more</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </div>;
          })}
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden shadow-xl relative">
              <div className="absolute inset-0 bg-gradient-med opacity-20 rounded-2xl"></div>
              <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80" alt="Medical Technology" className="w-full h-full object-cover rounded-2xl z-10 relative" />
            </div>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Advanced Healthcare Features</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Our platform combines cutting-edge technology with medical expertise to provide you with the best healthcare experience.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                    <CheckCircle className="h-5 w-5 text-medical-aqua flex-shrink-0" />
                    <span>{feature}</span>
                  </div>)}
              </div>
              
              <Button className="rounded-full bg-gradient-med hover:shadow-lg hover:scale-105 transition-all">
                Learn How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Plans & Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Plans For Everyone</h2>
            <p className="text-lg text-gray-600">
              Choose the perfect plan that fits your healthcare needs and budget.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden transition-all hover:shadow-xl">
              <div className="p-8">
                <h3 className="text-xl font-bold mb-2">Basic</h3>
                <div className="text-3xl font-bold mb-4">$9.99<span className="text-lg text-gray-500 font-normal">/month</span></div>
                <p className="text-gray-600 mb-6">Perfect for individuals just starting out</p>
                
                <ul className="space-y-3 mb-8">
                  {["Find Doctors", "Book Appointments", "Health Records", "Chat Support"].map((feature, idx) => <li key={idx} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>)}
                </ul>
                
                <Button variant="outline" className="w-full rounded-full hover:bg-gradient-med hover:text-white hover:border-transparent">
                  Get Started
                </Button>
              </div>
            </div>
            
            {/* Pro Plan - Highlighted */}
            <div className="rounded-2xl overflow-hidden shadow-lg transform scale-105 border-2 border-medical-aqua relative">
              <div className="absolute top-0 right-0 bg-gradient-med text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                POPULAR
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold mb-2">Professional</h3>
                <div className="text-3xl font-bold mb-4">$24.99<span className="text-lg text-gray-500 font-normal">/month</span></div>
                <p className="text-gray-600 mb-6">Best value for individuals and families</p>
                
                <ul className="space-y-3 mb-8">
                  {["All Basic Features", "AI Health Assistant", "Video Consultations", "Priority Support", "Health Monitoring", "Family Accounts"].map((feature, idx) => <li key={idx} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>)}
                </ul>
                
                <Button className="w-full rounded-full bg-gradient-med hover:shadow-lg hover:scale-105 transition-all">
                  Get Started
                </Button>
              </div>
            </div>
            
            {/* Enterprise Plan */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden transition-all hover:shadow-xl">
              <div className="p-8">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <div className="text-3xl font-bold mb-4">$99.99<span className="text-lg text-gray-500 font-normal">/month</span></div>
                <p className="text-gray-600 mb-6">For healthcare organizations and providers</p>
                
                <ul className="space-y-3 mb-8">
                  {["All Pro Features", "Custom Branding", "Advanced Analytics", "Integration APIs", "Dedicated Support", "Staff Training"].map((feature, idx) => <li key={idx} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>)}
                </ul>
                
                <Button variant="outline" className="w-full rounded-full hover:bg-gradient-med hover:text-white hover:border-transparent">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-medical-aqua to-medical-cyan text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to Take Control of Your Health?</h2>
            <p className="text-xl mb-8 text-white/80">
              Join thousands of users who are already experiencing the future of healthcare with Medical Universe.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-white text-medical-aqua hover:bg-blue-50 rounded-full px-8">
                Create Free Account
              </Button>
              <Button variant="outline" className="border-white hover:bg-white/10 rounded-full px-8 text-gray-950">
                Book a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default ServicesPage;