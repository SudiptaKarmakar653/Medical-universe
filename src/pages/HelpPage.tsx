import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { useTitle } from "@/hooks/use-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Mail, Phone } from "lucide-react";
const HelpPage = () => {
  useTitle("Help & Support - Medical Universe");
  const [query, setQuery] = useState("");
  const faqs = [{
    question: "How do I book an appointment with a doctor?",
    answer: "To book an appointment, navigate to the 'Find Doctors' page, search for your preferred doctor, and click on the 'Book Appointment' button. Select your preferred date and time from the available slots, and confirm your booking. You'll receive a confirmation email with all the details."
  }, {
    question: "How can I upload my prescriptions?",
    answer: "To upload your prescriptions, log in to your patient dashboard, navigate to the 'Prescriptions' section, and click on the 'Upload Prescription' button. You can upload your prescription in PDF or image format. Our AI will analyze it and provide a summary of the medications and instructions."
  }, {
    question: "What should I do in case of a medical emergency?",
    answer: "In case of a medical emergency, use the SOS button on your patient dashboard. This will alert your emergency contacts with your current location. Always call your local emergency number (like 911) first for immediate medical assistance."
  }, {
    question: "How does the AI Health Assistant work?",
    answer: "Our AI Health Assistant uses advanced algorithms to provide answers to your health-related queries. It can help with symptom checking, general health guidance, and understanding medical terms. Remember, while our AI is intelligent, it's always best to consult with a healthcare professional for personalized medical advice."
  }, {
    question: "How do I update my health information?",
    answer: "To update your health information, log in to your patient dashboard, go to the 'Profile' section, and click on 'Edit Health Information'. Here you can update details like allergies, pre-existing conditions, current medications, and other relevant health information."
  }, {
    question: "Is my data secure on Medical Universe?",
    answer: "Yes, we take data security and privacy very seriously. We use industry-standard encryption and security measures to protect your personal and health information. We comply with all relevant healthcare data protection regulations and do not share your information with third parties without your explicit consent."
  }, {
    question: "How do I get my medicine delivered?",
    answer: "To order medicines, go to the 'Medicine Orders' section in your patient dashboard. You can upload your prescription, select the medicines you need, and proceed to checkout. We'll verify the prescription and deliver the medicines to your specified address within the estimated delivery time."
  }];

  // Filter FAQs based on search query
  const filteredFaqs = query ? faqs.filter(faq => faq.question.toLowerCase().includes(query.toLowerCase()) || faq.answer.toLowerCase().includes(query.toLowerCase())) : faqs;
  return <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 my-[50px]">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find answers to commonly asked questions or reach out to our support team for assistance.
          </p>
        </div>

        {/* Search FAQs */}
        <div className="max-w-3xl mx-auto mb-8">
          <input type="text" placeholder="Search for help topics..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" value={query} onChange={e => setQuery(e.target.value)} />
        </div>

        {/* FAQs Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="bg-white rounded-lg border">
            {filteredFaqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0">
                  <p className="text-gray-600">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>

          {filteredFaqs.length === 0 && <div className="text-center py-8">
              <p className="text-gray-500">No results found. Try a different search term or contact support.</p>
              <Button variant="outline" className="mt-4" onClick={() => setQuery("")}>
                Clear Search
              </Button>
            </div>}
        </div>

        {/* Contact Support Section */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Need More Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-3">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Live Chat</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-4 text-gray-600">Chat with our support team for immediate assistance</p>
                <Button variant="outline" className="w-full">Start Chat</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-3">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Email Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-4 text-gray-600">We'll respond to your query within 24 hours</p>
                <Button variant="outline" className="w-full">Email Us</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-3">
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Phone Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-4 text-gray-600">Available Monday to Friday, 9AM - 6PM</p>
                <Button variant="outline" className="w-full">+1 (555) 123-4567</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default HelpPage;