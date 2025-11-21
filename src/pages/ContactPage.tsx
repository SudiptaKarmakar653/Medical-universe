
import React from "react";
import Navbar from "@/components/layout/Navbar";
import { useTitle } from "@/hooks/use-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

const ContactPage = () => {
  useTitle("Contact Us - Medical Universe");

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-lg text-gray-600">
              Have questions about our services or need assistance? Our friendly team is here to help.
              Reach out to us using the contact information below.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-2 md:order-1 animate-slide-up">
              <Card className="overflow-hidden border-0 rounded-2xl shadow-xl">
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                  
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          id="name" 
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-medical-aqua focus:border-medical-aqua transition-all" 
                          placeholder="Enter your name" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          id="email" 
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-medical-aqua focus:border-medical-aqua transition-all" 
                          placeholder="Enter your email" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          id="subject" 
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-medical-aqua focus:border-medical-aqua transition-all" 
                          placeholder="Enter subject" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                      <textarea 
                        id="message" 
                        rows={4} 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-medical-aqua focus:border-medical-aqua transition-all" 
                        placeholder="How can we help you?"
                      ></textarea>
                    </div>
                    
                    <Button className="w-full rounded-lg bg-gradient-med hover:shadow-lg hover:scale-[1.02] transition-all py-6">
                      <Send className="mr-2 h-5 w-5" /> Send Message
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
            
            <div className="order-1 md:order-2 animate-fade-in">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
                  <p className="text-gray-600">
                    We're available to assist you through multiple channels. Choose the one that's most convenient for you.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <ContactInfoCard 
                    icon={<Phone className="h-6 w-6 text-white" />}
                    title="Phone Number"
                    content="(555) 123-4567"
                    subContent="Mon-Fri, 8am-6pm"
                    color="from-blue-400 to-blue-600"
                  />
                  
                  <ContactInfoCard 
                    icon={<Mail className="h-6 w-6 text-white" />}
                    title="Email Address"
                    content="info@medicaluniverse.com"
                    subContent="We'll respond within 24 hours"
                    color="from-medical-aqua to-medical-cyan"
                  />
                  
                  <ContactInfoCard 
                    icon={<MapPin className="h-6 w-6 text-white" />}
                    title="Office Location"
                    content="123 Medical Plaza, Health City"
                    subContent="CA 91234, United States"
                    color="from-emerald-400 to-emerald-600"
                  />
                  
                  <ContactInfoCard 
                    icon={<Clock className="h-6 w-6 text-white" />}
                    title="Working Hours"
                    content="Monday - Friday: 9am - 5pm"
                    subContent="Weekends: 10am - 2pm"
                    color="from-purple-400 to-purple-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl overflow-hidden shadow-lg h-[400px] relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.3060219304!2d-74.25987368715491!3d40.697149419326654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1684459736064!5m2!1sen!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Medical Universe Location"
            ></iframe>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our services, appointments, and more.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <FaqItem 
              question="How do I schedule an appointment?" 
              answer="You can schedule an appointment through our website by navigating to the 'Find Doctors' page, selecting a doctor, and choosing an available time slot. Alternatively, you can call our office directly."
            />
            
            <FaqItem 
              question="What insurance plans do you accept?" 
              answer="Medical Universe works with most major insurance providers. Please contact our office with your specific insurance information to verify coverage before your appointment."
            />
            
            <FaqItem 
              question="How does the AI Health Assistant work?" 
              answer="Our AI Health Assistant uses advanced machine learning to provide instant answers to health-related questions. It can help identify potential conditions based on symptoms, but is not a substitute for professional medical advice."
            />
            
            <FaqItem 
              question="Can I cancel or reschedule my appointment?" 
              answer="Yes, you can cancel or reschedule your appointment through your patient portal or by calling our office. We request at least 24 hours' notice for any changes to your scheduled appointment."
            />
            
            <FaqItem 
              question="How do I access my medical records?" 
              answer="Medical records can be accessed through your secure patient portal. If you're having trouble accessing your records, please contact our support team for assistance."
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-medical-aqua to-medical-cyan text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Better Healthcare?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join Medical Universe today and get access to our network of specialists and AI-powered health tools.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-white text-medical-aqua hover:bg-blue-50 rounded-full px-8">
              Create Account
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white/10 rounded-full px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Contact info card component
const ContactInfoCard = ({ icon, title, content, subContent, color }: { 
  icon: React.ReactNode; 
  title: string; 
  content: string; 
  subContent: string;
  color: string;
}) => (
  <div className="flex items-start space-x-4">
    <div className={`bg-gradient-to-br ${color} p-3 rounded-xl shadow-lg`}>
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-900 font-medium">{content}</p>
      <p className="text-gray-500 text-sm">{subContent}</p>
    </div>
  </div>
);

// FAQ item component with animation
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button 
        className="w-full flex justify-between items-center p-5 text-left font-medium hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <svg 
          className={`h-5 w-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-40' : 'max-h-0'
        }`}
      >
        <div className="p-5 pt-0 border-t border-gray-100">
          <p className="text-gray-600">{answer}</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
