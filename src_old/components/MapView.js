import React, { useContext, useEffect, useRef } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import ImageStatic from 'ol/source/ImageStatic'
import ImageLayer from 'ol/layer/Image'
import TileLayer from 'ol/layer/Tile'
import BingMaps from 'ol/source/BingMaps'
import { OSM } from 'ol/source'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import { createStringXY } from 'ol/coordinate.js'
import { defaults as defaultControls, FullScreen } from 'ol/control.js'
import MousePosition from 'ol/control/MousePosition.js'
import { MapContext } from '../contexts/MapContext'
import RasterSource from './RasterSource'
import 'ol/ol.css'
const GeoTIFF = require('geotiff')
const plotty = require('plotty')

export default function MapView({
  projection = "EPSG:3857",
  center = [-95.79, 34.48],
  zoom = 4,
  minZoom = 0,
  maxZoom = 28,
  cssClass = "olmap",
  ...props
}) {
	const context = useContext(MapContext)
	const mapContainer = useRef(null)

	const baseLayer = props.bingAPIKey || true
		? new BingMaps({
				key: props.bingAPIKey || 'Al2oBjQ_opovK7NsjQhkWaPvCOJMm0fHal4-iW0JOj8IuMft5kpLVX_Ok7vriTzn',
				imagerySet: props.bingImagerySet || 'AerialWithLabels'
			})
		: new OSM()

	// create map when component first mounts
	useEffect(() => {
		(async () => {
			console.log('creating new map instance')
			const rasterSource = await RasterSource()
			const extend = []
			if (props.allowFullScreen) {
				extend.push(new FullScreen())
			}

			if (props.showMousePosition) {
				extend.push(
					new MousePosition({
						coordinateFormat: createStringXY(4),
						projection
					})
				)
			}

			const map = new Map({
				target: mapContainer.current,
				layers: [
					new TileLayer({
						source: baseLayer
					}),
					new ImageLayer({
						source: rasterSource,
						opacity: .9,
					}),
			    // new TileLayer({
			    //   source: new XYZ({
			    //     url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
			    //   })
			    // })				
				],
				view: new View({
					projection,
					center: fromLonLat(center),
					zoom,
					maxZoom: props.maxZoom,
					minZoom: props.minZoom
				}),
				controls: defaultControls().extend(extend)
			})
			// console.log(projection.getCode())
			context.setMap(map)
		})()

	}, [])

	return <div className={ cssClass } ref={ mapContainer } />
}
