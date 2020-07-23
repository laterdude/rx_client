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
    // // GeoTIFF.fromUrl() is very slow compared to reading from buffer
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

    // let flatRasterData = await image.readRasters({ interleave: true })
    // console.log(flatRasterData)

		let [rhData, tempData, windData] = rasterData
		// console.log(rhData, tempData, windData)

		let data = []
		for (let i = 0; i <= rhData.length - 1; i++) {
			let isWind = windData[i] >= minWind && windData[i] <= maxWind
			let isTemp = tempData[i] >= minT && tempData[i] <= maxT
			let isRh = rhData[i] >= minRh && rhData[i] <= maxRh
		
			// ifElse: 1974.77197265625ms
			if (!isWind && !isTemp && !isRh) { data.push(0) }
			// 1 present	
			else if (isWind && !isTemp && !isRh || !isWind && !isTemp && isRh || !isWind && isTemp && !isRh) { data.push(1) }
			// 2 present
			else if(isWind && isTemp && !isRh || !isWind && isTemp && isRh || isWind && !isTemp && isRh) { data.push(2) }
			// 3 present
			else if (isWind && isTemp && isRh) { data.push(3) }
			else { data.push(4) }			

			// // switch: 2198.236083984375ms
			// switch(true) {
			// 	case (!isWind && !isTemp && !isRh): 
			// 		data.push(0) // 0 present
			// 		break
			// 	case (isWind && !isTemp && !isRh || !isWind && !isTemp && isRh || !isWind && isTemp && !isRh):
			// 		data.push(1) // 1 present
			// 		break
			// 	case (isWind && isTemp && !isRh || !isWind && isTemp && isRh || isWind && !isTemp && isRh):
			// 		data.push(2) // 2 present
			// 		break
			// 	case (isWind && isTemp && isRh):
			// 		data.push(3) // 3 present
			// 		break
			// 	default: 
			// 		data.push(4)
			// }			
		}

		// let data = rhData.map((currRh, i) => {
		// 	let isWind = windData[i] >= minWind && windData[i] <= maxWind
		// 	let isTemp = tempData[i] >= minT && tempData[i] <= maxT
		// 	let isRh = currRh >= minRh && currRh <= maxRh

  //     // It is incongruent that Array.map method performance favors ifElse:

		// 	// // switch: 2470.373291015625ms
		// 	// switch(true) {
		// 	// 	case (!isWind && !isTemp && !isRh): 
		// 	// 		return 0 // 0 present
		// 	// 	case (isWind && !isTemp && !isRh || !isWind && !isTemp && isRh || !isWind && isTemp && !isRh):
		// 	// 		return 1 // 1 present
		// 	// 	case (isWind && isTemp && !isRh || !isWind && isTemp && isRh || isWind && !isTemp && isRh):
		// 	// 		return 2 // 2 present
		// 	// 	case (isWind && isTemp && isRh):
		// 	// 		return 3 // 3 present
		// 	// 	default: 
		// 	// 		return 4
		// 	// }

		// 	// // contrived: 2874.304931640625ms
		// 	// let contrived = {};
		// 	// contrived[!isWind && !isTemp && !isRh] = 0;
		// 	// contrived[isWind && !isTemp && !isRh || !isWind && !isTemp && isRh || !isWind && isTemp && !isRh] = 1;
		// 	// contrived[isWind && isTemp && !isRh || !isWind && isTemp && isRh || isWind && !isTemp && isRh] = 2;
		// 	// contrived[isWind && isTemp && isRh] = 3;
		// 	// return contrived[true] || 4;

  // 		// ifElse: 2408.59521484375ms
		// 	// 0 present
		// 	if (!isWind && !isTemp && !isRh) { return 0 }
		// 	// 1 present	
		// 	else if (isWind && !isTemp && !isRh || !isWind && !isTemp && isRh || !isWind && isTemp && !isRh) { return 1 }
		// 	// 2 present
		// 	else if(isWind && isTemp && !isRh || !isWind && isTemp && isRh || isWind && !isTemp && isRh) { return 2 }
		// 	// 3 present
		// 	else if (isWind && isTemp && isRh) { return 3 }
		// 	else { return 4 }

		// })
		// // console.log('data: ', data)

		// let r = 0 
		// let t = 1
		// let w = 2
		// let int_rh = []
		// let int_temp = []
		// let int_wind = []

		// 01 2 34 5 67 8 910 11 => w [i % 3] 01 2 01 2 01 2
		// let data = flatRasterData.reduce((prev, curr, i, arr) => {
		// 	let isRh, isTemp, isWind;
		// 	// let r, t, w;
		// 	// // let rem = i % 3;
		// 	// switch (i % 3) {
		// 	// 	case 0: 
		// 	// 		r = i
		// 	// 		t = i + 1
		// 	// 		w = i + 2
		// 	// 		// isRh = arr[i] >= minRh && arr[i] <= maxRh
		// 	// 		// isTemp = arr[i+1] >= minT && arr[i+1] <= maxT
		// 	// 		// isWind = arr[i+2] >= minWind && arr[i+2] <= maxWind
		// 	// 		// int_rh.push(arr[i])
		// 	// 		// int_temp.push(arr[i+1])
		// 	// 		// int_wind.push(arr[i+2])
		// 	// 		break;
		// 	// 	case 1:
		// 	// 		r = i + 2
		// 	// 		t = i
		// 	// 		w = i + 1
		// 	// 		// isRh = arr[i+2] >= minRh && arr[i+2] <= maxRh
		// 	// 		// isTemp = arr[i] >= minT && arr[i] <= maxT
		// 	// 		// isWind = arr[i+1] >= minWind && arr[i+1] <= maxWind
		// 	// 		// int_rh.push(arr[i+2])
		// 	// 		// int_temp.push(arr[i])
		// 	// 		// int_wind.push(arr[i+1])
		// 	// 		break;
		// 	// 	case 2: 
		// 	// 		r = i + 1
		// 	// 		t = i + 2
		// 	// 		w = i 
		// 	// 		// isRh = arr[i+1] >= minRh && arr[i+1] <= maxRh
		// 	// 		// isTemp = arr[i+2] >= minT && arr[i+2] <= maxT
		// 	// 		// isWind = arr[i] >= minWind && arr[i] <= maxWind
		// 	// 		// int_rh.push(arr[i+1])
		// 	// 		// int_temp.push(arr[i+2])
		// 	// 		// int_wind.push(arr[i])
		// 	// 		break;					
		// 	// }

		// 	isRh = arr[r] >= minRh && arr[r] <= maxRh
		// 	isTemp = arr[t] >= minT && arr[t] <= maxT
		// 	isWind = arr[w] >= minWind && arr[w] <= maxWind
		// 	r += 3
		// 	t += 3
		// 	w += 3
		// 	// int_rh.push(arr[r])
		// 	// int_temp.push(arr[t])
		// 	// int_wind.push(arr[w])
		// 	if (!isWind && !isTemp && !isRh) { prev.push(0) }
		// 	else if (isWind && !isTemp && !isRh || !isWind && !isTemp && isRh || !isWind && isTemp && !isRh) { prev.push(1) }
		// 	else if (isWind && isTemp && !isRh || !isWind && isTemp && isRh || isWind && !isTemp && isRh) { prev.push(2) }
		// 	else if (isWind && isTemp && isRh) { prev.push(3) }
		// 	else { prev.push(4) }
		// 	return prev

		// 	// switch is slow in array.reduce() => weird. oh well.
		// 	// switch(true) {
		// 	// 	case (!isWind && !isTemp && !isRh): 
		// 	// 		prev.push(0)
		// 	// 		return prev
		// 	// 	case (isWind && !isTemp && !isRh || !isWind && !isTemp && isRh || !isWind && isTemp && !isRh):
		// 	// 		prev.push(1)
		// 	// 		return prev
		// 	// 	case (isWind && isTemp && !isRh || !isWind && isTemp && isRh || isWind && !isTemp && isRh):
		// 	// 		prev.push(2)
		// 	// 		return prev
		// 	// 	case (isWind && isTemp && isRh):
		// 	// 		prev.push(3)
		// 	// 		return prev
		// 	// 	default: 
		// 	// 		prev.push(4)
		// 	// 		return prev
		// 	// }

		// }, [])
		// console.log(data)
		// console.log(int_rh, int_temp, int_wind)

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