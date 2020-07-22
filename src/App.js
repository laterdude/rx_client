import React from 'react'
import {  
	Router,
 	// BrowserRouter as Router,
 	// HashRouter as Router,
 } from 'react-router-dom'
import { createBrowserHistory, createHashHistory } from 'history'
import RouterConfig from './RouterConfig'

const appHistory = createHashHistory()

const App = () => (
  <Router history={appHistory}>
    <RouterConfig />
  </Router>
)

export default App
