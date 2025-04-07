import React, { useState, useEffect } from 'react';
import { Search, Users, MapPin, Briefcase, Clock, Star, MessageSquare, Filter, X } from 'lucide-react';

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

interface Alumni extends User {
  company: string;
  position: string;
  availability: string[];
  rating: number;
  totalMentees: number;
  profileImage: string;
  matchScore?: number;
  graduationYear: number;
}

// ML model-based matching via API
const fetchMatchScores = async (student: User, alumni: Alumni[]): Promise<Alumni[]> => {
  try {
    console.log('Fetching match scores from ML model');
    const response = await fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student: student,
        mentors: alumni // Backend still expects 'mentors' key
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Received match scores from ML model');
    return data.mentors;
  } catch (error) {
    console.error('Error fetching match scores:', error);
    // Fallback to local calculation if API fails
    console.log('Using fallback local calculation');
    return alumni.map(alum => ({
      ...alum,
      matchScore: calculateMatchScoreLocal(student, alum)
    }));
  }
};

// Fallback local calculation if API is unavailable
const calculateMatchScoreLocal = (student: User, alumni: Alumni): number => {
  // Create a feature vector similar to what our backend expects
  const features = [];
  
  // Skills match (count of common skills)
  const studentSkills = new Set(student.skills.map(skill => skill.name.toLowerCase()));
  const alumniSkills = new Set(alumni.skills.map(skill => skill.name.toLowerCase()));
  const commonSkills = [...studentSkills].filter(skill => alumniSkills.has(skill));
  features.push(commonSkills.length);
  
  // Industry match (binary: 1 if same industry, 0 otherwise)
  const industryMatch = student.industry.id === alumni.industry.id ? 1 : 0;
  features.push(industryMatch);
  
  // Interests match (count of common interests)
  const studentInterests = new Set(student.interests.map(interest => interest.toLowerCase()));
  const alumniInterests = new Set(alumni.interests.map(interest => interest.toLowerCase()));
  const commonInterests = [...studentInterests].filter(interest => alumniInterests.has(interest));
  features.push(commonInterests.length);
  
  // Location match (binary: 1 if same location, 0 otherwise)
  const locationMatch = student.location === alumni.location ? 1 : 0;
  features.push(locationMatch);
  
  // Experience years difference (absolute difference)
  const experienceDiff = Math.abs(student.experienceYears - alumni.experienceYears);
  features.push(experienceDiff);
  
  // Alumni rating
  features.push(alumni.rating);
  
  // Alumni total mentees
  features.push(alumni.totalMentees);
  
  // Calculate score using the same weights as in the server's fallback
  const weights = [15, 20, 10, 10, -2, 5, 2];
  
  // Adjust the experience_diff feature to be inverse (10 - diff, but min 0)
  const adjustedFeatures = [...features];
  adjustedFeatures[4] = Math.max(0, 10 - adjustedFeatures[4]);
  
  // Calculate weighted sum
  let score = 0;
  for (let i = 0; i < Math.min(adjustedFeatures.length, weights.length); i++) {
    score += adjustedFeatures[i] * weights[i];
  }
  
  // Ensure score is between 0-100
  return Math.min(100, Math.max(0, Math.round(score)));
};

