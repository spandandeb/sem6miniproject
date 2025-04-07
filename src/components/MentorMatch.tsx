import React, { useState, useEffect } from 'react';
import { Search, Users, MapPin, Briefcase, Clock, Star, MessageSquare } from 'lucide-react';

// Define interfaces for our data models
interface Skill {
  id: number;
  name: string;
}

interface Industry {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  role: string;
  skills: Skill[];
  interests: string[];
  bio: string;
  location: string;
  industry: Industry;
  experienceYears: number;
}

interface Mentor extends User {
  company: string;
  position: string;
  availability: string[];
  rating: number;
  totalMentees: number;
  profileImage: string;
  matchScore?: number;
}

// ML model-based matching via API
const fetchMatchScores = async (student: User, mentors: Mentor[]): Promise<Mentor[]> => {
  try {
    const response = await fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student: student,
        mentors: mentors
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.mentors;
  } catch (error) {
    console.error('Error fetching match scores:', error);
    // Fallback to local calculation if API fails
    return mentors.map(mentor => ({
      ...mentor,
      matchScore: calculateMatchScoreLocal(student, mentor)
    }));
  }
};

// Fallback local calculation if API is unavailable
const calculateMatchScoreLocal = (student: User, mentor: Mentor): number => {
  let score = 0;
  const weights = {
    skills: 0.4,
    industry: 0.3,
    interests: 0.2,
    location: 0.1
  };

  // Calculate skill match
  const studentSkillsSet = new Set(student.skills.map(skill => skill.name.toLowerCase()));
  const mentorSkillsSet = new Set(mentor.skills.map(skill => skill.name.toLowerCase()));
  const commonSkills = [...studentSkillsSet].filter(skill => mentorSkillsSet.has(skill));
  const skillScore = commonSkills.length / Math.max(studentSkillsSet.size, 1);
  
  // Calculate industry match
  const industryScore = student.industry.id === mentor.industry.id ? 1 : 0;
  
  // Calculate interests match
  const studentInterestsSet = new Set(student.interests.map(interest => interest.toLowerCase()));
  const mentorInterestsSet = new Set(mentor.interests.map(interest => interest.toLowerCase()));
  const commonInterests = [...studentInterestsSet].filter(interest => mentorInterestsSet.has(interest));
  const interestScore = commonInterests.length / Math.max(studentInterestsSet.size, 1);
  
  // Calculate location match
  const locationScore = student.location === mentor.location ? 1 : 0;
  
  // Calculate weighted score
  score = (
    weights.skills * skillScore +
    weights.industry * industryScore +
    weights.interests * interestScore +
    weights.location * locationScore
  ) * 100;
  
  return Math.round(score);
};

