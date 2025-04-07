import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Clock, Star, MessageSquare, Filter, X, Users } from 'lucide-react';
import FeedbackForm from './FeedbackForm';

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
  email: string;
  role: string;
  skills: Skill[];
  interests: string[];
  bio: string;
  location: string;
  industry: Industry;
  experienceYears: number;
  profileImage?: string;
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
    const response = await fetch('http://localhost:5000/api/predict/predict', {
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
  
  // State for student profile form
  const [showProfileForm, setShowProfileForm] = useState<boolean>(true);
  const [studentName, setStudentName] = useState<string>('');
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [studentSkills, setStudentSkills] = useState<string>('');
  const [studentInterests, setStudentInterests] = useState<string>('');
  const [studentBio, setStudentBio] = useState<string>('');
  const [studentLocation, setStudentLocation] = useState<string>('');
  const [studentIndustry, setStudentIndustry] = useState<string>('Technology');
  const [studentExperience, setStudentExperience] = useState<string>('0');
  const [studentBranch, setStudentBranch] = useState<string>('');
  
  // State for student data
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State for alumni data
  const [allAlumni, setAllAlumni] = useState<Alumni[]>([]);
  const [displayedAlumni, setDisplayedAlumni] = useState<Alumni[]>([]);
  
  // State for connection requests and feedback
  const [connectionRequests, setConnectionRequests] = useState<{[key: number]: boolean}>({});
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<{[key: number]: boolean}>({});
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [currentAlumniForFeedback, setCurrentAlumniForFeedback] = useState<Alumni | null>(null);

  // Sample industries for dropdown
  const industries = [
    { id: 1, name: "Technology" },
    { id: 2, name: "Finance" },
    { id: 3, name: "Healthcare" },
    { id: 4, name: "Education" },
    { id: 5, name: "Manufacturing" },
  ];

  // Sample alumni data (would normally come from an API)
  const sampleAlumni: Alumni[] = [
    {
      id: 101,
      name: "John Smith",
      email: "john.smith@example.com",
      role: "Alumni",
      skills: [
        { id: 1, name: "JavaScript" },
        { id: 2, name: "React" },
        { id: 3, name: "Node.js" }
      ],
      interests: ["Web Development", "Open Source", "AI"],
      bio: "Full-stack developer with 10+ years of experience in building scalable web applications.",
      location: "San Francisco",
      industry: { id: 1, name: "Technology" },
      experienceYears: 10,
      company: "TechCorp",
      position: "Senior Software Engineer",
      availability: ["Weekday Evenings", "Weekends"],
      rating: 4.8,
      totalMentees: 12,
      profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
      graduationYear: 2013
    },
    {
      id: 102,
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "Alumni",
      skills: [
        { id: 4, name: "Python" },
        { id: 5, name: "Machine Learning" },
        { id: 6, name: "Data Science" }
      ],
      interests: ["AI/ML", "Data Visualization", "Research"],
      bio: "Data scientist with expertise in machine learning and predictive modeling.",
      location: "New York",
      industry: { id: 2, name: "Finance" },
      experienceYears: 8,
      company: "FinTech Solutions",
      position: "Lead Data Scientist",
      availability: ["Weekends"],
      rating: 4.9,
      totalMentees: 15,
      profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
      graduationYear: 2015
    },
    {
      id: 103,
      name: "Raj Patel",
      email: "raj.patel@example.com",
      role: "Alumni",
      skills: [
        { id: 7, name: "Java" },
        { id: 8, name: "Spring Boot" },
        { id: 9, name: "Microservices" }
      ],
      interests: ["Backend Development", "System Design", "Cloud Computing"],
      bio: "Enterprise software architect specializing in scalable backend systems.",
      location: "Bangalore",
      industry: { id: 1, name: "Technology" },
      experienceYears: 12,
      company: "TechSolutions",
      position: "Principal Architect",
      availability: ["Weekday Evenings"],
      rating: 4.7,
      totalMentees: 20,
      profileImage: "https://randomuser.me/api/portraits/men/22.jpg",
      graduationYear: 2010
    },
    {
      id: 104,
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      role: "Alumni",
      skills: [
        { id: 10, name: "UI/UX Design" },
        { id: 11, name: "Figma" },
        { id: 12, name: "User Research" },
        { id: 13, name: "Prototyping" }
      ],
      interests: ["Product Design", "User Experience", "Design Systems"],
      bio: "Senior UX Designer with expertise in creating user-centered digital experiences for startups and enterprises.",
      location: "Bangalore",
      industry: { id: 1, name: "Technology" },
      experienceYears: 6,
      company: "DesignFirst",
      position: "Senior UX Designer",
      availability: ["Weekday Evenings", "Weekends"],
      rating: 4.9,
      totalMentees: 12,
      profileImage: "https://randomuser.me/api/portraits/women/28.jpg",
      graduationYear: 2017
    },
    {
      id: 105,
      name: "Rahul Mehta",
      email: "rahul.mehta@example.com",
      role: "Alumni",
      skills: [
        { id: 14, name: "Data Analysis" },
        { id: 15, name: "Python" },
        { id: 16, name: "SQL" },
        { id: 17, name: "Tableau" },
        { id: 18, name: "Power BI" }
      ],
      interests: ["Business Intelligence", "Data Visualization", "Big Data"],
      bio: "Data Analyst with expertise in transforming complex data into actionable insights for business decisions.",
      location: "Mumbai",
      industry: { id: 2, name: "Finance" },
      experienceYears: 5,
      company: "DataInsights",
      position: "Senior Data Analyst",
      availability: ["Weekends"],
      rating: 4.7,
      totalMentees: 8,
      profileImage: "https://randomuser.me/api/portraits/men/42.jpg",
      graduationYear: 2018
    },
    {
      id: 106,
      name: "Neha Gupta",
      email: "neha.gupta@example.com",
      role: "Alumni",
      skills: [
        { id: 19, name: "Cybersecurity" },
        { id: 20, name: "Network Security" },
        { id: 21, name: "Ethical Hacking" },
        { id: 22, name: "CISSP" }
      ],
      interests: ["Information Security", "Penetration Testing", "Security Compliance"],
      bio: "Cybersecurity expert specializing in threat detection and vulnerability assessment for financial institutions.",
      location: "Delhi",
      industry: { id: 1, name: "Technology" },
      experienceYears: 7,
      company: "SecureDefense",
      position: "Security Architect",
      availability: ["Weekday Evenings"],
      rating: 4.9,
      totalMentees: 15,
      profileImage: "https://randomuser.me/api/portraits/women/56.jpg",
      graduationYear: 2016
    },
    {
      id: 107,
      name: "Vikram Singh",
      email: "vikram.singh@example.com",
      role: "Alumni",
      skills: [
        { id: 23, name: "DevOps" },
        { id: 24, name: "AWS" },
        { id: 25, name: "Docker" },
        { id: 26, name: "Kubernetes" },
        { id: 27, name: "CI/CD" }
      ],
      interests: ["Cloud Architecture", "Infrastructure as Code", "Site Reliability Engineering"],
      bio: "DevOps engineer with expertise in cloud infrastructure and CI/CD pipelines for scalable applications.",
      location: "Hyderabad",
      industry: { id: 1, name: "Technology" },
      experienceYears: 8,
      company: "CloudTech Solutions",
      position: "DevOps Lead",
      availability: ["Weekday Evenings", "Weekends"],
      rating: 4.8,
      totalMentees: 10,
      profileImage: "https://randomuser.me/api/portraits/men/65.jpg",
      graduationYear: 2015
    }
  ];

  // Function to handle student profile submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create student user object from form data
    const newUser: User = {
      id: 1,
      name: studentName,
      email: studentEmail,
      role: "Student",
      skills: studentSkills.split(',').map((skill, index) => ({ 
        id: index + 1, 
        name: skill.trim() 
      })),
      interests: studentInterests.split(',').map(interest => interest.trim()),
      bio: studentBio,
      location: studentLocation,
      industry: industries.find(ind => ind.name === studentIndustry) || industries[0],
      experienceYears: parseInt(studentExperience) || 0,
      profileImage: "https://randomuser.me/api/portraits/lego/1.jpg" // Default profile image for new students
    };
    
    setCurrentUser(newUser);
    setShowProfileForm(false);
    
    // Load alumni and calculate match scores
    fetchAlumniScores(newUser, sampleAlumni);
  };

  // Function to fetch alumni scores from the API
  const fetchAlumniScores = async (student: User, alumniList: Alumni[]) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const scoredAlumni = await fetchMatchScores(student, alumniList);
      setAllAlumni(scoredAlumni);
      setDisplayedAlumni(scoredAlumni);
    } catch (error) {
      console.error("Error fetching alumni scores:", error);
      setApiError("Failed to fetch alumni match scores. Please try again later.");
      setAllAlumni(alumniList);
      setDisplayedAlumni(alumniList);
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
      filtered = filtered.filter(alumni => 
        alumni.name.toLowerCase().includes(term) ||
        alumni.company.toLowerCase().includes(term) ||
        alumni.position.toLowerCase().includes(term) ||
        alumni.skills.some(skill => skill.name.toLowerCase().includes(term))
      );
    }
    
    // Apply skill filters
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(alumni => 
        selectedSkills.every(selectedSkill => 
          alumni.skills.some(skill => skill.id === selectedSkill.id)
        )
      );
    }
    
    // Apply industry filter
    if (selectedIndustry) {
      filtered = filtered.filter(alumni => alumni.industry.id === selectedIndustry.id);
    }
    
    setDisplayedAlumni(filtered);
  };

  // Handle requesting connection with an alumni
  const handleRequestConnection = (alumni: Alumni) => {
    setConnectionRequests(prev => ({
      ...prev,
      [alumni.id]: true
    }));
  };

  // Handle opening feedback modal
  const handleOpenFeedback = (alumni: Alumni) => {
    setCurrentAlumniForFeedback(alumni);
    setShowFeedbackModal(true);
  };
  
  // Handle opening forum - redirect to private chat with the selected alumni
  const handleOpenForum = (alumni: Alumni) => {
    // Redirect to the private chat with this alumni
    window.location.href = `/chat/${alumni.id}`;
  };
  
  
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSkills([]);
    setSelectedIndustry(null);
    setDisplayedAlumni(allAlumni);
  };
  
  // Add a skill to the filter
  const addSkillFilter = (skill: Skill) => {
    if (!selectedSkills.some(s => s.id === skill.id)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };
  
  // Remove a skill from the filter
  const removeSkillFilter = (skillId: number) => {
    setSelectedSkills(selectedSkills.filter(skill => skill.id !== skillId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentor Match</h1>
      
      {showProfileForm ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Enter Your Profile Information</h2>
          <p className="text-gray-600 mb-6">
            We'll use this information to match you with the most compatible mentors using our ML-powered matching algorithm.
          </p>
          
          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch/Major *
                </label>
                <input
                  type="text"
                  value={studentBranch}
                  onChange={(e) => setStudentBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  value={studentSkills}
                  onChange={(e) => setStudentSkills(e.target.value)}
                  placeholder="e.g., JavaScript, Python, Data Analysis"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interests (comma-separated) *
                </label>
                <input
                  type="text"
                  value={studentInterests}
                  onChange={(e) => setStudentInterests(e.target.value)}
                  placeholder="e.g., Machine Learning, Web Development, IoT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={studentLocation}
                  onChange={(e) => setStudentLocation(e.target.value)}
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  value={studentIndustry}
                  onChange={(e) => setStudentIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {industries.map(industry => (
                    <option key={industry.id} value={industry.name}>
                      {industry.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={studentExperience}
                  onChange={(e) => setStudentExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio (Brief description about yourself)
                </label>
                <textarea
                  value={studentBio}
                  onChange={(e) => setStudentBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Tell us a bit about yourself, your goals, and what you're looking for in a mentor..."
                ></textarea>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Find My Mentors
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          {/* User profile summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{currentUser?.name}</h2>
                <p className="text-gray-600">{studentBranch}</p>
                <p className="text-gray-500 text-sm mt-1">{currentUser?.email}</p>
              </div>
              <button
                onClick={() => setShowProfileForm(true)}
                className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
              >
                Edit Profile
              </button>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {currentUser?.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
          
          {/* Search and filter section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    applyFilters();
                  }}
                  placeholder="Search by name, company, position, or skills..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>
            
            {showFilters && (
              <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="font-medium mb-3">Filter by:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedSkills.map(skill => (
                        <span
                          key={skill.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                        >
                          {skill.name}
                          <button
                            type="button"
                            onClick={() => removeSkillFilter(skill.id)}
                            className="ml-1 inline-flex text-indigo-500 hover:text-indigo-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        const selectedId = parseInt(e.target.value);
                        if (selectedId && !isNaN(selectedId)) {
                          const skill = allAlumni
                            .flatMap(a => a.skills)
                            .find(s => s.id === selectedId);
                          if (skill) addSkillFilter(skill);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue=""
                    >
                      <option value="" disabled>Select a skill</option>
                      {Array.from(new Set(allAlumni.flatMap(a => a.skills.map(s => JSON.stringify(s)))))
                        .map(s => JSON.parse(s))
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(skill => (
                          <option key={skill.id} value={skill.id}>
                            {skill.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <select
                      value={selectedIndustry?.id || ""}
                      onChange={(e) => {
                        const selectedId = parseInt(e.target.value);
                        if (selectedId && !isNaN(selectedId)) {
                          const industry = industries.find(i => i.id === selectedId);
                          setSelectedIndustry(industry || null);
                        } else {
                          setSelectedIndustry(null);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All Industries</option>
                      {industries.map(industry => (
                        <option key={industry.id} value={industry.id}>
                          {industry.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      applyFilters();
                      setShowFilters(false);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={resetFilters}
                    className="ml-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Calculating mentor matches using ML model...</p>
            </div>
          )}
          
          {/* API error */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-8">
              <p>{apiError}</p>
            </div>
          )}
          
          {/* Alumni cards */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedAlumni.length > 0 ? (
                displayedAlumni.map(alumni => (
                  <div key={alumni.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <img 
                            src={alumni.profileImage} 
                            alt={alumni.name} 
                            className="h-16 w-16 rounded-full object-cover mr-4"
                          />
                          <div>
                            <h3 className="text-lg font-semibold">{alumni.name}</h3>
                            <p className="text-gray-600">{alumni.position} at {alumni.company}</p>
                          </div>
                        </div>
                        {alumni.matchScore !== undefined && (
                          <div className="flex flex-col items-center">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${
                              alumni.matchScore >= 80 ? 'bg-green-500' : 
                              alumni.matchScore >= 60 ? 'bg-blue-500' : 
                              alumni.matchScore >= 40 ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}>
                              {alumni.matchScore}%
                            </div>
                            <span className="text-xs text-gray-500 mt-1">Match</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 flex flex-wrap items-center text-sm text-gray-600">
                        <div className="flex items-center mr-4 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {alumni.location}
                        </div>
                        <div className="flex items-center mr-4 mb-2">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {alumni.experienceYears} years
                        </div>
                        <div className="flex items-center mr-4 mb-2">
                          <Clock className="h-4 w-4 mr-1" />
                          {alumni.availability.join(', ')}
                        </div>
                        <div className="flex items-center mb-2">
                          <Star className="h-4 w-4 mr-1 text-yellow-400" />
                          {alumni.rating} ({alumni.totalMentees} mentees)
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {alumni.skills.map(skill => (
                            <span
                              key={skill.id}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                currentUser?.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())
                                  ? 'bg-green-100 text-green-800'
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
                        
                        <button 
                          onClick={() => handleOpenForum(alumni)}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all font-medium flex items-center justify-center"
                        >
                          <Users className="h-5 w-5 mr-2" />
                          Open Forum
                        </button>
                        
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
        </div>
      )}
      
      {/* Forum functionality moved to Forums.tsx */}
      
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="flex justify-end p-2">
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FeedbackForm 
              eventId={currentAlumniForFeedback?.id.toString() || ''} 
              onClose={() => {
                setShowFeedbackModal(false);
                // Mark feedback as submitted for this alumni
                if (currentAlumniForFeedback) {
                  setFeedbackSubmitted((prev: {[key: number]: boolean}) => ({
                    ...prev,
                    [currentAlumniForFeedback.id]: true
                  }));
                }
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorMatch;