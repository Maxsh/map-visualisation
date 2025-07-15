# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a TypeScript project for rendering heatmaps based on location coordinates. The project uses:
- Vite as the build tool
- TypeScript for type safety
- Leaflet for interactive maps
- heatmap.js for heatmap visualization

## Code Guidelines
- Use TypeScript interfaces for all data structures
- Maintain separation between data processing and visualization logic
- Follow modern ES6+ practices
- Ensure proper error handling for coordinate validation
- Use descriptive variable and function names for geospatial operations

## Architecture
- `src/types/` - TypeScript interfaces and types
- `src/utils/` - Utility functions for data processing
- `src/components/` - Reusable visualization components
- `src/data/` - Sample data and data processing logic