const MentorMatch: React.FC = () => {
  // State for API loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Mock current user (student) data
  const [currentUser] = useState<User>({
    id: 1,
    name: "Alex Johnson",
    role: "Student",
    skills: [
      { id: 1, name: "JavaScript" },
      { id: 2, name: "React" },
      { id: 3, name: "UI/UX Design" }
    ],
    interests: ["Web Development", "Mobile Apps", "AI/ML"],
    bio: "Computer Science student passionate about frontend development and UX design.",
    location: "San Francisco",
    industry: { id: 1, name: "Technology" },
    experienceYears: 1
  });

  // Mock mentors data
  const [allMentors] = useState<Mentor[]>([
    {
      id: 101,
      name: "Sarah Chen",
      role: "Mentor",
      skills: [
        { id: 1, name: "JavaScript" },
        { id: 2, name: "React" },
        { id: 4, name: "Node.js" },
        { id: 5, name: "TypeScript" }
      ],
      interests: ["Web Development", "Open Source", "Teaching"],
      bio: "Senior developer with 8 years of experience in full-stack web development.",
      location: "San Francisco",
      industry: { id: 1, name: "Technology" },
      experienceYears: 8,
      company: "Google",
      position: "Senior Software Engineer",
      availability: ["Monday evenings", "Wednesday afternoons", "Weekends"],
      rating: 4.9,
      totalMentees: 24,
      profileImage: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 102,
      name: "Michael Rodriguez",
      role: "Mentor",
      skills: [
        { id: 3, name: "UI/UX Design" },
        { id: 6, name: "Figma" },
        { id: 7, name: "Adobe XD" }
      ],
      interests: ["UI/UX Design", "Design Systems", "User Research"],
      bio: "Product designer focused on creating intuitive user experiences.",
      location: "New York",
      industry: { id: 2, name: "Design" },
      experienceYears: 6,
      company: "Airbnb",
      position: "Senior Product Designer",
      availability: ["Tuesday afternoons", "Thursday evenings"],
      rating: 4.7,
      totalMentees: 18,
      profileImage: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 103,
      name: "Priya Patel",
      role: "Mentor",
      skills: [
        { id: 8, name: "Python" },
        { id: 9, name: "TensorFlow" },
        { id: 10, name: "Machine Learning" }
      ],
      interests: ["AI/ML", "Data Science", "Research"],
      bio: "AI researcher with a focus on natural language processing and computer vision.",
      location: "Seattle",
      industry: { id: 1, name: "Technology" },
      experienceYears: 5,
      company: "Microsoft",
      position: "AI Research Scientist",
      availability: ["Monday afternoons", "Friday evenings"],
      rating: 4.8,
      totalMentees: 15,
      profileImage: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
      id: 104,
      name: "David Kim",
      role: "Mentor",
      skills: [
        { id: 1, name: "JavaScript" },
        { id: 11, name: "React Native" },
        { id: 12, name: "Mobile Development" }
      ],
      interests: ["Mobile Apps", "Cross-platform Development", "UI Animation"],
      bio: "Mobile developer specializing in cross-platform solutions.",
      location: "San Francisco",
      industry: { id: 1, name: "Technology" },
      experienceYears: 7,
      company: "Uber",
      position: "Lead Mobile Developer",
      availability: ["Tuesday evenings", "Weekends"],
      rating: 4.6,
      totalMentees: 20,
      profileImage: "https://randomuser.me/api/portraits/men/75.jpg"
    },
    {
      id: 105,
      name: "Emma Wilson",
      role: "Mentor",
      skills: [
        { id: 13, name: "Product Management" },
        { id: 14, name: "Agile" },
        { id: 15, name: "User Stories" }
      ],
      interests: ["Product Strategy", "User-Centered Design", "Agile Methodologies"],
      bio: "Product manager with experience in both startups and enterprise companies.",
      location: "Boston",
      industry: { id: 1, name: "Technology" },
      experienceYears: 9,
      company: "HubSpot",
      position: "Senior Product Manager",
      availability: ["Wednesday mornings", "Thursday afternoons"],
      rating: 4.9,
      totalMentees: 22,
      profileImage: "https://randomuser.me/api/portraits/women/17.jpg"
    }
  ]);

  // State for filtered and matched mentors
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<number | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [experienceFilter, setExperienceFilter] = useState<number | null>(null);
  const [skillFilter, setSkillFilter] = useState<number | null>(null);

  // Feedback state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<{[key: number]: boolean}>({});
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentMentorForFeedback, setCurrentMentorForFeedback] = useState<Mentor | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Get all unique industries, locations, and skills for filters
  const industries = Array.from(new Set(allMentors.map(mentor => mentor.industry.name)));
  const locations = Array.from(new Set(allMentors.map(mentor => mentor.location)));
  const allSkills = Array.from(
    new Set(
      allMentors.flatMap(mentor => 
        mentor.skills.map(skill => skill.name)
      )
    )
  );

  // Apply ML-based matching on component mount
  useEffect(() => {
    const fetchMentorScores = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        // Call the API to get mentor match scores using the ML model
        const mentorsWithScores = await fetchMatchScores(currentUser, allMentors);
        
        // Sort by match score (highest first)
        const sortedMentors = mentorsWithScores.sort((a, b) => 
          (b.matchScore || 0) - (a.matchScore || 0)
        );
        
        setMentors(sortedMentors);
        setFilteredMentors(sortedMentors);
      } catch (error) {
        console.error('Error fetching mentor matches:', error);
        setApiError('Failed to load mentor matches from ML model. Using fallback algorithm.');
        
        // Fallback to local calculation if API fails
        const mentorsWithScores = allMentors.map(mentor => ({
          ...mentor,
          matchScore: calculateMatchScoreLocal(currentUser, mentor)
        }));
        
        // Sort by match score (highest first)
        const sortedMentors = mentorsWithScores.sort((a, b) => 
          (b.matchScore || 0) - (a.matchScore || 0)
        );
        
        setMentors(sortedMentors);
        setFilteredMentors(sortedMentors);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMentorScores();
  }, [currentUser, allMentors]);

  // Apply filters when they change
  useEffect(() => {
    let result = [...mentors];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(mentor => 
        mentor.name.toLowerCase().includes(term) || 
        mentor.company.toLowerCase().includes(term) ||
        mentor.position.toLowerCase().includes(term) ||
        mentor.skills.some(skill => skill.name.toLowerCase().includes(term))
      );
    }
    
    // Apply industry filter
    if (industryFilter !== null) {
      result = result.filter(mentor => mentor.industry.id === industryFilter);
    }
    
    // Apply location filter
    if (locationFilter) {
      result = result.filter(mentor => mentor.location === locationFilter);
    }
    
    // Apply experience filter
    if (experienceFilter !== null) {
      result = result.filter(mentor => mentor.experienceYears >= experienceFilter);
    }
    
    // Apply skill filter
    if (skillFilter !== null) {
      result = result.filter(mentor => 
        mentor.skills.some(skill => skill.id === skillFilter)
      );
    }
    
    setFilteredMentors(result);
  }, [searchTerm, industryFilter, locationFilter, experienceFilter, skillFilter, mentors]);

  // Handle requesting mentorship
  const handleRequestMentorship = (mentor: Mentor) => {
    // In a real app, this would send a request to the backend
    alert(`Mentorship request sent to ${mentor.name}!`);
  };

  // Handle opening feedback modal
  const handleOpenFeedback = (mentor: Mentor) => {
    setCurrentMentorForFeedback(mentor);
    setShowFeedbackModal(true);
  };

  // Handle submitting feedback
  const handleSubmitFeedback = () => {
    if (!currentMentorForFeedback) return;
    
    // In a real app, this would send feedback to the backend
    // and potentially update the ML model
    
    // For demo purposes, we'll just mark this mentor as having received feedback
    setFeedbackSubmitted({
      ...feedbackSubmitted,
      [currentMentorForFeedback.id]: true
    });
    
    // Close the modal and reset form
    setShowFeedbackModal(false);
    setFeedbackRating(5);
    setFeedbackComment('');
    setCurrentMentorForFeedback(null);
    
    alert('Thank you for your feedback! This helps us improve our matching algorithm.');
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setIndustryFilter(null);
    setLocationFilter(null);
    setExperienceFilter(null);
    setSkillFilter(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {apiError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
          <p>{apiError}</p>
        </div>
      )}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Find Your Perfect Mentor
        </h1>
        <p className="text-gray-600 mt-2">
          Our ML-powered system matches you with mentors based on your skills, interests, and career goals.
        </p>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search mentors by name, company, position, or skills"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Industry filter */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <select
              id="industry"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              value={industryFilter || ''}
              onChange={(e) => setIndustryFilter(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">All Industries</option>
              {industries.map((industry, index) => (
                <option key={index} value={index + 1}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          {/* Location filter */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              id="location"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              value={locationFilter || ''}
              onChange={(e) => setLocationFilter(e.target.value || null)}
            >
              <option value="">All Locations</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Experience filter */}
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
              Min. Experience (Years)
            </label>
            <select
              id="experience"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              value={experienceFilter || ''}
              onChange={(e) => setExperienceFilter(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Any Experience</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
              <option value="7">7+ Years</option>
              <option value="10">10+ Years</option>
            </select>
          </div>

          {/* Skills filter */}
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
              Skills
            </label>
            <select
              id="skills"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              value={skillFilter || ''}
              onChange={(e) => setSkillFilter(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">All Skills</option>
              {allSkills.map((skill, index) => (
                <option key={index} value={index + 1}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mentor cards */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="ml-3 text-indigo-600 font-medium">Loading mentor matches from ML model...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMentors.length > 0 ? (
          filteredMentors.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="h-16 w-16 rounded-full overflow-hidden mr-4 border-2 border-indigo-100">
                    <img src={mentor.profileImage} alt={mentor.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>
                    <p className="text-indigo-600">{mentor.position} at {mentor.company}</p>
                    
                    {/* Match score */}
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      <span className="mr-1">Match:</span>
                      <span className="font-bold">{mentor.matchScore}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{mentor.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Briefcase className="h-4 w-4 mr-1" />
                    <span>{mentor.industry.name} • {mentor.experienceYears} years</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{mentor.totalMentees} mentees</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                    <span>{mentor.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.map((skill) => (
                      <span 
                        key={skill.id} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Availability</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.availability.map((time, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button 
                    onClick={() => handleRequestMentorship(mentor)}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-medium flex items-center justify-center"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request Mentorship
                  </button>
                  
                  {feedbackSubmitted[mentor.id] ? (
                    <button 
                      disabled
                      className="flex-1 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg font-medium flex items-center justify-center cursor-not-allowed"
                    >
                      Feedback Submitted
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleOpenFeedback(mentor)}
                      className="flex-1 bg-white text-indigo-600 px-4 py-2 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-all font-medium"
                    >
                      Provide Feedback
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500 text-lg">No mentors found matching your filters. Try adjusting your search criteria.</p>
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Provide Feedback for {currentMentorForFeedback?.name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFeedbackRating(rating)}
                    className={`p-2 rounded-full ${
                      feedbackRating >= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                Comments
              </label>
              <textarea
                id="feedback"
                rows={4}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Share your experience with this mentor..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitFeedback}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorMatch;
