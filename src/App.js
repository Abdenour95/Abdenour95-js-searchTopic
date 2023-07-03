import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import cheerio from 'cheerio';
import { useState } from 'react';
import { pipeline } from '@huggingface/transformers';

function App() {
  const [topic, setTopic] = useState('');
  const [searchResults, setSearchResults] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleTopicChange = (e) => {
    setTopic(e.target.value);
  };

  const handleSearch = () => {
    const results = searchInternet(topic);
    setSearchResults(results);
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleAskQuestion = () => {
    // Answer the question using the search results
    const ans = answerQuestion(question, searchResults);
    setAnswer(ans);
  };


  const searchInternet = async (topic) => {
    try {
      const response = await axios.get(`https://www.example.com/search?q=${topic}`);
      const html = response.data;
      const $ = cheerio.load(html);
  
      // Extract relevant information from the HTML using selectors
      const searchResults = $('.result-item')
        .map((index, element) => {
          const title = $(element).find('.title').text();
          const url = $(element).find('.url').attr('href');
          // Extract other relevant information as needed
          return { title, url };
        })
        .get();
  
      return searchResults;
    } catch (error) {
      console.error('Error searching the internet:', error);
      return [];
    }
  };

  const answerQuestion = async (question, searchResults) => {
    try {
 
      const pipelineOptions = {
        model: 'distilbert-base-cased-distilled-squad', 
        tokenizer: 'distilbert-base-cased',
      };
      const questionAnsweringPipeline = pipeline('question-answering', pipelineOptions);
  
     
      const answers = await questionAnsweringPipeline({
        question,
        context: searchResults.map((result) => result.title).join(' '),
      });
  
      return answers[0]?.answer || 'No answer found.';
    } catch (error) {
      console.error('Error answering the question:', error);
      return 'An error occurred while answering the question.';
    }
  };

  return (
    <div>
      <h1>Topic Search Application</h1>
      <div>
        <label>Enter a topic: </label>
        <input type="text" value={topic} onChange={handleTopicChange} />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div>
        <label>Ask a question: </label>
        <input type="text" value={question} onChange={handleQuestionChange} />
        <button onClick={handleAskQuestion}>Ask</button>
      </div>
      <div>
        <h3>Answer:</h3>
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default App;


