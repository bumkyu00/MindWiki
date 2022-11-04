import File from './File/File';
// import Mindmap from './Mindmap/Mindmap';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import Main from './Main';

function App() {
  return (
    <div className="App">
      <header className="App-header"/>
      <BrowserRouter>
        <Switch>
          <Route exact path='/'><Main/></Route>
          <Route exact path='/file/:fileId'><File /></Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
