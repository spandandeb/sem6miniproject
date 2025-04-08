import React, { useState, useEffect } from 'react';
import { Search, BookOpen, FileText, Download, Star, Plus, Filter, Eye } from 'lucide-react';
import { resourceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Resource {
  _id: string;
  title: string;
  description: string;
  category: 'learning_material' | 'resume_template' | 'cover_letter' | 'interview_guide';
  industry?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  tags: string[];
  downloads: number;
  views: number;
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
}

interface ResourceFormData {
  title: string;
  description: string;
  category: 'learning_material' | 'resume_template' | 'cover_letter' | 'interview_guide';
  industry: string;
  fileUrl: string;
  thumbnailUrl: string;
  tags: string;
}

interface ReviewFormData {
  rating: number;
  comment: string;
}

const ResourceLibraryPage: React.FC = () => {
  // Debug log
  console.log("ResourceLibraryPage component rendering");
  
  const { isAuthenticated } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showResourceDetails, setShowResourceDetails] = useState<boolean>(false);
  const [formData, setFormData] = useState<ResourceFormData>({
    title: '',
    description: '',
    category: 'learning_material',
    industry: '',
    fileUrl: '',
    thumbnailUrl: '',
    tags: ''
  });
  const [reviewFormData, setReviewFormData] = useState<ReviewFormData>({
    rating: 5,
    comment: ''
  });
  const [reviewStatus, setReviewStatus] = useState<{
    loading: boolean;
    success: string | null;
    error: string | null;
  }>({
    loading: false,
    success: null,
    error: null
  });

  useEffect(() => {
    // Adding a delay to simulate loading and prevent immediate API calls
    const timer = setTimeout(() => {
      fetchResources();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchResources = async () => {
    try {
      console.log("Attempting to fetch resources");
      setLoading(true);
      setError(null);
      
      // Use our centralized API service
      const params: any = {};
      
      if (filter !== 'all' && !filter.startsWith('industry:')) {
        params.category = filter;
      }
      
      if (filter.startsWith('industry:')) {
        params.industry = filter.split(':')[1];
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      try {
        // Test the API connection, if it fails we'll still show the UI
        const response = await resourceAPI.getResources(params);
        console.log('API response received:', response);
        setResources(response.data || []);
      } catch (apiError) {
        console.error('API connection failed:', apiError);
        // Set empty data but don't show error to user
        setResources([]);
      }
    } catch (err) {
      console.error('Error in fetchResources function:', err);
      setError('Failed to load resources. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReviewFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      console.log('Upload Resource - Auth token exists:', !!token);
      
      if (!token) {
        console.error('Authentication required - No token found');
        setError('You must be logged in to upload resources. Please log in and try again.');
        return;
      }
      
      // Validate form data
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }
      
      if (!formData.description.trim()) {
        setError('Description is required');
        return;
      }
      
      if (!formData.fileUrl.trim()) {
        setError('File URL is required');
        return;
      }
      
      if (formData.category === 'learning_material' && !formData.industry.trim()) {
        setError('Industry is required for Learning Materials');
        return;
      }
      
      // Convert tags string to array
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const resourceData = {
        ...formData,
        tags: tagsArray
      };
      
      console.log('Submitting resource data:', resourceData);
      
      try {
        const response = await resourceAPI.createResource(resourceData);
        console.log('Resource created successfully:', response.data);
        
        setShowForm(false);
        setFormData({
          title: '',
          description: '',
          category: 'learning_material',
          industry: '',
          fileUrl: '',
          thumbnailUrl: '',
          tags: ''
        });
        
        // Refresh resources list
        fetchResources();
      } catch (apiError: any) {
        console.error('API error creating resource:', apiError);
        setError(apiError.response?.data?.message || 'Failed to upload resource. Please try again.');
      }
    } catch (err) {
      console.error('Error in form submission:', err);
      setError('Failed to upload resource. Please try again.');
    }
  };

  const handleDownload = async (resourceId: string) => {
    try {
      const response = await resourceAPI.downloadResource(resourceId);
      
      // Open file URL in a new tab
      window.open(response.data.fileUrl, '_blank');
    } catch (err) {
      console.error('Error downloading resource:', err);
      setError('Failed to download the resource. Please try again.');
    }
  };

  const viewResourceDetails = async (resourceId: string) => {
    try {
      setLoading(true);
      const response = await resourceAPI.getResourceById(resourceId);
      setSelectedResource(response.data);
      setShowResourceDetails(true);
    } catch (err) {
      console.error('Error fetching resource details:', err);
      setError('Failed to load resource details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedResource) return;
    
    try {
      setReviewStatus({
        loading: true,
        success: null,
        error: null
      });
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setReviewStatus({
          loading: false,
          success: null,
          error: 'You must be logged in to submit a review'
        });
        return;
      }
      
      await resourceAPI.addReview(selectedResource._id, reviewFormData);
      
      setReviewStatus({
        loading: false,
        success: 'Review submitted successfully!',
        error: null
      });
      
      // Reset form
      setReviewFormData({
        rating: 5,
        comment: ''
      });
      
      // Refresh resource details
      const updatedResource = await resourceAPI.getResourceById(selectedResource._id);
      setSelectedResource(updatedResource.data);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setReviewStatus({
        loading: false,
        success: null,
        error: err.response?.data?.message || 'Failed to submit review. Please try again.'
      });
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'learning_material': return 'Learning Material';
      case 'resume_template': return 'Resume Template';
      case 'cover_letter': return 'Cover Letter';
      case 'interview_guide': return 'Interview Guide';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning_material': return <BookOpen className="h-5 w-5" />;
      case 'resume_template': return <FileText className="h-5 w-5" />;
      case 'cover_letter': return <FileText className="h-5 w-5" />;
      case 'interview_guide': return <BookOpen className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'learning_material': return 'bg-blue-100 text-blue-800';
      case 'resume_template': return 'bg-green-100 text-green-800';
      case 'cover_letter': return 'bg-purple-100 text-purple-800';
      case 'interview_guide': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Library</h1>
          <p className="text-gray-600 mt-2">
            Access industry-specific materials, templates, and guides
          </p>
        </div>
        {isAuthenticated && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Upload Resource
          </button>
        )}
      </div>

      {/* Simple message to verify page is loading */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8 text-center">
        <BookOpen className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Resource Library Page</h2>
        <p className="text-gray-600">
          This page is now loading. If you see this message, the page is rendering correctly.
          The full functionality will be available once the API is connected.
        </p>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for resources..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('learning_material')}
              className={`px-3 py-1 text-sm rounded-md ${filter === 'learning_material' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}
            >
              Learning Materials
            </button>
            <button 
              onClick={() => setFilter('resume_template')}
              className={`px-3 py-1 text-sm rounded-md ${filter === 'resume_template' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}
            >
              Resume Templates
            </button>
            <button 
              onClick={() => setFilter('cover_letter')}
              className={`px-3 py-1 text-sm rounded-md ${filter === 'cover_letter' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}
            >
              Cover Letters
            </button>
            <button 
              onClick={() => setFilter('interview_guide')}
              className={`px-3 py-1 text-sm rounded-md ${filter === 'interview_guide' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}
            >
              Interview Guides
            </button>
          </div>
        </div>
      </div>

      {/* Resources list */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading resources...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-10">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No resources found</h2>
          <p className="text-gray-500">
            {searchQuery 
              ? `No resources match your search "${searchQuery}"`
              : filter !== 'all'
                ? `No ${getCategoryLabel(filter).toLowerCase()} resources available`
                : 'No resources available in the library yet.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <div key={resource._id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative">
                {resource.thumbnailUrl ? (
                  <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${resource.thumbnailUrl})` }} />
                ) : (
                  <div className="h-40 bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center">
                    {getCategoryIcon(resource.category)}
                    <span className="text-white text-lg font-medium ml-2">
                      {getCategoryLabel(resource.category)}
                    </span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getCategoryColor(resource.category)}`}>
                    {getCategoryLabel(resource.category)}
                  </span>
                </div>
                {resource.industry && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {resource.industry}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{resource.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {renderStarRating(resource.rating.average)}
                    <span className="text-sm text-gray-500 ml-1">
                      ({resource.rating.count})
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 space-x-3">
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      <span>{resource.downloads}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{resource.views}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewResourceDetails(resource._id)}
                    className="flex-1 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition text-center"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDownload(resource._id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resource Upload Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Upload New Resource</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="learning_material">Learning Material</option>
                    <option value="resume_template">Resume Template</option>
                    <option value="cover_letter">Cover Letter</option>
                    <option value="interview_guide">Interview Guide</option>
                  </select>
                </div>
                
                {formData.category === 'learning_material' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleFormChange}
                      placeholder="e.g. Technology, Healthcare, Finance"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
                  <input
                    type="url"
                    name="fileUrl"
                    value={formData.fileUrl}
                    onChange={handleFormChange}
                    placeholder="https://example.com/file.pdf"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Please provide a link to your file (PDF, DOCX, etc.)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (optional)</label>
                  <input
                    type="url"
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleFormChange}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleFormChange}
                    placeholder="career, resume, interview, tech"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700"
                >
                  Upload Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Details Modal */}
      {showResourceDetails && selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedResource.title}</h2>
              <button 
                onClick={() => setShowResourceDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className={`text-sm font-medium px-3 py-1 rounded ${getCategoryColor(selectedResource.category)}`}>
                  {getCategoryLabel(selectedResource.category)}
                </span>
                {selectedResource.industry && (
                  <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded">
                    {selectedResource.industry}
                  </span>
                )}
                {selectedResource.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              
              {selectedResource.thumbnailUrl && (
                <div className="h-56 bg-cover bg-center rounded-lg" style={{ backgroundImage: `url(${selectedResource.thumbnailUrl})` }} />
              )}
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedResource.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Resource Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center">
                        {renderStarRating(selectedResource.rating.average)}
                        <span className="text-sm text-gray-500 ml-1">
                          ({selectedResource.rating.count} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Downloads:</span>
                      <span className="font-medium">{selectedResource.downloads}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium">{selectedResource.views}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Added by:</span>
                      <span className="font-medium">{selectedResource.author.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Date added:</span>
                      <span className="font-medium">{new Date(selectedResource.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={() => handleDownload(selectedResource._id)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition flex items-center justify-center"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Resource
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Leave a Review</h3>
                  {isAuthenticated ? (
                    <form onSubmit={submitReview}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setReviewFormData(prev => ({ ...prev, rating: value }))}
                                className="focus:outline-none"
                              >
                                <Star 
                                  className={`h-6 w-6 ${value <= reviewFormData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
                          <textarea
                            name="comment"
                            value={reviewFormData.comment}
                            onChange={handleReviewFormChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Share your thoughts about this resource..."
                          />
                        </div>
                        
                        <button
                          type="submit"
                          className="w-full bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition"
                          disabled={reviewStatus.loading}
                        >
                          {reviewStatus.loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                        
                        {reviewStatus.success && (
                          <div className="bg-green-100 text-green-800 p-3 rounded-lg">
                            {reviewStatus.success}
                          </div>
                        )}
                        
                        {reviewStatus.error && (
                          <div className="bg-red-100 text-red-800 p-3 rounded-lg">
                            {reviewStatus.error}
                          </div>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg">
                      Please sign in to leave a review.
                    </div>
                  )}
                  
                  {selectedResource.reviews && selectedResource.reviews.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3">User Reviews</h4>
                      <div className="space-y-4">
                        {selectedResource.reviews.map((review: any) => (
                          <div key={review._id} className="border-b border-gray-200 pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900 mr-2">{review.user.name}</span>
                                {renderStarRating(review.rating)}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-600">{review.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceLibraryPage; 