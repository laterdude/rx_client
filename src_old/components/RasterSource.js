import React, { useRef, useEffect } from 'react'
import ImageStatic from 'ol/source/ImageStatic'
import ImageLayer from 'ol/layer/Image'
import * as olExtent from 'ol/extent'
import { applyTransform } from 'ol/extent'
import { transform } from 'ol/proj'
import geoblaze from 'geoblaze'
const plotty = require('plotty')
const GeoTIFF = require('geotiff')

export default async function() {
	const arrayBuffer = await fetch('http://localhost:3090/data')
		.then(res => res.arrayBuffer())

	const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer)		
	// const tiff = await GeoTIFF.fromUrl('http://localhost:3090/data')

	const image = await tiff.getImage()
	const bbox = await image.getBoundingBox()
	const width = await image.getWidth()
	console.log(width)
	console.log(image.getFileDirectory())
	// [minx, miny, maxx, maxy]
	// for some reason, geotiff.js calculates BBOX assuming that origin is the lower-left corner
	// but at least for gdal_translate-generated raster, it's the upper-left one, so the BBOX has to be adjusted
	const box = [bbox[0], bbox[1] - (bbox[3] - bbox[1]), bbox[2], bbox[1]]; 
	const data = await image.readRasters()
	console.log(data)
	console.log('bbox: ', bbox)
	// [-3272421.457337171, -265063.58496456454, 2683182.0776628293, 3790842.1060354356]
	console.log('box: ', box)
	// [-3272421.457337171, -4320969.275964565, 2683182.0776628293, -265063.58496456454]
	console.log(transform([ bbox[0], bbox[1] ], 'EPSG:3857', 'EPSG:4326'))
	console.log(transform([ bbox[2], bbox[3] ], 'EPSG:3857', 'EPSG:4326'))
	// [-9228024.992337171, -265063.58496456454, -3272421.45733717, 3790842.1060354356]
	// -29.39666211206659, -2.3804215985413606, 24.10343470440092, 32.2094986521585	
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
		// imageExtent: bbox,
		imageExtent: [-13694727.643587172, 2574070.3987354357, -7739124.108587171, 6629976.089735435],
		// imageExtent: [-12205826.759837171, 3790842.1060354356, -6250223.224837171, 7846747.797035435],
		// imageExtent: [-15183628.527337171, 3790842.1060354356, -9228024.992337171, 7846747.797035435],
		// imageExtent: [-9228024.992337171, 3790842.1060354356, -3272421.45733717, 7846747.797035435],
		// imageExtent: [-29.39666211206659, -2.3804215985413606, 24.10343470440092, 32.2094986521585],
		// projection: 'EPSG:4326'
		projection: 'EPSG:3857'
	})

	return imgSource
}

