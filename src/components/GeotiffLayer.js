import React, { useRef, useEffect } from 'react'
import ImageStatic from 'ol/source/ImageStatic'
import ImageLayer from 'ol/layer/Image'
import toCanvas from '../utilities/toCanvas'
import geoblaze, { rasterCalculator } from '../utilities/geoblaze'
// import geoblaze from 'geoblaze'
const plotty = require('plotty')
const GeoTIFF = require('geotiff')
const parseGeoraster = require("georaster")

// fetch('http://localhost:3090/data')
//   .then(response => response.arrayBuffer() )
//   .then(parseGeoraster)
//   .then(georaster => {
//       console.log("georaster:", georaster);
//   });

export default function() {
	const plotRef = useRef()

	// useEffect(() => {
	// 	(async () => {
	// 		const tiff = await GeoTIFF.fromUrl('http://localhost:3090/data')
	// 		const image = await tiff.getImage()
	// 		const data = await image.readRasters()
	// 		console.log(data)

	// 		const canvas = plotRef.current
	// 		const plot = new plotty.plot({
	// 			canvas,
	// 			data: data[0],
	// 			width: image.getWidth(),
	// 			height: image.getHeight(),
	// 			domain: [0, 256],
	// 			colorScale: 'viridis'
	// 		})
	// 	})()
	// })

	;(async () => {
		const arrayBuffer = await fetch('http://localhost:3090/data')
			.then(res => res.arrayBuffer())
		// console.log(arrayBuffer)

		const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer)		
		// const tiff = await GeoTIFF.fromUrl('http://localhost:3090/data')

		const image = await tiff.getImage()
		const bbox = await image.getBoundingBox()
  	//for some reason, geotiff.js calculates BBOX assuming that origin is the lower-left corner
  	//but at least for gdal_translate-generated raster, it's the upper-left one, so the BBOX has to be adjusted
  	const box = [bbox[0], bbox[1] - (bbox[3] - bbox[1]), bbox[2], bbox[1]]; 
		const data = await image.readRasters()
		// console.log(box)
		// console.log(data)


		// const raster = await fetch('http://localhost:3090/data')
		//   .then(response => response.arrayBuffer() )
		//   .then(parseGeoraster)
		//   .then(georaster => {
		//       console.log("georaster:", georaster);
		//       return georaster
		//   });

		// const raster = await geoblaze.load('http://localhost:3090/data')
		// const georaster = await geoblaze
		// 	.rasterCalculator(raster, (rh, temp, wind) => rh < 10 ? rh : wind)

		const raster = await geoblaze.load('http://localhost:3090/data')
		const georaster = await rasterCalculator(raster, (rh, temp, wind) => rh < 10 ? rh : wind)
		console.log(georaster)

		// const canvas = plotRef.current
		// const plot = new plotty.plot({
		// 	canvas,
		// 	data: data[0],
		// 	width: image.getWidth(),
		// 	height: image.getHeight(),
		// 	domain: [0, 256],
		// 	colorScale: 'viridis'
		// })

		await toCanvas(georaster, plotRef.current, { height: 500, width: 500 })
	
		// const imgSource = new ImageStatic({
		// 	url: plotRef.current.toDataURL('image/png'),
		// 	imageExtent: box,
		// 	projection: 'EPSG:3857'
		// })
		// const rasterLayer = new ImageLayer()
		// rasterLayer.setSource(imgSource)
	})()
	
	return (
		<canvas ref={ plotRef }></canvas>
	)
}