const MentorMatch: React.FC = () => {
  // State for API loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
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

  // State for available skills and industries (for filtering)
  const [availableSkills] = useState<Skill[]>([
    { id: 1, name: "JavaScript" },
    { id: 2, name: "React" },
    { id: 3, name: "UI/UX Design" },
    { id: 4, name: "Node.js" },
    { id: 5, name: "TypeScript" },
    { id: 6, name: "Python" },
    { id: 7, name: "Data Science" },
    { id: 8, name: "Machine Learning" },
    { id: 9, name: "Product Management" },
    { id: 10, name: "Cloud Computing" },
    { id: 11, name: "DevOps" },
    { id: 12, name: "Cybersecurity" }
  ]);
  
  const [availableIndustries] = useState<Industry[]>([
    { id: 1, name: "Technology" },
    { id: 2, name: "Finance" },
    { id: 3, name: "Healthcare" },
    { id: 4, name: "Education" },
    { id: 5, name: "Manufacturing" },
    { id: 6, name: "Retail" }
  ]);

  // Mock alumni data
  const [allAlumni] = useState<Alumni[]>([
    {
      id: 101,
      name: "Sarah Chen",
      role: "Alumni",
      skills: [
        { id: 1, name: "JavaScript" },
        { id: 2, name: "React" },
        { id: 4, name: "Node.js" },
        { id: 5, name: "TypeScript" }
      ],
      interests: ["Web Development", "Open Source", "Teaching"],
      bio: "Full-stack developer with 5 years of experience. Passionate about mentoring new developers.",
      location: "San Francisco",
      industry: { id: 1, name: "Technology" },
      experienceYears: 5,
      company: "TechCorp",
      position: "Senior Frontend Developer",
      availability: ["Weekday Evenings", "Weekends"],
      rating: 4.8,
      totalMentees: 12,
      profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
      graduationYear: 2018
    },
    {
      id: 102,
      name: "Marcus Johnson",
      role: "Alumni",
      skills: [
        { id: 6, name: "Python" },
        { id: 7, name: "Data Science" },
        { id: 8, name: "Machine Learning" }
      ],
      interests: ["AI/ML", "Data Visualization", "Research"],
      bio: "Data scientist specializing in machine learning models for finance.",
      location: "New York",
      industry: { id: 2, name: "Finance" },
      experienceYears: 7,
      company: "FinTech Solutions",
      position: "Lead Data Scientist",
      availability: ["Weekends"],
      rating: 4.9,
      totalMentees: 8,
      profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
      graduationYear: 2016
    },
    {
      id: 103,
      name: "Priya Patel",
      role: "Alumni",
      skills: [
        { id: 9, name: "Product Management" },
        { id: 3, name: "UI/UX Design" }
      ],
      interests: ["Product Strategy", "UX Research", "Startups"],
      bio: "Product manager with experience in both startups and enterprise companies.",
      location: "Seattle",
      industry: { id: 1, name: "Technology" },
      experienceYears: 6,
      company: "ProductLab",
      position: "Senior Product Manager",
      availability: ["Weekday Evenings", "Weekends"],
      rating: 4.7,
      totalMentees: 15,
      profileImage: "https://randomuser.me/api/portraits/women/68.jpg" ,
      graduationYear: 2017
    },
    {
      id: 104,
      name: "David Kim",
      role: "Alumni",
      skills: [
        { id: 10, name: "Cloud Computing" },
        { id: 11, name: "DevOps" },
        { id: 12, name: "Cybersecurity" }
      ],
      interests: ["Cloud Architecture", "Security", "System Design"],
      bio: "Cloud architect specializing in secure infrastructure and DevOps practices.",
      location: "Chicago",
      industry: { id: 1, name: "Technology" },
      experienceYears: 8,
      company: "CloudSecure",
      position: "Principal Cloud Architect",
      availability: ["Weekday Mornings"],
      rating: 4.6,
      totalMentees: 6,
      profileImage: "https://randomuser.me/api/portraits/men/75.jpg",
      graduationYear: 2015
    },
    {
      id: 105,
      name: "Elena Rodriguez",
      role: "Alumni",
      skills: [
        { id: 1, name: "JavaScript" },
        { id: 2, name: "React" },
        { id: 3, name: "UI/UX Design" }
      ],
      interests: ["Web Development", "Mobile Apps", "Design Systems"],
      bio: "Frontend developer focused on creating accessible and beautiful user interfaces.",
      location: "San Francisco",
      industry: { id: 1, name: "Technology" },
      experienceYears: 4,
      company: "DesignTech",
      position: "UI/UX Developer",
      availability: ["Weekends", "Weekday Evenings"],
      rating: 4.9,
      totalMentees: 10,
      profileImage: "https://randomuser.me/api/portraits/women/90.jpg" ,
      graduationYear: 2019
    }
  ]);

  // State for displayed alumni (after filtering and matching)
  const [displayedAlumni, setDisplayedAlumni] = useState<Alumni[]>([]);
  
  // State for connection requests and feedback
  const [connectionRequests, setConnectionRequests] = useState<{[key: number]: boolean}>({});
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [currentAlumniForFeedback, setCurrentAlumniForFeedback] = useState<Alumni | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<{[key: number]: boolean}>({});

  // Fetch alumni match scores on component mount
  useEffect(() => {
    fetchAlumniScores();
  }, []);

  // Fetch alumni match scores whenever filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedSkills, selectedIndustry]);

  // Function to fetch alumni scores from the API
  const fetchAlumniScores = async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Update the current user with selected skills and industry for matching
      const userForMatching = {
        ...currentUser,
        skills: selectedSkills.length > 0 ? selectedSkills : currentUser.skills,
        industry: selectedIndustry || currentUser.industry
      };
      
      // Fetch match scores from the API
      const scoredAlumni = await fetchMatchScores(userForMatching, allAlumni);
      
      // Apply any additional filters
      applyFilters(scoredAlumni);
    } catch (error) {
      console.error('Error fetching alumni scores:', error);
      setApiError('Failed to fetch alumni match scores. Please try again later.');
      setDisplayedAlumni(allAlumni);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to apply filters to alumni list
  const applyFilters = (alumniList = displayedAlumni.length ? displayedAlumni : allAlumni) => {
    let filtered = [...alumniList];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((alumni: Alumni) => 
        alumni.name.toLowerCase().includes(term) ||
        alumni.skills.some((skill: Skill) => skill.name.toLowerCase().includes(term)) ||
        alumni.company.toLowerCase().includes(term) ||
        alumni.position.toLowerCase().includes(term) ||
        alumni.bio.toLowerCase().includes(term)
      );
    }
    
    // Apply skills filter
    if (selectedSkills.length > 0) {
      const skillIds = new Set(selectedSkills.map((skill: Skill) => skill.id));
      filtered = filtered.filter((alumni: Alumni) => 
        alumni.skills.some((skill: Skill) => skillIds.has(skill.id))
      );
    }
    
    // Apply industry filter
    if (selectedIndustry) {
      filtered = filtered.filter((alumni: Alumni) => 
        alumni.industry.id === selectedIndustry.id
      );
    }
    
    // Sort by match score if available
    filtered.sort((a: Alumni, b: Alumni) => {
      if (a.matchScore !== undefined && b.matchScore !== undefined) {
        return b.matchScore - a.matchScore;
      }
      return 0;
    });
    
    setDisplayedAlumni(filtered);
  };

  // Handle requesting connection with an alumni
  const handleRequestConnection = (alumni: Alumni): void => {
    setConnectionRequests({
      ...connectionRequests,
      [alumni.id]: true
    });
    
    // In a real app, you would send this request to the backend
    console.log(`Connection requested with ${alumni.name}`);
  };

  // Handle opening feedback modal
  const handleOpenFeedback = (alumni: Alumni): void => {
    setCurrentAlumniForFeedback(alumni);
    setFeedbackRating(0);
    setFeedbackComment('');
    setShowFeedbackModal(true);
  };

  // Handle submitting feedback
  const handleSubmitFeedback = (): void => {
    if (currentAlumniForFeedback && feedbackRating > 0) {
      // In a real app, you would send this feedback to the backend
      console.log(`Feedback submitted for ${currentAlumniForFeedback.name}: ${feedbackRating} stars, "${feedbackComment}"`);
      
      setFeedbackSubmitted({
        ...feedbackSubmitted,
        [currentAlumniForFeedback.id]: true
      });
      
      setShowFeedbackModal(false);
    }
  };

  // Reset all filters
  const resetFilters = (): void => {
    setSearchTerm('');
    setSelectedSkills([]);
    setSelectedIndustry(null);
    fetchAlumniScores();
  };

  // Add a skill to the filter
  const addSkillFilter = (skill: Skill): void => {
    if (!selectedSkills.some((s: Skill) => s.id === skill.id)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Remove a skill from the filter
  const removeSkillFilter = (skillId: number): void => {
    setSelectedSkills(selectedSkills.filter((skill: Skill) => skill.id !== skillId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Alumni Connect</h1>
      
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search alumni by name, skills, or company..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && applyFilters()}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button 
                onClick={() => applyFilters()}
                className="h-5 w-5 text-gray-400 hover:text-indigo-600 focus:outline-none"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Filter Button */}
          <button
            onClick={(): void => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
            {(selectedSkills.length > 0 || selectedIndustry) && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {selectedSkills.length + (selectedIndustry ? 1 : 0)}
              </span>
            )}
          </button>
          
          {/* Reset Button (only shown if filters are applied) */}
          {(selectedSkills.length > 0 || selectedIndustry || searchTerm) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <X className="h-5 w-5 mr-2" />
              Reset
            </button>
          )}
        </div>
        
        {/* Expanded Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
                <div className="mb-2 flex flex-wrap gap-2">
                  {selectedSkills.map((skill: Skill) => (
                    <span 
                      key={skill.id} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {skill.name}
                      <button 
                        type="button" 
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:text-indigo-600 focus:outline-none"
                        onClick={() => removeSkillFilter(skill.id)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const skillId = parseInt(e.target.value);
                    if (skillId) {
                      const skill = availableSkills.find((s: Skill) => s.id === skillId);
                      if (skill) addSkillFilter(skill);
                    }
                    e.target.value = ""; // Reset select after selection
                  }}
                  value=""
                >
                  <option value="">Select a skill to add</option>
                  {availableSkills
                    .filter((skill: Skill) => !selectedSkills.some((s: Skill) => s.id === skill.id))
                    .map((skill: Skill) => (
                      <option key={skill.id} value={skill.id}>{skill.name}</option>
                    ))
                  }
                </select>
              </div>
              
              {/* Industry Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Industry</h3>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedIndustry?.id || ""}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const industryId = parseInt(e.target.value);
                    if (industryId) {
                      const industry = availableIndustries.find((i: Industry) => i.id === industryId);
                      setSelectedIndustry(industry || null);
                    } else {
                      setSelectedIndustry(null);
                    }
                  }}
                >
                  <option value="">All Industries</option>
                  {availableIndustries.map((industry: Industry) => (
                    <option key={industry.id} value={industry.id}>{industry.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={(): void => setShowFilters(false)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Loading and Error States */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {apiError}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Alumni Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedAlumni.length > 0 ? (
            displayedAlumni.map((alumni: Alumni) => (
              <div key={alumni.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Alumni Card Header */}
                <div className="relative">
                  <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                  <div className="absolute -bottom-12 left-4">
                    <img 
                      src={alumni.profileImage} 
                      alt={alumni.name} 
                      className="h-24 w-24 rounded-full border-4 border-white object-cover"
                    />
                  </div>
                  {alumni.matchScore !== undefined && (
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-semibold text-indigo-600 shadow">
                      {alumni.matchScore}% Match
                    </div>
                  )}
                </div>
                
                {/* Alumni Card Body */}
                <div className="pt-14 px-4 pb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{alumni.name}</h3>
                  <p className="text-gray-600">{alumni.position} at {alumni.company}</p>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                      <span className="text-gray-600">{alumni.location}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Briefcase className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                      <span className="text-gray-600">{alumni.industry.name} • {alumni.experienceYears} years</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                      <span className="text-gray-600">Available: {alumni.availability.join(', ')}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Star className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                      <span className="text-gray-600">{alumni.rating} • {alumni.totalMentees} mentees</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {alumni.skills.map(skill => (
                        <span 
                          key={skill.id} 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedSkills.some(s => s.id === skill.id)
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-600 text-sm line-clamp-3">{alumni.bio}</p>
                  </div>
                  
                  <div className="mt-6 flex space-x-4">
                    {connectionRequests[alumni.id] ? (
                      <button 
                        disabled
                        className="flex-1 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg font-medium flex items-center justify-center cursor-not-allowed"
                      >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Request Sent
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRequestConnection(alumni)}
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all font-medium flex items-center justify-center"
                      >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Connect
                      </button>
                    )}
                    
                    {feedbackSubmitted[alumni.id] ? (
                      <button 
                        disabled
                        className="flex-1 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg font-medium flex items-center justify-center cursor-not-allowed"
                      >
                        Feedback Submitted
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleOpenFeedback(alumni)}
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
              <p className="text-gray-500 text-lg">No alumni found matching your filters. Try adjusting your search criteria.</p>
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
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Feedback for {currentAlumniForFeedback?.name}
              </h3>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`p-1 rounded-full focus:outline-none ${
                        feedbackRating >= star ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star className="h-8 w-8" fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  id="feedback"
                  rows={4}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Share your experience with this alumni..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitFeedback}
                disabled={feedbackRating === 0}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${feedbackRating === 0 ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
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