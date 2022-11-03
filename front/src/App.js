import File from './File/File';
// import Mindmap from './Mindmap/Mindmap';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Main from './Main';

function App() {
  return (
    <div className="App">
      <header className="App-header"/>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Main/>}></Route>
          <Route path={'/file/:fileId'} element={<File />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
