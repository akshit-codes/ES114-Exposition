// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';
import {CSVLoader} from '@loaders.gl/csv';
import {load} from '@loaders.gl/core';

import type {Color, PickingInfo, MapViewState} from '@deck.gl/core';

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/Aayush75/ES114-Exposition-Article/refs/heads/main/final_data.csv'; // eslint-disable-line

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-123.09, 49.2527, 80000]
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.4,
  position: [-140.09, 38.2527, 80000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight1, pointLight2});

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -123.09,
  latitude: 49.2527,
  zoom: 11.9,
  minZoom: 1,
  maxZoom: 15,
  pitch: 60,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

export const colorRange: Color[] = [
  [251, 97, 7],
  [124, 181, 24],
  [124, 181, 24],
  [124, 181, 24],
  [124, 181, 24],
  [124, 181, 24],
  [124, 181, 24],
  [124, 181, 24],
  [124, 181, 24],
  [124, 181, 24],
  [124, 181, 24],
  [124, 181, 24]
];

function getTooltip({coordinate, object}: PickingInfo) {
  if (!object) {
    return null;
  }
  const lat = coordinate[1];
  const lng = coordinate[0];
  const count = object.count;

  return `\
    latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}
    longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}
    ${count} Trees`;
}

type DataPoint = [longitude: number, latitude: number];

const defRadius = 25;
const defCoverage = 50;
const defUPercentile = 100;

export default function App({
  data = null,
  mapStyle = MAP_STYLE
}: {
  data?: DataPoint[] | null;
  mapStyle?: string;
  radius?: number;
  upperPercentile?: number;
  coverage?: number;
}) {
  const [sliderRadius, setSliderRadius] = useState(defRadius);
  const [sliderCoverage, setSliderCoverage] = useState(defCoverage);
  const [sliderUPercentile, setSliderUPercentile] = useState(defUPercentile);

  const sRadius = document.getElementById('sRadius');
  const nRadius = document.getElementById('nRadius');
  const sCoverage = document.getElementById('sCoverage');
  const nCoverage = document.getElementById('nCoverage');
  const sUPercentile = document.getElementById('sUPercentile');
  const nUPercentile = document.getElementById('nUPercentile');

  sRadius.addEventListener('input', e => {
    setSliderRadius(e.target.value);
    nRadius.value = e.target.value;
  });
  nRadius.addEventListener('input', e => {
    setSliderRadius(e.target.value);
    sRadius.value = e.target.value;
  });
  sCoverage.addEventListener('input', e => {
    setSliderCoverage(e.target.value);
    nCoverage.value = e.target.value;
  });
  nCoverage.addEventListener('input', e => {
    setSliderCoverage(e.target.value);
    sCoverage.value = e.target.value;
  });
  sUPercentile.addEventListener('input', e => {
    setSliderUPercentile(e.target.value);
    nUPercentile.value = e.target.value;
  });
  nUPercentile.addEventListener('input', e => {
    setSliderUPercentile(e.target.value);
    sUPercentile.value = e.target.value;
  });

  const layers = [
    new HexagonLayer<DataPoint>({
      id: 'heatmap',
      gpuAggregation: true,
      colorRange,
      coverage: sliderCoverage / 100,
      data,
      elevationRange: [0, 80],
      elevationScale: data && data.length ? 50 : 0,
      extruded: true,
      getPosition: d => d,
      pickable: true,
      radius: sliderRadius,
      upperPercentile: sliderUPercentile,
      material: {
        ambient: 0.64,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [51, 51, 51]
      },

      transitions: {
        elevationScale: 3000
      }
    })
  ];

  return (
    <DeckGL
      layers={layers}
      effects={[lightingEffect]}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);

  const data = (await load(DATA_URL, CSVLoader)).data;
  console.log(data);
  const points: DataPoint[] = data
    .map(d => (Number.isFinite(d.lng) ? [d.lng, d.lat] : null))
    .filter(Boolean);
  root.render(<App data={points} />);
}
