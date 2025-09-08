import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';

function HomePage() {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false
        }
      }
    ]
  };

  const carouselItems = [
    {
      id: 1,
      title: "Innovative Solutions for Modern Businesses",
      description: "We deliver cutting-edge technology solutions that help businesses transform and grow in the digital era.",
      backgroundImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      buttonText: "Explore More"
    },
    {
      id: 2,
      title: "Expert Team, Exceptional Results",
      description: "Our team of experts brings years of industry experience to deliver exceptional results for your business.",
      backgroundImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      buttonText: "Explore More"
    },
    {
      id: 3,
      title: "Tailored Solutions for Every Industry",
      description: "From healthcare to finance, we provide customized solutions designed for your specific industry needs.",
      backgroundImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      buttonText: "Explore More"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Carousel */}
      <div className="relative">
        <Slider {...sliderSettings}>
          {carouselItems.map((item) => (
            <div key={item.id} className="relative">
              <div className="h-[70vh] relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${item.backgroundImage})` }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                </div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
                  <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{item.title}</h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-8">{item.description}</p>
                    <Link 
                      to="/about" 
                      className="inline-block bg-blue-600 hover:bg-blue-700 transition duration-300 text-white font-semibold py-3 px-8 rounded-lg"
                    >
                      {item.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Quick Navigation */}
      <div className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 animate-slide-up">Our Expertise</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-slide-up">
              We specialize in a variety of domains, providing innovative solutions to meet your business needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 shadow-sm hover:shadow-md transition duration-300">
              <div className="text-blue-600 dark:text-blue-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Digital Services</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Comprehensive digital solutions including web development, mobile apps, and cloud services.
              </p>
              <Link to="/products" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium inline-flex items-center">
                View Solutions
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 shadow-sm hover:shadow-md transition duration-300">
              <div className="text-blue-600 dark:text-blue-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Automation Solutions</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Streamline your operations with our smart automation solutions that enhance efficiency.
              </p>
              <Link to="/products" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium inline-flex items-center">
                View Solutions
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 shadow-sm hover:shadow-md transition duration-300">
              <div className="text-blue-600 dark:text-blue-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Data Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Turn your data into insights with our advanced analytics and prediction solutions.
              </p>
              <Link to="/products" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium inline-flex items-center">
                View Solutions
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Company Overview */}
      <div className="py-16 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 animate-fade-in">About Our Company</h2>
              <div className="w-20 h-1 bg-blue-600 dark:bg-blue-500 mx-auto mb-6"></div>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed animate-slide-up">
              We are a leading technology company dedicated to helping businesses transform their operations through innovative solutions. 
              With our deep industry expertise and cutting-edge technology, we deliver tailored solutions that address your unique challenges.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed animate-slide-up">
              Our team of experts works closely with you to understand your business needs and develop solutions that drive growth and efficiency.
              We're committed to delivering exceptional results and building lasting partnerships with our clients.
            </p>
            <div className="text-center">
              <Link 
                to="/about" 
                className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition duration-300 text-white font-semibold py-3 px-8 rounded-lg"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
