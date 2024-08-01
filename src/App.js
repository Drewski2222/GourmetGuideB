import React, { useState } from 'react';
import './App.css';
import { jsPDF } from "jspdf";
import DOMPurify from 'dompurify';
import styled from 'styled-components';
import { marked } from 'marked';
import img1 from "./feature-img.png";
import img2 from "./Chef_icon.svg.png";
import img3 from "./splash.png";
import { ArrowRight, UtensilsCrossed, Clock, Sparkles } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
    <Icon className="text-blue-300 w-12 h-12 mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

const HomePage = ({ onGetStarted }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
    <div className="container mx-auto px-4 py-16">
      <nav className="flex justify-between items-center mb-16">
        <h1 className="text-3xl font-bold">Gourmet Guide (Design B) 🧑‍🍳</h1>
        <button
          onClick={onGetStarted}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          Get Started
        </button>
      </nav>

      <main className="text-center mb-20">
        <h2 className="text-5xl font-bold mb-6">Elevate Your Culinary Experience</h2>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Discover personalized meal plans tailored to your preferences and ingredients. 
          Let Gourmet Guide help you transform your pantry and fridge into delicacies!
        </p>
        <button
          onClick={onGetStarted}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center mx-auto"
        >
          Start Your Culinary Journey <ArrowRight className="ml-2" />
        </button>
      </main>

      <section className="grid md:grid-cols-3 gap-8 mb-20">
        <FeatureCard
          icon={UtensilsCrossed}
          title="Personalized Meal Plans"
          description="Get a fully customized 3-meal per day plan for as many days as you desire."
        />
        <FeatureCard
          icon={Sparkles}
          title="Ingredient Magic"
          description="Transform simple ingredients into gourmet delicacies with our expert recipes."
        />
        <FeatureCard
          icon={Clock}
          title="Effortless Meal Prep"
          description="Save time and reduce stress with our efficient meal preparation guidance."
        />
      </section>

      <footer className="text-center text-gray-400">
        <p>&copy; 2024 Drew Reisner</p>
      </footer>
    </div>
  </div>
);

const MealPlanContent = styled.div`
  h2 {
    font-size: 1.5em;
    font-weight: bold;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }
  h3 {
    font-size: 1.3em;
    font-weight: bold;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }
  p {
    margin-bottom: 0.5em;
  }
  ul {
    list-style-type: disc;
    padding-left: 1.5em;
    margin-bottom: 1em;
  }
  li {
    margin-bottom: 0.25em;
  }
  strong {
    font-weight: bold;
  }
`;

const MainScreen = ({ onGourmetGuideClick }) => {
  const [ingredients, setIngredients] = useState('');
  const [mealPlan, setMealPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [daysToPlan, setDaysToPlan] = useState(7);
  const [inputType, setInputType] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  const generateMealPlan = async () => {
    setIsGenerating(true);
    try {
      let response;
      if (inputType === 'text') {
        response = await fetch('https://gourmetguide.adaptable.app/generate-meal-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            ingredients: ingredients, 
            daysToPlan: daysToPlan,
          }),
        });
      } else if (inputType === 'image' && uploadedImage) {
        const formData = new FormData();
        formData.append('image', uploadedImage);
        formData.append('daysToPlan', daysToPlan);
        
        response = await fetch('https://gourmetguide.adaptable.app/generate-meal-plan-from-image', {
          method: 'POST',
          body: formData,
        });
      }

      const data = await response.text();
      setMealPlan(marked(data));
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      setMealPlan('Error 217: Error processing request');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setUploadedImage(file);
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const parser = new DOMParser();
    const doc = parser.parseFromString(mealPlan, 'text/html');
    
    let y = 15;
    const margin = 15;
    const pageWidth = pdf.internal.pageSize.width;
    const maxWidth = pageWidth - 2 * margin;
  
    const addTextWithWrapping = (text, fontSize, isBold = false, indent = 0) => {
      pdf.setFontSize(fontSize);
      pdf.setFont(undefined, isBold ? 'bold' : 'normal');
      const lines = pdf.splitTextToSize(text, maxWidth - indent);
      lines.forEach(line => {
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(margin + indent, y, line);
        y += fontSize * 0.7;
      });
      y += fontSize * 0.0001;
    };
  
    // Add title
    const title = doc.querySelector('h2') ? doc.querySelector('h2').textContent : 'Gourmet Guide Meal Plan';
    addTextWithWrapping(title, 18, true);
  
    Array.from(doc.body.children).forEach(element => {
      if (element.tagName === 'H3' && element.textContent.startsWith('Day')) {
        // Day header
        y += 5;
        addTextWithWrapping(element.textContent, 14, true);
      } else if (element.tagName === 'UL') {
        Array.from(element.children).forEach(li => {
          const [mealType, mealDescription] = li.textContent.split(':');
          addTextWithWrapping(mealType + ':', 12, true, 5);
          addTextWithWrapping(mealDescription.trim(), 12, false, 10);
        });
      } else if (element.tagName === 'P') {
        addTextWithWrapping(element.textContent, 12, false);
      }
    });
  
    pdf.save('meal_plan.pdf');
  };  

  const refreshPage = () => {
    setIngredients('');
    setMealPlan('');
  };

  return (
    <div className="min-h-screen bg-blue-900 text-white p-8">
      <div className="container mx-auto">
        <h1
          onClick={onGourmetGuideClick}
          className="text-4xl font-bold mb-8 cursor-pointer"
        >
          Gourmet Guide (Design B) 🧑‍🍳
        </h1>
        <div className="grid grid-cols-2 gap-8">
        <div>
            <h2 className="text-2xl font-bold mb-4">Meal Plan</h2>
            {mealPlan ? (
              <MealPlanContent className="bg-white text-black p-4 rounded h-80 overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mealPlan) }} />
              </MealPlanContent>
            ) : (
              <p className="text-gray-300 italic">
                Your meal plan will appear here. Click "Create Meal Plan" below!
              </p>
            )}
            <h3 className="text-2x1 mt-4">Note: Calorie count may be inaccurate.</h3>
            {mealPlan && (
              <div className="mt-4">
                <p className="mb-5">
                  Your meal plan is ready! You can now download it as a PDF.
                </p>
                <button
                  onClick={downloadPDF}
                  className="bg-green-500 hover:bg-green-600 mb-7 text-white font-bold py-2 px-4 rounded"
                >
                  Download as PDF
                </button>
              </div>
            )}
            {mealPlan && (
              <button
                onClick={refreshPage}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                  Create New Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [showMainScreen, setShowMainScreen] = useState(false);

  const navigateToHome = () => {
    setShowMainScreen(false);
  };

  return (
    <div>
      {showMainScreen ? (
        <MainScreen onGourmetGuideClick={navigateToHome} />
      ) : (
        <HomePage onGetStarted={() => setShowMainScreen(true)} />
      )}
    </div>
  );
};

export default App;