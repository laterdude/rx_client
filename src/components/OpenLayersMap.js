import React, { useContext, useEffect, useRef } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import ImageStatic from 'ol/source/ImageStatic'
import ImageLayer from 'ol/layer/Image'
import TileLayer from 'ol/layer/Tile'
import TileWMS from 'ol/source/TileWMS'
import BingMaps from 'ol/source/BingMaps'
import { OSM } from 'ol/source'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import { createStringXY } from 'ol/coordinate.js'
import { defaults as defaultControls, FullScreen } from 'ol/control.js'
import MousePosition from 'ol/control/MousePosition.js'
import { click } from 'ol/events/condition'
import { MapContext } from '../contexts/MapContext'
import ProjectedRasterSource from './ProjectedRasterSource'
import 'ol/ol.css'

export default function OpenLayersMap({
  projection = 'EPSG:3857',
  center = [-95.79, 34.48],
  zoom = 4,
  minZoom = 0,
  maxZoom = 28,
  cssClass = 'olmap',
  ...props
}) {
	const context = useContext(MapContext)
	const mapContainer = useRef(null)

	const bingLayer = new TileLayer({
		source: props.bingAPIKey
			? new BingMaps({
					key: props.bingAPIKey,
					imagerySet: props.bingImagerySet,
				})
			: new OSM()
	})

	const mapboxLayer = new TileLayer({
     source: new XYZ({
      url: 'https://api.mapbox.com/styles/v1/nanhosen/ckc3y98lb06231isyrlswshpf/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmFuaG9zZW4iLCJhIjoiY2ppZGExdDZsMDloNzN3cGVoMjZ0NHR5YyJ9.RYsPZGmajXULk-WtqvBNpQ'
    })
	})

	var wmsLayer = new TileLayer({
    visible: true,
    className: 'rhData',
    opacity:0,
    source: new TileWMS({
      url: 'http://134.209.13.38:8080/geoserver/nbmLayers/wms',
      params: {
      	'FORMAT': 'image/png', 
        'VERSION': '1.1.1',
        'tiled': true,
        'LAYERS': 'nbmLayers:rh_raw_3857',
        'exceptions': 'application/vnd.ogc.se_inimage',
        'tilesOrigin': `-15405970.42041901, 2181303.206501129`
      }
    })
  })

	// create map when component first mounts
	useEffect(() => {

		(async () => {
		  try {
		  	console.time('Array.map method performance')
		    const rasterSource = await ProjectedRasterSource()
		    console.timeEnd('Array.map method performance')

		    const extend = []
				if (props.allowFullScreen) { extend.push(new FullScreen()) }
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
						// bingLayer,
						new ImageLayer({
							source: rasterSource,
							opacity: .8,
							className:'presentImage'
						}),
						wmsLayer,
						mapboxLayer,				
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

				map.on('click', function(e) {
		  		let pixel = e.pixel
		  		let view = map.getView()
		      let viewResolution = view.getResolution()
		      let coordinate = e.coordinate
		  		let layersAll = map.getLayers()
		  		layersAll.forEach((el, ind, ar) => {
		  			if(el.className_ == 'rhData') {
		  				let clickUrl = el.getSource().getFeatureInfoUrl(coordinate, viewResolution, 'EPSG:3857',{'INFO_FORMAT': 'application/json'})
		  				async function getPointData(url) {
		  					try {
				  				let response = await fetch(url)
			  					let layersText = await response.text()
		          		let layersJSON = JSON.parse(layersText)
		          		console.log('layersText: ', layersText)
		  					}
		  					catch(err) { console.log(err) }
		  				}
		  				getPointData(clickUrl)
		  				console.log('Raster: ', el.getSource().getFeatureInfoUrl(coordinate, viewResolution, 'EPSG:3857', {'INFO_FORMAT': 'application/json'}))
		  			}
		  		})
		  		let layers = map.forEachLayerAtPixel(
		  			pixel, 
		  			(lyr, rgbArray) => console.log('layer: ', lyr.className_, 'rgb array: ', rgbArray, lyr),
		  			{
		  				layerFilter: layer => {
			  				if (layer.className_ === 'presentImage' || layer.className_ === 'rhData') {
			  					console.log('layer', layer.className_)
			  					return layer
			  				}
		  				}	
		  			}
		  		)
		  		console.log('pixel: ', pixel, layers)
				})

				context.setMap(map)
		  } 
		  catch (err) { console.log(err) }
		})()

	}, [])

	return <div className={ cssClass } ref={ mapContainer } />
}