import React, { useState } from 'react'

import { MapContext } from '../contexts/MapContext'

export default function MapProvider(props) {
	const [map, setMap] = useState()
	const { children } = props

	return (
		<MapContext.Provider value={{ map, setMap }}>
			{ children }
		</MapContext.Provider>
	)
}