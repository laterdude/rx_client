import React, { Component, useState } from 'react'
import {
  Redirect,
  Switch,
  Route,
  Link,
  NavLink,
  useHistory
} from 'react-router-dom'

import RxClient from './components/RxClient' 
import GeotiffLayer from './components/GeotiffLayer'

const routes = [
	{	path: '/map',
		component: RxClient,
		exact: true
	},
	{ path: '/geotiff',
		component: GeotiffLayer,
    exact: true
	},
	// { path: '/maprojression',
	// 	component: GeotiffLayer,
 //    exact: true
	// },	
]

const RouteWithSubRoutes = route => (
	<Route 
		path={route.path}
		render={props => (
			<route.component {...props} routes={route.routes} />
		)}
	/>
)

class RouterConfig extends Component {
  render() {
    return (
      <div className='h-100'>
	    	<Switch>
					{routes.map((route, i) => (
						<RouteWithSubRoutes key={i} {...route} />
					))}
				</Switch>
      </div>
    )
  }
}

export default RouterConfig