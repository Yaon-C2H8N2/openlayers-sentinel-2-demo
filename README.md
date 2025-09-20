# OpenLayers Copernicus Satellite Viewer

A web application for viewing Sentinel-2 satellite imagery using OpenLayers and the Copernicus Data Space Ecosystem API.

## Tech Stack

- Bun runtime
- React with TypeScript
- OpenLayers for mapping
- Copernicus Data Space Ecosystem API

## Purpose

Search and display Sentinel-2 satellite images on an interactive map. Filter images by date range and cloud coverage, then overlay them on the map view.

## Setup

Requires Copernicus Data Space Ecosystem credentials. Create `.env`:

```
COPERNICUS_CLIENT_ID=your_client_id
COPERNICUS_CLIENT_SECRET=your_client_secret
COPERNICUS_INSTANCE_ID=your_instance_id
```
