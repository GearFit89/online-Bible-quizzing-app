//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Cpu } from 'lucide-react'
import QuizApp from './routes/QuizStates.jsx'
import Notifications from './routes/Notifications.jsx'
///import ProfilePage from './main1.jsx'
// import SearchBarScene from './SearchBar.jsx'

import { Leaderboard } from './LeaderBoard.jsx'
import { RouterProvider, Link } from 'react-router-dom';
import { createRouterService } from './routes/Router.jsx';
import  Home  from './routes/Home.jsx';
import Quizzing from './routes/Quizzing.jsx';
import AuthPage from './auth_scripts.jsx'
import { Home as HomeIcon, BrainCircuit, Search, Bell as Bell, TrophyIcon  } from 'lucide-react'; // Import icons
import DebugConsole, {DebugConsole2} from './Test.jsx'
import { Connection } from './connection.jsx';
import { Profile } from './routes/Profile.jsx';
import { useState, useEffect } from 'react';
import { StatusOutputBox } from './status.jsx'
import IndexPage from './routes/IndexPage.jsx'
import { AdvancedSettings } from './settings.jsx'
const settings = ()=>{
  return (<div>
    <h1>Settings Page</h1>
    <p>Settings content goes here.</p>
  </div>    )
}
// Refactored from an object to an array of objects for better scalability
export const routes = [
  { 

    path: 'home', // URL path
    label: 'Home', // Text for nav bar
    icon: <HomeIcon size={18} />, // Icon element
    component: IndexPage// The React component to render
  },
  { 
    tab:true,
    path: 'dashboard/quizzing', // URL path
    label: 'Quiz', // Text for nav bar
    icon: <BrainCircuit size={18} />, // Icon element
    component: Quizzing // The React component to render
  },
  {
    tab: true,
    path: 'dashboard/leaderboard', // URL path
    label: 'Quiz', // Text for nav bar
    icon: <TrophyIcon size={18} />, // Icon element
    component: Leaderboard // The React component to render
  },
  {  
    tab:false,
    path: 'play/', // URL path
    label: 'Quiz', // Text for nav bar
    icon: <BrainCircuit size={18} />, // Icon element
    component: QuizApp // The React component to render
  },
  // { 
  //   tab:true,
  //   path: 'dashboard/questions', // URL path
  //   label: 'Search', // Text for nav bar
  //   icon: <Search size={18} />, // Icon element
  //   component: SearchBarScene // The React component to render
  // },
  { 
    tab:true,
    path: 'dashboard/profile', // URL path
    label: 'Profile', // Text for nav bar
    icon: <BrainCircuit size={18} />, // Icon element
    component: Profile // The React component to render
  },
  { 
    tab:false,
    path: 'auth/:inittype', // URL path
    label: '', // Text for nav bar
    icon: '', // Icon element
    component: AuthPage // The React component to render
  },
  {
    tab: false,
    path: 'settings', // URL path
    label: '', // Text for nav bar
    icon: '', // Icon element
    component: AdvancedSettings // The React component to render
  },
   { 
    tab:false,
    path: 'dev/debug', // URL path
    label: 'debug', // Text for nav bar
    icon: <Cpu size={18} />, // Icon element
    component:StatusOutputBox // The React component to render
  },
{
  tab: true,
  path: 'dashboard/notifications', // URL path
  label: 'Notifications', // Text for nav bar
  icon: <Bell size={18} />, // Icon element
  component: Notifications // The React component to render
  },
  
]; // End of routes array


const  router = createRouterService(routes)
createRoot(document.getElementById('root')).render(
  
   <Connection >
     <RouterProvider router={router} /> 
     <DebugConsole />
     
    </Connection>
 
)