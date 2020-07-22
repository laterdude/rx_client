import React, { useRef, useEffect } from 'react'
import ImageStatic from 'ol/source/ImageStatic'
import ImageLayer from 'ol/layer/Image'
import * as olExtent from 'ol/extent'
const plotty = require('plotty')
const GeoTIFF = require('geotiff')

export default async function() {
	try {
		console.log('yo')
		const arrayBuffer = await fetch('http://localhost:3090/data')
			.then(res => res.arrayBuffer())

		const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer)		

		const image = await tiff.getImage()
		const bbox = await image.getBoundingBox()
		const width = await image.getWidth()
		const data = await image.readRasters()

		let canvas = document.createElement('canvas')
		const plot = new plotty.plot({
			canvas,
			data: data[0],
			width: image.getWidth(),
			height: image.getHeight(),
			domain: [0, 256],
			colorScale: 'viridis'
		})
		await plot.render()

		const imgSource = new ImageStatic({
			url: canvas.toDataURL('image/png'),
			imageExtent: [-13694727.643587172, 2574070.3987354357, -7739124.108587171, 6629976.089735435],
			projection: 'EPSG:3857'
		})

		return imgSource
	}
	catch(err) { console.log(err) }
}
