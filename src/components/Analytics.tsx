import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Feedback {
  id: string;
  eventId: string;
  eventName: string;
  rating: number;
  eventExperience: number;
  speakerInteraction: number;
  sessionRelevance: number;
  suggestions: string;
  createdAt: string;
}

const Analytics: React.FC = () => {
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'details'>('overview');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5000/api/feedback');
        setFeedbackData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching feedback data:', err);
        setError('Failed to load feedback data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbackData();
  }, []);

  const calculateAverages = () => {
    if (feedbackData.length === 0) return { rating: 0, eventExperience: 0, speakerInteraction: 0, sessionRelevance: 0 };

    const sum = feedbackData.reduce(
      (acc, feedback) => {
        return {
          rating: acc.rating + feedback.rating,
          eventExperience: acc.eventExperience + feedback.eventExperience,
          speakerInteraction: acc.speakerInteraction + feedback.speakerInteraction,
          sessionRelevance: acc.sessionRelevance + feedback.sessionRelevance,
        };
      },
      { rating: 0, eventExperience: 0, speakerInteraction: 0, sessionRelevance: 0 }
    );

    return {
      rating: parseFloat((sum.rating / feedbackData.length).toFixed(1)),
      eventExperience: parseFloat((sum.eventExperience / feedbackData.length).toFixed(1)),
      speakerInteraction: parseFloat((sum.speakerInteraction / feedbackData.length).toFixed(1)),
      sessionRelevance: parseFloat((sum.sessionRelevance / feedbackData.length).toFixed(1)),
    };
  };

  const averages = calculateAverages();

  const getAveragesByEvent = () => {
    const eventMap = new Map();

    feedbackData.forEach(feedback => {
      if (!eventMap.has(feedback.eventId)) {
        eventMap.set(feedback.eventId, {
          eventId: feedback.eventId,
          eventName: feedback.eventName,
          ratings: [],
          eventExperiences: [],
          speakerInteractions: [],
          sessionRelevances: [],
          count: 0
        });
      }

      const eventData = eventMap.get(feedback.eventId);
      eventData.ratings.push(feedback.rating);
      eventData.eventExperiences.push(feedback.eventExperience);
      eventData.speakerInteractions.push(feedback.speakerInteraction);
      eventData.sessionRelevances.push(feedback.sessionRelevance);
      eventData.count++;
    });

    return Array.from(eventMap.values()).map(event => {
      const avgRating = event.ratings.reduce((a: number, b: number) => a + b, 0) / event.count;
      const avgEventExp = event.eventExperiences.reduce((a: number, b: number) => a + b, 0) / event.count;
      const avgSpeakerInt = event.speakerInteractions.reduce((a: number, b: number) => a + b, 0) / event.count;
      const avgSessionRel = event.sessionRelevances.reduce((a: number, b: number) => a + b, 0) / event.count;

      return {
        eventId: event.eventId,
        eventName: event.eventName,
        avgRating: parseFloat(avgRating.toFixed(1)),
        avgEventExperience: parseFloat(avgEventExp.toFixed(1)),
        avgSpeakerInteraction: parseFloat(avgSpeakerInt.toFixed(1)),
        avgSessionRelevance: parseFloat(avgSessionRel.toFixed(1)),
        count: event.count
      };
    });
  };

  const eventAverages = getAveragesByEvent();

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // For ratings 1-5

    feedbackData.forEach(feedback => {
      if (feedback.rating >= 1 && feedback.rating <= 5) {
        distribution[feedback.rating - 1]++;
      }
    });

    return [
      { name: '1 Star', value: distribution[0] },
      { name: '2 Stars', value: distribution[1] },
      { name: '3 Stars', value: distribution[2] },
      { name: '4 Stars', value: distribution[3] },
      { name: '5 Stars', value: distribution[4] },
    ];
  };

  const overviewData = [
    { name: 'Overall Rating', value: averages.rating },
    { name: 'Event Experience', value: averages.eventExperience },
    { name: 'Speaker Interaction', value: averages.speakerInteraction },
    { name: 'Session Relevance', value: averages.sessionRelevance },
  ];

  const renderOverviewTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {overviewData.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">{item.name}</h3>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-3xl font-bold text-indigo-600">{item.value}</p>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-5 h-5 ${
                      i < Math.round(item.value) ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.869 1.4-8.168L.132 9.21l8.2-1.192z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getRatingDistribution()}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }: { name: string; percent: number }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getRatingDistribution().map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback Metrics Comparison</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderEventsTab = () => (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Event Comparison</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={eventAverages}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="eventName" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgRating" name="Overall Rating" fill="#8884d8" />
              <Bar dataKey="avgEventExperience" name="Event Experience" fill="#82ca9d" />
              <Bar dataKey="avgSpeakerInteraction" name="Speaker Interaction" fill="#ffc658" />
              <Bar dataKey="avgSessionRelevance" name="Session Relevance" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Events Feedback Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exp. Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speaker Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relevance Rating</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {eventAverages.map((event, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.eventName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.avgRating}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.avgEventExperience}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.avgSpeakerInteraction}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.avgSessionRelevance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDetailsTab = () => (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Feedback</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggestions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feedbackData.map((feedback, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{feedback.eventName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 ${
                          i < feedback.rating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.869 1.4-8.168L.132 9.21l8.2-1.192z" />
                      </svg>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {feedback.suggestions || <span className="text-gray-400 italic">No suggestions provided</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Feedback Analytics</h1>
        <p className="text-gray-600 mt-2">
          View and analyze feedback from events and mentorship sessions.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Note: You may see this message if you haven't set up the feedback API endpoint yet.
          </p>
        </div>
      ) : feedbackData.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          <p>No feedback data available yet. Once users submit feedback, it will appear here.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`${
                  activeTab === 'events'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Events Analysis
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`${
                  activeTab === 'details'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Detailed Feedback
              </button>
            </nav>
          </div>

          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'events' && renderEventsTab()}
          {activeTab === 'details' && renderDetailsTab()}
        </>
      )}
    </div>
  );
};

export default Analytics;
