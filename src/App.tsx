import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ChatBot, { Loading } from 'react-simple-chatbot';


class DBPedia extends Component {
  constructor(props : any) {
    super(props);

    this.state = {
      loading: true,
      result: '',
      conversationHistory: [], 
    };

    this.searchDBPedia = this.searchDBPedia.bind(this);
  }

  componentDidMount() {
    this.searchDBPedia();
  }


  searchDBPedia() {
    const { steps, triggerNextStep } = this.props;
    const search = steps.search.value;
    const limitedHistory = chatHistory.slice(-5);

    console.log(chatHistory)

    this.setState({ loading: true, result: '' });
    const updatedHistory = [
      ...limitedHistory,
      { role: 'user', content: search },
    ];

    console.log(updatedHistory)

    axios
      .post(
        'http://localhost:8001/chatbot',
        {
          message: search,
          conversation: updatedHistory, 
        },
        { headers: { 'Content-Type': 'application/json' }}
      )
      .then((response) => {
        const reply = response.data;

        updatedHistory.push({ role: 'assistant', content: reply });
        chatHistory = updatedHistory;

        this.setState((prevState) => ({
          loading: false, 
          result: reply, 
          conversationHistory: updatedHistory, 
        }));

        triggerNextStep();
      })
      .catch((error) => {
        console.error('Error:', error);
        const errorMessage = 'An error occurred while fetching data.';

        updatedHistory.push({ role: 'assistant', content: errorMessage });
        chatHistory = updatedHistory
        this.setState((prevState) => ({
          loading: false, 
          result: errorMessage, 
          conversationHistory: updatedHistory,
        }));
        
        triggerNextStep();
      });
  }

  render() {
    const { loading , result } = this.state;

    return <div className="dbpedia">{loading ? <Loading /> : result}</div>;
  }
}

DBPedia.propTypes = {
  steps: PropTypes.object.isRequired,
  triggerNextStep: PropTypes.func.isRequired,
};

let chatHistory : any = [];

const App = () => {

  const [open , setOpen] = useState(false);

  if(!open){
    return (
    <div className='w-screen h-screen'>
      <div className='rounded-full bg-red-600 w-20 h-20 absolute right-10 bottom-10' onClick={() => (setOpen(!open))}></div>
    </div>
    )
  }

  return (
    <div className='w-screen h-screen'>
      <div className='absolute right-10 bottom-10 flex flex-col justify-end'>
       <ChatBot
    steps={[
      {
        id: '1',
        message: 'Hello! I am a conversational chatbot. What would you like to know?',
        trigger: 'search',
      },
      {
        id: 'search',
        user: true,
        trigger: '3',
      },
      {
        id: '3',
        component: <DBPedia />,
        waitAction: true,
        trigger: '4',
      },
      {
        id: '4',
        message: 'Would you like to ask another question?',
        trigger: 'search',
      },
    ]}
  />
  <div className='rounded-full bg-red-600 w-20 h-20 mt-2 self-end' onClick={() => (setOpen(!open))}></div>
  </div>
    </div>
  )
}

export default App;
