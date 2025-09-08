import React from 'react';

function AboutPage() {
  const teamMembers = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "CEO & Founder",
      bio: "With over 15 years of experience in the tech industry, Alex leads our company with vision and expertise.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "CTO",
      bio: "Sarah oversees all technical aspects of the company, bringing innovative solutions to complex problems.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Lead Developer",
      bio: "Michael leads our development team, ensuring high-quality code and timely delivery of projects.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 4,
      name: "Emily Rodriguez",
      role: "UX/UI Designer",
      bio: "Emily creates beautiful, intuitive user interfaces that enhance user experience across all our products.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
  ];

  const milestones = [
    {
      id: 1,
      year: 2015,
      title: "Company Founded",
      description: "Our company was established with a vision to transform businesses through technology."
    },
    {
      id: 2,
      year: 2017,
      title: "First Major Client",
      description: "Secured our first enterprise client and delivered a successful digital transformation project."
    },
    {
      id: 3,
      year: 2019,
      title: "Expansion",
      description: "Expanded our team and opened a new office to accommodate our growing business."
    },
    {
      id: 4,
      year: 2021,
      title: "Product Launch",
      description: "Launched our flagship product suite, offering comprehensive solutions across multiple domains."
    },
    {
      id: 5,
      year: 2023,
      title: "International Presence",
      description: "Established our international presence with clients across multiple countries."
    }
  ];

  const clientReviews = [
    {
      id: 1,
      name: "David Thompson",
      company: "Global Enterprises",
      review: "Working with this team has transformed our business operations. Their solutions have increased our efficiency by 40%.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 2,
      name: "Jennifer Lee",
      company: "Innovative Tech",
      review: "Their expertise in digital transformation helped us navigate our technology challenges with ease. Highly recommended!",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 3,
      name: "Robert Garcia",
      company: "HealthPlus",
      review: "The healthcare solutions provided by this team have revolutionized our patient management system, improving both efficiency and patient satisfaction.",
      image: "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-blue-900 dark:bg-blue-950 text-white py-20 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Learn about our journey, our team, and the mission that drives us forward.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center animate-fade-in">Our Mission & Vision</h2>
              <div className="w-20 h-1 bg-blue-600 dark:bg-blue-500 mx-auto mb-8"></div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg shadow-sm mb-8 animate-slide-up">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Mission</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our mission is to empower businesses through innovative technology solutions that drive 
                  growth, enhance efficiency, and create sustainable value. We are committed to excellence 
                  in everything we do, delivering tailored solutions that address the unique challenges of 
                  each client.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg shadow-sm animate-slide-up">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Vision</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We envision a future where technology seamlessly integrates with business processes, 
                  enabling organizations of all sizes to achieve their full potential. Our goal is to be 
                  the leading provider of innovative technology solutions that transform businesses and 
                  improve lives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-100 dark:bg-gray-850 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 animate-fade-in">Our Team</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Meet the talented individuals who make our company successful. Our diverse team brings a wealth of 
              experience and expertise to every project.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transform transition-transform hover:scale-105 duration-300">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6 dark:text-white">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">{member.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-300">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 animate-fade-in">Our Journey</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore the key milestones in our company's history that have shaped who we are today.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200 dark:bg-blue-900"></div>
              
              {/* Timeline items */}
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative z-10 mb-12">
                  <div className={`flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-1/2"></div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 border-4 border-white dark:border-gray-800 shadow"></div>
                    </div>
                    <div className="w-1/2 pl-6 pr-2">
                      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm animate-slide-up">
                        <div className="text-blue-600 dark:text-blue-400 font-bold text-xl mb-1">{milestone.year}</div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{milestone.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Client Testimonials */}
      <div className="py-16 bg-gray-100 dark:bg-gray-850 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 animate-fade-in">Client Testimonials</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hear what our clients have to say about their experience working with us.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {clientReviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md animate-slide-up">
                <div className="flex items-center mb-6">
                  <img 
                    src={review.image} 
                    alt={review.name} 
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{review.name}</h3>
                    <p className="text-gray-600">{review.company}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{review.review}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
