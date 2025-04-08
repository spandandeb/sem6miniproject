import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Question {
  type: 'MCQ';
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  topic: string;
}

interface InterviewQuestion {
  question: string;
  expected_points: string[];
  difficulty: string;
  reference: string;
  topic_area: string;
}

const InterviewPrep: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mcq' | 'interview'>('mcq');
  const [selectedTopic, setSelectedTopic] = useState('python');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentInterviewQuestion, setCurrentInterviewQuestion] = useState<InterviewQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [interviewResponse, setInterviewResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const topics = [
    'Python',
    'JavaScript',
    'Java',
    'C++',
    'React',
    'SQL',
    'System Design',
    'Data Structures',
    'Algorithms'
  ];

  const generateMCQ = async () => {
    setIsLoading(true);
    setFeedback({ message: '', type: '' });
    
    try {
      // For demo purposes, generate a mock question without API
      const mockQuestion: Question = {
        type: 'MCQ',
        question: `What is the time complexity of a binary search on a sorted array of n elements?`,
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'],
        correct: 'O(log n)',
        explanation: 'Binary search repeatedly divides the search interval in half, resulting in a logarithmic time complexity.',
        topic: selectedTopic
      };
      
      setCurrentQuestion(mockQuestion);
      setSelectedAnswer('');
    } catch (error) {
      console.error('Error generating MCQ:', error);
      setFeedback({ 
        message: 'Failed to generate question. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateInterviewQuestion = async () => {
    setIsLoading(true);
    setFeedback({ message: '', type: '' });
    
    try {
      // For demo purposes, generate a mock interview question without API
      const mockInterviewQuestion: InterviewQuestion = {
        question: `Explain how React's virtual DOM works and why it's beneficial for performance.`,
        expected_points: [
          'Virtual DOM is a lightweight copy of the actual DOM',
          'React compares virtual DOM with real DOM (diffing)',
          'Only necessary updates are applied to the real DOM',
          'Batching of DOM updates improves performance'
        ],
        difficulty: 'medium',
        reference: 'React official documentation',
        topic_area: 'React'
      };
      
      setCurrentInterviewQuestion(mockInterviewQuestion);
      setInterviewResponse('');
    } catch (error) {
      console.error('Error generating interview question:', error);
      setFeedback({ 
        message: 'Failed to generate question. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) {
      setFeedback({ message: 'Please select an answer', type: 'error' });
      return;
    }

    const isCorrect = currentQuestion?.correct === selectedAnswer;
    
    setFeedback({
      message: isCorrect 
        ? `Correct! ${currentQuestion?.explanation}` 
        : `Incorrect. The correct answer is ${currentQuestion?.correct}. ${currentQuestion?.explanation}`,
      type: isCorrect ? 'success' : 'error'
    });
  };

  const handleInterviewSubmit = async () => {
    if (!interviewResponse) {
      setFeedback({ message: 'Please provide a response', type: 'error' });
      return;
    }

    // For demo, generate a mock evaluation
    const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
    
    setFeedback({
      message: `Score: ${score}/100\n
        Your response covered several key points well. You explained the concept of the virtual DOM clearly.
        Key points covered: Virtual DOM concept, diffing algorithm.
        Consider adding more details about: Performance optimizations, reconciliation process.`,
      type: score >= 70 ? 'success' : 'error'
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would use the Web Speech API
    if (!isRecording) {
      setFeedback({ message: 'Voice recording is simulated in this demo.', type: '' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Interview Preparation</h1>
        <p className="mt-2 text-gray-600">Practice technical interviews and MCQs</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('mcq')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mcq'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Multiple Choice Questions
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'interview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Technical Interview
          </button>
        </nav>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Select Topic</label>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          {topics.map((topic) => (
            <option key={topic.toLowerCase()} value={topic.toLowerCase()}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      {activeTab === 'mcq' ? (
        <div className="space-y-6">
          <button
            onClick={generateMCQ}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? 'Generating...' : 'Generate MCQ'}
          </button>

          {currentQuestion && (
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{currentQuestion.question}</h3>
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name="mcq-answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor={`option-${index}`} className="ml-3 block text-sm font-medium text-gray-700">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAnswerSubmit}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Answer
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={generateInterviewQuestion}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? 'Generating...' : 'Generate Interview Question'}
          </button>

          {currentInterviewQuestion && (
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{currentInterviewQuestion.question}</h3>
              <div className="mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  {currentInterviewQuestion.difficulty}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {currentInterviewQuestion.topic_area}
                </span>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Your Response</label>
                <div className="mt-1 flex items-center space-x-4">
                  <button
                    onClick={toggleRecording}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                      isRecording
                        ? 'text-red-700 bg-red-100 hover:bg-red-200'
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
                  </button>
                </div>
                <textarea
                  value={interviewResponse}
                  onChange={(e) => setInterviewResponse(e.target.value)}
                  rows={6}
                  className="mt-4 shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Type or speak your answer here..."
                />
              </div>
              <button
                onClick={handleInterviewSubmit}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Response
              </button>
            </div>
          )}
        </div>
      )}

      {feedback.message && (
        <div
          className={`mt-4 p-4 rounded-md ${
            feedback.type === 'success' ? 'bg-green-50 text-green-800' : feedback.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'
          }`}
        >
          <pre className="whitespace-pre-wrap">{feedback.message}</pre>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;