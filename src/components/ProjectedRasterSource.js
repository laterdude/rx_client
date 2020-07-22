import React, { useRef, useEffect } from 'react'
import ImageStatic from 'ol/source/ImageStatic'
import ImageLayer from 'ol/layer/Image'
import Projection from 'ol/proj/Projection'
const plotty = require('plotty')
const GeoTIFF = require('geotiff')

export default async function(
	minT = 0,
	maxT = 50,
	minRh = 5,
	maxRh = 20,
	minWind = 0,
	maxWind = 20,
) {
	try {
    // GeoTIFF.fromUrl() is very slow compared to reading from buffer
    // let tiff = await GeoTIFF.fromUrl('http://localhost:3090/data')	
		let arrayBuffer = await fetch('http://localhost:3090/data')
			.then(res => res.arrayBuffer())
		let tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer)	
		let image = await tiff.getImage()
		let extent = await image.getBoundingBox()
		let width = await image.getWidth()
		let height = await image.getHeight()
		let rasterData = await image.readRasters()

    // webworker overhead isn't worth it for a single tiff:
    // let pool = new GeoTIFF.Pool();
    // let rasterData = await image.readRasters({ pool })

		let [rhAr, tempData, windData] = rasterData
		let data = rhAr.map((currRh, i) => {
			let isWind = windData[i] >= minWind && windData[i] <= maxWind
			let isTemp = tempData[i] >= minT && tempData[i] <= maxT
			let isRh = currRh >= minRh && currRh <= maxRh

      // It is incongruent that Array.map method performance favors ifElse:

			// // switch: 2945.177978515625ms
			// switch(true) {
			// 	case (!isWind && !isTemp && !isRh): 
			// 		return 0 // 0 present
			// 	case (isWind && !isTemp && !isRh || !isWind && !isTemp && isRh || !isWind && isTemp && !isRh):
			// 		return 1 // 1 present
			// 	case (isWind && isTemp && !isRh || !isWind && isTemp && isRh || isWind && !isTemp && isRh):
			// 		return 2 // 2 present
			// 	case (isWind && isTemp && isRh):
			// 		return 3 // 3 present
			// 	default: 
			// 		return 4
			// }

			// // contrived: 3841.89697265625ms
			// let contrived = {};
			// contrived[!isWind && !isTemp && !isRh] = 0;
			// contrived[isWind && !isTemp && !isRh || !isWind && !isTemp && isRh || !isWind && isTemp && !isRh] = 1;
			// contrived[isWind && isTemp && !isRh || !isWind && isTemp && isRh || isWind && !isTemp && isRh] = 2;
			// contrived[isWind && isTemp && isRh] = 3;
			// return contrived[true] || 4;

      // ifElse: 2420.407958984375ms
			// 0 present
			if (!isWind && !isTemp && !isRh) { return 0 }
			// 1 present	
			else if (isWind && !isTemp && !isRh || !isWind && !isTemp && isRh || !isWind && isTemp && !isRh) { return 1 }
			// 2 present
			else if(isWind && isTemp && !isRh || !isWind && isTemp && isRh || isWind && !isTemp && isRh) { return 2 }
			// 3 present
			else if (isWind && isTemp && isRh) { return 3 }
			else { return 4 }

		})

		let colorAr = data.indexOf(4) === -1 ? ["#dc3545", "#007bff", "#ffc107", "#28a745"] : ["#dc3545", "#007bff", "#ffc107", "#28a745", "#090909"]
		let valueAr = data.indexOf(4) === -1 ? [0,1,2,3] : [0,1,2,3,4]
		let domain = [ 0, data.indexOf(4) === -1 ? 3 : 4 ]

	  plotty.addColorScale("mycolorscale", colorAr, valueAr)
		let canvas = document.createElement('canvas')
		let plot = new plotty.plot({
			canvas,
			data,
			width,
			height,
			domain,
		})
		await plot.render()

		let imgSource = new ImageStatic({
			url: canvas.toDataURL('image/png', 1.0),
			imageExtent: extent,
			projection: new Projection({
			  code: 'EPSG:3857',
			  units: 'pixels',
			  extent
			})
		})

		return imgSource
	}
	catch(err) { console.log(err) }
}


// import React, { useRef, useEffect } from 'react'
// import ImageStatic from 'ol/source/ImageStatic'
// import ImageLayer from 'ol/layer/Image'
// import Projection from 'ol/proj/Projection'
// import * as olExtent from 'ol/extent'
// const plotty = require('plotty')
// const GeoTIFF = require('geotiff')

// export default async function() {
// 	const minT = 0
// 	const maxT = 50
// 	const minRh = 5
// 	const maxRh = 20
// 	const minWind = 0
// 	const maxWind = 20

// 	const tiff = await GeoTIFF.fromUrl('http://localhost:3090/data')

// 	const image = await tiff.getImage()
// 	const bbox = await image.getBoundingBox()
// 	const width = await image.getWidth()
// 	const height = await image.getHeight()
// 	const data = await image.readRasters()
	
// 	var rhAr = data[0]
// 	var tempData = data[1]
// 	var windData = data[2]
// 	var filteredArray = rhAr.map((currRh,i) => {
// 		const isWind = windData[i] >= minWind && windData[i] <= maxWind
// 		const isTemp = tempData[i] >= minT && tempData[i] <= maxT
// 		const isRh = currRh >= minRh && currRh <= maxRh

// 		if(!isWind && !isTemp && !isRh){ //none present
// 			return 0
// 		}
// 		else if(isWind && !isTemp && !isRh || !isWind && !isTemp && isRh || !isWind && isTemp && !isRh){ //1 present
// 			return 1
// 		}
// 		else if(isWind && isTemp && !isRh || !isWind && isTemp && isRh || isWind && !isTemp && isRh){ //two present
// 			return 2
// 		}
// 		else if(isWind && isTemp && isRh){ //three present
// 			return 3
// 		}
// 		else{
// 			return 4
// 		}
// 	})
// 	const colorAr = filteredArray.indexOf(4) === -1 ? ["#dc3545", "#007bff", "#ffc107", "#28a745"] : ["#dc3545", "#007bff", "#ffc107", "#28a745", "#090909"]
// 	const valueAr = filteredArray.indexOf(4) === -1 ? [0,1,2,3] : [0,1,2,3,4]
// 	const maxVal = filteredArray.indexOf(4) === -1 ? 3 : 4

// 	const minValue = 0
//   const maxValue = 3

// 	let canvas = document.createElement('canvas')
// 	const plot = new plotty.plot({
// 		canvas: canvas,
// 		data: filteredArray, 
// 		width: width, 
// 		height: height,
// 		domain: [minValue, maxVal], 
// 		clampLow: true, 
// 		clampHigh: true
//   });
//   plotty.addColorScale("mycolorscale", colorAr, valueAr)
//   plot.render();

// 	const imgSource = new ImageStatic({
// 		url: canvas.toDataURL('image/png', 1.0),
// 		imageExtent: bbox,
// 		projection: new Projection({
// 		  code: 'EPSG:3857',
// 		  units: 'pixels',
// 		  extent: bbox
// 		})
// 	})
// 	return imgSource
// }
