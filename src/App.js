import React from 'react';
import MainScene from './Scenes/MainScene.component';
import GlobeNew from "./Components/GlobeNew";
import './Styles/main.css';

export default class App extends React.Component{
  render(){
    return(<>
    {/* <MainScene loading={true}/> */}
    <GlobeNew/>
    
    </>)
  }
}