import React from 'react'
import {
  Router,
  // BrowserRouter as Router,
  // HashRouter as Router,
  Redirect,
  Switch,
  Route,
  Link,
  NavLink,
  useHistory
} from 'react-router-dom'
import { createBrowserHistory, createHashHistory } from 'history'

import App from './components/App'

// import Gallery from './components/Gallery'
// import Page from './components/Page'
// import Modules from './components/Modules'

// import { Pages } from './constants/pages'

// const appHistory = useHistory(createHashHistory)({queryKey: false})
const appHistory = createHashHistory()
// const appHistory = createBrowserHistory()

// const getDefaultPath = pages => {
//   const path = []
//   let page
//   while (pages) {
//     page = pages[0]
//     pages = page.children
//     path.push(page.path)
//   }
//   return path.join('/')
// }


// const renderRoute = (pageComponent = Page, page, i) => {
//   const {children, path, content, component} = page
//   if (!children) {
//     return (
//       <Route
//         key={i}
//         path={path}
//         childComponent={component}
//         component={pageComponent}
//         content={content}
//       />
//     )
//   }

//   return (
//     <Route key={i} path={path} >
//       <IndexRedirect to={getDefaultPath(children)} />
//       {children.map(renderRoute.bind(null, pageComponent))}
//     </Route>
//   )
// }

// const renderRouteGroup = (path, pages, pageComponent) => {
//   const defaultPage = getDefaultPath(pages)
//   return (
//     <Route key={path} path={path} component={Gallery} pages={pages}>
//       <IndexRedirect to={defaultPage} />
//       {pages.map(renderRoute.bind(null, pageComponent))}
//       <Redirect from="*" to={defaultPage} />
//     </Route>
//   )
// }

// eslint-disable-next-line react/display-name
const RouterConfig = () => (
  <Router history={appHistory}>
    <App />
  </Router>
)

export default RouterConfig










